const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  // comments: [
  //   {
  //     type: String,
  //   },
  // ],
  complete: {
    type: Boolean,
    default: false,
  },
  objectives: [
    { type: mongoose.Schema.Types.ObjectId, ref: "ReviewObjective" },
  ],
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    required: true,
  },
  archived: {
    type: Boolean,
    default: false,
  },
  isDemo: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("Review", reviewSchema);
