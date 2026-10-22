"use client";

import { Bell } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { markAllNotificationsRead } from "@/lib/firebase-actions";
import type { NotificationType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useApp } from "./AppProvider";
import { NotificationItem } from "./NotificationItem";
import { PageBody, PageHeader } from "./PageHeader";

const FILTERS: { key: NotificationType | "all" | "unread"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "unread", label: "Unread" },
  { key: "mention", label: "Mentions" },
  { key: "assigned", label: "Assigned" },
  { key: "invite", label: "Invites" },
];

export function NotificationsView() {
  const { notifications } = useApp();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["key"]>("all");
  const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id);
  const shown = notifications.filter((n) => (filter === "all" ? true : filter === "unread" ? !n.read : n.type === filter));

  return (
    <PageBody>
      <PageHeader
        title="Notifications"
        actions={
          unreadIds.length > 0 && (
            <Button variant="secondary" onClick={() => markAllNotificationsRead(unreadIds)}>
              Mark all as read
            </Button>
          )
        }
      />
      <div className="flex flex-wrap gap-2" role="tablist">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            role="tab"
            aria-selected={filter === f.key}
            onClick={() => setFilter(f.key)}
            className={cn("rounded-full px-3.5 py-2 text-[13px] font-semibold transition", filter === f.key ? "bg-ink text-white" : "bg-white text-muted ring-1 ring-line hover:text-ink")}
          >
            {f.label}
          </button>
        ))}
      </div>
      {shown.length ? (
        <section className="card overflow-hidden rounded-[20px] [&>a:first-child]:border-t-0">
          {shown.map((n) => (
            <NotificationItem key={n.id} n={n} />
          ))}
        </section>
      ) : (
        <EmptyState icon={<Bell className="size-6" />} title="Nothing here" body="When someone mentions you, assigns you a task or invites you, it shows up here." />
      )}
    </PageBody>
  );
}
