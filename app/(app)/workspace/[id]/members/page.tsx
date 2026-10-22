import type { Metadata } from "next";
import { MembersView } from "@/components/members/MembersView";

export const metadata: Metadata = { title: "Members" };

export default async function WorkspaceMembersPage({ params }: PageProps<"/workspace/[id]/members">) {
  const { id } = await params;
  return <MembersView workspaceId={id} />;
}
