const express = require("express");
const {
  createReviewObjective,
  getReviewObjective,
} = require("../../controllers/reviewObjectivesController");

const requireAuth = require("../../middleware/requireAuth");
const projectViewVerification = require("../../middleware/projectViewVerification");

const router = express.Router();

// router.use(requireAuth);

// "/api/v1/reviewObjectives"

// router.get(
//   "/:objectiveId/project/:projectId",
//   requireAuth,
//   projectViewVerification,
//   getReviewObjective
// );

router.post(
  "/:reviewId/project/:projectId",
  requireAuth,
  projectViewVerification,
  createReviewObjective
);

module.exports = router;
