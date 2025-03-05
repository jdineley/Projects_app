const express = require("express");
const requireAuth = require("../../middleware/requireAuth");
const multer = require("multer");
const upload = multer({ dest: "./public/temp/" });

const {
  // getReplies,
  // getReply,
  createReply,
  updateReply,
  deleteReply,
} = require("../../controllers/replyController");

const router = express.Router();

router.use(requireAuth);

// router.get("/", getReplies);

// router.get("/:replyId", getReply);

router.post(
  "/",
  upload.fields([{ name: "uploaded_images" }, { name: "uploaded_videos" }]),
  createReply
);

// router.patch("/replyId", updateReply);

// router.delete("/:replyId", deleteReply);

module.exports = router;
