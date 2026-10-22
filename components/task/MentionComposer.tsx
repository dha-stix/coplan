"use client";

import { AtSign, Send } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useRef, useState, type KeyboardEvent } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import type { Person } from "@/lib/people";
import { cn } from "@/lib/utils";

interface MentionComposerProps {
  people: Person[];
  onSubmit: (text: string, mentions: string[]) => Promise<void>;
}

interface MentionQuery {
  start: number;
  term: string;
}

/** Comment box with @mention autocomplete. Mentioned people are notified when it's posted. */
export function MentionComposer({ people, onSubmit }: MentionComposerProps) {
  const [text, setText] = useState("");
  const [mentioned, setMentioned] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState<MentionQuery | null>(null);
  const [active, setActive] = useState(0);
  const [sending, setSending] = useState(false);
  const ref = useRef<HTMLTextAreaElement>(null);

  const options = useMemo(() => {
    if (!query) return [];
    const term = query.term.toLowerCase();
    return people.filter((p) => p.name.toLowerCase().includes(term) || p.email.toLowerCase().startsWith(term)).slice(0, 6);
  }, [people, query]);

  function detect(value: string, caret: number) {
    const match = /(^|\s)@([^\s@]*)$/.exec(value.slice(0, caret));
    setQuery(match ? { start: caret - match[2].length - 1, term: match[2] } : null);
    setActive(0);
  }

  function pick(person: Person) {
    if (!query || !ref.current) return;
    const caret = ref.current.selectionStart;
    const insert = `@${person.name} `;
    const next = text.slice(0, query.start) + insert + text.slice(caret);
    setText(next);
    setMentioned((s) => new Set(s).add(person.id));
    setQuery(null);
    requestAnimationFrame(() => {
      const pos = query.start + insert.length;
      ref.current?.focus();
      ref.current?.setSelectionRange(pos, pos);
    });
  }

  async function submit() {
    if (!text.trim() || sending) return;
    // Keep only mentions whose @Name is still in the text.
    const ids = [...mentioned].filter((id) => {
      const p = people.find((x) => x.id === id);
      return p && text.includes(`@${p.name}`);
    });
    setSending(true);
    try {
      await onSubmit(text, ids);
      setText("");
      setMentioned(new Set());
    } finally {
      setSending(false);
    }
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (query && options.length) {
      if (e.key === "ArrowDown") return e.preventDefault(), setActive((i) => (i + 1) % options.length);
      if (e.key === "ArrowUp") return e.preventDefault(), setActive((i) => (i - 1 + options.length) % options.length);
      if (e.key === "Enter" || e.key === "Tab") return e.preventDefault(), pick(options[active]);
      // preventDefault tells the task dialog this Escape only closed the @mention list.
      if (e.key === "Escape") return e.preventDefault(), setQuery(null);
    }
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      void submit();
    }
  }

  function insertAt() {
    const el = ref.current;
    if (!el) return;
    const caret = el.selectionStart;
    const prefix = caret > 0 && !/\s/.test(text[caret - 1]) ? " @" : "@";
    const next = text.slice(0, caret) + prefix + text.slice(caret);
    setText(next);
    requestAnimationFrame(() => {
      el.focus();
      const pos = caret + prefix.length;
      el.setSelectionRange(pos, pos);
      detect(next, pos);
    });
  }

  return (
    <div className="relative rounded-[14px] border border-line-2 bg-white transition focus-within:border-brand focus-within:shadow-[0_0_0_4px_var(--color-brand-soft)]">
      <label htmlFor="comment-box" className="sr-only">
        Write a comment
      </label>
      <textarea
        id="comment-box"
        ref={ref}
        value={text}
        rows={2}
        onChange={(e) => {
          setText(e.target.value);
          detect(e.target.value, e.target.selectionStart);
        }}
        onKeyDown={onKeyDown}
        onClick={(e) => detect(text, e.currentTarget.selectionStart)}
        placeholder="Write a comment… type @ to mention a teammate"
        aria-autocomplete="list"
        aria-controls={query && options.length ? "mention-options" : undefined}
        className="block w-full resize-none rounded-[14px] bg-transparent px-3.5 pt-3 text-sm leading-relaxed outline-none placeholder:text-faint"
      />
      <div className="flex items-center gap-1 px-2 pb-2">
        <button type="button" onClick={insertAt} aria-label="Mention someone" className="flex size-9 items-center justify-center rounded-lg text-muted hover:bg-soft">
          <AtSign className="size-4" />
        </button>
        <span className="hidden text-xs text-faint sm:inline">⌘ + Enter to send</span>
        <Button size="sm" className="ml-auto" onClick={submit} loading={sending} disabled={!text.trim()}>
          {!sending && <Send className="size-3.5" />} Comment
        </Button>
      </div>

      <AnimatePresence>
        {query && options.length > 0 && (
          <motion.ul
            id="mention-options"
            role="listbox"
            aria-label="Mention a teammate"
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute left-3 top-[calc(100%-36px)] z-20 w-[min(280px,calc(100%-24px))] rounded-[14px] border border-line bg-white p-1.5 shadow-pop"
          >
            <li className="px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-muted">People on this project</li>
            {options.map((p, i) => (
              <li key={p.id} role="option" aria-selected={i === active}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => pick(p)}
                  onMouseEnter={() => setActive(i)}
                  className={cn("flex w-full items-center gap-2.5 rounded-[10px] px-2.5 py-2 text-left text-sm", i === active && "bg-brand-soft")}
                >
                  <Avatar id={p.id} name={p.name} photoURL={p.photoURL} size={28} />
                  <span className="min-w-0">
                    <span className="block truncate font-medium">{p.name}</span>
                    <span className="block truncate text-xs text-muted">{p.email}</span>
                  </span>
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Renders comment text with @mentions highlighted. */
export function CommentText({ text, names }: { text: string; names: string[] }) {
  if (!names.length) return <>{text}</>;
  const escaped = names.map((n) => `@${n}`.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const parts = text.split(new RegExp(`(${escaped.join("|")})`, "g"));
  return (
    <>
      {parts.map((part, i) =>
        names.some((n) => part === `@${n}`) ? (
          <span key={i} className="rounded bg-brand-soft px-1 font-semibold text-brand">
            {part}
          </span>
        ) : (
          part
        ),
      )}
    </>
  );
}
