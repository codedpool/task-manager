const path = require("path");
const fs = require("fs");
const Task = require("../models/Task");

const uploadAttachments = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Check ownership
    if (
      req.user.role !== "admin" &&
      task.createdBy.toString() !== req.user.userId &&
      task.assignedTo.toString() !== req.user.userId
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    const currentCount = task.attachments.length;
    if (currentCount + req.files.length > 3) {
      // Clean up uploaded files
      req.files.forEach((f) => fs.unlinkSync(f.path));
      return res.status(400).json({
        message: `Task already has ${currentCount} attachment(s). Max 3 allowed.`,
      });
    }

    const newAttachments = req.files.map((file) => ({
      filename: file.filename,
      originalName: file.originalname,
      path: file.path,
      mimetype: file.mimetype,
      size: file.size,
    }));

    task.attachments.push(...newAttachments);
    await task.save();

    res.status(201).json(task.attachments);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const downloadAttachment = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Check ownership
    if (
      req.user.role !== "admin" &&
      task.createdBy.toString() !== req.user.userId &&
      task.assignedTo.toString() !== req.user.userId
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    const attachment = task.attachments.id(req.params.fileId);
    if (!attachment) {
      return res.status(404).json({ message: "Attachment not found" });
    }

    const filePath = path.resolve(attachment.path);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "File not found on disk" });
    }

    res.setHeader("Content-Type", attachment.mimetype);
    res.setHeader("Content-Disposition", `inline; filename="${attachment.originalName}"`);
    fs.createReadStream(filePath).pipe(res);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { uploadAttachments, downloadAttachment };
