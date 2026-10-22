"use client";

import { Check, ChevronDown, Plus } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useState } from "react";
import { useDismiss } from "@/lib/hooks";
import type { Workspace } from "@/lib/types";
import { useApp } from "./AppProvider";
import { CreateWorkspaceModal } from "./CreateWorkspaceModal";

export function WorkspaceBadge({ workspace, size = 30 }: { workspace: Pick<Workspace, "name">; size?: number }) {
  return (
    <span className="flex shrink-0 items-center justify-center rounded-lg bg-orange-100 font-display font-bold text-orange-800" style={{ width: size, height: size, fontSize: size * 0.48 }}>
      {workspace.name.charAt(0).toUpperCase()}
    </span>
  );
}

export function WorkspaceSwitcher() {
  const { workspaces, workspace, selectWorkspace } = useApp();
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  const ref = useDismiss<HTMLDivElement>(open, close);

  if (!workspace) return null;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center gap-2.5 rounded-xl border border-line bg-canvas p-2.5 text-left text-sm font-semibold transition hover:border-line-2"
      >
        <WorkspaceBadge workspace={workspace} />
        <span className="min-w-0 flex-1">
          <span className="block truncate">{workspace.name}</span>
          <span className="block text-xs font-normal text-muted">
            Workspace · {workspace.memberIds.length} member{workspace.memberIds.length === 1 ? "" : "s"}
          </span>
        </span>
        <ChevronDown className="size-4 text-muted" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-x-0 top-[calc(100%+6px)] z-30 rounded-2xl border border-line bg-white p-1.5 shadow-pop"
          >
            {workspaces.map((w) => (
              <button
                key={w.id}
                type="button"
                onClick={() => {
                  selectWorkspace(w.id);
                  close();
                }}
                className="flex w-full items-center gap-2.5 rounded-xl p-2 text-left text-sm hover:bg-canvas"
              >
                <WorkspaceBadge workspace={w} size={26} />
                <span className="min-w-0 flex-1 truncate">{w.name}</span>
                {w.id === workspace.id && <Check className="size-4 text-brand" />}
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                close();
                setCreating(true);
              }}
              className="mt-1 flex w-full items-center gap-2.5 rounded-xl border-t border-soft p-2 text-sm font-semibold text-brand hover:bg-brand-soft"
            >
              <Plus className="size-4" /> New workspace
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      <CreateWorkspaceModal open={creating} onClose={() => setCreating(false)} />
    </div>
  );
}
