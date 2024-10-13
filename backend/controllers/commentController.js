const mongoose = require("mongoose");

const Comment = require("../models/Comment");
const Task = require("../models/Task");
const User = require("../models/User");
const ReviewAction = require("../models/ReviewAction");

const { channel } = require("../routes/v1/sse");

// get all comments
const getAllComments = async (req, res) => {
  console.log("hit getAllComments route");
};

// get comment

const getComment = async (req, res) => {
  console.log("hit getComment route");
};

// create comment
const createComment = async (req, res) => {
  console.log("hit createComment handler");
  const user = req.user;

  const { task: taskId, action: actionId, projectId, reviewId } = req.body;

  try {
    const comment = await Comment.create({
      ...req.body,
      isDemo: req.user.isDemo,
    });
    if (taskId) {
      const task = await Task.findById(taskId);
      if (!task) {
        throw Error("no task found");
      }
      task.comments.push(comment._id);
      await task.save();
      const taskOwner = await User.findById(task.user);
      if (user._id.toString() !== taskOwner._id.toString()) {
        taskOwner.recievedNotifications.push(
          `/projects/${task.project}/tasks/${task._id}?commentId=${comment._id}&user=${user.email}&intent=new-comment`
        );
        // taskOwner.recentReceivedComments.push(
        //   `/projects/${task.project}/tasks/${task._id}?commentId=${comment._id}&user=${user.email}&intent=new-comment`
        // );
        await taskOwner.save();
        channel.publish(
          `/projects/${task.project}/tasks/${task._id}?commentId=${comment._id}&user=${user.email}&intent=new-comment`,
          `new-comment-notification${taskOwner._id}`
        );
      }
    }
    if (actionId) {
      const action = await ReviewAction.findById(actionId).populate(
        "actionees"
      );
      if (!action) {
        throw Error("no task found");
      }
      action.comments.push(comment._id);
      await action.save();

      if (action.actionees.length > 0) {
        for (const actionee of action.actionees) {
          if (actionee._id.toString() !== user._id.toString()) {
            actionee.recievedNotifications.push(
              `/projects/${projectId}/reviews/${reviewId}?commentId=${comment._id}&user=${user.email}&intent=new-comment`
            );
            // actionee.recentReceivedComments.push(
            //   `/projects/${projectId}/reviews/${reviewId}?commentId=${comment._id}&user=${user.email}&intent=new-comment`
            // );
            await actionee.save();

            channel.publish(
              `/projects/${projectId}/reviews/${reviewId}?commentId=${comment._id}&user=${user.email}&intent=new-comment`,
              `new-comment-notification${actionee._id}`
            );
          }
        }
      }
    }
    res.status(200).json(comment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// update comment

// delete comment

// get all comments for a single task.  Including

const getTaskComments = async (req, res) => {
  const { taskId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(taskId)) {
    return res.status(404).json({ error: "No such task" });
  }

  try {
    const task = Task.findById(taskId).populate("comments");
    if (!task) {
      return res.status(404).json({ error: "No such task" });
    }
    let taskComments = [];
    for (const comment of task.comments) {
      const populatedComment = await Comment.findById(comment._id).populate([
        "user",
        "replies",
      ]);
      taskComments.push(populatedComment);
    }
    res.status(200).json(taskComments);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

module.exports = {
  getAllComments,
  createComment,
  getTaskComments,
};
