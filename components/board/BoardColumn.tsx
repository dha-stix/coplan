"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { ArrowDown, MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { useDismiss } from "@/lib/hooks";
import type { Person } from "@/lib/people";
import type { Column, Task } from "@/lib/types";
import { cn } from "@/lib/utils";
import { TaskCard } from "./TaskCard";

interface BoardColumnProps {
  column: Column;
  /** Tasks shown (after board filters). */
  tasks: Task[];
  /** All tasks in the column, filtered or not — a column can only be deleted when this is 0. */
  totalCount: number;
  people: Map<string, Person>;
  editable: boolean;
  isDropTarget: boolean;
  onOpenTask: (task: Task) => void;
  onAddTask: (columnId: string, title: string) => Promise<void>;
  onRename: (columnId: string, name: string) => Promise<void>;
  onDelete: (columnId: string) => Promise<void>;
}

export const columnDropId = (id: string) => `column:${id}`;

function ColumnMenu({ onRename, onDelete, canDelete }: { onRename: () => void; onDelete: () => void; canDelete: boolean }) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  const ref = useDismiss<HTMLDivElement>(open, close);
  return (
    <div ref={ref} className="relative ml-auto">
      <button type="button" onClick={() => setOpen((v) => !v)} aria-label="Column options" className="flex size-8 items-center justify-center rounded-lg text-muted hover:bg-white">
        <MoreHorizontal className="size-4" />
      </button>
      {open && (
        <div className="absolute right-0 top-9 z-20 w-48 rounded-xl border border-line bg-white p-1 shadow-pop">
          <button type="button" onClick={() => (close(), onRename())} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-canvas">
            <Pencil className="size-4 text-muted" /> Rename
          </button>
          <button
            type="button"
            disabled={!canDelete}
            onClick={() => (close(), onDelete())}
            title={canDelete ? undefined : "Move or delete its tasks first"}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-danger hover:bg-red-50 disabled:cursor-not-allowed disabled:text-faint disabled:hover:bg-transparent"
          >
            <Trash2 className="size-4" /> Delete column
          </button>
        </div>
      )}
    </div>
  );
}

export function BoardColumn({ column, tasks, totalCount, people, editable, isDropTarget, onOpenTask, onAddTask, onRename, onDelete }: BoardColumnProps) {
  const { setNodeRef } = useDroppable({ id: columnDropId(column.id), data: { type: "column", columnId: column.id }, disabled: !editable });
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [renaming, setRenaming] = useState(false);
  const [name, setName] = useState(column.name);
  const [saving, setSaving] = useState(false);

  async function submitTask(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    await onAddTask(column.id, title);
    setSaving(false);
    setTitle("");
  }

  async function submitRename(e: FormEvent) {
    e.preventDefault();
    if (name.trim() && name.trim() !== column.name) await onRename(column.id, name);
    setRenaming(false);
  }

  return (
    <section
      ref={setNodeRef}
      aria-label={column.name}
      className={cn("flex w-[290px] shrink-0 flex-col gap-2.5 rounded-[18px] bg-[#EDEFF5] p-3 transition-colors sm:w-[300px]", isDropTarget && "bg-brand-soft ring-2 ring-brand/30")}
    >
      <div className="flex items-center gap-2 px-1 pt-1">
        <span className="size-2 rounded-full" style={{ background: column.color }} />
        {renaming ? (
          <form onSubmit={submitRename} className="flex-1">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={submitRename}
              autoFocus
              aria-label="Column name"
              className="w-full rounded-md border border-brand bg-white px-2 py-1 text-sm font-semibold outline-none"
            />
          </form>
        ) : (
          <h2 className="text-sm font-semibold">{column.name}</h2>
        )}
        <span className="rounded-full bg-white px-2 text-xs font-semibold text-muted">{tasks.length}</span>
        {editable && !renaming && <ColumnMenu onRename={() => setRenaming(true)} onDelete={() => onDelete(column.id)} canDelete={totalCount === 0} />}
      </div>

      <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div className="flex min-h-[60px] flex-col gap-2.5">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} people={people} onOpen={onOpenTask} disabled={!editable} />
          ))}
          {isDropTarget && tasks.length === 0 && (
            <div className="relative flex h-[84px] items-center justify-center gap-1.5 rounded-[14px] bg-white/60 text-xs font-semibold text-brand">
              <svg aria-hidden="true" className="absolute inset-0 size-full overflow-visible">
                <rect className="cp-flow" x="1" y="1" rx="13" fill="none" stroke="#4338CA" strokeWidth="2" style={{ width: "calc(100% - 2px)", height: "calc(100% - 2px)" }} />
              </svg>
              <ArrowDown className="cp-bounce size-3.5" /> Drop here
            </div>
          )}
        </div>
      </SortableContext>

      {editable && (
        <AnimatePresence initial={false} mode="wait">
          {adding ? (
            <motion.form key="form" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} onSubmit={submitTask} className="flex flex-col gap-2">
              <textarea
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) submitTask(e);
                  if (e.key === "Escape") setAdding(false);
                }}
                placeholder="What needs doing?"
                aria-label="Task title"
                rows={2}
                autoFocus
                className="resize-none rounded-xl border border-brand bg-white p-3 text-sm outline-none shadow-[0_0_0_4px_var(--color-brand-soft)]"
              />
              <div className="flex gap-2">
                <Button type="submit" size="sm" loading={saving}>
                  Add task
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setAdding(false)}>
                  Cancel
                </Button>
              </div>
            </motion.form>
          ) : (
            <motion.button
              key="button"
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => setAdding(true)}
              className="flex min-h-10 items-center gap-2 rounded-xl px-2 text-[13px] font-medium text-muted transition hover:bg-white hover:text-ink"
            >
              <Plus className="size-4" /> Add a task
            </motion.button>
          )}
        </AnimatePresence>
      )}
    </section>
  );
}
