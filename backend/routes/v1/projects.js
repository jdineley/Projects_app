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

router.use(requireAuth);

router.get("/", getAllProjects);

router.get("/:projectId", getProject);

router.post("/", upload.single("file"), createProject);

router.patch("/:projectId", upload.single("file"), updateProject);

router.delete("/:projectId", deleteProject);

module.exports = router;
