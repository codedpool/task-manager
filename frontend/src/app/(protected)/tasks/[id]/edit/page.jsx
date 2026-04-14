"use client";

import { use } from "react";
import TaskForm from "@/components/TaskForm";

export default function EditTaskPage({ params }) {
  const { id } = use(params);

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">Edit Task</h1>
      <TaskForm taskId={id} />
    </div>
  );
}
