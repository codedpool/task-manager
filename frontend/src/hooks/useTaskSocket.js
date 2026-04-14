"use client";

import { useEffect } from "react";
import { connectSocket, disconnectSocket } from "@/lib/socket";

export default function useTaskSocket(onTaskEvent) {
  useEffect(() => {
    const socket = connectSocket();

    const handleCreated = (task) => {
      if (onTaskEvent) onTaskEvent("created", task);
    };
    const handleUpdated = (task) => {
      if (onTaskEvent) onTaskEvent("updated", task);
    };
    const handleDeleted = (data) => {
      if (onTaskEvent) onTaskEvent("deleted", data);
    };

    socket.on("task:created", handleCreated);
    socket.on("task:updated", handleUpdated);
    socket.on("task:deleted", handleDeleted);

    return () => {
      socket.off("task:created", handleCreated);
      socket.off("task:updated", handleUpdated);
      socket.off("task:deleted", handleDeleted);
      disconnectSocket();
    };
  }, [onTaskEvent]);
}
