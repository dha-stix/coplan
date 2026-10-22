"use client";

import { Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { FormError, TextField } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { PROJECT_COLORS } from "@/lib/constants";
import { createProject } from "@/lib/firebase-actions";
import { canEdit, roleOf } from "@/lib/utils";
import { useApp } from "./AppProvider";

export function CreateProjectModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user, workspace } = useApp();
  const router = useRouter();
  const [name, setName] = useState("");
  const [color, setColor] = useState(PROJECT_COLORS[0]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const allowed = canEdit(roleOf(workspace, user.uid));

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!workspace) return;
    if (name.trim().length < 2) return setError("Give your project a name.");
    setLoading(true);
    try {
      const id = await createProject(user, workspace, { name, color });
      setName("");
      onClose();
      router.push(`/project/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't create the project.");
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="New project" description={workspace ? `It will live in ${workspace.name}.` : undefined}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-6 sm:p-7">
        {!allowed && <FormError message="Viewers can't create projects in this workspace. Ask an owner to change your role." />}
        <TextField label="Project name" placeholder="e.g. Website relaunch" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-2 text-sm font-semibold">Colour</legend>
          <div className="flex flex-wrap gap-2.5">
            {PROJECT_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                aria-label={`Colour ${c}`}
                aria-pressed={color === c}
                className="flex size-10 items-center justify-center rounded-xl transition hover:scale-105"
                style={{ background: c, boxShadow: color === c ? `0 0 0 3px #fff, 0 0 0 5px ${c}` : undefined }}
              >
                {color === c && <Check className="size-4 text-white" strokeWidth={3} />}
              </button>
            ))}
          </div>
        </fieldset>
        <p className="text-[13px] text-muted">We&apos;ll add Backlog, To do, In progress and Done columns — rename or add more anytime.</p>
        <FormError message={error} />
        <div className="flex justify-end gap-2.5">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={loading} disabled={!allowed}>
            Create project
          </Button>
        </div>
      </form>
    </Modal>
  );
}
