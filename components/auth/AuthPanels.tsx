import { LogoMark } from "@/components/ui/Logo";
import { BellIcon } from "@/components/ui/Icons";

const ACTIVITY = [
  { i: "MK", c: "#0F766E", body: <><strong>Maya</strong> mentioned you in <strong>Launch checklist</strong><br /><span className="text-muted">&ldquo;@David the staging build is ready for QA&rdquo;</span></>, offset: false },
  { i: "JL", c: "#4338CA", body: <><strong>Jon</strong> moved <strong>Auth with Google</strong> to <span className="rounded-md bg-green-100 px-1.5 font-semibold text-green-800">Done</span></>, offset: true },
  { i: "SR", c: "#BE185D", body: <><strong>Sara</strong> invited you to <strong>Marketing Q4</strong></>, offset: false },
];

/** Dark panel beside the login form: orbiting rings and recent team activity. */
export function LoginPanel() {
  return (
    <div className="relative flex w-full flex-col justify-between bg-night p-12 text-white" aria-hidden="true">
      <svg viewBox="0 0 600 600" className="pointer-events-none absolute -right-44 top-16 size-[600px]">
        <g className="cp-spin-slow" style={{ transformOrigin: "300px 300px" }}>
          <circle cx="300" cy="300" r="230" fill="none" stroke="#2A2E48" strokeWidth="1.5" strokeDasharray="4 10" />
          <circle cx="530" cy="300" r="7" fill="#D4F75B" />
          <circle cx="70" cy="300" r="5" fill="#F97316" />
        </g>
        <g className="cp-spin-slow" style={{ transformOrigin: "300px 300px", animationDuration: "26s", animationDirection: "reverse" }}>
          <circle cx="300" cy="300" r="150" fill="none" stroke="#2A2E48" strokeWidth="1.5" />
          <circle cx="300" cy="150" r="6" fill="#4F46E5" />
        </g>
      </svg>
      <span className="relative inline-flex items-center gap-2 self-start rounded-full bg-night-2 px-3 py-1.5 text-[13px] font-semibold text-lime">
        <BellIcon ringing className="size-3.5" />
        Your team is waiting
      </span>
      <div className="relative my-8 flex max-w-[440px] flex-col gap-3.5">
        {ACTIVITY.map((a, idx) => (
          <div
            key={a.i}
            className={`cp-in flex items-start gap-3 rounded-2xl bg-white p-4 text-ink shadow-[0_20px_40px_rgba(0,0,0,0.35)] ${a.offset ? "ml-10" : ""}`}
            style={{ animationDelay: `${0.2 + idx * 0.25}s` }}
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white" style={{ background: a.c }}>
              {a.i}
            </span>
            <span className="text-sm leading-normal">{a.body}</span>
          </div>
        ))}
      </div>
      <h2 className="relative max-w-[460px] font-display text-[40px] font-bold leading-[1.08] tracking-[-0.03em]">Everything your team touched while you were away.</h2>
    </div>
  );
}

const LANDING_CARDS = [
  { x: 10, y: 12, w: 44, c: "#D4F75B" },
  { x: 10, y: 56, w: 30, c: "#F97316" },
  { x: 135, y: 12, w: 50, c: "#0F766E" },
  { x: 260, y: 12, w: 36, c: "#D4F75B" },
  { x: 260, y: 56, w: 48, c: "#BE185D" },
  { x: 260, y: 100, w: 40, c: "#4F46E5" },
];

const BENEFITS = [
  { title: "Unlimited boards", body: "Organise work by workspace and project." },
  { title: "Invite by email", body: "Bring teammates into a project or the whole workspace." },
  { title: "Mentions that notify", body: "Tag anyone and they're pinged in-app instantly." },
];

/** Indigo panel beside the sign-up form: cards dropping onto a board. */
export function RegisterPanel() {
  return (
    <div className="flex w-full flex-col justify-between gap-8 bg-brand p-12 text-white">
      <span className="flex items-center gap-2.5">
        <LogoMark inverted size={30} />
        <span className="font-display text-[21px] font-bold">Coplan</span>
      </span>
      <div className="flex flex-col gap-7">
        <svg viewBox="0 0 360 150" role="img" aria-label="Task cards dropping onto a three-column board" className="h-auto w-full max-w-[400px]">
          {[0, 125, 250].map((x) => (
            <rect key={x} x={x} y="0" width="110" height="150" rx="12" fill="#3730A3" />
          ))}
          {LANDING_CARDS.map((card, i) => (
            <g key={`${card.x}-${card.y}`} className="cp-land" style={{ animationDelay: `${i * 0.5}s` }}>
              <rect x={card.x} y={card.y} width="90" height="34" rx="8" fill="#fff" />
              <rect x={card.x + 10} y={card.y + 12} width={card.w} height="5" rx="2.5" fill={card.c} />
              <rect x={card.x + 10} y={card.y + 22} width="56" height="4" rx="2" fill="#C7CAF5" />
            </g>
          ))}
        </svg>
        <h2 className="font-display text-[44px] font-bold leading-[1.04] tracking-[-0.03em]">Your whole team, on one board.</h2>
        <ul className="flex flex-col gap-4">
          {BENEFITS.map((b, i) => (
            <li key={b.title} className="flex items-start gap-3.5">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-lime font-bold text-ink">{i + 1}</span>
              <span>
                <strong>{b.title}</strong>
                <br />
                <span className="text-brand-tint">{b.body}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
      <span className="text-[13px] text-brand-tint">100% free · No credit card</span>
    </div>
  );
}
