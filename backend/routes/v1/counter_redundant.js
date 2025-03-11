const express = require("express");

const { updateCounter } = require("../../controllers/commentController");
const requireAuth = require("../../middleware/requireAuth");
const router = express.Router();

// router.post("/", requireAuth, updateCounter);

module.exports = router;
