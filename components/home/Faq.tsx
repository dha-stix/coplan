"use client";

import { Plus } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/utils";

const FAQS = [
  { q: "Is Coplan free?", a: "Yes — Coplan is completely free. Create unlimited workspaces and projects and invite your whole team at no cost." },
  {
    q: "How do invites work?",
    a: "Project owners enter teammates’ emails. Coplan emails an invite link; when they sign in they land straight in the project or workspace.",
  },
  { q: "Will I be notified when someone tags me?", a: "Yes. Every @mention shows up instantly in your notification bell with a link to the exact task." },
  { q: "Do I need a Google account?", a: "No. Sign up with Google in one click, or use any email address and a password. You can reset your password anytime." },
  { q: "Does it work on my phone?", a: "Coplan is fully responsive — boards, comments and notifications work on any screen size." },
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="mx-auto flex max-w-3xl scroll-mt-20 flex-col gap-9 px-4 py-24 sm:px-5 lg:py-28">
      <Reveal>
        <h2 className="section-title text-center">Questions, answered.</h2>
      </Reveal>
      <div className="flex flex-col gap-3">
        {FAQS.map((item, i) => {
          const isOpen = open === i;
          return (
            <Reveal key={item.q} delay={0.05 * i}>
              <div className="card rounded-2xl">
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left text-[17px] font-semibold"
                >
                  {item.q}
                  <Plus className={cn("size-5 shrink-0 text-brand transition-transform duration-300", isOpen && "rotate-45")} />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <p className="px-6 pb-5 text-[15px] leading-relaxed text-muted">{item.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
