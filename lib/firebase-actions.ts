/**
 * Every read and write Coplan makes to Firebase lives here, so pages and components
 * never talk to the SDK directly. Access control itself is enforced by firestore.rules;
 * these helpers only shape the data the rules expect.
 */
import {
  browserLocalPersistence,
  browserSessionPersistence,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type User,
} from "firebase/auth";
import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  collectionGroup,
  deleteDoc,
  deleteField,
  doc,
  getDoc,
  getDocs,
  increment,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
  type DocumentData,
  type DocumentSnapshot,
  type QueryDocumentSnapshot,
  type WriteBatch,
} from "firebase/firestore";
import { getFirebase, getGoogleProvider } from "./firebase";
import { defaultColumns } from "./constants";
import { sendInviteEmail } from "./emailjs";
import type {
  AppNotification,
  Column,
  Comment,
  Invite,
  InviteScope,
  MemberInfo,
  NotificationType,
  Project,
  Role,
  Task,
  Workspace,
} from "./types";

type Unsubscribe = () => void;
type OnError = (error: Error) => void;
type MembershipCollection = "workspaces" | "projects";

const db = () => getFirebase().db;
const auth = () => getFirebase().auth;

function withId<T>(snap: QueryDocumentSnapshot<DocumentData> | DocumentSnapshot<DocumentData>): T {
  return { id: snap.id, ...snap.data() } as T;
}

export function memberInfo(user: User, nameOverride?: string): MemberInfo {
  return {
    name: nameOverride || user.displayName || user.email?.split("@")[0] || "Teammate",
    email: user.email ?? "",
    photoURL: user.photoURL ?? null,
  };
}

/* ------------------------------------------------------------------ */
/* Auth                                                                */
/* ------------------------------------------------------------------ */

/** Creates the user's profile and a starter workspace the first time they sign in. */
export async function ensureUserProfile(user: User, nameOverride?: string) {
  const userRef = doc(db(), "users", user.uid);
  if ((await getDoc(userRef)).exists()) return;

  const info = memberInfo(user, nameOverride);
  const batch = writeBatch(db());
  batch.set(userRef, { uid: user.uid, ...info, createdAt: serverTimestamp() });
  batch.set(doc(collection(db(), "workspaces")), {
    name: `${info.name.split(" ")[0]}'s workspace`,
    ownerId: user.uid,
    memberIds: [user.uid],
    roles: { [user.uid]: "owner" },
    members: { [user.uid]: info },
    createdAt: serverTimestamp(),
  });
  await batch.commit();
}

async function applyPersistence(remember: boolean) {
  await setPersistence(auth(), remember ? browserLocalPersistence : browserSessionPersistence);
}

export async function signInWithGoogle(remember = true) {
  await applyPersistence(remember);
  const { user } = await signInWithPopup(auth(), getGoogleProvider());
  await ensureUserProfile(user);
  return user;
}

export async function registerWithEmail({ name, email, password }: { name: string; email: string; password: string }) {
  const { user } = await createUserWithEmailAndPassword(auth(), email.trim(), password);
  await updateProfile(user, { displayName: name.trim() });
  await ensureUserProfile(user, name.trim());
  // A verified email is required to accept invites (see firestore.rules); a failed send isn't fatal.
  await sendVerificationEmail(user).catch(() => undefined);
  return user;
}

export async function sendVerificationEmail(user: User) {
  await withContinueUrl("/dashboard", (settings) => sendEmailVerification(user, settings));
}

/** Re-reads the account after the user clicks the verification link; returns whether it's verified now. */
export async function refreshEmailVerified(user: User) {
  await user.reload();
  await user.getIdToken(true); // so Firestore rules see email_verified straight away
  return auth().currentUser?.emailVerified ?? false;
}

export async function loginWithEmail({ email, password, remember }: { email: string; password: string; remember: boolean }) {
  await applyPersistence(remember);
  const { user } = await signInWithEmailAndPassword(auth(), email.trim(), password);
  await ensureUserProfile(user);
  return user;
}

