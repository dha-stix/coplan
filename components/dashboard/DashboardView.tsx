"use client";

import { Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useApp } from "@/components/app/AppProvider";
import { CreateProjectModal } from "@/components/app/CreateProjectModal";
import { NotificationItem } from "@/components/app/NotificationItem";
import { PageBody, PageHeader } from "@/components/app/PageHeader";
import { Reveal } from "@/components/ui/Reveal";
import { Spinner } from "@/components/ui/Spinner";
import { memberInfo, subscribeToAssignedTasks } from "@/lib/firebase-actions";
import { useSubscription } from "@/lib/hooks";
import type { Task } from "@/lib/types";
import { cn, greeting, roleOf } from "@/lib/utils";
import emptyBoard from "@/images/empty-board.svg";
import { AssignedTasks } from "./AssignedTasks";
import { ProjectCard } from "./ProjectCard";

type Filter = "all" | "owned" | "shared";

export function DashboardView() {
  const { user, workspace, projects, sharedProjects, projectsLoading, notifications, unreadCount, selectWorkspace } = useApp();
  const [filter, setFilter] = useState<Filter>("all");
  const [creating, setCreating] = useState(false);
  const [now] = useState(() => Date.now());
  const assigned = useSubscription<Task[]>((onData, onError) => subscribeToAssignedTasks(user.uid, onData, onError), [], [user.uid]);

  // Arriving from an accepted workspace invite: /dashboard?workspace=<id>
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("workspace");
    if (id) selectWorkspace(id);
  }, [selectWorkspace]);

  const all = [...projects, ...sharedProjects];
  const visible = all.filter((p) => (filter === "owned" ? p.ownerId === user.uid : filter === "shared" ? p.ownerId !== user.uid : true));
  const openTasks = assigned.data.length;
  const dueSoon = assigned.data.filter((t) => t.dueDate && new Date(`${t.dueDate}T23:59:59`).getTime() - now < 7 * 86_400_000).length;
  const totalDone = all.reduce((sum, p) => sum + p.doneCount, 0);
  const firstName = memberInfo(user).name.split(" ")[0];

  const stats = [
    { label: "Assigned to me", value: openTasks, note: dueSoon ? `${dueSoon} due within a week` : "Nothing due this week", tone: dueSoon ? "text-amber-700" : "text-muted" },
    { label: "Tasks done", value: totalDone, note: "Across your projects", tone: "text-teal" },
    { label: "Unread notifications", value: unreadCount, note: unreadCount ? "Check your bell" : "All caught up", tone: "text-brand" },
    { label: "Projects", value: all.length, note: workspace ? `In ${workspace.name}` : "", tone: "text-muted" },
  ];

  return (
    <PageBody>
      <PageHeader
        eyebrow={new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
        title={`${greeting()}, ${firstName}`}
        actions={
          <div className="flex gap-1 rounded-xl border border-line bg-white p-1 text-[13px] font-semibold" role="tablist" aria-label="Filter projects">
            {(["all", "owned", "shared"] as Filter[]).map((f) => (
              <button
                key={f}
                type="button"
                role="tab"
                aria-selected={filter === f}
                onClick={() => setFilter(f)}
                className={cn("rounded-lg px-3.5 py-2 transition", filter === f ? "bg-ink text-white" : "text-muted hover:text-ink")}
              >
                {f === "all" ? "All projects" : f === "owned" ? "Owned by me" : "Shared"}
              </button>
            ))}
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {stats.map((s, i) => (
          <Reveal key={s.label} delay={i * 0.05} y={12}>
            <div className="card flex h-full flex-col gap-2 rounded-[18px] p-4 sm:p-5">
              <span className="text-[13px] font-medium text-muted">{s.label}</span>
              <span className="font-display text-[30px] font-bold tracking-[-0.02em] sm:text-[34px]">{s.value}</span>
              <span className={cn("text-xs font-semibold", s.tone)}>{s.note}</span>
            </div>
          </Reveal>
        ))}
      </div>

      <section className="flex flex-col gap-3.5">
        <h2 className="text-lg font-semibold">Projects</h2>
        {projectsLoading ? (
          <div className="flex justify-center py-12 text-brand">
            <Spinner className="size-7" />
          </div>
        ) : visible.length ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {visible.map((p, i) => (
              <Reveal key={p.id} delay={Math.min(i, 6) * 0.05} y={14}>
                <ProjectCard project={p} role={roleOf(p, user.uid) ?? roleOf(workspace, user.uid)} />
              </Reveal>
            ))}
            {filter !== "shared" && (
              <button
                type="button"
                onClick={() => setCreating(true)}
                className="flex min-h-[220px] flex-col items-center justify-center gap-2.5 rounded-[20px] border-2 border-dashed border-line-2 text-sm font-semibold text-muted transition hover:border-brand hover:text-brand"
              >
                <span className="flex size-11 items-center justify-center rounded-full bg-brand-soft text-brand">
                  <Plus className="size-5" />
                </span>
                Create project
              </button>
            )}
          </div>
        ) : (
          <div className="card flex flex-col items-center gap-4 rounded-[20px] px-6 py-12 text-center">
            <Image src={emptyBoard} alt="" width={260} height={162} />
            <h3 className="text-lg font-semibold">{filter === "all" ? "Create your first project" : "No projects here yet"}</h3>
            <p className="max-w-sm text-sm leading-relaxed text-muted">Projects hold your team&apos;s board, tasks and conversations.</p>
            <button type="button" onClick={() => setCreating(true)} className="rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-600">
              New project
            </button>
          </div>
        )}
      </section>

      <div className="flex flex-wrap gap-4">
        <section className="card flex min-w-0 flex-[999_1_420px] flex-col gap-1.5 rounded-[20px] p-5">
          <div className="flex items-center justify-between pb-2">
            <h2 className="text-lg font-semibold">Assigned to me</h2>
            <Link href="/my-tasks" className="text-sm font-semibold text-brand">
              See all
            </Link>
          </div>
          <AssignedTasks tasks={assigned.data} loading={assigned.loading} limit={5} />
        </section>
        <section className="card flex min-w-0 flex-[1_1_320px] flex-col rounded-[20px] pt-5">
          <div className="flex items-center justify-between px-5 pb-3">
            <h2 className="text-lg font-semibold">Recent activity</h2>
            <Link href="/notifications" className="text-sm font-semibold text-brand">
              View all
            </Link>
          </div>
          {notifications.length ? (
            notifications.slice(0, 5).map((n) => <NotificationItem key={n.id} n={n} />)
          ) : (
            <p className="border-t border-soft px-5 py-10 text-center text-sm text-muted">Mentions, assignments and invites will appear here.</p>
          )}
        </section>
      </div>
      <CreateProjectModal open={creating} onClose={() => setCreating(false)} />
    </PageBody>
  );
}
