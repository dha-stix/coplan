"use client";

import { Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Logo } from "@/components/ui/Logo";
import { ButtonLink } from "@/components/ui/Button";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";

export const NAV_LINKS = [
  { href: "#features", label: "Features" },
  { href: "#how", label: "How it works" },
  { href: "#roles", label: "Teams & roles" },
  { href: "#faq", label: "FAQ" },
];

export function Navbar() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={cn("sticky top-0 z-40 transition-all duration-300", scrolled || open ? "border-b border-line bg-canvas/85 backdrop-blur-xl" : "border-b border-transparent")}>
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3.5 sm:px-5">
        <Logo />
        <div className="hidden items-center gap-8 text-[15px] font-medium md:flex">
          {NAV_LINKS.map((l) => (
            <a key={l.href} href={l.href} className="text-muted transition hover:text-ink">
              {l.label}
            </a>
          ))}
        </div>
        <div className="flex items-center gap-2">
          {user ? (
            <ButtonLink href="/dashboard" variant="dark">
              Open dashboard
            </ButtonLink>
          ) : (
            <>
              <Link href="/auth/login" className="hidden rounded-xl px-4 py-2.5 text-[15px] font-medium hover:bg-soft md:inline-flex">
                Log in
              </Link>
              <ButtonLink href="/auth/register" variant="dark" className="hidden sm:inline-flex">
                Get started free
              </ButtonLink>
            </>
          )}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="flex size-11 items-center justify-center rounded-xl border border-line bg-white md:hidden"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </nav>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden md:hidden"
          >
            <div className="flex flex-col gap-1 px-4 pb-5">
              {NAV_LINKS.map((l) => (
                <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="rounded-xl px-3 py-3 text-base font-medium hover:bg-soft">
                  {l.label}
                </a>
              ))}
              {!user && (
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <ButtonLink href="/auth/login" variant="secondary" size="lg">
                    Log in
                  </ButtonLink>
                  <ButtonLink href="/auth/register" variant="dark" size="lg">
                    Sign up
                  </ButtonLink>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