/**
 * Firebase emails link to its own hosted page; the "continue" button there returns to `path`.
 * That return link only works on domains listed under Authentication → Authorized domains,
 * so if this site isn't listed yet the email is sent without it rather than failing.
 */
async function withContinueUrl(path: string, send: (settings?: { url: string }) => Promise<void>) {
  try {
    await send({ url: `${window.location.origin}${path}` });
  } catch (error) {
    const code = (error as { code?: string }).code;
    if (code !== "auth/unauthorized-continue-uri" && code !== "auth/invalid-continue-uri") throw error;
    await send();
  }
}

export async function resetPassword(email: string) {
  await withContinueUrl("/auth/login", (settings) => sendPasswordResetEmail(auth(), email.trim(), settings));
}

export async function logout() {
  await signOut(auth());
}

export async function updateDisplayName(user: User, name: string) {
  await updateProfile(user, { displayName: name });
  await updateDoc(doc(db(), "users", user.uid), { name });
}

const AUTH_ERRORS: Record<string, string> = {
  "auth/invalid-credential": "That email and password don't match. Please try again.",
  "auth/wrong-password": "That email and password don't match. Please try again.",
  "auth/user-not-found": "We couldn't find an account with that email.",
  "auth/email-already-in-use": "An account with this email already exists. Try logging in instead.",
  "auth/weak-password": "Please choose a stronger password (at least 8 characters).",
  "auth/invalid-email": "Please enter a valid email address.",
  "auth/too-many-requests": "Too many attempts. Please wait a moment and try again.",
  "auth/popup-closed-by-user": "The Google sign-in window was closed before finishing.",
  "auth/popup-blocked": "Your browser blocked the Google sign-in window. Please allow pop-ups and try again.",
  "auth/network-request-failed": "Network error. Check your connection and try again.",
  "auth/user-disabled": "This account has been disabled. Contact your workspace owner.",
};

export function authErrorMessage(error: unknown) {
  const code = (error as { code?: string })?.code ?? "";
  return AUTH_ERRORS[code] ?? (error instanceof Error ? error.message : "Something went wrong. Please try again.");
}

/* ------------------------------------------------------------------ */
/* Workspaces & membership                                             */
/* ------------------------------------------------------------------ */

export function subscribeToWorkspaces(uid: string, cb: (items: Workspace[]) => void, onError?: OnError): Unsubscribe {
  const q = query(collection(db(), "workspaces"), where("memberIds", "array-contains", uid));
  return onSnapshot(
    q,
    (snap) => cb(snap.docs.map((d) => withId<Workspace>(d)).sort((a, b) => a.name.localeCompare(b.name))),
    onError,
  );
}

export function subscribeToWorkspace(id: string, cb: (item: Workspace | null) => void, onError?: OnError): Unsubscribe {
  return onSnapshot(doc(db(), "workspaces", id), (snap) => cb(snap.exists() ? withId<Workspace>(snap) : null), onError);
}

