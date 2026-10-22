import { clsx, type ClassValue } from "clsx";
import type { Timestamp } from "firebase/firestore";
import { AVATAR_COLORS } from "./constants";
import type { Membership, Role } from "./types";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
}

/** Stable colour per user id, so the same person always gets the same avatar colour. */
export function colorFor(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) | 0;
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export function timeAgo(ts?: Timestamp | null) {
  if (!ts) return "just now";
  const seconds = Math.floor((Date.now() - ts.toMillis()) / 1000);
  if (seconds < 45) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "yesterday";
  if (days < 7) return `${days}d ago`;
  return ts.toDate().toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

/** Today's date as yyyy-mm-dd in the user's local time zone (the format date inputs use). */
export function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function formatDue(date: string | null) {
  if (!date) return null;
  const due = new Date(`${date}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.round((due.getTime() - today.getTime()) / 86_400_000);
  const label =
    diff === 0 ? "Today" : diff === 1 ? "Tomorrow" : diff === -1 ? "Yesterday" : due.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  return { label, overdue: diff < 0, soon: diff >= 0 && diff <= 1 };
}

export function roleOf(entity: Membership | null | undefined, uid: string | undefined): Role | null {
  if (!entity || !uid) return null;
  return entity.roles[uid] ?? null;
}

export function canEdit(role: Role | null) {
  return role === "owner" || role === "member";
}

export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}
