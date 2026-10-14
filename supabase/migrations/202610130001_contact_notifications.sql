-- Persist enquiries independently of the notification provider.
alter table public.contact_requests
  add column notification_status text not null default 'pending'
    check(notification_status in ('pending','accepted','failed')),
  add column notification_attempted_at timestamptz;

create or replace function public.submit_contact(p_key text,p_payload jsonb)
returns void language plpgsql security definer set search_path='' as $$
declare hits integer;
begin
 insert into public.contact_rate_limits(key) values(p_key) on conflict(key) do update set
 requests=case when contact_rate_limits.window_start < now()-interval '15 minutes' then 1 else contact_rate_limits.requests+1 end,
 window_start=case when contact_rate_limits.window_start < now()-interval '15 minutes' then now() else contact_rate_limits.window_start end returning requests into hits;
 if hits>5 then raise exception 'Rate limit exceeded' using errcode='P0001'; end if;
 insert into public.contact_requests(id,name,company,email,phone,type,location,message)
 values(coalesce(nullif(p_payload->>'request_id','')::uuid,gen_random_uuid()),p_payload->>'name',p_payload->>'company',p_payload->>'email',p_payload->>'phone',p_payload->>'type',p_payload->>'location',p_payload->>'message');
 delete from public.contact_rate_limits where window_start < now()-interval '1 day';
end; $$;
revoke all on function public.submit_contact(text,jsonb) from public,anon,authenticated;
grant execute on function public.submit_contact(text,jsonb) to service_role;
