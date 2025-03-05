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
const projectViewVerification = require("../../middleware/projectViewVerification");

const router = express.Router();

// router.use(requireAuth);

// router.get("/", requireAuth, getAllTasks);

router.get("/getTasks", requireAuth, getTasks);

router.get(
  "/:taskId/project/:projectId",
  requireAuth,
  projectViewVerification,
  getTask
);

router.post(
  "/project/:projectId",
  requireAuth,
  projectViewVerification,
  createTask
);

router.patch(
  "/:taskId/project/:projectId",
  requireAuth,
  // projectViewVerification,
  updateTask
);

router.delete(
  "/:taskId/project/:projectId",
  requireAuth,
  // projectViewVerification,
  deleteTask
);

router.get("/getLearnerTask/:taskId", getTask);

module.exports = router;
