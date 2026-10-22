import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function EmptyState({ icon, title, body, action, className }: { icon?: ReactNode; title: string; body?: string; action?: ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col items-center gap-3 rounded-3xl border-2 border-dashed border-line-2 px-6 py-12 text-center", className)}>
      {icon && <div className="flex size-14 items-center justify-center rounded-2xl bg-brand-soft text-brand">{icon}</div>}
      <h3 className="text-base font-semibold">{title}</h3>
      {body && <p className="max-w-sm text-sm leading-relaxed text-muted">{body}</p>}
      {action}
    </div>
  );
}
