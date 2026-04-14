"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import api from "@/lib/api";

export default function TaskForm({ taskId = null }) {
  const router = useRouter();
  const isEdit = !!taskId;

  const [form, setForm] = useState({
    title: "",
    description: "",
    status: "todo",
    priority: "medium",
    dueDate: "",
    assignedTo: "",
  });
  const [errors, setErrors] = useState({});
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);

  // File upload state
  const [files, setFiles] = useState([]);
  const [existingAttachments, setExistingAttachments] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await api.get("/users?limit=100");
        setUsers(data.users);
      } catch {
        try {
          const { data } = await api.get("/auth/me");
          setUsers([data]);
        } catch {
          // ignore
        }
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    const fetchTask = async () => {
      try {
        const { data } = await api.get(`/tasks/${taskId}`);
        setForm({
          title: data.title,
          description: data.description || "",
          status: data.status,
          priority: data.priority,
          dueDate: data.dueDate ? data.dueDate.split("T")[0] : "",
          assignedTo: data.assignedTo?._id || "",
        });
        setExistingAttachments(data.attachments || []);
      } catch {
        toast.error("Failed to load task");
        router.push("/tasks");
      } finally {
        setFetching(false);
      }
    };
    fetchTask();
  }, [taskId, isEdit, router]);

  const maxFiles = 3 - existingAttachments.length;

  const handleFiles = (newFiles) => {
    const incoming = Array.from(newFiles);
    const valid = [];

    for (const f of incoming) {
      if (f.type !== "application/pdf") {
        toast.error(`${f.name} is not a PDF`);
        continue;
      }
      if (f.size > 5 * 1024 * 1024) {
        toast.error(`${f.name} exceeds 5MB limit`);
        continue;
      }
      valid.push(f);
    }

    const total = files.length + valid.length;
    if (total > maxFiles) {
      toast.error(`Can only attach ${maxFiles} more file(s)`);
      return;
    }

    setFiles((prev) => [...prev, ...valid]);
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = "Title is required";
    if (!form.dueDate) errs.dueDate = "Due date is required";
    else if (isNaN(new Date(form.dueDate).getTime())) errs.dueDate = "Invalid date";
    if (!form.assignedTo) errs.assignedTo = "Please assign a user";
    if (!["todo", "in_progress", "done"].includes(form.status)) errs.status = "Invalid status";
    if (!["low", "medium", "high"].includes(form.priority)) errs.priority = "Invalid priority";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      let task;
      if (isEdit) {
        const { data } = await api.put(`/tasks/${taskId}`, form);
        task = data;
        toast.success("Task updated");
      } else {
        const { data } = await api.post("/tasks", form);
        task = data;
        toast.success("Task created");
      }

      // Upload files if any were selected
      if (files.length > 0) {
        const formData = new FormData();
        files.forEach((f) => formData.append("files", f));
        await api.post(`/tasks/${task._id}/attachments`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success(`${files.length} file(s) attached`);
      }

      router.push(`/tasks/${task._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex justify-center py-10">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 max-w-2xl mx-auto space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
        <input
          type="text"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Task title"
        />
        {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          rows={3}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Optional description"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="done">Done</option>
          </select>
          {errors.status && <p className="text-red-500 text-sm mt-1">{errors.status}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
          <select
            value={form.priority}
            onChange={(e) => setForm({ ...form, priority: e.target.value })}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          {errors.priority && <p className="text-red-500 text-sm mt-1">{errors.priority}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Due Date *</label>
          <input
            type="date"
            value={form.dueDate}
            onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.dueDate && <p className="text-red-500 text-sm mt-1">{errors.dueDate}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Assign To *</label>
          <select
            value={form.assignedTo}
            onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select user</option>
            {users.map((u) => (
              <option key={u._id} value={u._id}>
                {u.email} ({u.role})
              </option>
            ))}
          </select>
          {errors.assignedTo && <p className="text-red-500 text-sm mt-1">{errors.assignedTo}</p>}
        </div>
      </div>

      {/* File upload section */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Attachments ({existingAttachments.length + files.length}/3)
        </label>

        {/* Show existing attachments in edit mode */}
        {existingAttachments.length > 0 && (
          <div className="space-y-1 mb-2">
            {existingAttachments.map((att) => (
              <div key={att._id} className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 rounded px-3 py-1.5 border border-gray-200">
                <svg className="h-4 w-4 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <span className="truncate">{att.originalName}</span>
                <span className="text-gray-400 text-xs">({(att.size / 1024).toFixed(0)} KB)</span>
              </div>
            ))}
          </div>
        )}

        {/* Show queued new files */}
        {files.length > 0 && (
          <div className="space-y-1 mb-2">
            {files.map((f, i) => (
              <div key={i} className="flex items-center justify-between text-sm bg-blue-50 rounded px-3 py-1.5 border border-blue-200">
                <div className="flex items-center gap-2 min-w-0">
                  <svg className="h-4 w-4 text-blue-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <span className="truncate">{f.name}</span>
                  <span className="text-gray-400 text-xs">({(f.size / 1024).toFixed(0)} KB)</span>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  className="text-red-500 hover:text-red-700 text-xs ml-2 shrink-0"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Drop zone */}
        {files.length < maxFiles && (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
            className={`border-2 border-dashed rounded-lg p-3 text-center transition cursor-pointer ${
              dragOver ? "border-blue-500 bg-blue-50" : "border-gray-300"
            }`}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              multiple
              onChange={(e) => { handleFiles(e.target.files); e.target.value = ""; }}
              className="hidden"
            />
            <p className="text-sm text-gray-500">
              <span className="text-blue-600 font-medium">Click to upload</span> or drag & drop
            </p>
            <p className="text-xs text-gray-400 mt-1">
              PDF only, max 5MB per file ({maxFiles - files.length} slot{maxFiles - files.length !== 1 ? "s" : ""} remaining)
            </p>
          </div>
        )}
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 transition"
        >
          {loading ? "Saving..." : isEdit ? "Update Task" : "Create Task"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2 border border-gray-300 text-sm text-gray-600 rounded-md hover:bg-gray-50 transition"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
