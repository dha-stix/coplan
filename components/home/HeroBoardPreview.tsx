import { LabelTag } from "@/components/ui/LabelTag";
import { BellIcon } from "@/components/ui/Icons";
import type { LabelKey } from "@/lib/types";

const PEOPLE = {
  AO: "#F97316",
  MK: "#0F766E",
  JL: "#4338CA",
  SR: "#BE185D",
  DA: "#F97316",
} as const;

type Who = keyof typeof PEOPLE;

const COLUMNS: { name: string; count: number; cards: { label: LabelKey; title: string; meta: string; who: Who }[] }[] = [
  {
    name: "To do",
    count: 4,
    cards: [
      { label: "research", title: "Competitor audit", meta: "Oct 28", who: "SR" },
      { label: "copy", title: "Homepage headlines", meta: "2 comments", who: "DA" },
    ],
  },
  { name: "In progress", count: 3, cards: [{ label: "dev", title: "Auth with Google", meta: "3/5 done", who: "JL" }] },
  {
    name: "Done",
    count: 6,
    cards: [
      { label: "design", title: "Moodboard", meta: "Oct 12", who: "MK" },
      { label: "dev", title: "Repo setup", meta: "Oct 10", who: "JL" },
    ],
  },
];

function Dot({ who, size = 20 }: { who: Who; size?: number }) {
  return (
    <span className="inline-flex items-center justify-center rounded-full font-semibold text-white ring-2 ring-white" style={{ width: size, height: size, background: PEOPLE[who], fontSize: size * 0.4 }}>
      {who}
    </span>
  );
}

/** Illustrative board used in the hero — static sample content, not live data. */
export function HeroBoardPreview() {
  return (
    <div className="relative" aria-hidden="true">
      <div className="overflow-hidden rounded-[20px] border border-line bg-white p-3 shadow-float sm:p-[18px]">
        <div className="flex items-center justify-between px-1 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="size-2.5 rounded-[3px] bg-brand" />
            <strong className="text-[15px]">Website relaunch</strong>
            <span className="hidden rounded-md bg-soft px-2 py-0.5 text-xs text-muted sm:inline">Acme Studio</span>
          </div>
          <div className="flex -space-x-1.5">
            <Dot who="AO" size={26} />
            <Dot who="MK" size={26} />
            <Dot who="JL" size={26} />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {COLUMNS.map((col) => (
            <div key={col.name} className="flex flex-col gap-2 rounded-[14px] bg-canvas p-2 sm:p-2.5">
              <div className="flex justify-between px-1 text-[11px] font-semibold text-muted sm:text-xs">
                <span>{col.name}</span>
                <span>{col.count}</span>
              </div>
              {col.cards.map((card) => (
                <div key={card.title} className="flex flex-col gap-2 rounded-[10px] border border-line bg-white p-2 sm:p-2.5">
                  <LabelTag label={card.label} className="self-start text-[10px]" />
                  <span className="text-xs font-medium leading-snug sm:text-[13px]">{card.title}</span>
                  <div className="flex items-center justify-between text-[10px] text-muted sm:text-[11px]">
                    <span>{card.meta}</span>
                    <Dot who={card.who} />
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* card mid-drag */}
      <div className="cp-float absolute left-[28%] top-[46%] flex w-[150px] -rotate-[4deg] flex-col gap-1.5 rounded-xl border-2 border-brand bg-white p-3 shadow-[0_20px_40px_rgba(67,56,202,0.25)] sm:w-[190px]">
        <LabelTag label="design" className="self-start text-[10px]" />
        <span className="text-[13px] font-semibold">Pricing page hero</span>
        <span className="text-[11px] text-muted">Dragging to In progress…</span>
      </div>

      {/* teammate's live cursor */}
      <div className="cp-roam pointer-events-none absolute left-[16%] top-[30%] flex items-start gap-0.5">
        <svg width="22" height="22" viewBox="0 0 24 24">
          <path d="M4 3l16 7-7 2-2 7z" fill="#0F766E" stroke="#fff" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
        <span className="mt-4 rounded-md bg-teal px-2 py-0.5 text-[11px] font-semibold text-white">Maya</span>
      </div>

      {/* mention toast */}
      <div className="cp-float-slow absolute -top-6 right-0 flex w-[240px] items-start gap-2.5 rounded-2xl bg-ink p-3 text-white shadow-[0_20px_40px_rgba(14,16,32,0.3)] sm:-right-3 sm:w-[260px]">
        <span className="cp-pulse flex size-[30px] shrink-0 items-center justify-center rounded-full bg-brand">
          <BellIcon ringing className="size-[15px]" />
        </span>
        <span className="text-[13px] leading-snug">
          <strong>Maya</strong> mentioned you in <strong>Pricing page hero</strong>: &ldquo;@David can you review copy?&rdquo;
        </span>
      </div>
    </div>
  );
}
