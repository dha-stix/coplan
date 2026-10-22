import { LABELS } from "@/lib/constants";
import type { LabelKey } from "@/lib/types";
import { cn } from "@/lib/utils";

export function LabelTag({ label, className }: { label: LabelKey; className?: string }) {
  const { name, bg, fg } = LABELS[label];
  return (
    <span className={cn("inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold", className)} style={{ background: bg, color: fg }}>
      {name}
    </span>
  );
}
