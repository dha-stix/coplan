"use client";

import { Plus, X } from "lucide-react";
import { useState, type FormEvent } from "react";
import type { ChecklistItem } from "@/lib/types";
import { cn } from "@/lib/utils";

export function Checklist({ items, editable, onChange }: { items: ChecklistItem[]; editable: boolean; onChange: (items: ChecklistItem[]) => void }) {
  const [draft, setDraft] = useState("");
  const done = items.filter((i) => i.done).length;
  const pct = items.length ? (done / items.length) * 100 : 0;

  function add(e: FormEvent) {
    e.preventDefault();
    if (!draft.trim()) return;
    onChange([...items, { id: crypto.randomUUID(), text: draft.trim(), done: false }]);
    setDraft("");
  }

  return (
    <section className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-muted">Checklist</h3>
        {items.length > 0 && (
          <span className="text-[13px] text-muted">
            {done} of {items.length}
          </span>
        )}
      </div>
      {items.length > 0 && (
        <div className="h-1.5 overflow-hidden rounded-full bg-soft">
          <div className="h-full rounded-full bg-teal transition-[width] duration-500" style={{ width: `${pct}%` }} />
        </div>
      )}
      <ul className="flex flex-col">
        {items.map((item) => (
          <li key={item.id} className="group flex min-h-10 items-center gap-3">
            <input
              type="checkbox"
              checked={item.done}
              disabled={!editable}
              onChange={() => onChange(items.map((i) => (i.id === item.id ? { ...i, done: !i.done } : i)))}
              aria-label={item.text}
              className="size-[18px] accent-teal"
            />
            <span className={cn("flex-1 text-sm transition", item.done && "text-muted line-through")}>{item.text}</span>
            {editable && (
              <button
                type="button"
                onClick={() => onChange(items.filter((i) => i.id !== item.id))}
                aria-label={`Remove ${item.text}`}
                className="flex size-7 items-center justify-center rounded-md text-faint opacity-0 hover:bg-soft hover:text-ink focus:opacity-100 group-hover:opacity-100"
              >
                <X className="size-3.5" />
              </button>
            )}
          </li>
        ))}
      </ul>
      {editable && (
        <form onSubmit={add} className="flex items-center gap-2">
          <Plus className="size-4 text-muted" />
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Add an item"
            aria-label="New checklist item"
            className="min-h-9 flex-1 rounded-lg px-2 text-sm outline-none focus:bg-canvas"
          />
        </form>
      )}
    </section>
  );
}
