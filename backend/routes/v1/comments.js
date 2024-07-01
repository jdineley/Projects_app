const express = require("express");
const {
  getAllComments,
  createComment,
  getTaskComments,
} = require("../../controllers/commentController");

const requireAuth = require("../../middleware/requireAuth");

const router = express.Router();

router.use(requireAuth);

// /api/v1/comments
router.get("/", getAllComments);

//  /api/v1/comments
router.post("/", createComment);

//  /api/v1/comments
router.get("/:taskId", getTaskComments);

module.exports = router;
