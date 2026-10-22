"use client";

import { CheckSquare } from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/components/ui/EmptyState";
import { LabelTag } from "@/components/ui/LabelTag";
import { Spinner } from "@/components/ui/Spinner";
import type { Task } from "@/lib/types";
import { cn, formatDue } from "@/lib/utils";

export function DueBadge({ date }: { date: string | null }) {
  const due = formatDue(date);
  if (!due) return <span className="rounded-md bg-soft px-2 py-0.5 text-xs font-semibold text-muted">No date</span>;
  return (
    <span
      className={cn(
        "rounded-md px-2 py-0.5 text-xs font-semibold",
        due.overdue ? "bg-red-100 text-red-800" : due.soon ? "bg-amber-100 text-amber-800" : "bg-soft text-ink-2",
      )}
    >
      {due.label}
    </span>
  );
}

/** Tasks assigned to the current user, linking straight to each task on its board. */
export function AssignedTasks({ tasks, loading, limit }: { tasks: Task[]; loading: boolean; limit?: number }) {
  if (loading) {
    return (
      <div className="flex justify-center py-8 text-brand">
        <Spinner />
      </div>
    );
  }
  if (!tasks.length) {
    return <EmptyState icon={<CheckSquare className="size-6" />} title="Nothing assigned to you" body="When a teammate assigns you a task, it shows up here." className="py-8" />;
  }
  return (
    <ul className="flex flex-col">
      {tasks.slice(0, limit).map((t) => (
        <li key={`${t.projectId}-${t.id}`} className="border-t border-soft first:border-t-0">
          <Link href={`/project/${t.projectId}?task=${t.id}`} className="flex items-center gap-3.5 rounded-xl px-2 py-3 transition hover:bg-canvas">
            <span className="flex min-w-0 flex-1 flex-col gap-1">
              <span className="truncate text-sm font-medium">{t.title}</span>
              <span className="flex items-center gap-2 text-xs text-muted">
                {t.projectName}
                {t.labels[0] && <LabelTag label={t.labels[0]} className="text-[10px]" />}
              </span>
            </span>
            <DueBadge date={t.dueDate} />
          </Link>
        </li>
      ))}
    </ul>
  );
}
