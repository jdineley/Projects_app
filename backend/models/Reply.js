const mongoose = require("mongoose");

const replySchema = new mongoose.Schema({
  content: {
    type: String,
    // required: true,
  },
  comment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Comment",
    required: true,
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
