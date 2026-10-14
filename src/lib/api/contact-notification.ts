import type { ContactValues } from "@/lib/validation/forms";

export async function sendContactNotification(
  values: ContactValues,
  reference: string,
): Promise<boolean> {
  const service = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
  const template = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
  const key = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;
  if (!service || !template || !key) return false;
  try {
    const response = await fetch(
      "https://api.emailjs.com/api/v1.0/email/send",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(10000),
        body: JSON.stringify({
          service_id: service,
          template_id: template,
          user_id: key,
          template_params: {
            from_name: values.name,
            reply_to: values.email,
            company: values.company,
            phone: values.phone,
            enquiry_type: values.type,
            location: values.location,
            message: values.message,
            request_reference: reference,
          },
        }),
      },
    );
    return response.ok;
  } catch {
    return false;
  }
}
