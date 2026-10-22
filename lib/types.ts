import type { Timestamp } from "firebase/firestore";

export type Role = "owner" | "member" | "viewer";

export interface MemberInfo {
  name: string;
  email: string;
  photoURL: string | null;
}

export interface UserProfile extends MemberInfo {
  uid: string;
  createdAt?: Timestamp;
}

/** Fields shared by workspaces and projects: both carry their own member list and roles. */
export interface Membership {
  ownerId: string;
  memberIds: string[];
  roles: Record<string, Role>;
  members: Record<string, MemberInfo>;
}

export interface Workspace extends Membership {
  id: string;
  name: string;
  createdAt?: Timestamp;
}

export interface Column {
  id: string;
  name: string;
  color: string;
}

export interface Project extends Membership {
  id: string;
  workspaceId: string;
  name: string;
  color: string;
  columns: Column[];
  taskCount: number;
  doneCount: number;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export type LabelKey = "design" | "dev" | "copy" | "research" | "bug";

export interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

export interface Task {
  id: string;
  projectId: string;
  projectName: string;
  title: string;
  description: string;
  columnId: string;
  order: number;
  labels: LabelKey[];
  assigneeIds: string[];
  dueDate: string | null;
  checklist: ChecklistItem[];
  commentCount: number;
  createdBy: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  authorPhoto: string | null;
  text: string;
  mentions: string[];
  createdAt?: Timestamp;
}

export type NotificationType = "mention" | "assigned" | "invite" | "comment";

export interface AppNotification {
  id: string;
  userId: string;
  type: NotificationType;
  actorId: string;
  actorName: string;
  actorPhoto: string | null;
  projectId: string | null;
  projectName: string | null;
  taskId: string | null;
  taskTitle: string | null;
  text: string | null;
  link: string;
  read: boolean;
  createdAt?: Timestamp;
}

export type InviteScope = "project" | "workspace";
export type InviteStatus = "pending" | "accepted" | "revoked";

export interface Invite {
  id: string;
  email: string;
  scope: InviteScope;
  targetId: string;
  targetName: string;
  workspaceId: string;
  role: Exclude<Role, "owner">;
  invitedBy: string;
  invitedByName: string;
  /** Used as Reply-To when the invite email is resent. Missing on invites created before it existed. */
  invitedByEmail?: string;
  message: string;
  status: InviteStatus;
  createdAt?: Timestamp;
}
