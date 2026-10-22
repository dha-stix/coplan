"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { FormError, TextField } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { createWorkspace } from "@/lib/firebase-actions";
import { useApp } from "./AppProvider";

export function CreateWorkspaceModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user, selectWorkspace } = useApp();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (name.trim().length < 2) return setError("Give your workspace a name.");
    setLoading(true);
    try {
      const id = await createWorkspace(user, name);
      selectWorkspace(id);
      setName("");
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't create the workspace.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="New workspace" description="Workspaces group projects for a team, client or company.">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-6 sm:p-7">
        <TextField label="Workspace name" placeholder="e.g. Acme Studio" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
        <FormError message={error} />
        <div className="flex justify-end gap-2.5">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Create workspace
          </Button>
        </div>
      </form>
    </Modal>
  );
}