export async function createWorkspace(user: User, name: string) {
  const ref = await addDoc(collection(db(), "workspaces"), {
    name: name.trim(),
    ownerId: user.uid,
    memberIds: [user.uid],
    roles: { [user.uid]: "owner" },
    members: { [user.uid]: memberInfo(user) },
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateMemberRole(kind: MembershipCollection, id: string, uid: string, role: Role) {
  await updateDoc(doc(db(), kind, id), { [`roles.${uid}`]: role });
}

export async function removeMember(kind: MembershipCollection, id: string, uid: string) {
  await updateDoc(doc(db(), kind, id), {
    memberIds: arrayRemove(uid),
    [`roles.${uid}`]: deleteField(),
    [`members.${uid}`]: deleteField(),
  });
}

/* ------------------------------------------------------------------ */
/* Projects & columns                                                  */
/* ------------------------------------------------------------------ */

const byUpdated = (a: Project, b: Project) => (b.updatedAt?.toMillis() ?? 0) - (a.updatedAt?.toMillis() ?? 0);

export function subscribeToWorkspaceProjects(workspaceId: string, cb: (items: Project[]) => void, onError?: OnError): Unsubscribe {
  const q = query(collection(db(), "projects"), where("workspaceId", "==", workspaceId));
  return onSnapshot(q, (snap) => cb(snap.docs.map((d) => withId<Project>(d)).sort(byUpdated)), onError);
}

/** Projects the user was invited to directly, which may live in workspaces they are not part of. */
export function subscribeToSharedProjects(uid: string, cb: (items: Project[]) => void, onError?: OnError): Unsubscribe {
  const q = query(collection(db(), "projects"), where("memberIds", "array-contains", uid));
  return onSnapshot(q, (snap) => cb(snap.docs.map((d) => withId<Project>(d)).sort(byUpdated)), onError);
}

export function subscribeToProject(id: string, cb: (item: Project | null) => void, onError?: OnError): Unsubscribe {
  return onSnapshot(doc(db(), "projects", id), (snap) => cb(snap.exists() ? withId<Project>(snap) : null), onError);
}

export async function createProject(user: User, workspace: Workspace, { name, color }: { name: string; color: string }) {
  const ref = await addDoc(collection(db(), "projects"), {
    workspaceId: workspace.id,
    name: name.trim(),
    color,
    ownerId: user.uid,
    memberIds: [user.uid],
    roles: { [user.uid]: "owner" },
    members: { [user.uid]: memberInfo(user) },
    columns: defaultColumns(),
    taskCount: 0,
    doneCount: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateProject(id: string, patch: Partial<Pick<Project, "name" | "color" | "columns">>) {
  await updateDoc(doc(db(), "projects", id), { ...patch, updatedAt: serverTimestamp() });
}

/**
 * Saves a new column list. The last column counts as "done", so when it changes the
 * project's done counter is recounted from the tasks now in that column.
 */
async function saveColumns(project: Project, columns: Column[]) {
  const newDone = columns[columns.length - 1]?.id;
  const patch: Record<string, unknown> = { columns, updatedAt: serverTimestamp() };
  if (newDone !== doneColumnId(project)) {
    const inDone = newDone ? await getDocs(query(collection(db(), "projects", project.id, "tasks"), where("columnId", "==", newDone))) : null;
    patch.doneCount = inDone?.size ?? 0;
  }
  await updateDoc(doc(db(), "projects", project.id), patch);
}

export async function addColumn(project: Project, name: string, color: string) {
  await saveColumns(project, [...project.columns, { id: crypto.randomUUID(), name: name.trim(), color }]);
}

export async function renameColumn(project: Project, columnId: string, name: string) {
  await saveColumns(project, project.columns.map((c) => (c.id === columnId ? { ...c, name: name.trim() } : c)));
}

/** Only empty columns can be removed; the UI checks this before calling. */
export async function deleteColumn(project: Project, columnId: string) {
  await saveColumns(project, project.columns.filter((c) => c.id !== columnId));
}

async function commitInChunks(paths: string[], apply: (batch: WriteBatch, path: string) => void) {
  for (let i = 0; i < paths.length; i += 400) {
    const batch = writeBatch(db());
    paths.slice(i, i + 400).forEach((p) => apply(batch, p));
    await batch.commit();
  }
}

export async function deleteProject(project: Project) {
  const tasks = await getDocs(collection(db(), "projects", project.id, "tasks"));
  const paths: string[] = [];
  for (const t of tasks.docs) {
    const comments = await getDocs(collection(t.ref, "comments"));
    comments.docs.forEach((c) => paths.push(c.ref.path));
    paths.push(t.ref.path);
  }
  await commitInChunks(paths, (batch, path) => batch.delete(doc(db(), path)));
  await deleteDoc(doc(db(), "projects", project.id));
}

/* ------------------------------------------------------------------ */
/* Tasks                                                               */
/* ------------------------------------------------------------------ */

const doneColumnId = (project: Project) => project.columns[project.columns.length - 1]?.id;

export function subscribeToTasks(projectId: string, cb: (items: Task[]) => void, onError?: OnError): Unsubscribe {
  const q = query(collection(db(), "projects", projectId, "tasks"), orderBy("order", "asc"));
  return onSnapshot(q, (snap) => cb(snap.docs.map((d) => withId<Task>(d))), onError);
}

/** Tasks assigned to the user across every project, newest due dates first. */
export function subscribeToAssignedTasks(uid: string, cb: (items: Task[]) => void, onError?: OnError): Unsubscribe {
  const q = query(collectionGroup(db(), "tasks"), where("assigneeIds", "array-contains", uid));
  return onSnapshot(
    q,
    (snap) =>
      cb(
        snap.docs
          .map((d) => withId<Task>(d))
          .sort((a, b) => (a.dueDate ?? "9999").localeCompare(b.dueDate ?? "9999")),
      ),
    onError,
  );
}

export async function createTask(user: User, project: Project, columnId: string, title: string, order: number) {
  const batch = writeBatch(db());
  const ref = doc(collection(db(), "projects", project.id, "tasks"));
  batch.set(ref, {
    projectId: project.id,
    projectName: project.name,
    title: title.trim(),
    description: "",
    columnId,
    order,
    labels: [],
    assigneeIds: [],
    dueDate: null,
    checklist: [],
    commentCount: 0,
    createdBy: user.uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  batch.update(doc(db(), "projects", project.id), {
    taskCount: increment(1),
    ...(columnId === doneColumnId(project) ? { doneCount: increment(1) } : {}),
    updatedAt: serverTimestamp(),
  });
  await batch.commit();
  return ref.id;
}

export async function updateTask(projectId: string, taskId: string, patch: Partial<Omit<Task, "id" | "projectId">>) {
  await updateDoc(doc(db(), "projects", projectId, "tasks", taskId), { ...patch, updatedAt: serverTimestamp() });
}

/** Moves a task to a column/position and keeps the project's done counter in sync. */
export async function moveTask(project: Project, task: Task, toColumnId: string, order: number) {
  const done = doneColumnId(project);
  const delta = (toColumnId === done ? 1 : 0) - (task.columnId === done ? 1 : 0);
  const batch = writeBatch(db());
  batch.update(doc(db(), "projects", project.id, "tasks", task.id), { columnId: toColumnId, order, updatedAt: serverTimestamp() });
  batch.update(doc(db(), "projects", project.id), { ...(delta ? { doneCount: increment(delta) } : {}), updatedAt: serverTimestamp() });
  await batch.commit();
}

export async function deleteTask(project: Project, task: Task) {
  const comments = await getDocs(collection(db(), "projects", project.id, "tasks", task.id, "comments"));
  const batch = writeBatch(db());
  comments.docs.forEach((c) => batch.delete(c.ref));
  batch.delete(doc(db(), "projects", project.id, "tasks", task.id));
  batch.update(doc(db(), "projects", project.id), {
    taskCount: increment(-1),
    ...(task.columnId === doneColumnId(project) ? { doneCount: increment(-1) } : {}),
    updatedAt: serverTimestamp(),
  });
  await batch.commit();
}

/* ------------------------------------------------------------------ */
/* Notifications                                                       */
/* ------------------------------------------------------------------ */

interface NotifyInput {
  type: NotificationType;
  recipients: string[];
  actor: User;
  link: string;
  project?: Project | null;
  task?: Pick<Task, "id" | "title"> | null;
  text?: string | null;
}

function queueNotifications(batch: WriteBatch, { type, recipients, actor, link, project, task, text }: NotifyInput) {
  const info = memberInfo(actor);
  new Set(recipients).forEach((userId) => {
    if (userId === actor.uid) return;
    batch.set(doc(collection(db(), "notifications")), {
      userId,
      type,
      actorId: actor.uid,
      actorName: info.name,
      actorPhoto: info.photoURL,
      projectId: project?.id ?? null,
      projectName: project?.name ?? null,
      taskId: task?.id ?? null,
      taskTitle: task?.title ?? null,
      text: text ?? null,
      link,
      read: false,
      createdAt: serverTimestamp(),
    });
  });
}

const taskLink = (projectId: string, taskId: string) => `/project/${projectId}?task=${taskId}`;

export function subscribeToNotifications(uid: string, cb: (items: AppNotification[]) => void, max = 30, onError?: OnError): Unsubscribe {
  const q = query(collection(db(), "notifications"), where("userId", "==", uid), orderBy("createdAt", "desc"), limit(max));
  return onSnapshot(q, (snap) => cb(snap.docs.map((d) => withId<AppNotification>(d))), onError);
}

export async function markNotificationRead(id: string) {
  await updateDoc(doc(db(), "notifications", id), { read: true });
}

export async function markAllNotificationsRead(ids: string[]) {
  await commitInChunks(ids, (batch, id) => batch.update(doc(db(), "notifications", id), { read: true }));
}

/** Updates assignees and notifies anyone newly assigned. */
export async function assignTask(user: User, project: Project, task: Task, assigneeIds: string[]) {
  const batch = writeBatch(db());
  batch.update(doc(db(), "projects", project.id, "tasks", task.id), { assigneeIds, updatedAt: serverTimestamp() });
  queueNotifications(batch, {
    type: "assigned",
    recipients: assigneeIds.filter((id) => !task.assigneeIds.includes(id)),
    actor: user,
    project,
    task,
    link: taskLink(project.id, task.id),
  });
  await batch.commit();
}

/* ------------------------------------------------------------------ */
/* Comments & mentions                                                 */
/* ------------------------------------------------------------------ */

export function subscribeToComments(projectId: string, taskId: string, cb: (items: Comment[]) => void, onError?: OnError): Unsubscribe {
  const q = query(collection(db(), "projects", projectId, "tasks", taskId, "comments"), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => cb(snap.docs.map((d) => withId<Comment>(d))), onError);
}

/** Posts a comment, then notifies everyone @mentioned and the task's other assignees. */
export async function addComment(user: User, project: Project, task: Task, text: string, mentions: string[]) {
  const info = memberInfo(user);
  const batch = writeBatch(db());
  batch.set(doc(collection(db(), "projects", project.id, "tasks", task.id, "comments")), {
    authorId: user.uid,
    authorName: info.name,
    authorPhoto: info.photoURL,
    text: text.trim(),
    mentions,
    createdAt: serverTimestamp(),
  });
  batch.update(doc(db(), "projects", project.id, "tasks", task.id), { commentCount: increment(1) });
  const link = taskLink(project.id, task.id);
  const snippet = text.trim().slice(0, 140);
  queueNotifications(batch, { type: "mention", recipients: mentions, actor: user, project, task, link, text: snippet });
  queueNotifications(batch, {
    type: "comment",
    recipients: task.assigneeIds.filter((id) => !mentions.includes(id)),
    actor: user,
    project,
    task,
    link,
    text: snippet,
  });
  await batch.commit();
}

export async function deleteComment(projectId: string, taskId: string, commentId: string) {
  const batch = writeBatch(db());
  batch.delete(doc(db(), "projects", projectId, "tasks", taskId, "comments", commentId));
  batch.update(doc(db(), "projects", projectId, "tasks", taskId), { commentCount: increment(-1) });
  await batch.commit();
}

/* ------------------------------------------------------------------ */
/* Invites (EmailJS)                                                   */
/* ------------------------------------------------------------------ */

export interface InviteRequest {
  scope: InviteScope;
  targetId: string;
  targetName: string;
  workspaceId: string;
  emails: string[];
  role: Invite["role"];
  message: string;
}

export interface InviteResult {
  email: string;
  link: string;
  emailed: boolean;
  error?: string;
}

export const inviteLink = (token: string) => `${window.location.origin}/invite/${token}`;

/**
 * Creates one invite per email (the document id is the secret token in the link), emails it
 * with EmailJS and, if the person already has a Coplan account, drops an invite into their bell.
 */
export async function createInvites(user: User, req: InviteRequest): Promise<InviteResult[]> {
  const inviter = memberInfo(user);
  const results: InviteResult[] = [];

  for (const raw of req.emails) {
    const email = raw.trim().toLowerCase();
    if (email === inviter.email.toLowerCase()) {
      results.push({ email, link: "", emailed: false, error: "That's your own email — you already have access." });
      continue;
    }
    const ref = doc(collection(db(), "invites"));
    const link = inviteLink(ref.id);
    await setDoc(ref, {
      email,
      scope: req.scope,
      targetId: req.targetId,
      targetName: req.targetName,
      workspaceId: req.workspaceId,
      role: req.role,
      invitedBy: user.uid,
      invitedByName: inviter.name,
      invitedByEmail: inviter.email,
      message: req.message.trim(),
      status: "pending",
      createdAt: serverTimestamp(),
    });

    const existing = await getDocs(query(collection(db(), "users"), where("email", "==", email), limit(1)));
    if (!existing.empty) {
      const batch = writeBatch(db());
      queueNotifications(batch, {
        type: "invite",
        recipients: [existing.docs[0].id],
        actor: user,
        link: `/invite/${ref.id}`,
        text: `${req.scope === "workspace" ? "Workspace" : "Project"} · ${req.targetName}`,
      });
      await batch.commit();
    }

    try {
      const emailed = await sendInviteEmail({
        to_email: email,
        inviter_name: inviter.name,
        reply_to: inviter.email,
        target_name: req.targetName,
        target_type: req.scope,
        role: req.role,
        message: req.message.trim(),
        invite_link: link,
      });
      results.push({ email, link, emailed });
    } catch (error) {
      results.push({ email, link, emailed: false, error: error instanceof Error ? error.message : "Email failed to send" });
    }
  }
  return results;
}

export function subscribeToPendingInvites(scope: InviteScope, targetId: string, cb: (items: Invite[]) => void, onError?: OnError): Unsubscribe {
  const q = query(
    collection(db(), "invites"),
    where("scope", "==", scope),
    where("targetId", "==", targetId),
    where("status", "==", "pending"),
  );
  return onSnapshot(q, (snap) => cb(snap.docs.map((d) => withId<Invite>(d))), onError);
}

export async function getInvite(token: string) {
  const snap = await getDoc(doc(db(), "invites", token));
  return snap.exists() ? withId<Invite>(snap) : null;
}

export async function revokeInvite(token: string) {
  await updateDoc(doc(db(), "invites", token), { status: "revoked" });
}

export async function resendInvite(invite: Invite) {
  return sendInviteEmail({
    to_email: invite.email,
    inviter_name: invite.invitedByName,
    reply_to: invite.invitedByEmail ?? "",
    target_name: invite.targetName,
    target_type: invite.scope,
    role: invite.role,
    message: invite.message,
    invite_link: inviteLink(invite.id),
  });
}

/** Joins the invited workspace or project. Returns the path to send the user to. */
export async function acceptInvite(user: User, token: string) {
  const invite = await getInvite(token);
  if (!invite || invite.status === "revoked") throw new Error("This invite is no longer valid.");
  const targetPath = invite.scope === "workspace" ? `/dashboard?workspace=${invite.targetId}` : `/project/${invite.targetId}`;
  if (invite.status === "accepted") return targetPath;
  if (invite.email.toLowerCase() !== (user.email ?? "").toLowerCase()) {
    throw new Error(`This invite was sent to ${invite.email}. Sign in with that email to accept it.`);
  }
  if (!user.emailVerified) throw new Error("Please verify your email address before accepting this invite.");

  const collectionName: MembershipCollection = invite.scope === "workspace" ? "workspaces" : "projects";
  const targetRef = doc(db(), collectionName, invite.targetId);

  // Already a member (we can only read the target if we are): just close the invite.
  const alreadyMember = await getDoc(targetRef)
    .then((s) => s.exists() && (s.data().memberIds as string[]).includes(user.uid))
    .catch(() => false);

  const batch = writeBatch(db());
  if (!alreadyMember) {
    batch.update(targetRef, {
      memberIds: arrayUnion(user.uid),
      [`roles.${user.uid}`]: invite.role,
      [`members.${user.uid}`]: memberInfo(user),
      joinedVia: token,
    });
  }
  batch.update(doc(db(), "invites", token), { status: "accepted", acceptedBy: user.uid });
  await batch.commit();
  return targetPath;
}
