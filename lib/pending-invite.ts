/**
 * Remembers an invite someone opened before signing in, so the auth pages can show
 * the invite banner and send them back to accept it afterwards.
 */
import { useMemo, useSyncExternalStore } from "react";

/** Only the token is stored: invite details can only be read once the person is signed in. */
export interface PendingInvite {
  token: string;
}

const KEY = "coplan:pending-invite";

export function savePendingInvite(invite: PendingInvite) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(invite));
  } catch {
    /* storage unavailable — the invite link still works */
  }
}

export function readPendingInvite(): PendingInvite | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as PendingInvite) : null;
  } catch {
    return null;
  }
}

export function clearPendingInvite() {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

function readRaw() {
  try {
    return sessionStorage.getItem(KEY);
  } catch {
    return null;
  }
}

const noopSubscribe = () => () => {};

/** The pending invite, read safely during render (null on the server). */
export function usePendingInvite(): PendingInvite | null {
  const raw = useSyncExternalStore(noopSubscribe, readRaw, () => null);
  return useMemo(() => {
    try {
      return raw ? (JSON.parse(raw) as PendingInvite) : null;
    } catch {
      return null;
    }
  }, [raw]);
}

/** Where to go after a successful sign-in. */
export function postAuthPath() {
  const invite = readPendingInvite();
  return invite ? `/invite/${invite.token}` : "/dashboard";
}
