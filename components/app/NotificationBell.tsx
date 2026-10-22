"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { BellIcon } from "@/components/ui/Icons";
import { markAllNotificationsRead } from "@/lib/firebase-actions";
import { useDismiss } from "@/lib/hooks";
import { cn } from "@/lib/utils";
import { useApp } from "./AppProvider";
import { NotificationItem } from "./NotificationItem";

const TABS = [
  { key: "all", label: "All" },
  { key: "mention", label: "Mentions" },
  { key: "assigned", label: "Assigned" },
] as const;

export function NotificationBell() {
  const { notifications, unreadCount } = useApp();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("all");
  const [ringing, setRinging] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  const ref = useDismiss<HTMLDivElement>(open, close);

  // Ring the bell briefly whenever a new unread notification arrives.
  const previousUnread = useRef(unreadCount);
  useEffect(() => {
    if (unreadCount > previousUnread.current) {
      setRinging(true);
      const t = setTimeout(() => setRinging(false), 2600);
      previousUnread.current = unreadCount;
      return () => clearTimeout(t);
    }
    previousUnread.current = unreadCount;
  }, [unreadCount]);

  const shown = notifications.filter((n) => tab === "all" || n.type === tab).slice(0, 8);
  const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={unreadCount ? `Notifications, ${unreadCount} unread` : "Notifications"}
        aria-expanded={open}
        className={cn(
          "relative flex size-11 items-center justify-center rounded-xl border bg-white transition",
          open ? "border-brand bg-brand-soft text-brand" : "border-line text-ink hover:border-line-2",
        )}
      >
        <BellIcon ringing={ringing} />
        {unreadCount > 0 && (
          <motion.span
            key={unreadCount}
            initial={{ scale: 0.4 }}
            animate={{ scale: 1 }}
            className="absolute right-1.5 top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full border-2 border-white bg-alert px-1 text-[10px] font-bold text-white"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </motion.span>
        )}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-label="Notifications"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-x-3 top-[72px] z-50 flex max-h-[min(560px,calc(100dvh-96px))] flex-col overflow-hidden rounded-[18px] border border-line bg-white shadow-pop sm:absolute sm:inset-x-auto sm:right-0 sm:top-[52px] sm:w-[380px]"
          >
            <div className="flex items-center justify-between px-4 pb-2 pt-4">
              <strong className="text-base">Notifications</strong>
              {unreadIds.length > 0 && (
                <button type="button" onClick={() => markAllNotificationsRead(unreadIds)} className="min-h-8 text-[13px] font-semibold text-brand">
                  Mark all read
                </button>
              )}
            </div>
            <div className="flex gap-1 px-3 text-[13px] font-semibold" role="tablist">
              {TABS.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  role="tab"
                  aria-selected={tab === t.key}
                  onClick={() => setTab(t.key)}
                  className={cn("border-b-2 px-2.5 py-1.5", tab === t.key ? "border-brand text-ink" : "border-transparent text-muted")}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto">
              {shown.length ? (
                shown.map((n) => <NotificationItem key={n.id} n={n} onNavigate={close} />)
              ) : (
                <p className="border-t border-soft px-4 py-10 text-center text-sm text-muted">You&apos;re all caught up.</p>
              )}
            </div>
            <Link href="/notifications" onClick={close} className="border-t border-soft py-3.5 text-center text-[13px] font-semibold text-brand">
              View all notifications
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
