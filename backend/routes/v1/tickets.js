const express = require("express");
const multer = require("multer");
const upload = multer({ dest: "./public/temp/" });

const {
  createTicket,
  getTickets,
  updateTicket,
} = require("../../controllers/ticketController");

const requireAuth = require("../../middleware/requireAuth");

const router = express.Router();

router.get("/", requireAuth, getTickets);

router.post(
  "/",
  requireAuth,
  upload.fields([{ name: "uploaded_images" }, { name: "uploaded_videos" }]),
  createTicket
);

router.patch("/:ticketId", requireAuth, updateTicket);

module.exports = router;
