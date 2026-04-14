"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { connectSocket, disconnectSocket } from "@/lib/socket";

export default function useTaskSocket(onTaskEvent) {
  const dispatch = useDispatch();

  useEffect(() => {
    const socket = connectSocket();

    socket.on("task:created", (task) => {
      if (onTaskEvent) onTaskEvent("created", task);
    });

    socket.on("task:updated", (task) => {
      if (onTaskEvent) onTaskEvent("updated", task);
    });

    socket.on("task:deleted", (data) => {
      if (onTaskEvent) onTaskEvent("deleted", data);
    });

    return () => {
      socket.off("task:created");
      socket.off("task:updated");
      socket.off("task:deleted");
      disconnectSocket();
    };
  }, [onTaskEvent]);
}
