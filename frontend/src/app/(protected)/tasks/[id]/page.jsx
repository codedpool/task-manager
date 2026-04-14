"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import api from "@/lib/api";
import PDFViewer from "@/components/PDFViewer";
import FileUpload from "@/components/FileUpload";

const statusColors = {
  todo: "bg-yellow-100 text-yellow-800",
  in_progress: "bg-purple-100 text-purple-800",
  done: "bg-green-100 text-green-800",
};

const priorityColors = {
  low: "bg-secondary text-foreground",
  medium: "bg-blue-100 text-blue-700",
  high: "bg-red-100 text-red-700",
};

const statusLabels = {
  todo: "To Do",
  in_progress: "In Progress",
  done: "Done",
};

export default function TaskDetailPage({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useSelector((state) => state.auth);
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [viewingPdf, setViewingPdf] = useState(null);

  const fetchTask = async () => {
    try {
      const { data } = await api.get(`/tasks/${id}`);
      setTask(data);
    } catch {
      toast.error("Failed to load task");
      router.push("/tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTask();
  }, [id]);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    setDeleting(true);
    try {
      await api.delete(`/tasks/${id}`);
      toast.success("Task deleted");
      router.push("/tasks");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete");
      setDeleting(false);
    }
  };

  const canEdit =
    user?.role === "admin" ||
    task?.createdBy?._id === user?._id ||
    task?.assignedTo?._id === user?._id;

  const canDelete =
    user?.role === "admin" || task?.createdBy?._id === user?._id;

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!task) return null;

  const apiBase = process.env.NEXT_PUBLIC_API_URL;

  return (
    <div className="max-w-3xl mx-auto">
      {viewingPdf && (
        <PDFViewer
          url={viewingPdf.url}
          filename={viewingPdf.filename}
          onClose={() => setViewingPdf(null)}
        />
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">{task.title}</h1>
        <div className="flex gap-2 mt-3 sm:mt-0">
          {canEdit && (
            <Link
              href={`/tasks/${id}/edit`}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition"
            >
              Edit
            </Link>
          )}
          {canDelete && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="px-4 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 disabled:opacity-50 transition"
            >
              {deleting ? "Deleting..." : "Delete"}
            </button>
          )}
        </div>
      </div>

      <div className="bg-background rounded-lg shadow-sm border border-border p-6 space-y-5">
        <div className="flex flex-wrap gap-2">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[task.status]}`}>
            {statusLabels[task.status]}
          </span>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${priorityColors[task.priority]}`}>
            {task.priority} priority
          </span>
        </div>

        {task.description && (
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Description</h3>
            <p className="text-foreground whitespace-pre-wrap">{task.description}</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Due Date:</span>{" "}
            <span className="font-medium text-foreground">
              {new Date(task.dueDate).toLocaleDateString()}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">Assigned To:</span>{" "}
            <span className="font-medium text-foreground">{task.assignedTo?.email}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Created By:</span>{" "}
            <span className="font-medium text-foreground">{task.createdBy?.email}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Created:</span>{" "}
            <span className="font-medium text-foreground">
              {new Date(task.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Attachments section */}
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-2">
            Attachments ({task.attachments?.length || 0}/3)
          </h3>

          {task.attachments?.length > 0 && (
            <div className="space-y-2 mb-3">
              {task.attachments.map((file) => (
                <div
                  key={file._id}
                  className="flex items-center justify-between bg-muted rounded-md px-3 py-2 border border-border"
                >
                  <div className="flex items-center gap-2 text-sm min-w-0">
                    <svg className="h-4 w-4 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <span className="truncate">{file.originalName}</span>
                    <span className="text-muted-foreground shrink-0">
                      ({(file.size / 1024).toFixed(0)} KB)
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <button
                      onClick={() =>
                        setViewingPdf({
                          url: `${apiBase}/tasks/${id}/attachments/${file._id}`,
                          filename: file.originalName,
                        })
                      }
                      className="text-blue-600 text-sm hover:underline"
                    >
                      View
                    </button>
                    <a
                      href={`${apiBase}/tasks/${id}/attachments/${file._id}`}
                      download={file.originalName}
                      className="text-muted-foreground text-sm hover:underline"
                    >
                      Download
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}

          {canEdit && (
            <FileUpload
              taskId={id}
              currentCount={task.attachments?.length || 0}
              onUploadComplete={fetchTask}
            />
          )}
        </div>
      </div>

      <div className="mt-4">
        <Link href="/tasks" className="text-sm text-muted-foreground hover:text-foreground">
          &larr; Back to tasks
        </Link>
      </div>
    </div>
  );
}
