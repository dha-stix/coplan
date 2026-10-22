import { cn } from "@/lib/utils";

/** Full-colour Google "G". Pass `mono` for a white version on dark buttons. */
export function GoogleIcon({ className, mono = false }: { className?: string; mono?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("size-5", className)} aria-hidden="true">
      <path fill={mono ? "#fff" : "#4285F4"} d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.3Z" />
      <path fill={mono ? "#fff" : "#34A853"} opacity={mono ? 0.85 : 1} d="M12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22Z" />
      <path fill={mono ? "#fff" : "#FBBC05"} opacity={mono ? 0.7 : 1} d="M6.4 14c-.2-.6-.3-1.3-.3-2s.1-1.4.3-2V7.4H3.1a10 10 0 0 0 0 9.2L6.4 14Z" />
      <path fill={mono ? "#fff" : "#EA4335"} opacity={mono ? 0.55 : 1} d="M12 6c1.5 0 2.8.5 3.8 1.5l2.9-2.9A10 10 0 0 0 3.1 7.4L6.4 10C7.2 7.7 9.4 6 12 6Z" />
    </svg>
  );
}

/** Bell that swings when `ringing` is set — used for the notification bell. */
export function BellIcon({ className, ringing = false }: { className?: string; ringing?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={cn("size-5", ringing && "cp-ring", className)} aria-hidden="true">
      <path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.9 1.9 0 0 0 3.4 0" />
    </svg>
  );
}

export function CheckDraw({ className, delay = 0 }: { className?: string; delay?: number }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={cn("size-3.5", className)} aria-hidden="true">
      <path className="cp-draw" style={{ ["--len" as string]: 22, animationDelay: `${delay}s` }} d="m5 12 5 5 9-10" />
    </svg>
  );
}
