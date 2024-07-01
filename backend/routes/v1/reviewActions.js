const express = require("express");
const {
  createReviewAction,
} = require("../../controllers/reviewActionController");

const requireAuth = require("../../middleware/requireAuth");

const router = express.Router();

router.use(requireAuth);

// "/api/v1/reviewActions"

router.post("/objective/:objectiveId", createReviewAction);

module.exports = router;
