const Task = require("../models/Task");
const { getIO } = require("../socket");

const getTasks = async (req, res) => {
  try {
    const {
      status,
      priority,
      dueDate,
      sortBy = "createdAt",
      order = "desc",
      page = 1,
      limit = 10,
    } = req.query;

    const filter = {};

    // Non-admin users only see tasks assigned to them or created by them
    if (req.user.role !== "admin") {
      filter.$or = [
        { assignedTo: req.user.userId },
        { createdBy: req.user.userId },
      ];
    }

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (dueDate) {
      const date = new Date(dueDate);
      filter.dueDate = {
        $gte: new Date(date.setHours(0, 0, 0, 0)),
        $lte: new Date(date.setHours(23, 59, 59, 999)),
      };
    }

    const sortOrder = order === "asc" ? 1 : -1;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [tasks, total] = await Promise.all([
      Task.find(filter)
        .populate("assignedTo", "email role")
        .populate("createdBy", "email role")
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(parseInt(limit)),
      Task.countDocuments(filter),
    ]);

    res.json({
      tasks,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      totalTasks: total,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate("assignedTo", "email role")
      .populate("createdBy", "email role");

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Non-admin can only view their own tasks
    if (
      req.user.role !== "admin" &&
      task.assignedTo._id.toString() !== req.user.userId &&
      task.createdBy._id.toString() !== req.user.userId
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const createTask = async (req, res) => {
  try {
    const { title, description, status, priority, dueDate, assignedTo } = req.body;

    const task = await Task.create({
      title,
      description,
      status,
      priority,
      dueDate,
      assignedTo,
      createdBy: req.user.userId,
    });

    const populated = await task.populate([
      { path: "assignedTo", select: "email role" },
      { path: "createdBy", select: "email role" },
    ]);

    getIO().emit("task:created", populated);
    res.status(201).json(populated);
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(", ") });
    }
    res.status(500).json({ message: "Server error" });
  }
};

const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Only admin or task owner can update
    if (
      req.user.role !== "admin" &&
      task.createdBy.toString() !== req.user.userId &&
      task.assignedTo.toString() !== req.user.userId
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    const allowedFields = ["title", "description", "status", "priority", "dueDate", "assignedTo"];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        task[field] = req.body[field];
      }
    });

    await task.save();

    const populated = await task.populate([
      { path: "assignedTo", select: "email role" },
      { path: "createdBy", select: "email role" },
    ]);

    getIO().emit("task:updated", populated);
    res.json(populated);
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(", ") });
    }
    res.status(500).json({ message: "Server error" });
  }
};

const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Only admin or task creator can delete
    if (
      req.user.role !== "admin" &&
      task.createdBy.toString() !== req.user.userId
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    await task.deleteOne();
    getIO().emit("task:deleted", { _id: req.params.id });
    res.json({ message: "Task deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getTasks, getTaskById, createTask, updateTask, deleteTask };
