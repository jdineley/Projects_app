const express = require("express");
const {
  createReviewAction,
} = require("../../controllers/reviewActionController");

const requireAuth = require("../../middleware/requireAuth");
const projectViewVerification = require("../../middleware/projectViewVerification");

const router = express.Router();

// router.use(requireAuth);

// "/api/v1/reviewActions"

router.post(
  "/objective/:objectiveId/project/:projectId",
  requireAuth,
  projectViewVerification,
  createReviewAction
);

module.exports = router;
