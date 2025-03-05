const Review = require("../models/Review");
const Project = require("../models/Project");
const ReviewAction = require("../models/ReviewAction");
const ReviewObjective = require("../models/ReviewObjective");
const User = require("../models/User");

const { channel } = require("../routes/v1/sse");

const mongoose = require("mongoose");

// shareController
const {
  updateObjective,
  deleteObjective,
  updateAction,
  deleteAction,
  // updateActionComment,
  deleteActionComment,
} = require("./sharedController");

const getReview = async (req, res) => {
  console.log("Hit getReview route");
  const { projectId, reviewId } = req.params;
  const { intent } = req.query;
  if (!mongoose.Types.ObjectId.isValid(reviewId)) {
    return res.status(404).json({ error: "No such review!" });
  }
  try {
    // #7777
    // Get, only if user is member of review.project
    // let review;
    // if (intent === "getLearnerProject") {
    //   review = await Review.findById(reviewId);
    // } else {
    //   const userProjInvolve = [
    //     ...req.user.projects.map((p) => p._id.toString()),
    //     ...req.user.userInProjects.map((p) => p._id.toString()),
    //   ];
    //   review = await Review.findOne({
    //     _id: reviewId,
    //     project: { $in: userProjInvolve },
    //   });
    // }
    const review = await Review.findById(reviewId);
    if (!review) {
      throw Error("Couldn't fetch Review");
    }

    await review.populate([
      {
        path: "objectives",
        populate: {
          path: "actions",
          populate: [
            "actionees",
            {
              path: "comments",
              populate: ["user", { path: "replies", populate: "user" }],
            },
          ],
        },
      },
      "project",
    ]);

    return res.status(200).json(review);
  } catch (error) {
    return res.status(error.status || 400).json({ error: error.message });
  }
};

const updateReview = async (req, res) => {
  console.log("Hit update review handler");
  const {
    title,
    date,
    comments,
    complete,
    objectives,
    actioneeNotificationData,
  } = req.body;

  const { projectId, reviewId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    return res.status(404).json({ error: "No such project!" });
  }
  if (!mongoose.Types.ObjectId.isValid(reviewId)) {
    return res.status(404).json({ error: "No such review!" });
  }

  try {
    // #8888
    // update only if user is project owner
    const project = await Project.findById(projectId);
    if (!project) {
      res.status(404).json({ error: "no such project" });
    }
    if (req.user._id.toString() !== project.owner.toString()) {
      throw Error("Not authorised to update project review");
      // return res
      //   .status(401)
      //   .json({ error: "Not authorised to update project review" });
    }
    const reviewToUpdate = await Review.findById(reviewId);
    if (!reviewToUpdate) {
      throw Error("Couldn't fetch review");
      // res.status(404).json({ error: "Couldn't fetch review" });
    }

    // update title:
    if (title !== reviewToUpdate.title) {
      reviewToUpdate.title = title;
      await reviewToUpdate.save();
    }

    // update date:
    if (date !== reviewToUpdate.date) {
      reviewToUpdate.date = date;
      await reviewToUpdate.save();
    }

    // update comments []: (separate to edit review)

    // update complete:
    if (complete !== reviewToUpdate.complete) {
      reviewToUpdate.complete = complete;
      await reviewToUpdate.save();
    }

    // update objectives []:
    // if objective has been deleted...
    if (objectives.length < reviewToUpdate.objectives.length) {
      const newObjectiveIds = objectives.map((objective) => objective._id);
      const removedObjectiveIds = reviewToUpdate.objectives.filter(
        (objective) => {
          if (!newObjectiveIds.includes(objective.toString())) {
            return objective;
          }
        }
      );

      reviewToUpdate.objectives = newObjectiveIds;
      await reviewToUpdate.save();
      // before deleting objective we should delete the actions associated to each deleted objective and comments associated to each action
      for (const objectiveId of removedObjectiveIds) {
        const storedObjective = await ReviewObjective.findById(
          objectiveId
        ).populate("actions");
        const actions = storedObjective.actions;
        for (const action of actions) {
          for (const commentId of action.comments) {
            await deleteActionComment(commentId);
          }
          await deleteAction(action._id);
        }
        await deleteObjective(objectiveId);
      }
    }
    // update all objectives in review objectives array - not sure this is the best?
    for (const objective of objectives) {
      for (const action of objective.actions) {
        await updateAction(action._id, action);
      }
      await updateObjective(objective._id, objective);
    }

    // notify new actionees of their new action
    if (actioneeNotificationData) {
      const { notificationTracker } = actioneeNotificationData;
      console.log("*** notification tracker ***", notificationTracker);
      if (notificationTracker.length > 0) {
        for (const trackerElement of notificationTracker) {
          console.log("objectiveId", trackerElement.objectiveId);
          console.log("actionId", trackerElement.actionId);
          console.log("actioneeId", trackerElement.actioneeId);
          const { type } = trackerElement;

          const actionee = await User.findById(trackerElement.actioneeId);
          const action = await ReviewAction.findById(trackerElement.actionId);
          const objective = await ReviewObjective.findById(
            trackerElement.objectiveId
          );
          if (type === "add") {
            actionee.recievedNotifications.push(
              `/projects/${reviewToUpdate.project}/reviews/${reviewToUpdate._id}?projectTitle=${project.title}&reviewTitle=${reviewToUpdate.title}&objectiveTitle=${objective.title}&actionContent=${action.content}&actionId=${action._id}&intent=new-reviewAction`
            );
            await actionee.save();
            // channel.publish("sending", `sending-notification${actionee._id}`);

            channel.publish(
              `/projects/${reviewToUpdate.project}/reviews/${reviewToUpdate._id}?projectTitle=${project.title}&reviewTitle=${reviewToUpdate.title}&objectiveTitle=${objective.title}&actionContent=${action.content}&actionId=${action._id}&intent=new-reviewAction`,
              `new-reviewAction-notification${actionee._id}`
            );
          } else {
            //type === 'remove'
            // actionee.recentReceivedActions =
            //   actionee.recentReceivedActions.filter(
            //     (url) =>
            //       `/projects/${reviewToUpdate.project}/reviews/${reviewToUpdate._id}?projectTitle=${project.title}&reviewTitle=${reviewToUpdate.title}&objectiveTitle=${objective.title}&actionContent=${action.content}&intent=new-reviewAction` !==
            //       url
            //   );
            actionee.recievedNotifications.push(
              `/projects/${reviewToUpdate.project}/reviews/${reviewToUpdate._id}?projectTitle=${project.title}&reviewTitle=${reviewToUpdate.title}&objectiveTitle=${objective.title}&actionContent=${action.content}&intent=removed-reviewAction`
            );
            await actionee.save();
            // channel.publish("sending", `sending-notification${actionee._id}`);

            channel.publish(
              `/projects/${reviewToUpdate.project}/reviews/${reviewToUpdate._id}?projectTitle=${project.title}&reviewTitle=${reviewToUpdate.title}&objectiveTitle=${objective.title}&actionContent=${action.content}&intent=removed-reviewAction`,
              `removed-reviewAction-notification${actionee._id}`
            );
          }
        }
      }
    }

    return res.status(200).json(reviewToUpdate);
  } catch (error) {
    // console.log("patch error", error.message);
    return res.status(error.status || 400).json({ error: error.message });
  }
};

module.exports = {
  updateReview,
  getReview,
};
