"use client";
import { sitePath } from "@/lib/site-path";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getSupabase } from "@/lib/supabase/client";
import { safeReturnPath } from "@/components/forms/auth-form";
import { Button } from "@/components/ui/button";
export default function CallbackPage() {
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    (async () => {
      const client = getSupabase();
      if (!client) {
        setError("Supabase is not configured.");
        return;
      }
      const params = new URLSearchParams(window.location.search);
      if (params.has("error")) {
        setError("The confirmation link has expired or is invalid.");
        return;
      }
      const code = params.get("code");
      if (code) {
        const { error } = await client.auth.exchangeCodeForSession(code);
        if (error) {
          setError("Unable to confirm this link. Please request a new one.");
          return;
        }
      }
      const {
        data: { session },
      } = await client.auth.getSession();
      if (!session) {
        setError("No session found. Please sign in to continue.");
        return;
      }
      if (active)
        window.location.replace(sitePath(safeReturnPath(params.get("next"))));
    })().catch(() => setError("Unable to complete sign in. Please try again."));
    return () => {
      active = false;
    };
  }, []);
  return (
    <section className="container section empty-state">
      <h1>
        {error ? "Unable to confirm account" : "Confirming your account…"}
      </h1>
      <p>{error || "Please wait while we complete sign in."}</p>
      {error && (
        <Button asChild>
          <Link href="/login">Back to Login</Link>
        </Button>
      )}
    </section>
  );
}
