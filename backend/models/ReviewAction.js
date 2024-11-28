const mongoose = require("mongoose");

const reviewActionSchema = new mongoose.Schema({
  reviewObjective: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ReviewObjective",
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  complete: {
    type: Boolean,
    default: false,
  },
  actionees: [
    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  ],
  comments: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Comment", required: true },
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

module.exports = mongoose.model("ReviewAction", reviewActionSchema);
