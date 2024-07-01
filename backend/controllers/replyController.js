const Reply = require("../models/Reply");
const Comment = require("../models/Comment");
const Task = require("../models/Task");
const User = require("../models/User");
const ReviewAction = require("../models/ReviewAction");

const mongoose = require("mongoose");

// sse
const { channel } = require("../routes/v1/sse");

// get all replies
const getReplies = async (req, res) => {};

// get reply
const getReply = async (req, res) => {
  console;
  const { replyId } = req.params;

  try {
    const reply = await Reply.findById(replyId).populate("user");
    return res.status(200).json(reply);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

// create reply
const createReply = async (req, res) => {
  console.log("hit createReply route");
  const {
    content,
    comment: commentId,
    user: userId,
    projectId,
    reviewId,
  } = req.body;
  const { _id: currentUserId, email: currentUserEmail } = req.user;
  console.log("current user id", currentUserId, currentUserEmail);
  try {
    const comment = await Comment.findById(commentId);
    console.log(comment);
    if (!comment) {
      throw Error("no associated comment found");
    }
    let task;
    let action;
    if (comment.task) {
      task = await Task.findById(comment.task);
      if (!task) {
        throw Error("no associated task found");
      }
    }
    if (comment.action) {
      action = await ReviewAction.findById(comment.action);
      if (!action) {
        throw Error("no associated action found");
      }
    }
    const reply = await Reply.create(req.body);
    comment.replies.push(reply._id);
    await comment.save();
    const commentWithPopReplies = await Comment.findById(comment._id).populate(
      "replies"
    );
    const allUsersInDisscussion = commentWithPopReplies.replies.map(
      (reply) => reply.user
    );
    res.status(200).json(reply);

    // notification logic needs updating to with with action / actionees etc..
    // const taskOrActionOwners = comment.task ? task.user.toString() : action.actionees;

    // task.user.toString(),
    [
      ...allUsersInDisscussion.map((user) => user.toString()),
      comment.task ? task.user.toString() : action.actionees,
      comment.user.toString(),
    ]
      .filter((userId, i, arr) => arr.indexOf(userId) === i) //remove duplicates
      .filter((userId) => userId !== currentUserId.toString()) //remove the commenter/replier from notifications
      .forEach(async (user) => {
        const userObj = await User.findById(user);
        // if (!userObj.isLoggedIn) {
        userObj.recentReceivedReplies.push(
          comment.task
            ? `/projects/${task.project}/tasks/${task._id}?commentId=${comment._id}&user=${currentUserEmail}&intent=new-reply`
            : `/projects/${projectId}/reviews/${reviewId}?commentId=${comment._id}&user=${currentUserEmail}&intent=new-reply`
        );
        await userObj.save();
        // }
        channel.publish(
          comment.task
            ? `/projects/${task.project}/tasks/${task._id}?commentId=${comment._id}&user=${currentUserEmail}&intent=new-reply`
            : `/projects/${projectId}/reviews/${reviewId}?commentId=${comment._id}&user=${currentUserEmail}&intent=new-reply`,
          `new-reply-notification${user}`
        );
      });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// update reply
const updateReply = async (req, res) => {};

// delete reply
const deleteReply = async (req, res) => {};

module.exports = {
  getReplies,
  getReply,
  createReply,
  updateReply,
  deleteReply,
};
