import { beforeAll, afterAll, describe, it, expect } from "vitest";
import { PGlite } from "@electric-sql/pglite";
import { readFile } from "node:fs/promises";
const alice = "00000000-0000-0000-0000-000000000001",
  bob = "00000000-0000-0000-0000-000000000002",
  admin = "00000000-0000-0000-0000-000000000003";
let db: PGlite;
async function asUser(id: string, sql: string) {
  await db.exec(
    `reset role; set role authenticated; select set_config('request.jwt.claim.sub','${id}',false);`,
  );
  return db.query(sql);
}
describe("database access policies in local PostgreSQL", () => {
  beforeAll(async () => {
    db = new PGlite();
    await db.exec(
      `create role anon nologin; create role authenticated nologin; create role service_role nologin bypassrls; create schema auth; create schema storage; create schema extensions; create table auth.users(id uuid primary key,email text,raw_user_meta_data jsonb); create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$; grant usage on schema auth,storage to anon,authenticated; grant execute on function auth.uid() to anon,authenticated; create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]); create table storage.objects(id uuid primary key default gen_random_uuid(),bucket_id text,name text); alter table storage.objects enable row level security; grant select,insert,update,delete on storage.objects to anon,authenticated;`,
    );
    const migration = await readFile(
      "supabase/migrations/202610020001_initial.sql",
      "utf8",
    );
    await db.exec(
      migration.replace(
        "create extension if not exists pgcrypto with schema extensions;",
        "",
      ),
    );
    await db.exec(
      await readFile(
        "supabase/migrations/202610130001_contact_notifications.sql",
        "utf8",
      ),
    );
    await db.exec(
      `insert into auth.users values('${alice}','alice@example.com','{"full_name":"Alice","company":"Alice Company","role":"admin"}'),('${bob}','bob@example.com','{"full_name":"Bob","company":"Bob Company"}'),('${admin}','admin@example.com','{"full_name":"Admin"}'); update public.profiles set role='admin' where id='${admin}'; insert into public.contact_requests(name,email,phone,type,message) values('Test','test@example.com','1234567','General enquiry','Test contact enquiry'); insert into public.documents(external_product_id,name,storage_path,access_level) values('ro-001','Member guide','member.pdf','member'),('ro-001','Internal guide','admin.pdf','admin');insert into storage.objects(bucket_id,name) values('product-documents','member.pdf'),('product-documents','admin.pdf'),('product-documents','unregistered.pdf');`,
    );
  }, 30000);
  afterAll(async () => {
    await db.close();
  });
  it("preserves a received enquiry when its notification fails", async () => {
    await db.exec("reset role");
    const id = "00000000-0000-0000-0000-000000000010";
    await db.query("select public.submit_contact($1,$2::jsonb)", [
      "notification-test",
      JSON.stringify({
        request_id: id,
        name: "Test Sender",
        company: "Test",
        email: "test@example.com",
        phone: "9812345678",
        type: "General enquiry",
        location: "Kathmandu",
        message: "Test notification persistence",
      }),
    ]);
    expect(
      (
        await db.query(
          "select notification_status from public.contact_requests where id=$1",
          [id],
        )
      ).rows,
    ).toEqual([{ notification_status: "pending" }]);
    await db.query(
      "update public.contact_requests set notification_status='failed' where id=$1",
      [id],
    );
    expect(
      (
        await db.query(
          "select message,notification_status from public.contact_requests where id=$1",
          [id],
        )
      ).rows,
    ).toEqual([
      {
        message: "Test notification persistence",
        notification_status: "failed",
      },
    ]);
    expect(
      (
        await asUser(
          bob,
          `select id from public.contact_requests where id='${id}'`,
        )
      ).rows,
    ).toEqual([]);
  });
  it("ignores signup role metadata and forbids member role escalation", async () => {
    const result = await asUser(
      alice,
      `select role from public.profiles where id='${alice}'`,
    );
    expect(result.rows).toEqual([{ role: "member" }]);
    await expect(
      asUser(
        alice,
        `update public.profiles set role='admin' where id='${alice}'`,
      ),
    ).rejects.toThrow(/permission denied/);
  });
  it("isolates saved products and rejects writing another user's rows", async () => {
    await asUser(
      alice,
      `insert into public.saved_products(user_id,external_product_id) values('${alice}','ro-001')`,
    );
    expect(
      (await asUser(bob, "select * from public.saved_products")).rows,
    ).toHaveLength(0);
    await expect(
      asUser(
        bob,
        `insert into public.saved_products(user_id,external_product_id) values('${alice}','atm-001')`,
      ),
    ).rejects.toThrow(/row-level security/);
  });
  it("protects quotations and cross-user message access", async () => {
    await asUser(
      alice,
      `insert into public.quotation_requests(user_id,external_product_id,message) values('${alice}','ro-001','A test plant requirement')`,
    );
    expect(
      (await asUser(bob, "select * from public.quotation_requests")).rows,
    ).toHaveLength(0);
    await expect(
      asUser(alice, `update public.quotation_requests set status='quoted'`),
    ).rejects.toThrow(/permission denied/);
    await db.exec("reset role");
    const q = (
      await db.query<{ id: string }>("select id from public.quotation_requests")
    ).rows[0].id;
    await expect(
      asUser(
        bob,
        `insert into public.quotation_messages(quotation_request_id,sender_id,body) values('${q}','${bob}','Unauthorized reply')`,
      ),
    ).rejects.toThrow(/row-level security/);
  });
  it("hides contacts and admin documents from members, including storage objects", async () => {
    expect(
      (await asUser(alice, "select * from public.contact_requests")).rows,
    ).toHaveLength(0);
    expect(
      (await asUser(alice, "select name from public.documents")).rows,
    ).toEqual([{ name: "Member guide" }]);
    expect(
      (await asUser(alice, "select name from storage.objects")).rows,
    ).toEqual([{ name: "member.pdf" }]);
    expect(
      (await asUser(admin, "select * from public.contact_requests")).rows,
    ).toHaveLength(1);
    expect(
      (await asUser(admin, "select name from public.documents")).rows,
    ).toHaveLength(2);
  });
  it("prevents anonymous direct contact insertion and limits the backend contact function", async () => {
    await db.exec("reset role;set role anon;");
    await expect(
      db.exec(
        `insert into public.contact_requests(name,email,phone,type,message) values('X','x@example.com','1234567','General enquiry','Unauthorized enquiry')`,
      ),
    ).rejects.toThrow(/permission denied/);
    await db.exec("reset role;set role service_role;");
    const payload = JSON.stringify({
      name: "Test",
      company: "",
      email: "test@example.com",
      phone: "1234567",
      type: "General enquiry",
      location: "Kathmandu",
      message: "Test backend enquiry",
    });
    for (let i = 0; i < 5; i++)
      await db.query("select public.submit_contact($1,$2::jsonb)", [
        "test-rate-key",
        payload,
      ]);
    await expect(
      db.query("select public.submit_contact($1,$2::jsonb)", [
        "test-rate-key",
        payload,
      ]),
    ).rejects.toThrow(/Rate limit exceeded/);
  });
});
