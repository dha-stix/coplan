"use client";

import { PlayCircle } from "lucide-react";
import { motion } from "motion/react";
import { ButtonLink } from "@/components/ui/Button";
import { GoogleIcon } from "@/components/ui/Icons";
import { HeroBoardPreview } from "./HeroBoardPreview";

const rise = {
  hidden: { opacity: 0, y: 20 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { delay: 0.08 * i, duration: 0.6, ease: [0.2, 0.7, 0.2, 1] as const } }),
};

const SAMPLE_TEAM = [
  { initials: "AO", color: "#F97316" },
  { initials: "MK", color: "#0F766E" },
  { initials: "JL", color: "#4338CA" },
  { initials: "SR", color: "#BE185D" },
];

export function Hero() {
  return (
    <section className="mx-auto flex max-w-6xl flex-wrap items-center gap-14 px-4 pb-20 pt-12 sm:px-5 sm:pt-16 lg:pb-24">
      <motion.div initial="hidden" animate="show" className="flex min-w-0 flex-[1_1_420px] flex-col gap-6">
        <motion.div custom={0} variants={rise} className="inline-flex items-center gap-2 self-start rounded-full border border-line bg-white py-1.5 pl-1.5 pr-3 text-[13px] font-medium text-muted">
          <span className="rounded-full bg-lime px-2 py-0.5 font-semibold text-ink">New</span>
          Real-time @mentions &amp; notifications
        </motion.div>
        <motion.h1 custom={1} variants={rise} className="font-display text-[clamp(36px,4.6vw,56px)] font-bold leading-[1.05] tracking-[-0.035em]">
          Plan together. <span className="text-brand">Ship faster.</span>
        </motion.h1>
        <motion.p custom={2} variants={rise} className="max-w-[460px] text-lg leading-relaxed text-muted">
          Shared boards, drag-and-drop tasks and @mentions — so your team always knows what&apos;s next.
        </motion.p>
        <motion.div custom={3} variants={rise} className="flex flex-wrap gap-3">
          <ButtonLink href="/auth/register" size="lg">
            <GoogleIcon mono className="size-[18px]" />
            Start free with Google
          </ButtonLink>
          <ButtonLink href="#how" variant="secondary" size="lg">
            <PlayCircle className="size-[18px]" />
            See how it works
          </ButtonLink>
        </motion.div>
        <motion.div custom={4} variants={rise} className="flex items-center gap-3.5 text-sm text-muted">
          <div className="flex">
            {SAMPLE_TEAM.map((p, i) => (
              <span
                key={p.initials}
                className="flex size-8 items-center justify-center rounded-full border-2 border-canvas text-xs font-semibold text-white"
                style={{ background: p.color, marginLeft: i ? -8 : 0 }}
                aria-hidden="true"
              >
                {p.initials}
              </span>
            ))}
          </div>
          100% free · No credit card needed
        </motion.div>
      </motion.div>

      <motion.div
        className="min-w-0 flex-[1_1_500px]"
        initial={{ opacity: 0, y: 40, rotate: 1.5 }}
        animate={{ opacity: 1, y: 0, rotate: 0 }}
        transition={{ duration: 0.9, delay: 0.25, ease: [0.2, 0.7, 0.2, 1] }}
      >
        <HeroBoardPreview />
      </motion.div>
    </section>
  );
}
