"use client";

import { ArrowRight, Lock, Mail } from "lucide-react";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { FormError, PasswordField, TextField } from "@/components/ui/Field";
import { authErrorMessage, loginWithEmail } from "@/lib/firebase-actions";
import { isFirebaseConfigured } from "@/lib/firebase";
import { isValidEmail } from "@/lib/utils";
import { AuthHeading, OrDivider } from "./AuthShell";
import { GoogleButton } from "./GoogleButton";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!isValidEmail(email)) return setError("Please enter a valid email address.");
    if (!password) return setError("Please enter your password.");
    setError(null);
    setLoading(true);
    try {
      await loginWithEmail({ email, password, remember });
    } catch (err) {
      setError(authErrorMessage(err));
      setLoading(false);
    }
  }

  return (
    <>
      <AuthHeading title="Welcome back" body="Log in to pick up where your team left off." />
      <GoogleButton label="Continue with Google" onError={setError} remember={remember} />
      <OrDivider label="or log in with email" />
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <TextField label="Email" type="email" autoComplete="email" placeholder="you@company.com" icon={<Mail />} value={email} onChange={(e) => setEmail(e.target.value)} />
        <PasswordField
          label="Password"
          autoComplete="current-password"
          placeholder="••••••••"
          icon={<Lock />}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          labelAction={
            <Link href="/auth/forgot-password" className="text-[13px] font-semibold text-brand hover:text-brand-600">
              Forgot password?
            </Link>
          }
        />
        <label className="flex cursor-pointer items-center gap-2.5 text-sm text-ink-2">
          <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="size-[18px] accent-brand" />
          Keep me logged in
        </label>
        <FormError message={error} />
        <Button type="submit" size="lg" loading={loading} disabled={!isFirebaseConfigured} className="group">
          Log in
          {!loading && <ArrowRight className="cp-nudge size-[18px]" />}
        </Button>
      </form>
      <p className="text-[15px] text-muted">
        New to Coplan?{" "}
        <Link href="/auth/register" className="font-semibold text-brand hover:text-brand-600">
          Create an account
        </Link>
      </p>
    </>
  );
}
