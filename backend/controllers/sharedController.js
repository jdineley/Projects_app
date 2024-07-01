// models
const ReviewObjective = require("../models/ReviewObjective");
const ReviewAction = require("../models/ReviewAction");
const Comment = require("../models/Comment");

// Review Objectives
const updateObjective = async (id, data) => {
  const objectiveToUpdate = await ReviewObjective.findByIdAndUpdate(id, {
    ...data,
  });
};
const deleteObjective = async (id) => {
  await ReviewObjective.findByIdAndDelete(id);
};

// Objective actions
const updateAction = async (id, data) => {
  await ReviewAction.findByIdAndUpdate(id, { ...data });
};
const deleteAction = async (id) => {
  await ReviewAction.findByIdAndDelete(id);
};

// Action comments
const updateActionComment = async (id, data) => {};
const deleteActionComment = async (id) => {
  await Comment.findByIdAndDelete(id);
};

module.exports = {
  updateObjective,
  deleteObjective,
  updateAction,
  deleteAction,
  updateActionComment,
  deleteActionComment,
};
