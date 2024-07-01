const express = require("express");
const {
  getAllTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  getTasks,
} = require("../../controllers/taskController");

const requireAuth = require("../../middleware/requireAuth");

const router = express.Router();

router.use(requireAuth);

router.get("/", getAllTasks);

router.get("/getTasks", getTasks);

router.get("/:taskId", getTask);

router.post("/project/:projectId", createTask);

router.patch("/:taskId", updateTask);

router.delete("/:taskId", deleteTask);

module.exports = router;
