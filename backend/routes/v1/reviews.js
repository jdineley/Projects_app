const express = require("express");
const {
  getReview,
  updateReview,
} = require("../../controllers/reviewController");

const requireAuth = require("../../middleware/requireAuth");

const router = express.Router();

router.use(requireAuth);

// router.get("/", getAllProjects);

// router.get("/:projectId", getProject);

// router.post("/", createProject);

router.get("/:reviewId", getReview);

router.patch("/:reviewId/projects/:projectId", updateReview);

// router.delete("/:projectId", deleteProject);

module.exports = router;
