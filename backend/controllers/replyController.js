const Reply = require("../models/Reply");
const Comment = require("../models/Comment");
const Ticket = require("../models/Ticket");
const Task = require("../models/Task");
const User = require("../models/User");
const ReviewAction = require("../models/ReviewAction");

const path = require("path");

const mongoose = require("mongoose");

// sse
const { channel } = require("../routes/v1/sse");

// cloudinary
require("dotenv").config();
const cloudinary = require("cloudinary").v2;
console.log("cloudinary", cloudinary.config().cloud_name);

// util
const { removeAllFilesAsync } = require("../util");

// get all replies
// const getReplies = async (req, res) => {};

// get reply
// const getReply = async (req, res) => {
//   // console;
//   const { replyId } = req.params;

//   try {
//     const reply = await Reply.findById(replyId).populate("user");
//     return res.status(200).json(reply);
//   } catch (error) {
//     res.status(404).json({ error: error.message });
//   }
// };

// create reply
const createReply = async (req, res) => {
  console.log("hit createReply route");
  // const { ticket } = req.query;
  // console.log("ticket", ticket);
  // console.log("req.url", req.url);
  // const model = req.url === "/" ? Ticket : Comment
  const {
    content,
    comment: commentId,
    ticket: ticketId,
    user: userId,
    projectId,
    reviewId,
    tagged_users,
  } = req.body;
  console.log("req.body", req.body);
  // console.log("req.body", req.body);
  // console.log("commentId", commentId);
  console.log("&&&&&&&&&&&&&projectId&&&&&&&&&&&&&&&&&&&", projectId);
  const {
    _id: currentUserId,
    email: currentUserEmail,
    isDemo,
    isTest,
  } = req.user;
  // console.log("current user id", currentUserId, currentUserEmail);
  // const userProjInvolve = [
  //   ...req.user.projects.map((p) => p._id.toString()),
  //   ...req.user.userInProjects.map((p) => p._id.toString()),
  // ];
  try {
    // #4290
    // reply to be attached to a comment within user's projects
    let comment;
    let ticket;
    let task;
    let action;
    let actionees;
    if (commentId) {
      comment = await Comment.findById(commentId);
      if (!comment) {
        throw Error("no associated comment found");
      }
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
        actionees = action.actionees.map((a) => a.toString());
        // console.log("actionees", actionees);
      }
    } else {
      ticket = await Ticket.findById(ticketId);
    }
    const reply = await Reply.create({
      ...req.body,
      // project: projectId,
      isDemo,
      isTest,
    });
    if (req.files) {
      if (req.files.uploaded_images) {
        const imagePaths = req.files.uploaded_images.map((image) => {
          return {
            url: image.path,
            originalname: image.originalname,
          };
        });
        for (const image of imagePaths) {
          const result = await cloudinary.uploader.upload(image.url, {
            folder: "Projects/images",
          });
          console.log(result);
          reply.images.push({
            url: result.secure_url,
            asset_id: result.asset_id,
            originalname: image.originalname,
          });
        }
      }
      if (req.files.uploaded_videos) {
        const videoPaths = req.files.uploaded_videos.map((video) => {
          return {
            url: video.path,
            originalname: video.originalname,
          };
        });
        for (const video of videoPaths) {
          const result = await cloudinary.uploader.upload(video.url, {
            folder: "Projects/videos",
            resource_type: "video",
          });
          console.log(result);
          reply.videos.push({
            url: result.secure_url,
            asset_id: result.asset_id,
            originalname: video.originalname,
          });
        }
      }
      await reply.save();
      const dirPath = path.join(__dirname, "../public/temp");
      await removeAllFilesAsync(dirPath);
      // .then(() => console.log("All files have been removed asynchronously."))
      // .catch(console.error);
    }
    if (commentId || ticketId) {
      const target = commentId ? comment : ticket;
      const Model = commentId ? Comment : Ticket;
      target.replies.push(reply._id);
      await target.save();
      const commentWithPopReplies = await Model.findById(target._id).populate(
        "replies"
      );
      const allUsersInDisscussion = commentWithPopReplies.replies.map((reply) =>
        reply.user.toString()
      );
      console.log("allUsersInDisscussion", allUsersInDisscussion);
      // res.status(200).json(reply);
      // notification logic needs updating to with with action / actionees etc..
      // const taskOrActionOwners = comment.task ? task.user.toString() : action.actionees;

      // task.user.toString(),
      let messageEes;
      if (commentId) {
        messageEes = [
          // ...allUsersInDisscussion.map((user) => user.toString()),
          ...allUsersInDisscussion,
          ...(comment.task
            ? [task.user.toString()]
            : // : action.actionees.map((a) => a.toString()),
              actionees),
          comment.user.toString(),
        ]
          .filter((userId, i, arr) => arr.indexOf(userId) === i) //remove duplicates
          .filter((userId) => userId !== currentUserId.toString()); //remove the commenter/replier from notifications
      } else {
        messageEes = [
          // ...allUsersInDisscussion.map((user) => user.toString()),
          ...allUsersInDisscussion,
          ticket.user.toString(),
        ]
          .filter((userId, i, arr) => arr.indexOf(userId) === i) //remove duplicates
          .filter((userId) => userId !== currentUserId.toString()); //remove the commenter/replier from notifications
      }

      console.log("messageees", messageEes);
      messageEes = tagged_users ? [...messageEes, ...tagged_users] : messageEes;

      for (const messageEe of messageEes) {
        let userObj;
        if (mongoose.Types.ObjectId.isValid(messageEe)) {
          userObj = await User.findById(messageEe);
        } else {
          userObj = await User.findOne({ email: messageEe });
        }
        console.log("userObj", userObj);
        userObj.recievedNotifications.push(
          comment?.task
            ? `/projects/${task.project}/tasks/${task._id}?commentId=${comment._id}&user=${currentUserEmail}&intent=new-task-reply`
            : ticket
            ? `/tickets?ticketId=${ticket._id}&user=${req.user.email}&intent=ticket-reply`
            : `/projects/${projectId}/reviews/${reviewId}?commentId=${comment._id}&user=${currentUserEmail}&intent=new-review-reply`
        );
        await userObj.save();
        channel.publish(
          comment?.task
            ? `/projects/${task.project}/tasks/${task._id}?commentId=${comment._id}&user=${currentUserEmail}&intent=new-task-reply`
            : ticket
            ? `/tickets?ticketId=${ticket._id}&user=${req.user.email}&intent=ticket-reply`
            : `/projects/${projectId}/reviews/${reviewId}?commentId=${comment._id}&user=${currentUserEmail}&intent=new-review-reply`,
          `new-reply-notification${messageEe}`
        );
      }
    }
    // else {
    //   ticket.replies.push(reply._id);
    //   await ticket.save();
    // }
    res.status(200).json(reply);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// update reply
// const updateReply = async (req, res) => {};

// delete reply
// const deleteReply = async (req, res) => {};

module.exports = {
  // getReplies,
  // getReply,
  createReply,
  // updateReply,
  // deleteReply,
};
