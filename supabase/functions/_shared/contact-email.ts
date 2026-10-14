export type EnquiryEmail = {
  name: string;
  company: string;
  email: string;
  phone: string;
  type: string;
  location: string;
  message: string;
};
export type EmailSettings = { apiKey?: string; from?: string; to?: string };

/** Provider acceptance is not a guarantee of inbox delivery. No mail without configuration. */
export async function notifyEnquiry(
  id: string,
  enquiry: EnquiryEmail,
  settings: EmailSettings,
  send: typeof fetch = fetch,
): Promise<"pending" | "accepted" | "failed"> {
  if (!settings.apiKey || !settings.from || !settings.to) return "pending";
  try {
    const response = await send("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${settings.apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": `lucent-enquiry-${id}`,
      },
      signal: AbortSignal.timeout(10000),
      body: JSON.stringify({
        from: settings.from,
        to: [settings.to],
        reply_to: enquiry.email,
        subject: `New Lucent enquiry: ${enquiry.type}`,
        text: `Enquiry reference: ${id}\n\nName: ${enquiry.name}\nCompany: ${enquiry.company || "Not provided"}\nEmail: ${enquiry.email}\nPhone: ${enquiry.phone}\nType: ${enquiry.type}\nLocation: ${enquiry.location}\n\nMessage:\n${enquiry.message}`,
      }),
    });
    return response.ok ? "accepted" : "failed";
  } catch {
    return "failed";
  }
}
