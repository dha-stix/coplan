"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { CalendarDays, CheckSquare, MessageSquare } from "lucide-react";
import { AvatarStack } from "@/components/ui/Avatar";
import { LabelTag } from "@/components/ui/LabelTag";
import type { Person } from "@/lib/people";
import type { Task } from "@/lib/types";
import { cn, formatDue } from "@/lib/utils";

interface TaskCardProps {
  task: Task;
  people: Map<string, Person>;
  onOpen?: (task: Task) => void;
  overlay?: boolean;
}

export function TaskCardBody({ task, people, overlay }: Omit<TaskCardProps, "onOpen">) {
  const due = formatDue(task.dueDate);
  const done = task.checklist.filter((c) => c.done).length;
  const assignees = task.assigneeIds.map((id) => people.get(id)).filter((p): p is Person => Boolean(p));
  return (
    <div
      className={cn(
        "flex flex-col gap-2.5 rounded-[14px] border bg-white p-3 text-left transition-shadow",
        overlay ? "rotate-[-3deg] border-brand shadow-[0_18px_40px_rgba(67,56,202,0.25)]" : "border-line shadow-card hover:border-line-2 hover:shadow-[0_6px_16px_rgba(14,16,32,0.06)]",
      )}
    >
      {task.labels.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {task.labels.map((l) => (
            <LabelTag key={l} label={l} />
          ))}
        </div>
      )}
      <span className="text-sm font-medium leading-snug">{task.title}</span>
      {(due || task.commentCount > 0 || task.checklist.length > 0 || assignees.length > 0) && (
        <div className="flex items-center gap-3 text-xs text-muted">
          {due && (
            <span className={cn("inline-flex items-center gap-1 font-medium", due.overdue && "text-danger", due.soon && !due.overdue && "text-amber-700")}>
              <CalendarDays className="size-3.5" />
              {due.label}
            </span>
          )}
          {task.commentCount > 0 && (
            <span className="inline-flex items-center gap-1">
              <MessageSquare className="size-3.5" />
              {task.commentCount}
            </span>
          )}
          {task.checklist.length > 0 && (
            <span className={cn("inline-flex items-center gap-1", done === task.checklist.length && "text-teal")}>
              <CheckSquare className="size-3.5" />
              {done}/{task.checklist.length}
            </span>
          )}
          {assignees.length > 0 && (
            <span className="ml-auto">
              <AvatarStack people={assignees} size={24} max={3} />
            </span>
          )}
        </div>
      )}
    </div>
  );
}

/** A draggable task. Click (without dragging) opens the task detail. */
export function TaskCard({ task, people, onOpen, disabled }: TaskCardProps & { disabled?: boolean }) {
  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({ id: task.id, data: { type: "task", task }, disabled });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={cn("touch-manipulation select-none", isDragging && "opacity-40")}
      {...attributes}
      {...listeners}
      role="button"
      aria-label={`Open task ${task.title}`}
      onClick={() => onOpen?.(task)}
      onKeyDown={(e) => {
        if (e.key === "Enter") onOpen?.(task);
        listeners?.onKeyDown?.(e);
      }}
    >
      <TaskCardBody task={task} people={people} />
    </div>
  );
}
