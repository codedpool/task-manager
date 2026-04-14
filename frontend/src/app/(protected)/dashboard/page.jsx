"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import SkeletonLoader from "@/components/SkeletonLoader";
import useTaskSocket from "@/hooks/useTaskSocket";

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    try {
      const [todoRes, inProgressRes, doneRes, allRes] = await Promise.all([
        api.get("/tasks?status=todo&limit=1"),
        api.get("/tasks?status=in_progress&limit=1"),
        api.get("/tasks?status=done&limit=1"),
        api.get("/tasks?limit=1"),
      ]);
      setStats({
        total: allRes.data.totalTasks,
        todo: todoRes.data.totalTasks,
        inProgress: inProgressRes.data.totalTasks,
        done: doneRes.data.totalTasks,
      });
    } catch {
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useTaskSocket(() => {
    fetchStats();
  });

  if (loading) return <SkeletonLoader count={4} />;
  if (error) return <p className="text-red-500 text-center py-10">{error}</p>;

  const cards = [
    { label: "Total Tasks", value: stats.total, color: "bg-blue-500" },
    { label: "To Do", value: stats.todo, color: "bg-yellow-500" },
    { label: "In Progress", value: stats.inProgress, color: "bg-purple-500" },
    { label: "Done", value: stats.done, color: "bg-green-500" },
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <Link
          href="/tasks/new"
          className="mt-3 sm:mt-0 inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition"
        >
          + New Task
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="bg-background rounded-lg shadow-sm border border-border p-5"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{card.label}</p>
                <p className="text-3xl font-bold text-foreground mt-1">
                  {card.value}
                </p>
              </div>
              <div
                className={`${card.color} h-10 w-10 rounded-full opacity-20`}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
