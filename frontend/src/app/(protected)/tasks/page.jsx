"use client";

import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import api from "@/lib/api";
import { setTasks, setLoading, setError } from "@/store/tasksSlice";
import TaskCard from "@/components/TaskCard";
import TaskFilters from "@/components/TaskFilters";
import SkeletonLoader from "@/components/SkeletonLoader";

export default function TaskListPage() {
  const dispatch = useDispatch();
  const { items, loading, totalPages, currentPage } = useSelector((state) => state.tasks);
  const [filters, setFilters] = useState({
    status: "",
    priority: "",
    sortBy: "createdAt",
    order: "desc",
    page: 1,
    limit: 9,
  });
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [error, setLocalError] = useState(null);

  const fetchTasks = async () => {
    dispatch(setLoading(true));
    setLocalError(null);
    try {
      const params = {};
      Object.entries(filters).forEach(([key, val]) => {
        if (val !== "") params[key] = val;
      });
      const { data } = await api.get("/tasks", { params });
      dispatch(setTasks({
        tasks: data.tasks,
        totalPages: data.totalPages,
        currentPage: data.currentPage,
      }));
    } catch {
      dispatch(setError("Failed to load tasks"));
      setLocalError("Failed to load tasks");
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [filters]);

  const handlePageChange = (page) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
        <button
          onClick={() => setFiltersOpen(!filtersOpen)}
          className="mt-3 sm:mt-0 inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm rounded-md text-gray-600 hover:bg-gray-50 md:hidden"
        >
          Filters {filtersOpen ? "▲" : "▼"}
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Filter sidebar — always visible on desktop, toggleable on mobile */}
        <div className={`${filtersOpen ? "block" : "hidden"} md:block md:w-56 shrink-0`}>
          <TaskFilters filters={filters} setFilters={setFilters} />
        </div>

        <div className="flex-1">
          {loading ? (
            <SkeletonLoader count={6} />
          ) : error ? (
            <p className="text-red-500 text-center py-10">{error}</p>
          ) : items.length === 0 ? (
            <p className="text-gray-500 text-center py-10">No tasks found</p>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((task) => (
                  <TaskCard key={task._id} task={task} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-6">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage <= 1}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 hover:bg-gray-50"
                  >
                    Prev
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => handlePageChange(p)}
                      className={`px-3 py-1 border rounded-md text-sm ${
                        p === currentPage
                          ? "bg-blue-600 text-white border-blue-600"
                          : "border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
