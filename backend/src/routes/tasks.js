const express = require("express");
const router = express.Router();
const {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
} = require("../controllers/taskController");
const {
  uploadAttachments,
  downloadAttachment,
} = require("../controllers/attachmentController");
const { verifyToken } = require("../middleware/auth");
const upload = require("../middleware/upload");

router.use(verifyToken);

router.get("/", getTasks);
router.post("/", createTask);
router.get("/:id", getTaskById);
router.put("/:id", updateTask);
router.delete("/:id", deleteTask);

// Attachments
router.post("/:id/attachments", upload.array("files", 3), uploadAttachments);
router.get("/:id/attachments/:fileId", downloadAttachment);

module.exports = router;
