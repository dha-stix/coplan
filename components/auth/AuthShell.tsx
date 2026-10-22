"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { motion } from "motion/react";
import { Logo } from "@/components/ui/Logo";
import { useAuth } from "@/lib/auth-context";
import { postAuthPath } from "@/lib/pending-invite";
import { cn } from "@/lib/utils";
import { ConfigNotice } from "./ConfigNotice";

interface AuthShellProps {
  children: ReactNode;
  /** Decorative panel shown beside the form on wide screens. */
  aside?: ReactNode;
  asideFirst?: boolean;
  footer?: ReactNode;
}

/** Shared frame for the auth pages; sends already signed-in visitors on to the app. */
export function AuthShell({ children, aside, asideFirst, footer }: AuthShellProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      // Honour ?next= from a protected page, but only for same-site paths.
      const next = new URLSearchParams(window.location.search).get("next");
      router.replace(next && next.startsWith("/") && !next.startsWith("//") ? next : postAuthPath());
    }
  }, [loading, user, router]);

  return (
    <div className={cn("flex min-h-dvh", asideFirst && "flex-row-reverse")}>
      <main className="flex min-w-0 flex-[1_1_560px] flex-col px-4 py-6 sm:px-6 sm:py-7">
        <Logo className="self-start" />
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.2, 0.7, 0.2, 1] }}
          className="flex flex-1 items-center justify-center py-10"
        >
          <div className="flex w-full max-w-[420px] flex-col gap-5">
            <ConfigNotice />
            {children}
          </div>
        </motion.div>
        {footer}
      </main>
      {aside && <aside className="relative m-3 hidden min-w-0 flex-[1_1_520px] overflow-hidden rounded-[28px] lg:flex">{aside}</aside>}
    </div>
  );
}

export function AuthHeading({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex flex-col gap-2.5">
      <h1 className="font-display text-[clamp(32px,4vw,40px)] font-bold leading-[1.05] tracking-[-0.03em]">{title}</h1>
      <p className="leading-relaxed text-muted">{body}</p>
    </div>
  );
}

export function OrDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3.5 text-[13px] text-muted">
      <span className="h-px flex-1 bg-line" />
      {label}
      <span className="h-px flex-1 bg-line" />
    </div>
  );
}
