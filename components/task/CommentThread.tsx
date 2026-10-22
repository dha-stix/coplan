"use client";

import type { User } from "firebase/auth";
import { Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Avatar } from "@/components/ui/Avatar";
import { addComment, deleteComment, subscribeToComments } from "@/lib/firebase-actions";
import { useSubscription } from "@/lib/hooks";
import type { Person } from "@/lib/people";
import type { Comment, Project, Task } from "@/lib/types";
import { timeAgo } from "@/lib/utils";
import { CommentText, MentionComposer } from "./MentionComposer";

export function CommentThread({ user, project, task, people }: { user: User; project: Project; task: Task; people: Person[] }) {
  const { data: comments } = useSubscription<Comment[]>((onData, onError) => subscribeToComments(project.id, task.id, onData, onError), [], [project.id, task.id]);
  const nameOf = (id: string) => people.find((p) => p.id === id)?.name;

  return (
    <section className="flex flex-col gap-4">
      <h3 className="text-sm font-semibold text-muted">Comments · {comments.length}</h3>
      <div className="flex gap-3">
        <Avatar id={user.uid} name={user.displayName ?? user.email ?? "You"} photoURL={user.photoURL} size={36} />
        <div className="min-w-0 flex-1">
          <MentionComposer people={people} onSubmit={(text, mentions) => addComment(user, project, task, text, mentions)} />
        </div>
      </div>
      <ul className="flex flex-col gap-4">
        <AnimatePresence initial={false}>
          {comments.map((c) => (
            <motion.li
              key={c.id}
              layout
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              className="group flex gap-3"
            >
              <Avatar id={c.authorId} name={c.authorName} photoURL={c.authorPhoto} size={36} />
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <div className="flex items-center gap-2 text-sm">
                  <strong>{c.authorName}</strong>
                  <span className="text-xs text-muted">· {timeAgo(c.createdAt)}</span>
                  {c.authorId === user.uid && (
                    <button
                      type="button"
                      onClick={() => deleteComment(project.id, task.id, c.id)}
                      aria-label="Delete comment"
                      className="ml-auto flex size-7 items-center justify-center rounded-md text-faint opacity-0 transition hover:bg-red-50 hover:text-danger focus:opacity-100 group-hover:opacity-100"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  )}
                </div>
                <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-ink-2">
                  <CommentText text={c.text} names={c.mentions.map(nameOf).filter((n): n is string => Boolean(n))} />
                </p>
              </div>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </section>
  );
}
