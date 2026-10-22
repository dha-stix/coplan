"use client";

import type { User } from "firebase/auth";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { subscribeToNotifications, subscribeToSharedProjects, subscribeToWorkspaceProjects, subscribeToWorkspaces } from "@/lib/firebase-actions";
import type { AppNotification, Project, Workspace } from "@/lib/types";

interface AppState {
  user: User;
  workspaces: Workspace[];
  workspace: Workspace | null;
  workspacesLoading: boolean;
  selectWorkspace: (id: string) => void;
  /** Projects in the current workspace. */
  projects: Project[];
  /** Projects shared with the user directly from workspaces they aren't part of. */
  sharedProjects: Project[];
  projectsLoading: boolean;
  notifications: AppNotification[];
  unreadCount: number;
}

const AppContext = createContext<AppState | null>(null);
const WORKSPACE_KEY = "coplan:workspace";

function storedWorkspaceId() {
  try {
    return typeof window === "undefined" ? null : localStorage.getItem(WORKSPACE_KEY);
  } catch {
    return null;
  }
}

/** Live workspaces, projects and notifications for the signed-in user, shared by every app screen. */
export function AppProvider({ user, children }: { user: User; children: ReactNode }) {
  const [workspaces, setWorkspaces] = useState<Workspace[] | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(storedWorkspaceId);
  const [projectState, setProjectState] = useState<{ workspaceId: string | null; items: Project[] }>({ workspaceId: null, items: [] });
  const [directProjects, setDirectProjects] = useState<Project[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  useEffect(() => {
    const offWorkspaces = subscribeToWorkspaces(user.uid, setWorkspaces, () => setWorkspaces([]));
    const offNotifications = subscribeToNotifications(user.uid, setNotifications);
    const offShared = subscribeToSharedProjects(user.uid, setDirectProjects);
    return () => {
      offWorkspaces();
      offNotifications();
      offShared();
    };
  }, [user.uid]);

  const list = useMemo(() => workspaces ?? [], [workspaces]);
  const workspace = useMemo(
    () => list.find((w) => w.id === selectedId) ?? list.find((w) => w.ownerId === user.uid) ?? list[0] ?? null,
    [list, selectedId, user.uid],
  );
  const workspaceId = workspace?.id ?? null;

  useEffect(() => {
    if (!workspaceId) return;
    return subscribeToWorkspaceProjects(
      workspaceId,
      (items) => setProjectState({ workspaceId, items }),
      () => setProjectState({ workspaceId, items: [] }),
    );
  }, [workspaceId]);

  const selectWorkspace = useCallback((id: string) => {
    setSelectedId(id);
    try {
      localStorage.setItem(WORKSPACE_KEY, id);
    } catch {
      /* storage unavailable */
    }
  }, []);

  const value = useMemo<AppState>(() => {
    const myWorkspaceIds = new Set(list.map((w) => w.id));
    const projectsReady = projectState.workspaceId === workspaceId;
    return {
      user,
      workspaces: list,
      workspace,
      workspacesLoading: workspaces === null,
      selectWorkspace,
      projects: projectsReady ? projectState.items : [],
      sharedProjects: directProjects.filter((p) => !myWorkspaceIds.has(p.workspaceId)),
      projectsLoading: workspaces === null || (Boolean(workspaceId) && !projectsReady),
      notifications,
      unreadCount: notifications.filter((n) => !n.read).length,
    };
  }, [user, list, workspaces, workspace, workspaceId, selectWorkspace, projectState, directProjects, notifications]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside <AppProvider>");
  return ctx;
}
