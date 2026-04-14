"use client";

import { useState, useRef } from "react";
import toast from "react-hot-toast";
import api from "@/lib/api";

export default function FileUpload({ taskId, currentCount, onUploadComplete }) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);

  const remaining = 3 - currentCount;

  const handleFiles = async (files) => {
    if (remaining <= 0) {
      toast.error("Maximum 3 attachments reached");
      return;
    }

    const validFiles = Array.from(files).filter((f) => {
      if (f.type !== "application/pdf") {
        toast.error(`${f.name} is not a PDF`);
        return false;
      }
      if (f.size > 5 * 1024 * 1024) {
        toast.error(`${f.name} exceeds 5MB limit`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;
    if (validFiles.length > remaining) {
      toast.error(`Can only upload ${remaining} more file(s)`);
      return;
    }

    const formData = new FormData();
    validFiles.forEach((f) => formData.append("files", f));

    setUploading(true);
    try {
      await api.post(`/tasks/${taskId}/attachments`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Files uploaded");
      onUploadComplete();
    } catch (err) {
      toast.error(err.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  if (remaining <= 0) return null;

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        handleFiles(e.dataTransfer.files);
      }}
      className={`border-2 border-dashed rounded-lg p-4 text-center transition ${
        dragOver ? "border-blue-500 bg-blue-50" : "border-gray-300"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf"
        multiple
        onChange={(e) => handleFiles(e.target.files)}
        className="hidden"
        id="file-upload"
      />
      <label
        htmlFor="file-upload"
        className="cursor-pointer text-sm text-gray-500"
      >
        {uploading ? (
          <span className="flex items-center justify-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
            Uploading...
          </span>
        ) : (
          <>
            <span className="text-blue-600 font-medium">Click to upload</span> or drag & drop
            <br />
            <span className="text-xs text-gray-400">
              PDF only, max 5MB per file ({remaining} slot{remaining !== 1 ? "s" : ""} remaining)
            </span>
          </>
        )}
      </label>
    </div>
  );
}
