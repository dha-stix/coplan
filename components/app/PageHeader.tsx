import type { ReactNode } from "react";

/** Title row used at the top of app pages. */
export function PageHeader({ eyebrow, title, actions }: { eyebrow?: ReactNode; title: ReactNode; actions?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="flex min-w-0 flex-col gap-1.5">
        {eyebrow && <span className="text-sm text-muted">{eyebrow}</span>}
        <h1 className="font-display text-[clamp(26px,3.4vw,36px)] font-bold tracking-[-0.03em]">{title}</h1>
      </div>
      {actions}
    </div>
  );
}

export function PageBody({ children }: { children: ReactNode }) {
  return <main className="mx-auto flex w-full max-w-[1180px] flex-col gap-7 px-4 pb-12 pt-7 sm:px-6 sm:pt-8">{children}</main>;
}
