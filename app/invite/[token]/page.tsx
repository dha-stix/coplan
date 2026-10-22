import type { Metadata } from "next";
import { shareMetadata } from "@/lib/site";
import { AcceptInvite } from "@/components/invite/AcceptInvite";

export const metadata: Metadata = shareMetadata("You’re invited", "You have been invited to join a team on Coplan. Accept the invite to see the board.");

export default async function InvitePage({ params }: PageProps<"/invite/[token]">) {
  const { token } = await params;
  return <AcceptInvite token={token} />;
}
