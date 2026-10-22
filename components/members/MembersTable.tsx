"use client";

import { Search, UserMinus } from "lucide-react";
import { useState } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { ROLE_INFO } from "@/lib/constants";
import { removeMember, updateMemberRole } from "@/lib/firebase-actions";
import type { Person } from "@/lib/people";
import type { Role } from "@/lib/types";

interface MembersTableProps {
  kind: "workspaces" | "projects";
  entityId: string;
  ownerId: string;
  people: Person[];
  currentUid: string;
  canManage: boolean;
  /** Short note per member, e.g. their access scope. */
  accessLabel?: string;
}

export function MembersTable({ kind, entityId, ownerId, people, currentUid, canManage, accessLabel }: MembersTableProps) {
  const [term, setTerm] = useState("");
  const shown = people.filter((p) => `${p.name} ${p.email}`.toLowerCase().includes(term.toLowerCase()));

  async function remove(person: Person) {
    if (!window.confirm(`Remove ${person.name}? They'll lose access immediately.`)) return;
    await removeMember(kind, entityId, person.id);
  }

  return (
    <section className="card overflow-hidden rounded-[20px]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-soft px-5 py-4">
        <h2 className="text-[17px] font-semibold">Members · {people.length}</h2>
        <label className="flex h-[38px] items-center gap-2 rounded-[10px] border border-line bg-canvas px-3 text-sm text-muted focus-within:border-brand">
          <Search className="size-3.5" />
          <span className="sr-only">Search members</span>
          <input type="search" value={term} onChange={(e) => setTerm(e.target.value)} placeholder="Search members" className="w-40 bg-transparent text-ink outline-none" />
        </label>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px] border-collapse text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-[0.06em] text-muted">
              <th className="px-5 py-3 font-semibold">Name</th>
              <th className="px-3 py-3 font-semibold">Access</th>
              <th className="px-3 py-3 font-semibold">Role</th>
              <th className="px-5 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {shown.map((p) => {
              const locked = !canManage || p.id === ownerId;
              return (
                <tr key={p.id} className="border-t border-soft">
                  <td className="px-5 py-3.5">
                    <span className="flex items-center gap-3">
                      <Avatar id={p.id} name={p.name} photoURL={p.photoURL} size={36} />
                      <span className="min-w-0">
                        <strong className="block truncate font-semibold">
                          {p.name}
                          {p.id === currentUid && <span className="font-normal text-muted"> (you)</span>}
                        </strong>
                        <span className="block truncate text-[13px] text-muted">{p.email}</span>
                      </span>
                    </span>
                  </td>
                  <td className="px-3 py-3.5 text-ink-2">{accessLabel}</td>
                  <td className="px-3 py-3.5">
                    {locked ? (
                      <span className={p.role === "owner" ? "rounded-lg bg-ink px-2.5 py-1.5 text-[13px] font-semibold text-white" : "rounded-lg bg-soft px-2.5 py-1.5 text-[13px] font-semibold"}>
                        {ROLE_INFO[p.role].label}
                      </span>
                    ) : (
                      <select
                        value={p.role}
                        onChange={(e) => updateMemberRole(kind, entityId, p.id, e.target.value as Role)}
                        aria-label={`Role for ${p.name}`}
                        className="min-h-9 rounded-[9px] border border-line bg-white px-2.5 text-[13px] font-semibold outline-none focus:border-brand"
                      >
                        {(Object.keys(ROLE_INFO) as Role[]).map((r) => (
                          <option key={r} value={r}>
                            {ROLE_INFO[r].label}
                          </option>
                        ))}
                      </select>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    {!locked && (
                      <button type="button" onClick={() => remove(p)} aria-label={`Remove ${p.name}`} className="inline-flex size-9 items-center justify-center rounded-lg text-muted hover:bg-red-50 hover:text-danger">
                        <UserMinus className="size-4" />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
