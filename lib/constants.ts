import type { Column, LabelKey, Role } from "./types";

export const LABELS: Record<LabelKey, { name: string; bg: string; fg: string }> = {
  design: { name: "Design", bg: "#FFEDD5", fg: "#9A3412" },
  dev: { name: "Dev", bg: "#DCFCE7", fg: "#166534" },
  copy: { name: "Copy", bg: "#F3E8FF", fg: "#6B21A8" },
  research: { name: "Research", bg: "#E0F2FE", fg: "#075985" },
  bug: { name: "Bug", bg: "#FEE2E2", fg: "#991B1B" },
};

export const PROJECT_COLORS = ["#4338CA", "#0F766E", "#C2410C", "#BE185D", "#7C3AED", "#0369A1"];

export const COLUMN_COLORS = ["#9BA0B4", "#0284C7", "#E0A400", "#7C3AED", "#0F766E"];

export function defaultColumns(): Column[] {
  return [
    { id: crypto.randomUUID(), name: "Backlog", color: "#9BA0B4" },
    { id: crypto.randomUUID(), name: "To do", color: "#0284C7" },
    { id: crypto.randomUUID(), name: "In progress", color: "#E0A400" },
    { id: crypto.randomUUID(), name: "Done", color: "#0F766E" },
  ];
}

export const ROLE_INFO: Record<Role, { label: string; description: string }> = {
  owner: { label: "Owner", description: "Full control, including invites and roles" },
  member: { label: "Member", description: "Can create, move and comment on tasks" },
  viewer: { label: "Viewer", description: "Can view boards and comment" },
};

export const AVATAR_COLORS = ["#F97316", "#0F766E", "#4338CA", "#BE185D", "#7C3AED", "#0369A1", "#B45309", "#475569"];
