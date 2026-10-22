import { Circle } from "lucide-react";
import { CheckDraw } from "@/components/ui/Icons";
import { cn } from "@/lib/utils";

export const PASSWORD_RULES = [
  { label: "8+ characters", test: (p: string) => p.length >= 8 },
  { label: "A number", test: (p: string) => /\d/.test(p) },
  { label: "A symbol", test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

const LEVELS = [
  { label: "Too weak", color: "#B91C1C" },
  { label: "Weak", color: "#B91C1C" },
  { label: "Good", color: "#B45309" },
  { label: "Strong", color: "#0F766E" },
  { label: "Very strong", color: "#0F766E" },
];

export function passwordScore(password: string) {
  return PASSWORD_RULES.filter((r) => r.test(password)).length + (password.length >= 12 ? 1 : 0);
}

export function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;
  const score = passwordScore(password);
  const level = LEVELS[score];
  return (
    <div className="flex flex-col gap-2" aria-live="polite">
      <div className="flex items-center gap-2.5">
        <div className="flex flex-1 gap-1" aria-hidden="true">
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className="h-[5px] flex-1 overflow-hidden rounded-full bg-line">
              {i < score && <span className="cp-grow block h-full rounded-full" style={{ background: level.color, animationDelay: `${i * 0.08}s` }} />}
            </span>
          ))}
        </div>
        <span className="text-xs font-semibold" style={{ color: level.color }}>
          {level.label}
        </span>
      </div>
      <div className="flex flex-wrap gap-x-3.5 gap-y-1.5 text-xs">
        {PASSWORD_RULES.map((rule) => {
          const ok = rule.test(password);
          return (
            <span key={rule.label} className={cn("inline-flex items-center gap-1.5", ok ? "text-ink-2" : "text-muted")}>
              {ok ? <CheckDraw className="text-teal" /> : <Circle className="size-3.5 text-faint" />}
              {rule.label}
            </span>
          );
        })}
      </div>
    </div>
  );
}
