import { Check } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeader } from "./SectionHeader";

const POINTS = ["Threaded comments on every task", "@mentions with autocomplete", "Live updates — no refresh needed"];

function Mention({ children }: { children: string }) {
  return <span className="rounded bg-brand-soft px-1 font-semibold text-brand">{children}</span>;
}

function Bubble({ initials, color, name, time, children }: { initials: string; color: string; name: string; time: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <span className="flex size-[34px] shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white" style={{ background: color }}>
        {initials}
      </span>
      <div className="rounded-[4px_14px_14px_14px] bg-canvas px-3.5 py-3 text-sm leading-normal">
        <strong>{name}</strong> <span className="text-xs text-muted">· {time}</span>
        <br />
        {children}
      </div>
    </div>
  );
}

export function Collaboration() {
  return (
    <section className="bg-night text-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-14 px-4 py-24 sm:px-5 lg:py-28">
        <div className="flex min-w-0 flex-[1_1_360px] flex-col gap-6">
          <SectionHeader
            dark
            eyebrow="Real-time collaboration"
            title="Talk where the work happens."
            body="Every task has its own comment thread. Type @ to tag a teammate — they get an instant bell notification and jump straight to the conversation."
          />
          <Reveal delay={0.1}>
            <ul className="flex flex-col gap-3.5">
              {POINTS.map((p) => (
                <li key={p} className="flex items-center gap-3">
                  <span className="flex size-6 items-center justify-center rounded-full bg-lime text-ink">
                    <Check className="size-3.5" strokeWidth={3} />
                  </span>
                  {p}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        <Reveal delay={0.15} className="min-w-0 flex-[1_1_480px]">
          <div className="flex flex-col gap-4 rounded-[20px] bg-white p-5 text-ink shadow-[0_30px_80px_rgba(0,0,0,0.4)] sm:p-6" aria-hidden="true">
            <div className="flex items-center justify-between">
              <strong className="text-[17px]">Pricing page hero</strong>
              <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800">In review</span>
            </div>
            <Bubble initials="MK" color="#0F766E" name="Maya K." time="2m">
              First draft is up. <Mention>@David</Mention> can you review the copy before Friday?
            </Bubble>
            <Bubble initials="DA" color="#F97316" name="David A." time="just now">
              On it! Looping in <Mention>@Jon</Mention> for the illustrations.
            </Bubble>
            <div className="relative rounded-xl border-2 border-brand px-3.5 py-3 text-sm text-muted">
              Thanks <span className="font-semibold text-brand">@Sa</span>
              <span className="cp-blink ml-px inline-block h-4 w-0.5 bg-brand align-middle" />
              <div className="absolute bottom-[52px] left-12 flex w-[220px] flex-col rounded-xl border border-line bg-white p-1.5 shadow-pop">
                {[
                  { i: "SR", c: "#BE185D", n: "Sara Reyes", active: true },
                  { i: "SM", c: "#7C3AED", n: "Sam Miller", active: false },
                ].map((p) => (
                  <span key={p.i} className={`flex items-center gap-2.5 rounded-lg p-2 text-[13px] text-ink ${p.active ? "bg-brand-soft font-medium" : ""}`}>
                    <span className="flex size-6 items-center justify-center rounded-full text-[9px] font-semibold text-white" style={{ background: p.c }}>
                      {p.i}
                    </span>
                    {p.n}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
