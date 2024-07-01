const express = require("express");
const {
  createReviewObjective,
  getReviewObjective,
} = require("../../controllers/reviewObjectivesController");

const requireAuth = require("../../middleware/requireAuth");

const router = express.Router();

router.use(requireAuth);

// "/api/v1/reviewObjectives"

router.get("/:objectiveId", getReviewObjective);

router.post("/:reviewId", createReviewObjective);

module.exports = router;
