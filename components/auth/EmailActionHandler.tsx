"use client";

import { AlertTriangle, Lock } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { Button, ButtonLink } from "@/components/ui/Button";
import { FormError, PasswordField } from "@/components/ui/Field";
import { Spinner } from "@/components/ui/Spinner";
import { authErrorMessage, checkPasswordResetLink, completePasswordReset, recoverEmailLink, verifyEmailLink } from "@/lib/firebase-actions";
import { AuthCard, AuthCardHeading, BackToLogin, LockAnimation, SuccessAnimation } from "./AuthCard";
import { PASSWORD_RULES, PasswordStrength } from "./PasswordStrength";

type Mode = "resetPassword" | "verifyEmail" | "recoverEmail";
const MODES: Mode[] = ["resetPassword", "verifyEmail", "recoverEmail"];

type View =
  | { kind: "checking" }
  | { kind: "reset"; email: string }
  | { kind: "done"; title: string; body: string; cta: { href: string; label: string } }
  | { kind: "error"; message: string; retry: boolean };

/**
 * Handles every link Firebase emails (password reset, email verification, email recovery)
 * at /auth/action?mode=...&oobCode=..., so users never leave Coplan.
 */
export function EmailActionHandler() {
  const params = useSearchParams();
  const mode = params.get("mode") as Mode | null;
  const code = params.get("oobCode");
  const valid = Boolean(code && mode && MODES.includes(mode));
  const [view, setView] = useState<View>(
    valid ? { kind: "checking" } : { kind: "error", message: "This link is incomplete. Open it straight from your email, or request a new one.", retry: true },
  );

  useEffect(() => {
    if (!valid || !code) return;
    const fail = (err: unknown) => setView({ kind: "error", message: authErrorMessage(err), retry: mode === "resetPassword" });
    if (mode === "resetPassword") {
      checkPasswordResetLink(code).then((email) => setView({ kind: "reset", email }), fail);
    } else if (mode === "verifyEmail") {
      verifyEmailLink(code).then(
        () => setView({ kind: "done", title: "Email verified", body: "Thanks! Your email address is confirmed.", cta: { href: "/dashboard", label: "Open Coplan" } }),
        fail,
      );
    } else if (mode === "recoverEmail") {
      recoverEmailLink(code).then(
        (email) =>
          setView({
            kind: "done",
            title: "Email restored",
            body: `Your sign-in email is back to ${email}. If you didn't request the change, reset your password to secure your account.`,
            cta: { href: "/auth/forgot-password", label: "Reset password" },
          }),
        fail,
      );
    }
  }, [valid, code, mode]);

  return (
    <AuthCard>
      {view.kind === "checking" && (
        <div className="flex flex-col items-center gap-3 py-8 text-muted" role="status">
          <Spinner className="size-7 text-brand" />
          <span className="text-sm">Checking your link…</span>
        </div>
      )}

      {view.kind === "reset" && code && (
        <NewPasswordForm
          code={code}
          email={view.email}
          onDone={(signedIn) =>
            setView({
              kind: "done",
              title: "Password updated",
              body: signedIn ? "You're signed in with your new password." : "You can now log in with your new password.",
              cta: signedIn ? { href: "/dashboard", label: "Go to dashboard" } : { href: "/auth/login", label: "Log in" },
            })
          }
        />
      )}

      {view.kind === "done" && (
        <>
          <SuccessAnimation />
          <AuthCardHeading title={view.title}>{view.body}</AuthCardHeading>
          <ButtonLink href={view.cta.href} size="lg" className="w-full">
            {view.cta.label}
          </ButtonLink>
        </>
      )}

      {view.kind === "error" && (
        <>
          <span className="flex size-16 items-center justify-center rounded-2xl bg-red-50 text-danger">
            <AlertTriangle className="size-7" />
          </span>
          <AuthCardHeading title="This link didn't work">{view.message}</AuthCardHeading>
          {view.retry && (
            <ButtonLink href="/auth/forgot-password" size="lg" className="w-full">
              Request a new reset link
            </ButtonLink>
          )}
          <BackToLogin />
        </>
      )}
    </AuthCard>
  );
}

function NewPasswordForm({ code, email, onDone }: { code: string; email: string; onDone: (signedIn: boolean) => void }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!PASSWORD_RULES[0].test(password) || !PASSWORD_RULES[1].test(password)) return setError("Use at least 8 characters, including a number.");
    if (password !== confirm) return setError("The two passwords don't match.");
    setError(null);
    setSaving(true);
    try {
      onDone(await completePasswordReset(code, email, password));
    } catch (err) {
      setError(authErrorMessage(err));
      setSaving(false);
    }
  }

  return (
    <>
      <LockAnimation />
      <AuthCardHeading title="Choose a new password">
        For <strong className="text-ink">{email}</strong>
      </AuthCardHeading>
      <form onSubmit={submit} className="flex w-full flex-col gap-4 text-left" noValidate>
        {/* Lets password managers save the new password against the right account. */}
        <input type="email" name="username" autoComplete="username" value={email} readOnly hidden />
        <div className="flex flex-col gap-2">
          <PasswordField label="New password" autoComplete="new-password" placeholder="At least 8 characters" icon={<Lock />} value={password} onChange={(e) => setPassword(e.target.value)} autoFocus />
          <PasswordStrength password={password} />
        </div>
        <PasswordField
          label="Confirm new password"
          autoComplete="new-password"
          placeholder="Type it again"
          icon={<Lock />}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          error={confirm && confirm !== password ? "Passwords don't match yet." : null}
        />
        <FormError message={error} />
        <Button type="submit" size="lg" loading={saving}>
          Save new password
        </Button>
      </form>
      <BackToLogin />
    </>
  );
}
