"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ConfigNotice } from "@/components/auth/ConfigNotice";
import { Button, ButtonLink } from "@/components/ui/Button";
import { FormError } from "@/components/ui/Field";
import { Logo } from "@/components/ui/Logo";
import { PageLoader } from "@/components/ui/Spinner";
import { useAuth } from "@/lib/auth-context";
import type { User } from "firebase/auth";
import { acceptInvite, authErrorMessage, getInvite, logout, refreshEmailVerified, sendVerificationEmail } from "@/lib/firebase-actions";
import { clearPendingInvite, savePendingInvite } from "@/lib/pending-invite";
import type { Invite } from "@/lib/types";
import inviteArt from "@/images/invite.svg";

/** Invites are matched by email, so email/password accounts must confirm their address first. */
function VerifyEmailStep({ user, onVerified }: { user: User; onVerified: () => void }) {
  const [checking, setChecking] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function check() {
    setChecking(true);
    setError(null);
    try {
      if (await refreshEmailVerified(user)) onVerified();
      else setError("We couldn't confirm it yet. Click the link in the verification email, then try again.");
    } finally {
      setChecking(false);
    }
  }

  async function resend() {
    setError(null);
    try {
      await sendVerificationEmail(user);
      setNotice(`Verification email sent to ${user.email}.`);
    } catch (err) {
      setError(authErrorMessage(err));
    }
  }

  return (
    <>
      <p className="w-full rounded-2xl bg-amber-50 px-4 py-3 text-left text-sm leading-relaxed text-amber-900">
        <strong>Confirm your email to join.</strong> We sent a verification link to {user.email}. Click it, then come back here.
      </p>
      {notice && <p className="text-sm text-teal">{notice}</p>}
      <FormError message={error} />
      <Button size="lg" className="w-full" onClick={check} loading={checking}>
        I&apos;ve verified — continue
      </Button>
      <Button variant="ghost" onClick={resend}>
        Resend verification email
      </Button>
    </>
  );
}

/**
 * Landing page for an emailed invite link. Signed-out visitors are sent to sign up
 * (the invite is remembered); signed-in visitors can accept straight away.
 */
export function AcceptInvite({ token }: { token: string }) {
  const { user, loading, configured } = useAuth();
  const router = useRouter();
  const [invite, setInvite] = useState<Invite | null | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);
  // Bumped after the user confirms their email, since Firebase updates the user object in place.
  const [verifiedNow, setVerifiedNow] = useState(false);

  // Invite documents can only be read when signed in, so we fetch after auth resolves.
  useEffect(() => {
    if (!user) return;
    getInvite(token)
      .then(setInvite)
      .catch(() => setInvite(null));
  }, [user, token]);

  useEffect(() => {
    if (configured && !loading && !user) {
      savePendingInvite({ token });
    }
  }, [configured, loading, user, token]);

  async function join() {
    if (!user) return;
    setJoining(true);
    setError(null);
    try {
      const path = await acceptInvite(user, token);
      clearPendingInvite();
      router.replace(path);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't accept the invite.");
      setJoining(false);
    }
  }

  let body: React.ReactNode;
  if (!configured) body = <ConfigNotice />;
  else if (loading || (user && invite === undefined)) body = <PageLoader label="Opening your invite" />;
  else if (!user) {
    body = (
      <>
        <h1 className="font-display text-[30px] font-bold tracking-[-0.03em]">You&apos;ve been invited to Coplan</h1>
        <p className="leading-relaxed text-muted">Create an account or log in with the email address this invite was sent to, and we&apos;ll bring you straight back here.</p>
        <div className="grid w-full gap-2.5 sm:grid-cols-2">
          <ButtonLink href="/auth/register" size="lg">
            Create account
          </ButtonLink>
          <ButtonLink href="/auth/login" variant="secondary" size="lg">
            Log in
          </ButtonLink>
        </div>
      </>
    );
  } else if (!invite || invite.status === "revoked") {
    body = (
      <>
        <h1 className="font-display text-[30px] font-bold tracking-[-0.03em]">This invite isn&apos;t valid</h1>
        <p className="leading-relaxed text-muted">It may have been revoked. Ask the person who invited you to send a new one.</p>
        <ButtonLink href="/dashboard" variant="secondary" size="lg">
          Go to dashboard
        </ButtonLink>
      </>
    );
  } else {
    const wrongEmail = invite.email.toLowerCase() !== (user.email ?? "").toLowerCase();
    body = (
      <>
        <h1 className="font-display text-[30px] font-bold tracking-[-0.03em]">Join {invite.targetName}</h1>
        <p className="leading-relaxed text-muted">
          <strong className="text-ink">{invite.invitedByName}</strong> invited you to the {invite.scope} <strong className="text-ink">{invite.targetName}</strong> as a{" "}
          <span className="rounded-md bg-brand-soft px-1.5 font-semibold capitalize text-brand">{invite.role}</span>.
        </p>
        {invite.message && <blockquote className="w-full rounded-2xl bg-canvas px-4 py-3 text-left text-sm italic text-ink-2">&ldquo;{invite.message}&rdquo;</blockquote>}
        {wrongEmail ? (
          <>
            <FormError message={`This invite was sent to ${invite.email}, but you're signed in as ${user.email}.`} />
            <Button variant="secondary" size="lg" className="w-full" onClick={() => logout()}>
              Switch account
            </Button>
          </>
        ) : invite.status === "pending" && !user.emailVerified && !verifiedNow ? (
          <VerifyEmailStep user={user} onVerified={() => setVerifiedNow(true)} />
        ) : invite.status === "accepted" ? (
          <Button size="lg" className="w-full" onClick={join} loading={joining}>
            Open {invite.scope}
          </Button>
        ) : (
          <>
            <FormError message={error} />
            <Button size="lg" className="w-full" onClick={join} loading={joining}>
              Accept invite
            </Button>
          </>
        )}
      </>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col px-4 py-6 sm:px-6">
      <Logo />
      <main className="flex flex-1 items-center justify-center py-10">
        <div className="cp-in flex w-full max-w-[460px] flex-col items-center gap-5 rounded-[28px] border border-line bg-white p-[clamp(24px,5vw,44px)] text-center shadow-[0_30px_80px_rgba(14,16,32,0.08)]">
          <Image src={inviteArt} alt="" width={200} height={142} className="cp-float" />
          {body}
        </div>
      </main>
    </div>
  );
}
