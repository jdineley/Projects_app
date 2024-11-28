const mongoose = require("mongoose");

const reviewObjectiveSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  review: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Review",
    required: true,
  },
  complete: {
    type: Boolean,
    default: false,
  },
  // Thinking about using Map type here with form: [userIds]: String
  // When action is created, relevant users are assigned.
  // This is a way of avoiding another model (Action)..
  // If this works is could be a good solution to relate schema properties to other models without create further models???
  actions: [{ type: mongoose.Schema.Types.ObjectId, ref: "ReviewAction" }],
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

module.exports = mongoose.model("ReviewObjective", reviewObjectiveSchema);
