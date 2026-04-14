"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function TaskFilters({ filters, setFilters }) {
  const handleChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      status: "",
      priority: "",
      sortBy: "createdAt",
      order: "desc",
      page: 1,
      limit: 9,
    });
  };

  return (
    <div className="bg-card rounded-lg border border-border p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm text-foreground">Filters</h3>
        <Button
          variant="link"
          onClick={clearFilters}
          className="text-xs p-0 h-auto text-primary"
        >
          Clear all
        </Button>
      </div>

      <div>
        <Label className="block text-xs font-medium text-muted-foreground mb-1">Status</Label>
        <select
          value={filters.status}
          onChange={(e) => handleChange("status", e.target.value)}
          className="w-full border border-input bg-background text-foreground rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="">All</option>
          <option value="todo">To Do</option>
          <option value="in_progress">In Progress</option>
          <option value="done">Done</option>
        </select>
      </div>

      <div>
        <Label className="block text-xs font-medium text-muted-foreground mb-1">Priority</Label>
        <select
          value={filters.priority}
          onChange={(e) => handleChange("priority", e.target.value)}
          className="w-full border border-input bg-background text-foreground rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="">All</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      <div>
        <Label className="block text-xs font-medium text-muted-foreground mb-1">Sort By</Label>
        <select
          value={filters.sortBy}
          onChange={(e) => handleChange("sortBy", e.target.value)}
          className="w-full border border-input bg-background text-foreground rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="createdAt">Created Date</option>
          <option value="dueDate">Due Date</option>
          <option value="priority">Priority</option>
          <option value="status">Status</option>
        </select>
      </div>

      <div>
        <Label className="block text-xs font-medium text-muted-foreground mb-1">Order</Label>
        <select
          value={filters.order}
          onChange={(e) => handleChange("order", e.target.value)}
          className="w-full border border-input bg-background text-foreground rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="desc">Newest First</option>
          <option value="asc">Oldest First</option>
        </select>
      </div>
    </div>
  );
}
