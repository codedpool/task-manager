import Link from "next/link";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";

const statusVariants = {
  todo: "secondary",
  in_progress: "default",
  done: "outline",
};

const priorityVariants = {
  low: "secondary",
  medium: "default",
  high: "destructive",
};

const statusLabels = {
  todo: "To Do",
  in_progress: "In Progress",
  done: "Done",
};

export default function TaskCard({ task }) {
  const dueDate = new Date(task.dueDate).toLocaleDateString();
  const isOverdue =
    new Date(task.dueDate) < new Date() && task.status !== "done";

  return (
    <Link href={`/tasks/${task._id}`} className="block">
      <Card className="hover:shadow-md transition">
        <CardContent className="p-4 flex flex-col gap-0">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-sm line-clamp-1">{task.title}</h3>
            <Badge variant={priorityVariants[task.priority]} className="ml-2">
              {task.priority}
            </Badge>
          </div>

          {task.description && (
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
              {task.description}
            </p>
          )}

          <div className="flex items-center justify-between text-xs">
            <Badge variant={statusVariants[task.status]}>
              {statusLabels[task.status]}
            </Badge>
            <span
              className={`${isOverdue ? "text-destructive font-medium" : "text-muted-foreground"}`}
            >
              {isOverdue ? "Overdue: " : ""}
              {dueDate}
            </span>
          </div>

          {task.assignedTo && (
            <p className="text-xs text-muted-foreground mt-3 truncate">
              Assigned to: {task.assignedTo.email}
            </p>
          )}

          {task.attachments?.length > 0 && (
            <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
              <svg
                className="h-3.5 w-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                />
              </svg>
              {task.attachments.length} file
              {task.attachments.length !== 1 ? "s" : ""}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
