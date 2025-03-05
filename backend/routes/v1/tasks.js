const express = require("express");
const {
  // getAllTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  getTasks,
} = require("../../controllers/taskController");

const requireAuth = require("../../middleware/requireAuth");

const router = express.Router();

// router.use(requireAuth);

// router.get("/", requireAuth, getAllTasks);

router.get("/getTasks", requireAuth, getTasks);

router.get("/:taskId", requireAuth, getTask);

router.post("/project/:projectId", requireAuth, createTask);

router.patch("/:taskId", requireAuth, updateTask);

router.delete("/:taskId", requireAuth, deleteTask);

router.get("/getLearnerTask/:taskId", getTask);

module.exports = router;
