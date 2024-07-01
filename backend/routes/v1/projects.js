const express = require("express");
const {
  getAllProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
} = require("../../controllers/projectController");

const requireAuth = require("../../middleware/requireAuth");

const router = express.Router();

router.use(requireAuth);

router.get("/", getAllProjects);

router.get("/:projectId", getProject);

router.post("/", createProject);

router.patch("/:projectId", updateProject);

router.delete("/:projectId", deleteProject);

module.exports = router;
