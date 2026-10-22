"use client";

import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { useApp } from "@/components/app/AppProvider";
import { InviteModal } from "@/components/members/InviteModal";
import { MembersTable } from "@/components/members/MembersTable";
import { PendingInvites } from "@/components/members/PendingInvites";
import { ButtonLink } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { PageLoader } from "@/components/ui/Spinner";
import { TaskModal } from "@/components/task/TaskModal";
import { deleteProject, subscribeToProject, subscribeToTasks, updateProject } from "@/lib/firebase-actions";
import { useSubscription } from "@/lib/hooks";
import { membershipPeople, projectPeople, projectRole } from "@/lib/people";
import type { Project, Task } from "@/lib/types";
import { canEdit } from "@/lib/utils";
import notFoundArt from "@/images/not-found.svg";
import { Board } from "./Board";
import { BoardHeader, type BoardFilters } from "./BoardHeader";

export function BoardView({ projectId }: { projectId: string }) {
  const { user, workspaces } = useApp();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<BoardFilters>({ term: "", mine: false, label: "all" });
  const [inviting, setInviting] = useState(false);
  const [showMembers, setShowMembers] = useState(false);

  const project = useSubscription<Project | null>((onData, onError) => subscribeToProject(projectId, onData, onError), null, [projectId]);
  const tasks = useSubscription<Task[]>((onData, onError) => subscribeToTasks(projectId, onData, onError), [], [projectId]);

  const p = project.data;
  const workspace = workspaces.find((w) => w.id === p?.workspaceId) ?? null;
  const people = useMemo(() => projectPeople(p, workspace), [p, workspace]);
  const peopleMap = useMemo(() => new Map(people.map((x) => [x.id, x])), [people]);
  const role = projectRole(p, workspace, user.uid);
  const editable = canEdit(role);
  const ownsWorkspace = workspace?.roles[user.uid] === "owner";

  const openTaskId = searchParams.get("task");
  const openTask = tasks.data.find((t) => t.id === openTaskId) ?? null;
  const setTaskParam = useCallback(
    (id: string | null) => router.replace(id ? `${pathname}?task=${id}` : pathname, { scroll: false }),
    [router, pathname],
  );

  const endOrder = useCallback(
    (columnId: string) => Math.max(0, ...tasks.data.filter((t) => t.columnId === columnId).map((t) => t.order)) + 1024,
    [tasks.data],
  );

  const term = filters.term.trim().toLowerCase();
  const filter = useCallback(
    (t: Task) =>
      (!term || t.title.toLowerCase().includes(term) || t.description.toLowerCase().includes(term)) &&
      (!filters.mine || t.assigneeIds.includes(user.uid)) &&
      (filters.label === "all" || t.labels.includes(filters.label)),
    [term, filters.mine, filters.label, user.uid],
  );

  if (project.loading) return <PageLoader label="Loading board" />;
  if (!p) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-20 text-center">
        <Image src={notFoundArt} alt="" width={240} height={171} />
        <h1 className="font-display text-2xl font-bold">We couldn&apos;t open this project</h1>
        <p className="max-w-sm text-sm text-muted">It may have been deleted, or you don&apos;t have access. Ask the project owner to invite you.</p>
        <ButtonLink href="/dashboard" variant="secondary">
          <ArrowLeft className="size-4" /> Back to dashboard
        </ButtonLink>
      </div>
    );
  }

  async function handleDelete() {
    if (!p || !window.confirm(`Delete “${p.name}” and all of its tasks? This can't be undone.`)) return;
    await deleteProject(p);
    router.replace("/dashboard");
  }

  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <BoardHeader
        project={p}
        workspace={workspace}
        people={people}
        isOwner={role === "owner"}
        canInvite={role === "owner" || ownsWorkspace}
        filters={filters}
        onFilters={setFilters}
        onInvite={() => setInviting(true)}
        onMembers={() => setShowMembers(true)}
        onRename={(name) => updateProject(p.id, { name })}
        onDelete={handleDelete}
      />
      {role === "viewer" && (
        <p className="border-b border-amber-200 bg-amber-50 px-6 py-2 text-[13px] text-amber-900">You have view-only access. You can read tasks and comment.</p>
      )}
      <main className="flex-1 overflow-x-auto px-4 pb-10 pt-5 sm:px-6">
        <Board user={user} project={p} tasks={tasks.data} people={peopleMap} editable={editable} onOpenTask={(t) => setTaskParam(t.id)} filter={filter} />
      </main>

      <TaskModal user={user} project={p} task={openTask} people={people} editable={editable} endOrder={endOrder} onClose={() => setTaskParam(null)} />

      <InviteModal
        open={inviting}
        onClose={() => setInviting(false)}
        project={role === "owner" ? p : null}
        workspace={ownsWorkspace ? workspace : null}
        defaultScope={role === "owner" ? "project" : "workspace"}
      />

      <Modal open={showMembers} onClose={() => setShowMembers(false)} title="Project members" description="People invited to this project. Workspace members can open it too." width="max-w-3xl">
        <div className="flex flex-col gap-4 p-5 sm:p-6">
          <MembersTable kind="projects" entityId={p.id} ownerId={p.ownerId} people={membershipPeople(p)} currentUid={user.uid} canManage={role === "owner"} accessLabel="This project" />
          {role === "owner" && <PendingInvites scope="project" targetId={p.id} />}
        </div>
      </Modal>
    </div>
  );
}
