import { describe, expect, it, vi } from "vitest";
import { notifyEnquiry } from "../../supabase/functions/_shared/contact-email";

const enquiry = {
  name: "Test Sender",
  company: "Test Company",
  email: "sender@example.com",
  phone: "9812345678",
  type: "General enquiry",
  location: "Kathmandu",
  message: "Please advise on water treatment.",
};
const settings = {
  apiKey: "test-key",
  from: "Lucent <office@example.com>",
  to: "owner@example.com",
};
describe("enquiry email notification", () => {
  it("sends to the configured owner and places the customer address in reply-to", async () => {
    const send = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response("{}", { status: 200 }));
    expect(await notifyEnquiry("ref-1", enquiry, settings, send)).toBe(
      "accepted",
    );
    const init = send.mock.calls[0][1]!;
    const payload = JSON.parse(String(init.body));
    expect(payload.to).toEqual(["owner@example.com"]);
    expect(payload.reply_to).toBe("sender@example.com");
    expect(payload.text).toContain("ref-1");
    expect(init.headers).toMatchObject({
      "Idempotency-Key": "lucent-enquiry-ref-1",
    });
  });
  it("does not send without provider configuration", async () => {
    const send = vi.fn<typeof fetch>();
    expect(await notifyEnquiry("ref-1", enquiry, {}, send)).toBe("pending");
    expect(send).not.toHaveBeenCalled();
  });
  it("reports provider rejection and timeout without exposing credentials or throwing", async () => {
    const rejected = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response("rejected", { status: 429 }));
    const timeout = vi
      .fn<typeof fetch>()
      .mockRejectedValue(new Error("timeout"));
    expect(await notifyEnquiry("ref-1", enquiry, settings, rejected)).toBe(
      "failed",
    );
    expect(await notifyEnquiry("ref-1", enquiry, settings, timeout)).toBe(
      "failed",
    );
  });
});
