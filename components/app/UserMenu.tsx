"use client";

import { LogOut, Settings } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { logout, memberInfo } from "@/lib/firebase-actions";
import { useDismiss } from "@/lib/hooks";
import { useApp } from "./AppProvider";

export function UserMenu() {
  const { user } = useApp();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  const ref = useDismiss<HTMLDivElement>(open, close);
  const info = memberInfo(user);

  async function handleLogout() {
    await logout();
    router.replace("/");
  }

  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen((v) => !v)} aria-label="Account menu" aria-expanded={open} className="rounded-full">
        <Avatar id={user.uid} name={info.name} photoURL={info.photoURL} size={44} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-[52px] z-50 w-64 overflow-hidden rounded-2xl border border-line bg-white p-1.5 shadow-pop"
          >
            <div className="px-3 py-2.5">
              <p className="truncate text-sm font-semibold">{info.name}</p>
              <p className="truncate text-xs text-muted">{info.email}</p>
            </div>
            <Link href="/settings" onClick={close} className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm hover:bg-canvas">
              <Settings className="size-4 text-muted" /> Settings
            </Link>
            <button type="button" onClick={handleLogout} className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-danger hover:bg-red-50">
              <LogOut className="size-4" /> Log out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
