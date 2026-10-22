import type { Metadata } from "next";
import { MyTasksView } from "@/components/dashboard/MyTasksView";

export const metadata: Metadata = { title: "My tasks" };

export default function MyTasksPage() {
  return <MyTasksView />;
}
