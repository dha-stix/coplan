import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

/** Centred white card used by the password-reset pages. */
export function AuthCard({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-5 rounded-[28px] border border-line bg-white p-[clamp(24px,5vw,44px)] text-center shadow-[0_30px_80px_rgba(14,16,32,0.08)]">
      {children}
    </div>
  );
}

export function AuthCardHeading({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <h1 className="font-display text-[32px] font-bold tracking-[-0.03em]">{title}</h1>
      {children && <p className="text-[15px] leading-relaxed text-muted">{children}</p>}
    </div>
  );
}

export function BackToLogin() {
  return (
    <Link href="/auth/login" className="inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-brand hover:text-brand-600">
      <ArrowLeft className="size-4" />
      Back to log in
    </Link>
  );
}

export function EnvelopeAnimation() {
  return (
    <svg className="cp-float" width="168" height="120" viewBox="0 0 168 120" role="img" aria-label="Envelope with a paper plane flying out">
      <path className="cp-flow" d="M14 104 C 44 74, 70 112, 104 70 S 140 30, 150 22" fill="none" stroke="#C7CAF5" strokeWidth="2" />
      <rect x="34" y="44" width="88" height="62" rx="10" fill="#EEF0FF" stroke="#4338CA" strokeWidth="2.5" />
      <path d="m36 50 42 28 42-28" fill="none" stroke="#4338CA" strokeWidth="2.5" strokeLinejoin="round" />
      <g className="cp-fly">
        <path d="M156 12 124 24l12 5 4 13z" fill="#D4F75B" stroke="#0E1020" strokeWidth="2" strokeLinejoin="round" />
        <path d="m136 29 20-17" stroke="#0E1020" strokeWidth="2" />
      </g>
    </svg>
  );
}

export function SuccessAnimation() {
  return (
    <svg className="cp-pop" width="96" height="96" viewBox="0 0 96 96" role="img" aria-label="Success">
      <circle cx="48" cy="48" r="44" fill="#DCFCE7" />
      <circle className="cp-draw" style={{ ["--len" as string]: 260 }} cx="48" cy="48" r="40" fill="none" stroke="#0F766E" strokeWidth="4" strokeLinecap="round" transform="rotate(-90 48 48)" />
      <path className="cp-draw" style={{ ["--len" as string]: 50, animationDelay: "0.55s" }} d="m32 49 11 11 22-24" fill="none" stroke="#0F766E" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
