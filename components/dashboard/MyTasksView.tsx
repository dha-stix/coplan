"use client";

import { useApp } from "@/components/app/AppProvider";
import { PageBody, PageHeader } from "@/components/app/PageHeader";
import { subscribeToAssignedTasks } from "@/lib/firebase-actions";
import { useSubscription } from "@/lib/hooks";
import type { Task } from "@/lib/types";
import { AssignedTasks } from "./AssignedTasks";

export function MyTasksView() {
  const { user } = useApp();
  const { data, loading } = useSubscription<Task[]>((onData, onError) => subscribeToAssignedTasks(user.uid, onData, onError), [], [user.uid]);
  return (
    <PageBody>
      <PageHeader eyebrow="Across all your projects" title="My tasks" />
      <section className="card rounded-[20px] p-3 sm:p-5">
        <AssignedTasks tasks={data} loading={loading} />
      </section>
    </PageBody>
  );
}
