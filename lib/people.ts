import type { MemberInfo, Project, Role, Workspace } from "./types";

export interface Person extends MemberInfo {
  id: string;
  role: Role;
}

/** Everyone who can open a project: its own members plus members of its workspace. */
export function projectPeople(project: Project | null, workspace: Workspace | null): Person[] {
  if (!project) return [];
  const map = new Map<string, Person>();
  if (workspace) {
    for (const id of workspace.memberIds) {
      const info = workspace.members[id];
      if (info) map.set(id, { id, ...info, role: workspace.roles[id] ?? "viewer" });
    }
  }
  for (const id of project.memberIds) {
    const info = project.members[id];
    if (info) map.set(id, { id, ...info, role: project.roles[id] ?? map.get(id)?.role ?? "viewer" });
  }
  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
}

/** A user's effective role on a project (project role first, then workspace role). */
export function projectRole(project: Project | null, workspace: Workspace | null, uid: string | undefined): Role | null {
  if (!project || !uid) return null;
  return project.roles[uid] ?? workspace?.roles[uid] ?? null;
}

export function membershipPeople(entity: Workspace | Project | null): Person[] {
  if (!entity) return [];
  return entity.memberIds
    .filter((id) => entity.members[id])
    .map((id) => ({ id, ...entity.members[id], role: entity.roles[id] ?? "viewer" }))
    .sort((a, b) => (a.role === "owner" ? -1 : b.role === "owner" ? 1 : a.name.localeCompare(b.name)));
}
