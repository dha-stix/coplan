"use client";

import type { User } from "firebase/auth";
import { CalendarDays, Check, Link2, Trash2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { LabelTag } from "@/components/ui/LabelTag";
import { CloseButton, Modal } from "@/components/ui/Modal";
import { LABELS } from "@/lib/constants";
import { assignTask, deleteTask, moveTask, updateTask } from "@/lib/firebase-actions";
import type { Person } from "@/lib/people";
import type { LabelKey, Project, Task } from "@/lib/types";
import { cn, timeAgo, todayISO } from "@/lib/utils";
import { AssigneePicker } from "./AssigneePicker";
import { Checklist } from "./Checklist";
import { CommentThread } from "./CommentThread";

interface TaskModalProps {
  user: User;
  project: Project;
  task: Task | null;
  people: Person[];
  editable: boolean;
  endOrder: (columnId: string) => number;
  onClose: () => void;
}

function SideField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-semibold uppercase tracking-[0.06em] text-muted">{label}</span>
      {children}
    </div>
  );
}

function TaskDetail({ user, project, task, people, editable, endOrder, onClose }: TaskModalProps & { task: Task }) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [copied, setCopied] = useState(false);
  const column = project.columns.find((c) => c.id === task.columnId);
  const creator = people.find((p) => p.id === task.createdBy);
  const today = todayISO();

  const save = (patch: Partial<Task>) => updateTask(project.id, task.id, patch);

  // Title and description autosave shortly after typing stops, on blur, and when the
  // dialog closes (Escape or ✕), so no edit is lost.
  const pending = useRef<Partial<Task>>({});
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const flush = useCallback(() => {
    clearTimeout(timer.current);
    const patch = pending.current;
    pending.current = {};
    if (Object.keys(patch).length) void updateTask(project.id, task.id, patch);
  }, [project.id, task.id]);
  const queueSave = (patch: Partial<Task>) => {
    pending.current = { ...pending.current, ...patch };
    clearTimeout(timer.current);
    timer.current = setTimeout(flush, 600);
  };
  useEffect(() => flush, [flush]);

  function toggleLabel(label: LabelKey) {
    void save({ labels: task.labels.includes(label) ? task.labels.filter((l) => l !== label) : [...task.labels, label] });
  }

  async function copyLink() {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  async function remove() {
    if (!window.confirm(`Delete “${task.title}”? This also deletes its comments.`)) return;
    onClose();
    await deleteTask(project, task);
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-2.5 border-b border-soft px-5 py-4 sm:px-6">
        <span className="text-[13px] text-muted">
          {project.name} / <strong className="text-ink">{column?.name}</strong>
        </span>
        <div className="ml-auto flex gap-1.5">
          <button type="button" onClick={copyLink} aria-label="Copy link to task" className="flex size-10 items-center justify-center rounded-xl border border-line hover:bg-canvas">
            {copied ? <Check className="size-4 text-teal" /> : <Link2 className="size-4 text-ink-2" />}
          </button>
          {editable && (
            <button type="button" onClick={remove} aria-label="Delete task" className="flex size-10 items-center justify-center rounded-xl border border-line text-danger hover:bg-red-50">
              <Trash2 className="size-4" />
            </button>
          )}
          <CloseButton onClick={onClose} />
        </div>
      </div>

      <div className="flex flex-wrap">
        <div className="flex min-w-0 flex-[999_1_480px] flex-col gap-7 p-5 sm:p-7">
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap gap-1.5">
              {editable
                ? (Object.keys(LABELS) as LabelKey[]).map((l) => (
                    <button
                      key={l}
                      type="button"
                      onClick={() => toggleLabel(l)}
                      aria-pressed={task.labels.includes(l)}
                      className={cn("rounded-md transition", task.labels.includes(l) ? "opacity-100 ring-2 ring-offset-1" : "opacity-45 hover:opacity-80")}
                      style={{ ["--tw-ring-color" as string]: LABELS[l].fg }}
                    >
                      <LabelTag label={l} className="text-xs" />
                    </button>
                  ))
                : task.labels.map((l) => <LabelTag key={l} label={l} className="text-xs" />)}
            </div>
            <label htmlFor="task-title" className="sr-only">
              Task title
            </label>
            <textarea
              id="task-title"
              value={title}
              readOnly={!editable}
              rows={1}
              onChange={(e) => {
                setTitle(e.target.value);
                if (e.target.value.trim()) queueSave({ title: e.target.value.trim() });
              }}
              onBlur={flush}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), e.currentTarget.blur())}
              className="field-sizing-content resize-none rounded-lg font-display text-[28px] font-bold leading-tight tracking-[-0.02em] outline-none focus:bg-canvas sm:text-[32px]"
            />
          </div>

          <section className="flex flex-col gap-2.5">
            <label htmlFor="task-description" className="text-sm font-semibold text-muted">
              Description
            </label>
            <textarea
              id="task-description"
              value={description}
              readOnly={!editable}
              onChange={(e) => {
                setDescription(e.target.value);
                queueSave({ description: e.target.value });
              }}
              onBlur={flush}
              placeholder={editable ? "Add more detail…" : "No description"}
              rows={3}
              className="field-sizing-content min-h-20 resize-none rounded-xl border border-transparent p-3 text-[15px] leading-relaxed text-ink-2 outline-none transition hover:border-line focus:border-brand focus:bg-white"
            />
          </section>

          <Checklist items={task.checklist} editable={editable} onChange={(checklist) => save({ checklist })} />
          <CommentThread user={user} project={project} task={task} people={people} />
        </div>

        <aside className="flex min-w-0 flex-[1_1_260px] flex-col gap-6 border-t border-soft bg-[#F9FAFC] p-5 sm:p-6 md:border-l md:border-t-0">
          <SideField label="Status">
            <div className="flex min-h-[42px] items-center gap-2 rounded-[10px] border border-line bg-white px-3">
              <span className="size-2 rounded-full" style={{ background: column?.color }} />
              <select
                value={task.columnId}
                disabled={!editable}
                onChange={(e) => moveTask(project, task, e.target.value, endOrder(e.target.value))}
                aria-label="Status"
                className="flex-1 bg-transparent text-sm font-semibold outline-none"
              >
                {project.columns.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </SideField>
          <SideField label="Assignees">
            <AssigneePicker people={people} selected={task.assigneeIds} editable={editable} onChange={(ids) => assignTask(user, project, task, ids)} />
          </SideField>
          <SideField label="Due date">
            <label className="flex min-h-[42px] items-center gap-2 rounded-[10px] border border-line bg-white px-3 text-sm">
              <CalendarDays className="size-4 text-ink-2" />
              <span className="sr-only">Due date</span>
              {/* Only today or later can be picked; past days are greyed out in the calendar. */}
              <input
                type="date"
                value={task.dueDate ?? ""}
                min={today}
                disabled={!editable}
                onChange={(e) => {
                  const value = e.target.value;
                  // Typed-in past dates are ignored too, not just calendar clicks.
                  if (value && value < today) return;
                  void save({ dueDate: value || null });
                }}
                className="flex-1 bg-transparent font-medium outline-none"
              />
            </label>
            {task.dueDate && task.dueDate < today && <span className="text-xs font-semibold text-danger">Overdue — pick a new date from today onward.</span>}
          </SideField>
          <div className="h-px bg-line" />
          <SideField label="Details">
            <span className="text-[13px] leading-relaxed text-ink-2">
              Created by <strong>{creator?.name ?? "a teammate"}</strong> · {timeAgo(task.createdAt)}
              <br />
              Last updated {timeAgo(task.updatedAt)}
            </span>
          </SideField>
        </aside>
      </div>
    </>
  );
}

/** Task detail dialog. Re-mounts per task so local edit state starts fresh. */
export function TaskModal(props: TaskModalProps) {
  return (
    <Modal open={Boolean(props.task)} onClose={props.onClose} bare width="max-w-[1040px]" className="overflow-hidden">
      {props.task && <TaskDetail key={props.task.id} {...props} task={props.task} />}
    </Modal>
  );
}
