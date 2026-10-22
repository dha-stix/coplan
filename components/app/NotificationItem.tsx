"use client";

import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { markNotificationRead } from "@/lib/firebase-actions";
import type { AppNotification } from "@/lib/types";
import { cn, timeAgo } from "@/lib/utils";

const VERB: Record<AppNotification["type"], string> = {
  mention: "mentioned you in",
  assigned: "assigned you to",
  comment: "commented on",
  invite: "invited you to join",
};

export function NotificationItem({ n, onNavigate }: { n: AppNotification; onNavigate?: () => void }) {
  const subject = n.type === "invite" ? n.text : n.taskTitle;
  return (
    <Link
      href={n.link}
      onClick={() => {
        if (!n.read) void markNotificationRead(n.id);
        onNavigate?.();
      }}
      className={cn("flex gap-3 border-t border-soft px-4 py-3.5 transition hover:bg-canvas", !n.read && "bg-[#F7F7FF]")}
    >
      <Avatar id={n.actorId} name={n.actorName} photoURL={n.actorPhoto} size={36} />
      <span className="min-w-0 flex-1 text-[13px] leading-normal text-ink-2">
        <strong className="text-ink">{n.actorName}</strong> {VERB[n.type]} <strong className="text-ink">{subject}</strong>
        {n.type !== "invite" && n.text && <span className="mt-0.5 block truncate text-muted">&ldquo;{n.text}&rdquo;</span>}
        <span className="mt-0.5 block text-xs text-muted">
          {timeAgo(n.createdAt)}
          {n.projectName && n.type !== "invite" ? ` · ${n.projectName}` : ""}
        </span>
      </span>
      {!n.read && <span className="mt-1.5 size-2 shrink-0 rounded-full bg-brand" aria-label="Unread" />}
    </Link>
  );
}
