"use client";

import { Check, UserPlus } from "lucide-react";
import { useCallback, useState } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { useDismiss } from "@/lib/hooks";
import type { Person } from "@/lib/people";
import { cn } from "@/lib/utils";

interface AssigneePickerProps {
  people: Person[];
  selected: string[];
  editable: boolean;
  onChange: (ids: string[]) => void;
}

export function AssigneePicker({ people, selected, editable, onChange }: AssigneePickerProps) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  const ref = useDismiss<HTMLDivElement>(open, close);
  const assigned = people.filter((p) => selected.includes(p.id));
  const assignable = people.filter((p) => p.role !== "viewer");

  return (
    <div ref={ref} className="relative flex flex-col gap-2">
      {assigned.map((p) => (
        <span key={p.id} className="flex items-center gap-2.5 text-sm">
          <Avatar id={p.id} name={p.name} photoURL={p.photoURL} size={28} />
          {p.name}
        </span>
      ))}
      {!assigned.length && <span className="text-sm text-muted">Nobody yet</span>}
      {editable && (
        <button type="button" onClick={() => setOpen((v) => !v)} className="inline-flex min-h-8 items-center gap-1.5 self-start text-[13px] font-semibold text-brand">
          <UserPlus className="size-3.5" /> {assigned.length ? "Change assignees" : "Assign teammate"}
        </button>
      )}
      {open && (
        <div className="absolute left-0 top-full z-20 mt-1 w-64 rounded-[14px] border border-line bg-white p-1.5 shadow-pop">
          {assignable.map((p) => {
            const isOn = selected.includes(p.id);
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => onChange(isOn ? selected.filter((id) => id !== p.id) : [...selected, p.id])}
                className={cn("flex w-full items-center gap-2.5 rounded-[10px] px-2.5 py-2 text-left text-sm hover:bg-canvas", isOn && "bg-brand-soft")}
              >
                <Avatar id={p.id} name={p.name} photoURL={p.photoURL} size={26} />
                <span className="min-w-0 flex-1 truncate">{p.name}</span>
                {isOn && <Check className="size-4 text-brand" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
