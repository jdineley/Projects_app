const express = require("express");
const requireAuth = require("../../middleware/requireAuth");

const {
  getReplies,
  getReply,
  createReply,
  updateReply,
  deleteReply,
} = require("../../controllers/replyController");

const router = express.Router();

router.use(requireAuth);

router.get("/", getReplies);

router.get("/:replyId", getReply);

router.post("/", createReply);

router.patch("/replyId", updateReply);

router.delete("/:replyId", deleteReply);

module.exports = router;
