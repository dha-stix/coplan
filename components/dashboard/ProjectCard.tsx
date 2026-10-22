import Link from "next/link";
import { AvatarStack } from "@/components/ui/Avatar";
import { ROLE_INFO } from "@/lib/constants";
import type { Project, Role } from "@/lib/types";
import { timeAgo } from "@/lib/utils";

export function ProjectCard({ project, role }: { project: Project; role: Role | null }) {
  const pct = project.taskCount ? Math.round((project.doneCount / project.taskCount) * 100) : 0;
  const people = project.memberIds.filter((id) => project.members[id]).map((id) => ({ id, ...project.members[id] }));
  return (
    <Link href={`/project/${project.id}`} className="card cp-lift flex flex-col gap-4 rounded-[20px] p-5">
      <div className="flex items-start justify-between">
        <span
          className="flex size-[42px] items-center justify-center rounded-xl font-display text-lg font-bold"
          style={{ background: `${project.color}1A`, color: project.color }}
        >
          {project.name.charAt(0).toUpperCase()}
        </span>
        {role && <span className="rounded-full bg-soft px-2.5 py-1 text-xs font-semibold text-ink-2">{ROLE_INFO[role].label}</span>}
      </div>
      <div className="flex flex-col gap-1">
        <strong className="truncate text-base">{project.name}</strong>
        <span className="text-[13px] text-muted">
          {project.taskCount} task{project.taskCount === 1 ? "" : "s"} · updated {timeAgo(project.updatedAt)}
        </span>
      </div>
      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between text-xs text-muted">
          <span>Progress</span>
          <span className="font-semibold text-ink">{pct}%</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-soft">
          <div className="cp-fill h-full rounded-full" style={{ width: `${pct}%`, background: project.color }} />
        </div>
      </div>
      <AvatarStack people={people} size={28} />
    </Link>
  );
}
