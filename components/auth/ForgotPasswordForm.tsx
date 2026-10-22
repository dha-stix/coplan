"use client";

import { Mail } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { FormError, TextField } from "@/components/ui/Field";
import { authErrorMessage, resetPassword } from "@/lib/firebase-actions";
import { isFirebaseConfigured } from "@/lib/firebase";
import { isValidEmail } from "@/lib/utils";
import { AuthCard, AuthCardHeading, BackToLogin, EnvelopeAnimation, SuccessAnimation } from "./AuthCard";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function send(e?: FormEvent) {
    e?.preventDefault();
    const target = sentTo ?? email;
    if (!isValidEmail(target)) return setError("Please enter a valid email address.");
    setError(null);
    setLoading(true);
    try {
      await resetPassword(target);
      setSentTo(target.trim());
    } catch (err) {
      // Don't reveal whether an account exists for this email.
      if ((err as { code?: string }).code === "auth/user-not-found") setSentTo(target.trim());
      else setError(authErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard>
      {sentTo ? (
        <>
          <SuccessAnimation />
          <AuthCardHeading title="Check your inbox">
            If an account exists for <strong className="text-ink">{sentTo}</strong>, a reset link is on its way.
          </AuthCardHeading>
          <FormError message={error} />
          <Button variant="secondary" size="lg" className="w-full" onClick={() => send()} loading={loading}>
            Resend email
          </Button>
        </>
      ) : (
        <>
          <EnvelopeAnimation />
          <AuthCardHeading title="Forgot your password?">Enter the email you signed up with and we&apos;ll send you a link to reset it.</AuthCardHeading>
          <form onSubmit={send} className="flex w-full flex-col gap-4 text-left" noValidate>
            <TextField label="Email" type="email" autoComplete="email" placeholder="you@company.com" icon={<Mail />} value={email} onChange={(e) => setEmail(e.target.value)} />
            <FormError message={error} />
            <Button type="submit" size="lg" loading={loading} disabled={!isFirebaseConfigured}>
              Send reset link
            </Button>
          </form>
        </>
      )}
      <BackToLogin />
    </AuthCard>
  );
}
