const express = require("express");
// const multer = require("multer");
// const upload = multer({ dest: "../../public/data/uploads/" });
const {
  deleteAllE2ETestArtifacts,
} = require("../../controllers/testController");

// const requireAuth = require("../../middleware/requireAuth");

const router = express.Router();

// router.use(requireAuth);

// router.get("/", requireAuth, getAllProjects);

// router.get("/:projectId", requireAuth, getProject);

// router.post("/", requireAuth, upload.single("file"), createProject);

// router.patch("/test", requireAuth, upload.single("file"), updateProject);

router.delete("/", deleteAllE2ETestArtifacts);

// router.get("/getLearnerProject/:projectId", getProject);

module.exports = router;
