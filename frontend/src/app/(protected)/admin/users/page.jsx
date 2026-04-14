"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import api from "@/lib/api";
import { setUsers, setLoading } from "@/store/usersSlice";
import AuthGuard from "@/components/AuthGuard";

export default function AdminUsersPage() {
  const dispatch = useDispatch();
  const { items, loading, totalPages, currentPage } = useSelector((state) => state.users);
  const [filters, setFilters] = useState({
    search: "",
    role: "",
    sortBy: "createdAt",
    order: "desc",
    page: 1,
    limit: 10,
  });

  // Create user form state
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState({ email: "", password: "", role: "user" });
  const [createErrors, setCreateErrors] = useState({});
  const [creating, setCreating] = useState(false);

  const fetchUsers = async () => {
    dispatch(setLoading(true));
    try {
      const params = {};
      Object.entries(filters).forEach(([key, val]) => {
        if (val !== "") params[key] = val;
      });
      const { data } = await api.get("/users", { params });
      dispatch(setUsers({
        users: data.users,
        totalPages: data.totalPages,
        currentPage: data.currentPage,
      }));
    } catch {
      toast.error("Failed to load users");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [filters]);

  const handleDelete = async (userId) => {
    if (!confirm("Delete this user?")) return;
    try {
      await api.delete(`/users/${userId}`);
      toast.success("User deleted");
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete user");
    }
  };

  const handleRoleToggle = async (userId, currentRole) => {
    const newRole = currentRole === "admin" ? "user" : "admin";
    try {
      await api.put(`/users/${userId}`, { role: newRole });
      toast.success(`Role updated to ${newRole}`);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update role");
    }
  };

  const validateCreateForm = () => {
    const errs = {};
    if (!createForm.email.trim()) errs.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(createForm.email)) errs.email = "Invalid email format";
    if (!createForm.password) errs.password = "Password is required";
    else if (createForm.password.length < 6) errs.password = "Password must be at least 6 characters";
    setCreateErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!validateCreateForm()) return;

    setCreating(true);
    try {
      await api.post("/users", createForm);
      toast.success("User created");
      setCreateForm({ email: "", password: "", role: "user" });
      setCreateErrors({});
      setShowCreateForm(false);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create user");
    } finally {
      setCreating(false);
    }
  };

  return (
    <AuthGuard adminOnly>
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <h1 className="text-2xl font-bold text-foreground">User Management</h1>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="mt-3 sm:mt-0 inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition"
          >
            {showCreateForm ? "Cancel" : "+ New User"}
          </button>
        </div>

        {/* Create user form */}
        {showCreateForm && (
          <form onSubmit={handleCreateUser} className="bg-background rounded-lg shadow-sm border border-border p-4 mb-6">
            <h3 className="font-semibold text-sm text-foreground mb-3">Create New User</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <input
                  type="email"
                  placeholder="Email"
                  value={createForm.email}
                  onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                  className="w-full border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {createErrors.email && <p className="text-red-500 text-xs mt-1">{createErrors.email}</p>}
              </div>
              <div>
                <input
                  type="password"
                  placeholder="Password (min 6 chars)"
                  value={createForm.password}
                  onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                  className="w-full border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {createErrors.password && <p className="text-red-500 text-xs mt-1">{createErrors.password}</p>}
              </div>
              <div className="flex gap-2">
                <select
                  value={createForm.role}
                  onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}
                  className="flex-1 border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 disabled:opacity-50 transition"
                >
                  {creating ? "..." : "Create"}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            type="text"
            placeholder="Search by email..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
            className="flex-1 border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={filters.role}
            onChange={(e) => setFilters({ ...filters, role: e.target.value, page: 1 })}
            className="border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Roles</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
          <select
            value={filters.sortBy}
            onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
            className="border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="createdAt">Sort: Created</option>
            <option value="email">Sort: Email</option>
          </select>
          <select
            value={filters.order}
            onChange={(e) => setFilters({ ...filters, order: e.target.value })}
            className="border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="desc">Newest</option>
            <option value="asc">Oldest</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-background rounded-lg shadow-sm border border-border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Email</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Role</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Created</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-muted-foreground">Loading...</td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-muted-foreground">No users found</td>
                </tr>
              ) : (
                items.map((u) => (
                  <tr key={u._id} className="border-b border-border hover:bg-muted">
                    <td className="px-4 py-3 text-foreground">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        u.role === "admin" ? "bg-purple-100 text-purple-700" : "bg-secondary text-muted-foreground"
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <button
                        onClick={() => handleRoleToggle(u._id, u.role)}
                        className="text-blue-600 hover:underline text-xs"
                      >
                        Make {u.role === "admin" ? "User" : "Admin"}
                      </button>
                      <button
                        onClick={() => handleDelete(u._id)}
                        className="text-red-600 hover:underline text-xs"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-4">
            <button
              onClick={() => setFilters({ ...filters, page: currentPage - 1 })}
              disabled={currentPage <= 1}
              className="px-3 py-1 border border-border rounded-md text-sm disabled:opacity-50 hover:bg-muted"
            >
              Prev
            </button>
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setFilters({ ...filters, page: currentPage + 1 })}
              disabled={currentPage >= totalPages}
              className="px-3 py-1 border border-border rounded-md text-sm disabled:opacity-50 hover:bg-muted"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
