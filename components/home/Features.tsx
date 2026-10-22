import type { ReactNode } from "react";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeader } from "./SectionHeader";
import { EnvelopePlaneIcon, LayersIcon, RingingBellIcon, TypingIcon } from "./FeatureIcons";

const FEATURES: { icon: ReactNode; title: string; body: string }[] = [
  { icon: <TypingIcon />, title: "Comments & @mentions", body: "Discuss every task in context and tag teammates to pull them into the conversation." },
  { icon: <RingingBellIcon />, title: "Notification bell", body: "Get in-app alerts the moment you are tagged, assigned or a task you follow changes." },
  { icon: <EnvelopePlaneIcon />, title: "Email invites", body: "Invite people to a project or a whole workspace with one email — they join in a click." },
  { icon: <LayersIcon />, title: "Workspaces & projects", body: "Group boards by team or client. Switch workspaces without losing your place." },
];

function DragDropAnimation() {
  const col = (x: number, label: string) => (
    <g key={label}>
      <rect x={x} y="0" width="130" height="150" rx="12" fill="#1B1E33" />
      <text x={x + 12} y="22" fontFamily="Inter, sans-serif" fontSize="11" fill="#B9BCCB">
        {label}
      </text>
    </g>
  );
  const card = (x: number, y: number) => <rect key={`${x}-${y}`} x={x} y={y} width="110" height="34" rx="8" fill="#2A2E48" />;
  return (
    <svg viewBox="0 0 420 150" role="img" aria-label="A task card sliding from To do into In progress" className="mt-2 h-auto w-full max-w-[540px]">
      {col(0, "To do")}
      {col(145, "In progress")}
      {col(290, "Done")}
      {card(10, 78)}
      <rect className="cp-flow" x="155" y="34" width="110" height="34" rx="8" fill="none" stroke="#4F46E5" strokeWidth="2" />
      {card(155, 78)}
      {card(300, 34)}
      {card(300, 78)}
      <g className="cp-slide">
        <rect x="10" y="34" width="110" height="34" rx="8" fill="#D4F75B" />
        <rect x="20" y="45" width="62" height="5" rx="2.5" fill="#0E1020" />
        <rect x="20" y="55" width="38" height="4" rx="2" fill="#0E1020" opacity="0.45" />
        <path d="M92 52l14 6-6 2-2 6z" fill="#fff" stroke="#0E1020" strokeWidth="1.5" strokeLinejoin="round" />
      </g>
    </svg>
  );
}

export function Features() {
  return (
    <section id="features" className="mx-auto flex max-w-6xl scroll-mt-20 flex-col gap-12 px-4 py-24 sm:px-5 lg:py-28">
      <SectionHeader eyebrow="Features" title="Everything your team needs to move work forward." />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <Reveal className="sm:col-span-2">
          <article className="flex h-full flex-col gap-5 overflow-hidden rounded-3xl bg-night p-7 text-white sm:p-8">
            <span className="flex size-11 items-center justify-center rounded-xl bg-lime">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0E1020" strokeWidth="2" aria-hidden="true">
                <rect x="3" y="3" width="7" height="18" rx="2" />
                <rect x="14" y="3" width="7" height="11" rx="2" />
              </svg>
            </span>
            <h3 className="font-display text-[28px] font-semibold tracking-[-0.02em]">Drag-and-drop boards</h3>
            <p className="max-w-[460px] leading-relaxed text-night-text">
              Move tasks between columns with buttery-smooth drag and drop. Reorder lists, set custom stages and see updates from teammates instantly.
            </p>
            <DragDropAnimation />
          </article>
        </Reveal>
        {FEATURES.map((f, i) => (
          <Reveal key={f.title} delay={0.08 * (i + 1)}>
            <article className="card cp-lift flex h-full flex-col gap-3.5 p-7">
              <span className="flex size-[52px] items-center justify-center rounded-[14px] bg-brand-soft">{f.icon}</span>
              <h3 className="font-display text-[22px] font-semibold tracking-[-0.01em]">{f.title}</h3>
              <p className="text-[15px] leading-relaxed text-muted">{f.body}</p>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
