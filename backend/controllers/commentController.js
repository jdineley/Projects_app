const mongoose = require("mongoose");

const path = require("path");

const Comment = require("../models/Comment");
const Task = require("../models/Task");
const User = require("../models/User");
const ReviewAction = require("../models/ReviewAction");

const { channel } = require("../routes/v1/sse");

require("dotenv").config();
// const cloudinary = require("cloudinary").v2;
const cloudinary = require("../cloudinary");
console.log("cloudinary_cloud_name", cloudinary.config().cloud_name);
console.log("cloudinary_api_key", cloudinary.config().api_key);

// util
const { removeAllFilesAsync } = require("../util");

// get all comments
// const getAllComments = async (req, res) => {
//   console.log("hit getAllComments route");
// };

// get comment

// const getComment = async (req, res) => {
//   console.log("hit getComment route");
// };

// create comment
const createComment = async (req, res) => {
  console.log("hit createComment handler");
  const user = req.user;
  console.log("req.files", req.files);
  console.log("req.body", req.body);
  let { tagged_users } = req.body;
  console.log("tagged_users", tagged_users);
  if (!Array.isArray(tagged_users)) {
    // fix if only one tagged user which arrives as a string
    tagged_users = [tagged_users];
  }
  // if (tagged_users) {
  //   console.log("tagged_users", tagged_users);

  // }
  // const xml = await fs.readFile(req.file.path, { encoding: "utf8" });

  const { task: taskId, action: actionId, projectId, reviewId } = req.body;

  try {
    const comment = await Comment.create({
      ...req.body,
      project: projectId,
      isDemo: req.user.isDemo,
      isTest: req.user.isTest,
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
          comment.images.push({
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
          comment.videos.push({
            url: result.secure_url,
            asset_id: result.asset_id,
            originalname: video.originalname,
          });
        }
      }
      await comment.save();
      console.log("comment", comment);

      // delete temp attachment files
      const dirPath = path.join(__dirname, "../public/temp");
      console.log("dirPath", dirPath);
      await removeAllFilesAsync(dirPath);
      // .then(() => console.log("All files have been removed asynchronously."))
      // .catch(console.error);
    }

    if (taskId) {
      const task = await Task.findById(taskId).populate("user");
      if (!task) {
        throw Error("no task found");
      }
      // if (task.isDemo) {
      //   comment.isDemo = true;
      //   await comment.save();
      // }
      // if (task.isTest) {
      //   comment.isTest = true;
      //   await comment.save();
      // }
      task.comments.push(comment._id);
      await task.save();
      // distribute notification to [taskOwner,...taggedUsers]
      const taskNotees = tagged_users
        ? [
            user._id.toString() !== task.user._id.toString() && task.user.email,
            ...tagged_users,
          ]
        : [user._id.toString() !== task.user._id.toString() && task.user.email];
      console.log("taskNotees", taskNotees);
      if (taskNotees.length > 0) {
        for (const taskNotee of taskNotees) {
          const noteeObj = await User.findOne({ email: taskNotee });
          noteeObj.recievedNotifications.push(
            `/projects/${task.project}/tasks/${task._id}?commentId=${comment._id}&user=${user.email}&intent=new-task-comment`
          );
          await noteeObj.save();
          channel.publish(
            `/projects/${task.project}/tasks/${task._id}?commentId=${comment._id}&user=${user.email}&intent=new-task-comment`,
            `new-comment-notification${noteeObj._id}`
          );
        }
      }
      // const taskOwner = await User.findById(task.user);
      // if (user._id.toString() !== taskOwner._id.toString()) {
      //   taskOwner.recievedNotifications.push(
      //     `/projects/${task.project}/tasks/${task._id}?commentId=${comment._id}&user=${user.email}&intent=new-task-comment`
      //   );
      //   await taskOwner.save();
      //   channel.publish(
      //     `/projects/${task.project}/tasks/${task._id}?commentId=${comment._id}&user=${user.email}&intent=new-task-comment`,
      //     `new-comment-notification${taskOwner._id}`
      //   );
      // }
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

      const actionNotees = tagged_users
        ? [
            ...action.actionees
              .filter((a) => a._id.toString() !== user._id.toString())
              .map((a) => a.email),
            ...tagged_users,
          ]
        : action.actionees
            .filter((a) => a._id.toString() !== user._id.toString())
            .map((a) => a.email);

      console.log("actionNotees", actionNotees);

      if (actionNotees.length > 0) {
        for (const actionNotee of actionNotees) {
          const actionNoteeObj = await User.findOne({ email: actionNotee });
          actionNoteeObj.recievedNotifications.push(
            `/projects/${projectId}/reviews/${reviewId}?commentId=${comment._id}&user=${user.email}&intent=new-review-comment`
          );
          await actionNoteeObj.save();

          channel.publish(
            `/projects/${projectId}/reviews/${reviewId}?commentId=${comment._id}&user=${user.email}&intent=new-review-comment`,
            `new-comment-notification${actionNoteeObj._id}`
          );
        }
      }

      // if (action.actionees.length > 0) {
      //   for (const actionee of action.actionees) {
      //     if (actionee._id.toString() !== user._id.toString()) {
      //       actionee.recievedNotifications.push(
      //         `/projects/${projectId}/reviews/${reviewId}?commentId=${comment._id}&user=${user.email}&intent=new-review-comment`
      //       );
      //       // actionee.recentReceivedComments.push(
      //       //   `/projects/${projectId}/reviews/${reviewId}?commentId=${comment._id}&user=${user.email}&intent=new-comment`
      //       // );
      //       await actionee.save();

      //       channel.publish(
      //         `/projects/${projectId}/reviews/${reviewId}?commentId=${comment._id}&user=${user.email}&intent=new-review-comment`,
      //         `new-comment-notification${actionee._id}`
      //       );
      //     }
      //   }
      // }
    }
    res.status(200).json(comment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// update comment

// delete comment

// get all comments for a single task.  Including

// const getTaskComments = async (req, res) => {
//   const { taskId } = req.params;
//   if (!mongoose.Types.ObjectId.isValid(taskId)) {
//     return res.status(404).json({ error: "No such task" });
//   }

//   try {
//     const task = Task.findById(taskId).populate("comments");
//     if (!task) {
//       return res.status(404).json({ error: "No such task" });
//     }
//     let taskComments = [];
//     for (const comment of task.comments) {
//       const populatedComment = await Comment.findById(comment._id).populate([
//         "user",
//         "replies",
//       ]);
//       taskComments.push(populatedComment);
//     }
//     res.status(200).json(taskComments);
//   } catch (error) {
//     res.status(404).json({ error: error.message });
//   }
// };

module.exports = {
  // getAllComments,
  createComment,
  // getTaskComments,
};
