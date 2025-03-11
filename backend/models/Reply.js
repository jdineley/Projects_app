const mongoose = require("mongoose");

const replySchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
  },
  content: {
    type: String,
    // required: true,
  },
  comment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Comment",
    required: function () {
      return !this.ticket;
    },
  },
  ticket: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Ticket",
    required: function () {
      return !this.comment;
    },
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
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
  archived: {
    type: Boolean,
    default: false,
  },
  isDemo: {
    type: Boolean,
    default: false,
  },
  isTest: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("Reply", replySchema);
