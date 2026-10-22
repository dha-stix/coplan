"use client";

import { Mail } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { ROLE_INFO } from "@/lib/constants";
import { resendInvite, revokeInvite, subscribeToPendingInvites } from "@/lib/firebase-actions";
import { useSubscription } from "@/lib/hooks";
import type { Invite, InviteScope } from "@/lib/types";
import { timeAgo } from "@/lib/utils";

export function PendingInvites({ scope, targetId }: { scope: InviteScope; targetId: string }) {
  const { data: invites } = useSubscription<Invite[]>((onData, onError) => subscribeToPendingInvites(scope, targetId, onData, onError), [], [scope, targetId]);
  const [status, setStatus] = useState<Record<string, string>>({});

  if (!invites.length) return null;

  async function resend(invite: Invite) {
    setStatus((s) => ({ ...s, [invite.id]: "Sending…" }));
    try {
      const sent = await resendInvite(invite);
      setStatus((s) => ({ ...s, [invite.id]: sent ? "Sent again" : "EmailJS not configured" }));
    } catch {
      setStatus((s) => ({ ...s, [invite.id]: "Couldn't send" }));
    }
  }

  return (
    <section className="card flex flex-col rounded-[20px] px-5 py-4">
      <h2 className="pb-2 text-[17px] font-semibold">Pending invites · {invites.length}</h2>
      {invites.map((inv) => (
        <div key={inv.id} className="flex flex-wrap items-center gap-3 border-t border-soft py-3">
          <span className="flex size-9 items-center justify-center rounded-full border-2 border-dashed border-line-2 text-muted">
            <Mail className="size-4" />
          </span>
          <span className="min-w-[180px] flex-1 text-sm">
            <strong className="font-semibold">{inv.email}</strong>
            <span className="block text-[13px] text-muted">
              {ROLE_INFO[inv.role].label} · invited by {inv.invitedByName} · {timeAgo(inv.createdAt)}
              {status[inv.id] && <span className="font-semibold text-brand"> · {status[inv.id]}</span>}
            </span>
          </span>
          <Button size="sm" variant="secondary" onClick={() => resend(inv)}>
            Resend
          </Button>
          <Button size="sm" variant="danger" onClick={() => revokeInvite(inv.id)}>
            Revoke
          </Button>
        </div>
      ))}
    </section>
  );
}
