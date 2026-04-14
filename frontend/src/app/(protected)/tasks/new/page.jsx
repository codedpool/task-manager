"use client";

import TaskForm from "@/components/TaskForm";

export default function NewTaskPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">Create Task</h1>
      <TaskForm />
    </div>
  );
}
