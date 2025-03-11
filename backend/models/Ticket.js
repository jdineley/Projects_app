const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["bug", "feature"],
    },
    ticketNumber: {
      type: Number,
      required: true,
    },
    importance: {
      type: String,
      enum: ["high", "medium"],
      default: "medium",
    },
    status: {
      type: String,
      enum: ["open", "closed", "future"],
      default: "open",
    },
    content: {
      type: String,
      // required: true,
    },
    images: [
      {
        url: String,
        asset_id: String,
        originalname: String,
      },
    ],
    videos: [
      {
        url: String,
        asset_id: String,
        originalname: String,
      },
    ],
    replies: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Reply",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Ticket", ticketSchema);
