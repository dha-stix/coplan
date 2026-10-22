"use client";

import { ArrowLeft, UserPlus } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useApp } from "@/components/app/AppProvider";
import { PageBody } from "@/components/app/PageHeader";
import { WorkspaceBadge } from "@/components/app/WorkspaceSwitcher";
import { Button, ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageLoader } from "@/components/ui/Spinner";
import { membershipPeople } from "@/lib/people";
import { InviteModal } from "./InviteModal";
import { MembersTable } from "./MembersTable";
import { PendingInvites } from "./PendingInvites";

export function MembersView({ workspaceId }: { workspaceId: string }) {
  const { user, workspaces, workspacesLoading, projects, workspace: current, selectWorkspace } = useApp();
  // The sidebar's "Invite people" link (?invite=1) opens the dialog straight away.
  const [inviting, setInviting] = useState(() => typeof window !== "undefined" && new URLSearchParams(window.location.search).has("invite"));
  const workspace = workspaces.find((w) => w.id === workspaceId) ?? null;
  const isOwner = workspace?.roles[user.uid] === "owner";

  useEffect(() => {
    if (workspace && current?.id !== workspace.id) selectWorkspace(workspace.id);
  }, [workspace, current?.id, selectWorkspace]);

  if (workspacesLoading) return <PageLoader />;
  if (!workspace) {
    return (
      <PageBody>
        <EmptyState
          title="Workspace not found"
          body="You may not be a member of this workspace."
          action={
            <ButtonLink href="/dashboard" variant="secondary">
              <ArrowLeft className="size-4" /> Back to dashboard
            </ButtonLink>
          }
        />
      </PageBody>
    );
  }

  const people = membershipPeople(workspace);
  const workspaceProjects = projects.filter((p) => p.workspaceId === workspace.id);

  return (
    <PageBody>
      <div className="flex flex-wrap items-center gap-3.5">
        <WorkspaceBadge workspace={workspace} size={48} />
        <div className="flex min-w-0 flex-col">
          <h1 className="truncate font-display text-[28px] font-bold tracking-[-0.02em]">{workspace.name}</h1>
          <span className="text-[13px] text-muted">
            Workspace · {people.length} member{people.length === 1 ? "" : "s"} · {workspaceProjects.length} project{workspaceProjects.length === 1 ? "" : "s"}
          </span>
        </div>
        {isOwner && (
          <Button className="ml-auto" onClick={() => setInviting(true)}>
            <UserPlus className="size-4" /> Invite people
          </Button>
        )}
      </div>

      <MembersTable kind="workspaces" entityId={workspace.id} ownerId={workspace.ownerId} people={people} currentUid={user.uid} canManage={isOwner} accessLabel="All projects" />
      {isOwner && <PendingInvites scope="workspace" targetId={workspace.id} />}

      {workspaceProjects.length > 0 && (
        <section className="card flex flex-col rounded-[20px] px-5 py-4">
          <h2 className="pb-2 text-[17px] font-semibold">Projects in this workspace</h2>
          {workspaceProjects.map((p) => (
            <Link key={p.id} href={`/project/${p.id}`} className="flex items-center gap-3 border-t border-soft py-3 text-sm hover:text-brand">
              <span className="size-2.5 rounded-[3px]" style={{ background: p.color }} />
              <span className="flex-1 font-medium">{p.name}</span>
              <span className="text-xs text-muted">
                {p.memberIds.length} direct member{p.memberIds.length === 1 ? "" : "s"}
              </span>
            </Link>
          ))}
        </section>
      )}

      <InviteModal open={inviting && isOwner} onClose={() => setInviting(false)} workspace={isOwner ? workspace : null} defaultScope="workspace" />
    </PageBody>
  );
}
