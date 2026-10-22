"use client";

import {
  closestCorners,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import type { User } from "firebase/auth";
import { Plus } from "lucide-react";
import { useMemo, useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { COLUMN_COLORS } from "@/lib/constants";
import { addColumn, createTask, deleteColumn, moveTask, renameColumn } from "@/lib/firebase-actions";
import type { Person } from "@/lib/people";
import type { Project, Task } from "@/lib/types";
import { BoardColumn } from "./BoardColumn";
import { TaskCardBody } from "./TaskCard";

const GAP = 1024;

/** Order value between two neighbours, so a move only rewrites the moved task. */
function orderBetween(prev?: Task, next?: Task) {
  if (prev && next) return (prev.order + next.order) / 2;
  if (prev) return prev.order + GAP;
  if (next) return next.order - GAP;
  return GAP;
}

function groupByColumn(project: Project, tasks: Task[]) {
  const map = new Map<string, Task[]>(project.columns.map((c) => [c.id, []]));
  for (const t of tasks) map.get(t.columnId)?.push(t);
  map.forEach((list) => list.sort((a, b) => a.order - b.order));
  return map;
}

interface BoardProps {
  user: User;
  project: Project;
  tasks: Task[];
  people: Map<string, Person>;
  editable: boolean;
  onOpenTask: (task: Task) => void;
  filter: (task: Task) => boolean;
}

export function Board({ user, project, tasks, people, editable, onOpenTask, filter }: BoardProps) {
  // While dragging (and until the move is saved) we render a local copy so cards move instantly;
  // otherwise the live Firestore tasks are shown directly.
  const [override, setOverride] = useState<Task[] | null>(null);
  const items = override ?? tasks;
  const setItems = (update: (prev: Task[]) => Task[]) => setOverride((prev) => update(prev ?? tasks));
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overColumn, setOverColumn] = useState<string | null>(null);
  const dragStart = useRef<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const columns = useMemo(() => groupByColumn(project, items), [project, items]);
  const activeTask = items.find((t) => t.id === activeId) ?? null;

  const columnOf = (id: string) => {
    if (id.startsWith("column:")) return id.slice("column:".length);
    return items.find((t) => t.id === id)?.columnId ?? null;
  };

  function handleDragStart({ active }: DragStartEvent) {
    setActiveId(String(active.id));
    setOverride(tasks);
    dragStart.current = tasks.find((t) => t.id === active.id) ?? null;
  }

  function handleDragOver({ active, over }: DragOverEvent) {
    if (!over) return setOverColumn(null);
    const to = columnOf(String(over.id));
    setOverColumn(to);
    const from = columnOf(String(active.id));
    if (!to || !from || to === from) return;
    // Move the card into the hovered column right away so the list makes room for it.
    setItems((prev) => {
      const target = groupByColumn(project, prev).get(to) ?? [];
      const overIndex = target.findIndex((t) => t.id === over.id);
      const neighbour = overIndex >= 0 ? target[overIndex] : target[target.length - 1];
      const order = overIndex >= 0 ? orderBetween(target[overIndex - 1], neighbour) : orderBetween(neighbour, undefined);
      return prev.map((t) => (t.id === active.id ? { ...t, columnId: to, order } : t));
    });
  }

  async function handleDragEnd({ active, over }: DragEndEvent) {
    const original = dragStart.current;
    setActiveId(null);
    setOverColumn(null);
    dragStart.current = null;
    if (!over || !original) return setOverride(null);

    const to = columnOf(String(over.id)) ?? original.columnId;
    const list = (groupByColumn(project, items).get(to) ?? []).filter((t) => t.id !== active.id);
    const current = items.find((t) => t.id === active.id)!;
    let ordered = [...list, current].sort((a, b) => a.order - b.order);
    const from = ordered.findIndex((t) => t.id === active.id);
    const overIndex = ordered.findIndex((t) => t.id === over.id);
    if (overIndex >= 0 && from !== overIndex) ordered = arrayMove(ordered, from, overIndex);

    const index = ordered.findIndex((t) => t.id === active.id);
    const order = orderBetween(ordered[index - 1], ordered[index + 1]);
    if (to === original.columnId && order === original.order) return setOverride(null);

    setItems((prev) => prev.map((t) => (t.id === active.id ? { ...t, columnId: to, order } : t)));
    try {
      await moveTask(project, original, to, order);
    } finally {
      // Firestore's live snapshot now reflects the move (or the failure), so show it directly.
      setOverride(null);
    }
  }

  async function handleAddTask(columnId: string, title: string) {
    const list = columns.get(columnId) ?? [];
    await createTask(user, project, columnId, title, orderBetween(list[list.length - 1], undefined));
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={() => {
        setActiveId(null);
        setOverColumn(null);
        setOverride(null);
      }}
    >
      <div className="flex min-w-max items-start gap-4">
        {project.columns.map((column) => (
          <BoardColumn
            key={column.id}
            column={column}
            tasks={(columns.get(column.id) ?? []).filter((t) => t.id === activeId || filter(t))}
            totalCount={columns.get(column.id)?.length ?? 0}
            people={people}
            editable={editable}
            isDropTarget={Boolean(activeId) && overColumn === column.id}
            onOpenTask={onOpenTask}
            onAddTask={handleAddTask}
            onRename={(id, name) => renameColumn(project, id, name)}
            onDelete={(id) => deleteColumn(project, id)}
          />
        ))}
        {editable && <AddColumn project={project} />}
      </div>
      <DragOverlay dropAnimation={{ duration: 220, easing: "cubic-bezier(0.2, 0.7, 0.2, 1)" }}>
        {activeTask ? (
          <div className="w-[290px] cursor-grabbing sm:w-[300px]">
            <TaskCardBody task={activeTask} people={people} overlay />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

function AddColumn({ project }: { project: Project }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    await addColumn(project, name, COLUMN_COLORS[project.columns.length % COLUMN_COLORS.length]);
    setName("");
    setOpen(false);
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex min-h-14 w-[290px] shrink-0 items-center justify-center gap-2 rounded-[18px] border-2 border-dashed border-line-2 text-sm font-semibold text-muted transition hover:border-brand hover:text-brand sm:w-[300px]"
      >
        <Plus className="size-4" /> Add column
      </button>
    );
  }
  return (
    <form onSubmit={submit} className="flex w-[290px] shrink-0 flex-col gap-2 rounded-[18px] bg-[#EDEFF5] p-3 sm:w-[300px]">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
        placeholder="Column name"
        aria-label="Column name"
        autoFocus
        className="rounded-xl border border-brand bg-white px-3 py-2.5 text-sm outline-none"
      />
      <div className="flex gap-2">
        <Button type="submit" size="sm">
          Add column
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
