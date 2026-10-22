"use client";

import { MoreHorizontal, Pencil, Search, Trash2, UserPlus, Users } from "lucide-react";
import Link from "next/link";
import { useCallback, useState, type FormEvent } from "react";
import { AvatarStack } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { LABELS } from "@/lib/constants";
import { useDismiss } from "@/lib/hooks";
import type { Person } from "@/lib/people";
import type { LabelKey, Project, Workspace } from "@/lib/types";

export interface BoardFilters {
  term: string;
  mine: boolean;
  label: LabelKey | "all";
}

interface BoardHeaderProps {
  project: Project;
  workspace: Workspace | null;
  people: Person[];
  isOwner: boolean;
  canInvite: boolean;
  filters: BoardFilters;
  onFilters: (f: BoardFilters) => void;
  onInvite: () => void;
  onMembers: () => void;
  onRename: (name: string) => Promise<void>;
  onDelete: () => void;
}

function ProjectMenu({ onRename, onDelete }: { onRename: () => void; onDelete: () => void }) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  const ref = useDismiss<HTMLDivElement>(open, close);
  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen((v) => !v)} aria-label="Project options" className="flex size-10 items-center justify-center rounded-[10px] border border-line hover:bg-canvas">
        <MoreHorizontal className="size-4" />
      </button>
      {open && (
        <div className="absolute right-0 top-12 z-30 w-52 rounded-xl border border-line bg-white p-1 shadow-pop">
          <button type="button" onClick={() => (close(), onRename())} className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm hover:bg-canvas">
            <Pencil className="size-4 text-muted" /> Rename project
          </button>
          <button type="button" onClick={() => (close(), onDelete())} className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-danger hover:bg-red-50">
            <Trash2 className="size-4" /> Delete project
          </button>
        </div>
      )}
    </div>
  );
}

export function BoardHeader({ project, workspace, people, isOwner, canInvite, filters, onFilters, onInvite, onMembers, onRename, onDelete }: BoardHeaderProps) {
  const [renaming, setRenaming] = useState(false);
  const [name, setName] = useState(project.name);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (name.trim() && name.trim() !== project.name) await onRename(name.trim());
    setRenaming(false);
  }

  const chip = "h-9 rounded-[10px] border border-line bg-white px-3 text-[13px] font-medium text-ink-2 outline-none focus:border-brand";

  return (
    <header className="flex flex-col gap-3.5 border-b border-line bg-white px-4 py-4 sm:px-6">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="text-[13px] text-muted">
            <Link href="/dashboard" className="hover:text-ink">
              {workspace?.name ?? "Shared with me"}
            </Link>{" "}
            / Projects
          </span>
          {renaming ? (
            <form onSubmit={submit}>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={submit}
                autoFocus
                aria-label="Project name"
                className="rounded-lg border border-brand px-2 font-display text-[26px] font-bold tracking-[-0.02em] outline-none"
              />
            </form>
          ) : (
            <h1 className="flex items-center gap-2.5 truncate font-display text-[26px] font-bold tracking-[-0.02em]">
              <span className="size-3 shrink-0 rounded" style={{ background: project.color }} />
              {project.name}
            </h1>
          )}
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-2.5">
          <button type="button" onClick={onMembers} aria-label="View members" className="rounded-full">
            <AvatarStack people={people} max={5} size={32} />
          </button>
          <Button variant="secondary" size="sm" className="h-10" onClick={onMembers}>
            <Users className="size-4" /> <span className="hidden sm:inline">Members</span>
          </Button>
          {canInvite && (
            <Button size="sm" className="h-10" onClick={onInvite}>
              <UserPlus className="size-4" /> Invite
            </Button>
          )}
          {isOwner && <ProjectMenu onRename={() => setRenaming(true)} onDelete={onDelete} />}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2.5">
        <label className="flex h-9 w-full items-center gap-2 rounded-[10px] border border-line bg-canvas px-3 text-[13px] text-muted focus-within:border-brand sm:w-60">
          <Search className="size-3.5" />
          <span className="sr-only">Filter tasks</span>
          <input
            type="search"
            value={filters.term}
            onChange={(e) => onFilters({ ...filters, term: e.target.value })}
            placeholder="Filter tasks"
            className="min-w-0 flex-1 bg-transparent text-ink outline-none"
          />
        </label>
        <select value={filters.mine ? "me" : "anyone"} onChange={(e) => onFilters({ ...filters, mine: e.target.value === "me" })} aria-label="Assignee" className={chip}>
          <option value="anyone">Assignee: Anyone</option>
          <option value="me">Assigned to me</option>
        </select>
        <select value={filters.label} onChange={(e) => onFilters({ ...filters, label: e.target.value as BoardFilters["label"] })} aria-label="Label" className={chip}>
          <option value="all">Label: All</option>
          {(Object.keys(LABELS) as LabelKey[]).map((l) => (
            <option key={l} value={l}>
              {LABELS[l].name}
            </option>
          ))}
        </select>
      </div>
    </header>
  );
}
