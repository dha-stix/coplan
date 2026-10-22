"use client";

import { ArrowRight, Lock, Mail, User } from "lucide-react";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { FormError, PasswordField, TextField } from "@/components/ui/Field";
import { authErrorMessage, registerWithEmail } from "@/lib/firebase-actions";
import { isFirebaseConfigured } from "@/lib/firebase";
import { usePendingInvite } from "@/lib/pending-invite";
import { isValidEmail } from "@/lib/utils";
import { AuthHeading, OrDivider } from "./AuthShell";
import { GoogleButton } from "./GoogleButton";
import { PASSWORD_RULES, PasswordStrength } from "./PasswordStrength";

/** Invite details are only readable once signed in, so this stays general. */
function InviteBanner() {
  return (
    <div className="cp-in flex items-center gap-3.5 rounded-2xl border border-line bg-white p-4">
      <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand">
        <Mail className="size-5" />
      </span>
      <span className="text-sm leading-normal text-ink-2">
        <strong className="text-ink">You&apos;ve been invited to a team on Coplan.</strong> Sign up with the email address the invite was sent to and
        we&apos;ll take you straight to it.
      </span>
    </div>
  );
}

export function RegisterForm() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const invite = usePendingInvite();

  const update = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [key]: e.target.value }));

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (form.name.trim().length < 2) return setError("Please enter your full name.");
    if (!isValidEmail(form.email)) return setError("Please enter a valid email address.");
    if (!PASSWORD_RULES[0].test(form.password) || !PASSWORD_RULES[1].test(form.password)) {
      return setError("Use at least 8 characters, including a number.");
    }
    if (!agreed) return setError("Please accept the Terms and Privacy Policy to continue.");
    setError(null);
    setLoading(true);
    try {
      await registerWithEmail(form);
    } catch (err) {
      setError(authErrorMessage(err));
      setLoading(false);
    }
  }

  return (
    <>
      {invite && <InviteBanner />}
      <AuthHeading title="Create your account" body="Use Google or your email. We'll set up your first workspace for you." />
      <GoogleButton label="Sign up with Google" onError={setError} />
      <OrDivider label="or sign up with email" />
      <form onSubmit={handleSubmit} className="flex flex-col gap-3.5" noValidate>
        <TextField label="Full name" autoComplete="name" placeholder="Your name" icon={<User />} value={form.name} onChange={update("name")} />
        <TextField label="Work email" type="email" autoComplete="email" placeholder="you@company.com" icon={<Mail />} value={form.email} onChange={update("email")} />
        <div className="flex flex-col gap-2">
          <PasswordField label="Password" autoComplete="new-password" placeholder="At least 8 characters" icon={<Lock />} value={form.password} onChange={update("password")} />
          <PasswordStrength password={form.password} />
        </div>
        <label className="flex cursor-pointer items-start gap-2.5 text-[13px] leading-normal text-ink-2">
          <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-px size-[18px] accent-brand" />
          <span>
            I agree to the{" "}
            <Link href="/#faq" className="text-brand">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="/#faq" className="text-brand">
              Privacy Policy
            </Link>
          </span>
        </label>
        <FormError message={error} />
        <Button type="submit" variant="dark" size="lg" loading={loading} disabled={!isFirebaseConfigured}>
          Create account
          {!loading && <ArrowRight className="cp-nudge size-[18px]" />}
        </Button>
      </form>
      <p className="text-[15px] text-muted">
        Already have an account?{" "}
        <Link href="/auth/login" className="font-semibold text-brand hover:text-brand-600">
          Log in
        </Link>
      </p>
    </>
  );
}
