"use client";

import { Check, Copy, Send, X } from "lucide-react";
import { useState, type ClipboardEvent, type KeyboardEvent } from "react";
import { useApp } from "@/components/app/AppProvider";
import { Button } from "@/components/ui/Button";
import { FormError } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { ROLE_INFO } from "@/lib/constants";
import { isEmailConfigured } from "@/lib/emailjs";
import { createInvites, type InviteResult } from "@/lib/firebase-actions";
import type { Invite, InviteScope, Project, Workspace } from "@/lib/types";
import { cn, isValidEmail } from "@/lib/utils";

interface InviteModalProps {
  open: boolean;
  onClose: () => void;
  /** Pass the targets the current user owns; each one becomes a scope option. */
  workspace?: Workspace | null;
  project?: Project | null;
  defaultScope?: InviteScope;
}

function CopyLink({ link }: { link: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(link);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="inline-flex items-center gap-1.5 rounded-lg border border-line px-2.5 py-1.5 text-xs font-semibold hover:bg-canvas"
    >
      {copied ? <Check className="size-3.5 text-teal" /> : <Copy className="size-3.5" />}
      {copied ? "Copied" : "Copy link"}
    </button>
  );
}

/** Rendered only while the modal is open, so every opening starts with a fresh form. */
function InviteForm({ onClose, workspace, project, defaultScope }: Omit<InviteModalProps, "open">) {
  const { user } = useApp();
  const scopes = [project && ("project" as const), workspace && ("workspace" as const)].filter(Boolean) as InviteScope[];
  const [scope, setScope] = useState<InviteScope>(defaultScope ?? scopes[0] ?? "workspace");
  const [emails, setEmails] = useState<string[]>([]);
  const [draft, setDraft] = useState("");
  const [role, setRole] = useState<Invite["role"]>("member");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<InviteResult[] | null>(null);

  const target = scope === "project" ? project : workspace;

  function addEmails(raw: string) {
    const found = raw.split(/[\s,;]+/).map((e) => e.trim().toLowerCase()).filter(Boolean);
    const invalid = found.filter((e) => !isValidEmail(e));
    setEmails((prev) => [...new Set([...prev, ...found.filter(isValidEmail)])]);
    setError(invalid.length ? `Not a valid email: ${invalid.join(", ")}` : null);
    setDraft("");
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (["Enter", ",", " ", "Tab"].includes(e.key) && draft.trim()) {
      e.preventDefault();
      addEmails(draft);
    } else if (e.key === "Backspace" && !draft && emails.length) {
      setEmails((prev) => prev.slice(0, -1));
    }
  }

  function onPaste(e: ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    addEmails(e.clipboardData.getData("text"));
  }

  async function send() {
    const all = draft.trim() ? [...emails, ...draft.split(/[\s,;]+/).filter(isValidEmail)] : emails;
    if (!target) return;
    if (!all.length) return setError("Add at least one email address.");
    setLoading(true);
    setError(null);
    try {
      const res = await createInvites(user, {
        scope,
        targetId: target.id,
        targetName: target.name,
        workspaceId: scope === "project" ? (target as Project).workspaceId : target.id,
        emails: [...new Set(all)],
        role,
        message,
      });
      setResults(res);
      setEmails([]);
      setDraft("");
      setMessage("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't send invites.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {results ? (
        <div className="flex flex-col gap-4 p-6 sm:p-7">
          <ul className="flex flex-col divide-y divide-soft rounded-2xl border border-line">
            {results.map((r) => (
              <li key={r.email} className="flex flex-wrap items-center gap-3 px-4 py-3">
                <span className={cn("flex size-7 items-center justify-center rounded-full", r.emailed ? "bg-green-100 text-teal" : "bg-amber-100 text-amber-800")}>
                  {r.emailed ? <Check className="size-4" /> : <Send className="size-3.5" />}
                </span>
                <span className="min-w-0 flex-1 text-sm">
                  <strong className="block truncate font-semibold">{r.email}</strong>
                  <span className="text-xs text-muted">
                    {r.emailed ? "Invite emailed" : !r.link ? r.error : r.error ? "Email failed — share the link instead" : "Share this link with them"}
                  </span>
                </span>
                {r.link && <CopyLink link={r.link} />}
              </li>
            ))}
          </ul>
          <div className="flex justify-end gap-2.5">
            <Button variant="secondary" onClick={() => setResults(null)}>
              Invite more
            </Button>
            <Button onClick={onClose}>Done</Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-5 p-6 sm:p-7">
          {scopes.length > 1 && (
            <fieldset className="flex flex-col gap-2">
              <legend className="mb-2 text-[13px] font-semibold">Invite to</legend>
              <div className="grid grid-cols-2 gap-2.5">
                {scopes.map((s) => {
                  const t = s === "project" ? project : workspace;
                  return (
                    <label
                      key={s}
                      className={cn("flex cursor-pointer items-start gap-2.5 rounded-[14px] border p-3.5 transition", scope === s ? "border-2 border-brand bg-[#F7F7FF]" : "border-line hover:border-line-2")}
                    >
                      <input type="radio" name="scope" checked={scope === s} onChange={() => setScope(s)} className="mt-0.5 accent-brand" />
                      <span className="min-w-0 text-sm">
                        <strong>{s === "project" ? "This project" : "Whole workspace"}</strong>
                        <span className="block truncate text-xs text-muted">{t?.name}</span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </fieldset>
          )}

          <div className="flex flex-col gap-2">
            <label htmlFor="invite-emails" className="text-[13px] font-semibold">
              Email addresses
            </label>
            <div className="flex flex-wrap gap-1.5 rounded-[14px] border border-line-2 p-2.5 transition focus-within:border-brand focus-within:shadow-[0_0_0_4px_var(--color-brand-soft)]">
              {emails.map((e) => (
                <span key={e} className="cp-pop inline-flex items-center gap-1 rounded-lg bg-brand-soft py-1 pl-2.5 pr-1 text-[13px] font-medium text-brand-600">
                  {e}
                  <button type="button" onClick={() => setEmails((prev) => prev.filter((x) => x !== e))} aria-label={`Remove ${e}`} className="flex size-6 items-center justify-center rounded-md hover:bg-white">
                    <X className="size-3.5" />
                  </button>
                </span>
              ))}
              <input
                id="invite-emails"
                type="email"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={onKeyDown}
                onPaste={onPaste}
                onBlur={() => draft.trim() && addEmails(draft)}
                placeholder={emails.length ? "Add another…" : "name@company.com, another@company.com"}
                className="min-w-[160px] flex-1 p-1 text-sm outline-none"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="invite-role" className="text-[13px] font-semibold">
              Role
            </label>
            <select
              id="invite-role"
              value={role}
              onChange={(e) => setRole(e.target.value as Invite["role"])}
              className="min-h-[46px] rounded-xl border border-line-2 bg-white px-3 text-sm font-medium outline-none focus:border-brand"
            >
              {(["member", "viewer"] as const).map((r) => (
                <option key={r} value={r}>
                  {ROLE_INFO[r].label} — {ROLE_INFO[r].description.toLowerCase()}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="invite-message" className="text-[13px] font-semibold">
              Personal message <span className="font-normal text-muted">(optional)</span>
            </label>
            <textarea
              id="invite-message"
              rows={2}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={`Join us on Coplan so we can plan ${target?.name ?? "this"} together.`}
              className="resize-y rounded-xl border border-line-2 p-3 text-sm outline-none focus:border-brand"
            />
          </div>

          {!isEmailConfigured && (
            <p className="rounded-xl bg-amber-50 px-3.5 py-2.5 text-[13px] leading-relaxed text-amber-900">
              EmailJS isn&apos;t configured yet, so invites won&apos;t be emailed — you&apos;ll get a link to share instead.
            </p>
          )}
          <FormError message={error} />
          <div className="flex justify-end gap-2.5">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={send} loading={loading}>
              {!loading && <Send className="cp-plane size-4" />}
              Send {emails.length > 1 ? `${emails.length} invites` : "invite"}
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

export function InviteModal({ open, ...props }: InviteModalProps) {
  return (
    <Modal open={open} onClose={props.onClose} title="Invite people" description="They'll get an email with a link to join. New users can sign up with Google or email.">
      <InviteForm {...props} />
    </Modal>
  );
}
