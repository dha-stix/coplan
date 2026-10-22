import type { Metadata } from "next";
import { Suspense } from "react";
import { BoardView } from "@/components/board/BoardView";
import { PageLoader } from "@/components/ui/Spinner";

export const metadata: Metadata = { title: "Board" };

export default async function ProjectPage({ params }: PageProps<"/project/[id]">) {
  const { id } = await params;
  return (
    <Suspense fallback={<PageLoader label="Loading board" />}>
      <BoardView projectId={id} />
    </Suspense>
  );
}
