const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  task: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Task",
    required: function () {
      return !this.action;
    },
  },
  action: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ReviewAction",
    required: function () {
      return !this.task;
    },
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

module.exports = mongoose.model("Comment", commentSchema);
