import Link from "next/link";

const statusColors = {
  todo: "bg-yellow-100 text-yellow-800",
  in_progress: "bg-purple-100 text-purple-800",
  done: "bg-green-100 text-green-800",
};

const priorityColors = {
  low: "bg-gray-100 text-gray-700",
  medium: "bg-blue-100 text-blue-700",
  high: "bg-red-100 text-red-700",
};

const statusLabels = {
  todo: "To Do",
  in_progress: "In Progress",
  done: "Done",
};

export default function TaskCard({ task }) {
  const dueDate = new Date(task.dueDate).toLocaleDateString();
  const isOverdue = new Date(task.dueDate) < new Date() && task.status !== "done";

  return (
    <Link href={`/tasks/${task._id}`} className="block">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-gray-900 text-sm line-clamp-1">{task.title}</h3>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ml-2 whitespace-nowrap ${priorityColors[task.priority]}`}>
            {task.priority}
          </span>
        </div>

        {task.description && (
          <p className="text-sm text-gray-500 mb-3 line-clamp-2">{task.description}</p>
        )}

        <div className="flex items-center justify-between text-xs">
          <span className={`px-2 py-0.5 rounded-full font-medium ${statusColors[task.status]}`}>
            {statusLabels[task.status]}
          </span>
          <span className={`${isOverdue ? "text-red-500 font-medium" : "text-gray-400"}`}>
            {isOverdue ? "Overdue: " : ""}{dueDate}
          </span>
        </div>

        {task.assignedTo && (
          <p className="text-xs text-gray-400 mt-2 truncate">
            Assigned to: {task.assignedTo.email}
          </p>
        )}

        {task.attachments?.length > 0 && (
          <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
            {task.attachments.length} file{task.attachments.length !== 1 ? "s" : ""}
          </div>
        )}
      </div>
    </Link>
  );
}
