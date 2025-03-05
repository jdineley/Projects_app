const express = require("express");
const {
  getReview,
  updateReview,
} = require("../../controllers/reviewController");

const requireAuth = require("../../middleware/requireAuth");
const projectViewVerification = require("../../middleware/projectViewVerification");

const router = express.Router();

// router.use(requireAuth);

// router.get("/", getAllProjects);

// router.get("/:projectId", getProject);

// router.post("/", createProject);

router.get(
  "/:reviewId/project/:projectId",
  requireAuth,
  projectViewVerification,
  getReview
);

router.patch(
  "/:reviewId/projects/:projectId",
  requireAuth,
  projectViewVerification,
  updateReview
);

router.get("/getLearnerReview/:reviewId", getReview);

// router.delete("/:projectId", deleteProject);

module.exports = router;
