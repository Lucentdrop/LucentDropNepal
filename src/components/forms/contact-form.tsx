"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Send, CheckCircle2 } from "lucide-react";
import { contactSchema, type ContactValues } from "@/lib/validation/forms";
import { getSupabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { sendContactNotification } from "@/lib/api/contact-notification";
export function ContactForm() {
  const [status, setStatus] = useState<{ type: string; text: string } | null>(
    null,
  );
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { type: "General enquiry", company: "" },
  });
  async function submit(values: ContactValues) {
    setStatus(null);
    try {
      const client = getSupabase();
      if (client) {
        const { data, error } = await client.functions.invoke(
          "submit-contact",
          {
            body: values,
          },
        );
        if (error)
          throw new Error("Unable to send your enquiry. Please try again.");
        // Save first. A browser/provider failure must not discard the enquiry
        // or prompt a duplicate submission. Never notify from demo mode.
        if (typeof data?.reference === "string") {
          const notified = await sendContactNotification(
            values,
            data.reference,
          );
          if (!notified)
            console.warn("Enquiry saved; notification is unavailable.");
        }
        setStatus({
          type: "success",
          text: "Your enquiry has been received. Thank you for getting in touch.",
        });
      } else {
        setStatus({
          type: "success",
          text: "Demo enquiry validated successfully. No message was sent or stored. Connect Supabase to receive real submissions.",
        });
      }
      reset();
    } catch (error) {
      setStatus({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Something went wrong. Please try again.",
      });
    }
  }
  return (
    <form className="form-card" onSubmit={handleSubmit(submit)} noValidate>
      <h2>Send an Enquiry</h2>
      <p>Share a few details. Let’s understand your water needs.</p>
      {!getSupabase() && (
        <div className="notice">
          Development preview: this form validates your enquiry locally.
          Submissions are stored only after Supabase is connected.
        </div>
      )}
      {status && (
        <div role="status" className={`notice ${status.type}`}>
          <CheckCircle2
            size={15}
            style={{ display: "inline", marginRight: 6 }}
          />
          {status.text}
        </div>
      )}
      <div className="form-grid">
        {[
          {
            name: "name",
            label: "Full Name",
            placeholder: "Your name",
            required: true,
          },
          {
            name: "company",
            label: "Company Name",
            placeholder: "Your organization",
          },
          {
            name: "email",
            label: "Email",
            placeholder: "you@company.com",
            type: "email",
            required: true,
          },
          {
            name: "phone",
            label: "Phone Number",
            placeholder: "Your contact number",
            type: "tel",
            required: true,
          },
        ].map((f) => (
          <div className="field" key={f.name}>
            <label htmlFor={f.name}>
              {f.label}
              {f.required ? " *" : ""}
            </label>
            <input
              id={f.name}
              type={f.type ?? "text"}
              placeholder={f.placeholder}
              {...register(f.name as keyof ContactValues)}
              aria-invalid={!!errors[f.name as keyof ContactValues]}
              aria-describedby={
                errors[f.name as keyof ContactValues]
                  ? `${f.name}-error`
                  : undefined
              }
            />
            {errors[f.name as keyof ContactValues] && (
              <span className="field-error" id={`${f.name}-error`}>
                {errors[f.name as keyof ContactValues]?.message}
              </span>
            )}
          </div>
        ))}
        <div className="field">
          <label htmlFor="type">Enquiry Type *</label>
          <select id="type" {...register("type")}>
            {[
              "General enquiry",
              "Product enquiry",
              "Service & maintenance",
              "Partnership",
            ].map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
          {errors.type && (
            <span className="field-error">{errors.type.message}</span>
          )}
        </div>
        <div className="field">
          <label htmlFor="location">Location *</label>
          <input
            id="location"
            placeholder="City / Province"
            {...register("location")}
            aria-invalid={!!errors.location}
            aria-describedby={errors.location ? "location-error" : undefined}
          />
          {errors.location && (
            <span id="location-error" className="field-error">
              {errors.location.message}
            </span>
          )}
        </div>
        <div className="field full">
          <label htmlFor="message">Message *</label>
          <textarea
            id="message"
            placeholder="Tell us about your water requirements…"
            {...register("message")}
            aria-invalid={!!errors.message}
            aria-describedby={errors.message ? "message-error" : undefined}
          />
          {errors.message && (
            <span id="message-error" className="field-error">
              {errors.message.message}
            </span>
          )}
        </div>
      </div>
      <div className="form-actions">
        <p>
          By submitting, you agree to our enquiry processing terms. Required
          fields are marked *.
        </p>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Sending…" : "Send Enquiry"}
          <Send size={15} />
        </Button>
      </div>
    </form>
  );
}
