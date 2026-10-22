import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/ui/Reveal";

interface SectionHeaderProps {
  eyebrow: string;
  title: ReactNode;
  body?: ReactNode;
  center?: boolean;
  dark?: boolean;
  className?: string;
}

export function SectionHeader({ eyebrow, title, body, center, dark, className }: SectionHeaderProps) {
  return (
    <Reveal className={cn("flex max-w-2xl flex-col gap-4", center && "mx-auto items-center text-center", className)}>
      <span className={cn("eyebrow", dark && "text-lime")}>{eyebrow}</span>
      <h2 className="section-title">{title}</h2>
      {body && <p className={cn("text-[17px] leading-relaxed", dark ? "text-night-text" : "text-muted")}>{body}</p>}
    </Reveal>
  );
}
