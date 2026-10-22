"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

/** Calls `onOutside` when the user clicks/taps outside `ref` or presses Escape. */
export function useDismiss<T extends HTMLElement>(open: boolean, onOutside: () => void): RefObject<T | null> {
  const ref = useRef<T>(null);
  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onOutside();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.preventDefault(); // tells an enclosing dialog this Escape only closed the menu
      onOutside();
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onOutside]);
  return ref;
}

type Subscribe<T> = (onData: (value: T) => void, onError: (e: Error) => void) => () => void;

/**
 * Subscribes to a Firestore listener built by `subscribe`, re-subscribing when `deps` change.
 * Results are tagged with the deps they came from, so stale data is never shown after a switch.
 */
export function useSubscription<T>(subscribe: Subscribe<T> | null, initial: T, deps: unknown[]) {
  const key = JSON.stringify(deps);
  const [state, setState] = useState<{ key: string | null; data: T; error: Error | null }>({ key: null, data: initial, error: null });

  useEffect(() => {
    if (!subscribe) return;
    return subscribe(
      (data) => setState({ key, data, error: null }),
      (error) => setState((s) => ({ key, data: s.data, error })),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const current = state.key === key;
  return {
    data: current ? state.data : initial,
    loading: Boolean(subscribe) && !current,
    error: current ? state.error : null,
  };
}
