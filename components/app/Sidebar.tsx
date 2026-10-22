"use client";

import { Bell, CheckSquare, Home, Plus, Settings, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Logo } from "@/components/ui/Logo";
import { cn } from "@/lib/utils";
import { useApp } from "./AppProvider";
import { CreateProjectModal } from "./CreateProjectModal";
import { WorkspaceSwitcher } from "./WorkspaceSwitcher";

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { workspace, projects, sharedProjects, unreadCount } = useApp();
  const [creating, setCreating] = useState(false);

  const nav = [
    { href: "/dashboard", label: "Home", icon: Home },
    { href: "/my-tasks", label: "My tasks", icon: CheckSquare },
    { href: "/notifications", label: "Notifications", icon: Bell, badge: unreadCount },
    ...(workspace ? [{ href: `/workspace/${workspace.id}/members`, label: "Members", icon: Users }] : []),
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  const projectLink = (p: { id: string; name: string; color: string }) => {
    const active = pathname === `/project/${p.id}`;
    return (
      <Link
        key={p.id}
        href={`/project/${p.id}`}
        onClick={onNavigate}
        className={cn("flex items-center gap-3 rounded-[10px] px-3 py-2 text-sm transition", active ? "bg-soft font-semibold text-ink" : "text-ink-2 hover:bg-canvas")}
      >
        <span className="size-2.5 shrink-0 rounded-[3px]" style={{ background: p.color }} />
        <span className="truncate">{p.name}</span>
      </Link>
    );
  };

  return (
    <div className="flex h-full flex-col gap-5 overflow-y-auto px-3.5 py-5">
      <Logo href="/dashboard" className="px-2" />
      <WorkspaceSwitcher />
      <nav aria-label="Main" className="flex flex-col gap-0.5 text-sm font-medium">
        {nav.map(({ href, label, icon: Icon, badge }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className={cn("flex items-center gap-3 rounded-[10px] px-3 py-2.5 transition", active ? "bg-brand-soft text-brand" : "text-ink-2 hover:bg-canvas")}
            >
              <Icon className="size-[18px]" />
              {label}
              {badge ? <span className="ml-auto rounded-full bg-brand px-2 text-xs text-white">{badge}</span> : null}
            </Link>
          );
        })}
      </nav>

      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between px-3 pb-1 text-xs font-semibold uppercase tracking-[0.06em] text-muted">
          Projects
          <button type="button" onClick={() => setCreating(true)} aria-label="New project" className="flex size-7 items-center justify-center rounded-md hover:bg-soft">
            <Plus className="size-4" />
          </button>
        </div>
        {projects.length ? projects.map(projectLink) : <p className="px-3 text-[13px] text-muted">No projects yet.</p>}
      </div>

      {sharedProjects.length > 0 && (
        <div className="flex flex-col gap-1">
          <div className="px-3 pb-1 text-xs font-semibold uppercase tracking-[0.06em] text-muted">Shared with me</div>
          {sharedProjects.map(projectLink)}
        </div>
      )}

      {workspace && (
        <div className="mt-auto flex flex-col gap-2.5 rounded-2xl bg-night p-4 text-white">
          <strong className="text-sm">Invite your team</strong>
          <span className="text-[13px] leading-normal text-night-text">Coplan is better together. Send invites by email.</span>
          <Link
            href={`/workspace/${workspace.id}/members?invite=1`}
            onClick={onNavigate}
            className="self-start rounded-lg bg-lime px-3 py-2 text-[13px] font-semibold text-ink transition hover:brightness-95"
          >
            Invite people
          </Link>
        </div>
      )}
      <CreateProjectModal open={creating} onClose={() => setCreating(false)} />
    </div>
  );
}
