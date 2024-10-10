const express = require("express");
const multer = require("multer");
const upload = multer({ dest: "../../public/data/uploads/" });
const {
  getAllProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
} = require("../../controllers/projectController");

const requireAuth = require("../../middleware/requireAuth");

const router = express.Router();

// router.use(requireAuth);

router.get("/", requireAuth, getAllProjects);

router.get("/:projectId", requireAuth, getProject);

router.post("/", requireAuth, upload.single("file"), createProject);

router.patch("/:projectId", requireAuth, upload.single("file"), updateProject);

router.delete("/:projectId", requireAuth, deleteProject);

router.get("/getLearnerProject/:projectId", getProject);

module.exports = router;
