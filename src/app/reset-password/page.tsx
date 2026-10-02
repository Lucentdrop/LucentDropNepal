"use client";
import { useState } from "react";
import { getSupabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/providers";
export default function ResetPage() {
  const { member } = useAuth();
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      setStatus("Use at least 8 characters.");
      return;
    }
    if (!member || member.isDemo) {
      setStatus("Open a valid password reset link from your email.");
      return;
    }
    setBusy(true);
    const { error } = await getSupabase()!.auth.updateUser({ password });
    setBusy(false);
    setStatus(
      error
        ? "Unable to update your password. Request a new reset link."
        : "Password updated. You can now sign in with your new password.",
    );
    setPassword("");
  }
  return (
    <section className="container section article">
      <form className="form-card" onSubmit={submit}>
        <h1>Set a new password</h1>
        <p className="mt-4">
          Use the reset link sent to your email to update your password.
        </p>
        <div className="field mt-6">
          <label htmlFor="new-password">New Password</label>
          <input
            type="password"
            id="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            minLength={8}
            required
          />
        </div>
        {status && (
          <p role="status" className="notice mt-5">
            {status}
          </p>
        )}
        <Button className="mt-5" disabled={busy || !member || member.isDemo}>
          Update Password
        </Button>
      </form>
    </section>
  );
}
