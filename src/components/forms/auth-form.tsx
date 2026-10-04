"use client";
import Image from "@/components/ui/image";
import { sitePath } from "@/lib/site-path";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ShieldCheck,
  CheckCircle2,
  FileText,
  BarChart3,
  ArrowRight,
} from "lucide-react";
import { signupSchema, loginSchema } from "@/lib/validation/forms";
import { getSupabase } from "@/lib/supabase/client";
import { useAuth } from "@/components/providers";
import { Button } from "@/components/ui/button";
export function safeReturnPath(value: string | null) {
  return value && /^\/(?!\/)/.test(value) && !/[\\\x00-\x1f]/.test(value)
    ? value
    : "/dashboard";
}
export function AuthForm({ signup = false }: { signup?: boolean }) {
  const router = useRouter();
  const { enterDemo } = useAuth();
  const [status, setStatus] = useState<{ type: string; text: string } | null>(
    null,
  );
  const [resetting, setResetting] = useState(false);
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signup ? signupSchema : loginSchema) as never,
    defaultValues: { terms: false },
  });
  const configured = !!getSupabase();
  async function submit(values: z.infer<typeof signupSchema>) {
    setStatus(null);
    const client = getSupabase();
    if (!client) {
      setStatus({
        type: "warning",
        text: "Supabase is not connected. Use Preview Member Experience below to explore with demo data.",
      });
      return;
    }
    try {
      if (signup) {
        const { error } = await client.auth.signUp({
          email: values.email,
          password: values.password,
          options: {
            emailRedirectTo: `${window.location.origin}${sitePath("/auth/callback/")}`,
            data: {
              full_name: values.fullName,
              company: values.company,
              phone: values.phone,
              business_type: values.businessType,
              location: values.location,
            },
          },
        });
        if (error) throw error;
        setStatus({
          type: "success",
          text: "Account request received. Check your email to confirm your account, then sign in.",
        });
      } else {
        const { error } = await client.auth.signInWithPassword({
          email: values.email,
          password: values.password,
        });
        if (error) throw error;
        router.push(
          safeReturnPath(
            new URLSearchParams(window.location.search).get("next"),
          ),
        );
      }
    } catch (error) {
      setStatus({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Unable to authenticate. Please try again.",
      });
    }
  }
  async function forgot() {
    setStatus(null);
    const email = getValues("email");
    if (!z.email().safeParse(email).success) {
      setStatus({
        type: "warning",
        text: "Enter your email address above to request a reset link.",
      });
      return;
    }
    const client = getSupabase();
    if (!client) {
      setStatus({
        type: "warning",
        text: "Password recovery becomes available when Supabase is connected.",
      });
      return;
    }
    setResetting(true);
    const { error } = await client.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}${sitePath("/auth/callback/")}?next=/reset-password`,
    });
    setResetting(false);
    setStatus(
      error
        ? { type: "error", text: "Unable to request a reset link. Try again." }
        : {
            type: "success",
            text: "If an account exists for this email, a password reset link will be sent.",
          },
    );
  }
  function preview() {
    enterDemo();
    router.push(
      safeReturnPath(new URLSearchParams(window.location.search).get("next")),
    );
  }
  return (
    <section className="auth-area">
      <div className="container">
        <div className="auth-grid">
          <div className="auth-intro">
            <Image src="/images/hero.webp" alt="" fill sizes="50vw" />
            <div>
              <span className="eyebrow">
                <ShieldCheck size={15} /> Lucent Drop Members
              </span>
              <h1>
                {signup ? "Your next step to better water." : "Welcome back."}
              </h1>
              <p>
                Connect with practical solutions, technical resources and
                support for your organization’s water needs.
              </p>
              <ul>
                <li>
                  <FileText size={17} /> Explore technical product information
                </li>
                <li>
                  <CheckCircle2 size={17} /> Save solutions and request
                  quotations
                </li>
                <li>
                  <BarChart3 size={17} /> Access your member workspace
                </li>
              </ul>
            </div>
            <div className="intro-bottom">
              <p>
                Clean water. Healthier communities.
                <br />A brighter Nepal.
              </p>
            </div>
          </div>
          <div className="auth-form">
            <h2>{signup ? "Create an Account" : "Sign in to your account"}</h2>
            <p>
              {signup
                ? "Business, vendor and partner member access."
                : "Your water solutions, all in one place."}
            </p>
            {!configured && (
              <div className="notice">
                Development mode · Supabase credentials are not configured. Real
                authentication is unavailable; a separate demo preview is
                provided below.
              </div>
            )}
            {status && (
              <div className={`notice ${status.type}`} role="status">
                {status.text}
              </div>
            )}
            <form onSubmit={handleSubmit(submit)} noValidate>
              <div className={signup ? "form-grid" : ""}>
                {signup &&
                  [
                    {
                      name: "fullName",
                      label: "Contact Person",
                      placeholder: "Full name",
                    },
                    {
                      name: "company",
                      label: "Business Name",
                      placeholder: "Organization name",
                    },
                  ].map((f) => (
                    <AuthField
                      key={f.name}
                      {...f}
                      register={register}
                      errors={errors}
                    />
                  ))}
                <AuthField
                  name="email"
                  label="Email"
                  placeholder="you@company.com"
                  type="email"
                  register={register}
                  errors={errors}
                />
                {signup && (
                  <>
                    <AuthField
                      name="phone"
                      label="Phone Number"
                      placeholder="Contact number"
                      type="tel"
                      register={register}
                      errors={errors}
                    />
                    <div className="field">
                      <label htmlFor="businessType">Business Type *</label>
                      <select id="businessType" {...register("businessType")}>
                        <option value="">Select type</option>
                        {[
                          "Business",
                          "Vendor",
                          "Institution",
                          "Partner",
                          "Other",
                        ].map((t) => (
                          <option key={t}>{t}</option>
                        ))}
                      </select>
                      {errors.businessType && (
                        <span className="field-error">
                          {errors.businessType.message}
                        </span>
                      )}
                    </div>
                    <AuthField
                      name="location"
                      label="Province / City"
                      placeholder="Your location"
                      register={register}
                      errors={errors}
                    />
                  </>
                )}
                <AuthField
                  name="password"
                  label="Password"
                  placeholder="At least 8 characters"
                  type="password"
                  register={register}
                  errors={errors}
                />
              </div>
              {signup ? (
                <>
                  <label className="checkbox-label">
                    <input type="checkbox" {...register("terms")} />
                    <span>
                      I agree to the{" "}
                      <Link href="/terms" target="_blank">
                        Privacy & Terms
                      </Link>{" "}
                      for this prototype.
                    </span>
                  </label>
                  {errors.terms && (
                    <span className="field-error">{errors.terms.message}</span>
                  )}
                </>
              ) : (
                <button
                  type="button"
                  className="forgot-link"
                  disabled={resetting}
                  onClick={forgot}
                >
                  {resetting ? "Requesting…" : "Forgot password?"}
                </button>
              )}
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? "Please wait…"
                  : signup
                    ? "Create Account"
                    : "Sign In"}
                <ArrowRight size={15} />
              </Button>
            </form>
            <div className="auth-switch">
              {signup ? "Already have an account? " : "New to Lucent Drop? "}
              <Link href={signup ? "/login" : "/signup"}>
                {signup ? "Sign in" : "Create an account"}
              </Link>
            </div>
            {!configured && (
              <>
                <div className="auth-divider">Explore the prototype</div>
                <Button variant="outline" onClick={preview}>
                  Preview Member Experience <ArrowRight size={15} />
                </Button>
                <p className="demo-caption">
                  Demo access only. No account is created.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
type Values = z.infer<typeof signupSchema>;
function AuthField({
  name,
  label,
  placeholder,
  type = "text",
  register,
  errors,
}: {
  name: string;
  label: string;
  placeholder: string;
  type?: string;
  register: ReturnType<typeof useForm<Values>>["register"];
  errors: ReturnType<typeof useForm<Values>>["formState"]["errors"];
}) {
  const key = name as keyof Values;
  return (
    <div className="field">
      <label htmlFor={name}>{label} *</label>
      <input
        id={name}
        type={type}
        placeholder={placeholder}
        autoComplete={
          name === "password"
            ? "current-password"
            : name === "email"
              ? "email"
              : undefined
        }
        {...register(key)}
        aria-invalid={!!errors[key]}
        aria-describedby={errors[key] ? `${name}-error` : undefined}
      />
      {errors[key] && (
        <span id={`${name}-error`} className="field-error">
          {errors[key]?.message}
        </span>
      )}
    </div>
  );
}
