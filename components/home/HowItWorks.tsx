import type { ReactNode } from "react";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeader } from "./SectionHeader";
import { BarsIcon, CheckCircleIcon, InvitePulseIcon } from "./FeatureIcons";

const STEPS: { n: string; icon: ReactNode; title: string; body: string }[] = [
  {
    n: "01",
    icon: <CheckCircleIcon />,
    title: "Create your account",
    body: "Sign up with Google in one click, or with your email and a password. Your first workspace is created automatically.",
  },
  { n: "02", icon: <InvitePulseIcon />, title: "Invite your team", body: "Send email invites to a project or the whole workspace and set each person’s role." },
  { n: "03", icon: <BarsIcon />, title: "Plan, tag, ship", body: "Create tasks, drag them across stages, @mention teammates and watch work get done." },
];

export function HowItWorks() {
  return (
    <section id="how" className="mx-auto flex max-w-6xl scroll-mt-20 flex-col gap-12 px-4 py-24 sm:px-5 lg:py-28">
      <SectionHeader center eyebrow="How it works" title="Up and running in three steps." />
      <div className="grid gap-5 md:grid-cols-3">
        {STEPS.map((s, i) => (
          <Reveal key={s.n} delay={0.1 * i}>
            <article className="card cp-lift flex h-full flex-col gap-4 p-8">
              <div className="flex items-center justify-between">
                <span className="font-display text-[56px] font-bold leading-none text-brand">{s.n}</span>
                <span className="flex size-[60px] items-center justify-center rounded-[18px] bg-brand-soft">{s.icon}</span>
              </div>
              <h3 className="font-display text-[22px] font-semibold">{s.title}</h3>
              <p className="text-[15px] leading-relaxed text-muted">{s.body}</p>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
