const express = require("express");
const requireAuth = require("../../middleware/requireAuth");
const projectViewVerification = require("../../middleware/projectViewVerification");
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

// router.use(requireAuth);

// router.get("/", getReplies);

// router.get("/:replyId", getReply);

router.post(
  "/project/:projectId",
  requireAuth,
  projectViewVerification,
  upload.fields([{ name: "uploaded_images" }, { name: "uploaded_videos" }]),
  createReply
);
router.post(
  "/",
  requireAuth,
  upload.fields([{ name: "uploaded_images" }, { name: "uploaded_videos" }]),
  createReply
);

// router.patch("/replyId", updateReply);

// router.delete("/:replyId", deleteReply);

module.exports = router;
