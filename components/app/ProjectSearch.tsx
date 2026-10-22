"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDismiss } from "@/lib/hooks";
import { useApp } from "./AppProvider";

/** Quick-jump search across the user's projects. ⌘K / Ctrl+K focuses it. */
export function ProjectSearch() {
  const { projects, sharedProjects } = useApp();
  const router = useRouter();
  const [term, setTerm] = useState("");
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const close = useCallback(() => setOpen(false), []);
  const ref = useDismiss<HTMLDivElement>(open, close);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const matches = [...projects, ...sharedProjects].filter((p) => p.name.toLowerCase().includes(term.trim().toLowerCase())).slice(0, 6);

  function go(id: string) {
    setTerm("");
    close();
    router.push(`/project/${id}`);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key !== "Enter" || !matches[0]) return;
    e.currentTarget.blur();
    go(matches[0].id);
  }

  return (
    <div ref={ref} className="relative hidden max-w-[420px] flex-1 md:block">
      <label className="flex h-[42px] items-center gap-2.5 rounded-xl border border-line bg-canvas px-3.5 text-sm text-muted focus-within:border-brand">
        <Search className="size-4" />
        <span className="sr-only">Search projects</span>
        <input
          ref={inputRef}
          type="search"
          value={term}
          onChange={(e) => {
            setTerm(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search projects"
          className="min-w-0 flex-1 bg-transparent text-ink outline-none placeholder:text-muted"
        />
        <kbd className="rounded-md border border-line-2 px-1.5 py-0.5 font-sans text-xs">⌘K</kbd>
      </label>
      {open && term && (
        <div className="absolute inset-x-0 top-[48px] z-40 rounded-2xl border border-line bg-white p-1.5 shadow-pop">
          {matches.length ? (
            matches.map((p) => (
              <button key={p.id} type="button" onClick={() => go(p.id)} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm hover:bg-canvas">
                <span className="size-2.5 rounded-[3px]" style={{ background: p.color }} />
                {p.name}
              </button>
            ))
          ) : (
            <p className="px-3 py-3 text-sm text-muted">No projects match &ldquo;{term}&rdquo;.</p>
          )}
        </div>
      )}
    </div>
  );
}
