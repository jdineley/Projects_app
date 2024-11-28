const Project = require("../models/Project");
const Task = require("../models/Task");
const User = require("../models/User");
const Comment = require("../models/Comment");
const Reply = require("../models/Reply");
const Review = require("../models/Review");
const ReviewObjective = require("../models/ReviewObjective");
const ReviewAction = require("../models/ReviewAction");
const Vacation = require("../models/Vacation");

const deleteAllE2ETestArtifacts = async (req, res) => {
  console.log("running deleteAllE2ETestArtifacts handler");
  try {
    await Project.deleteMany({ isTest: true });
    await User.deleteMany({ isTest: true });
    await Task.deleteMany({ isTest: true });
    await Comment.deleteMany({ isTest: true });
    await Reply.deleteMany({ isTest: true });
    await Review.deleteMany({ isTest: true });
    await ReviewObjective.deleteMany({ isTest: true });
    await ReviewAction.deleteMany({ isTest: true });
    await Vacation.deleteMany({ isTest: true });
    res.status(200).json({ message: "deleted all e2e test artifacts" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  deleteAllE2ETestArtifacts,
};
