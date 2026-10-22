import Link from "next/link";
import { cn } from "@/lib/utils";

export function LogoMark({ size = 32, inverted = false }: { size?: number; inverted?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="9" fill={inverted ? "#fff" : "#4338CA"} />
      <rect x="8" y="8" width="6" height="16" rx="2" fill={inverted ? "#4338CA" : "#fff"} />
      <rect x="18" y="8" width="6" height="10" rx="2" fill={inverted ? "#0E1020" : "#D4F75B"} />
    </svg>
  );
}

export function Logo({ href = "/", inverted = false, className }: { href?: string; inverted?: boolean; className?: string }) {
  return (
    <Link href={href} className={cn("flex items-center gap-2.5", inverted ? "text-white" : "text-ink", className)} aria-label="Coplan home">
      <LogoMark inverted={inverted} />
      <span className="font-display text-[22px] font-bold tracking-[-0.02em]">Coplan</span>
    </Link>
  );
}
