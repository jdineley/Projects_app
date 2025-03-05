// const Project = require("../models/Project");
const Review = require("../models/Review");
const Task = require("../models/Task");
const ReviewObjective = require("../models/ReviewObjective");

const projectViewVerification = async (req, res, next) => {
  console.log("In projectViewVerification middleware");
  const { projectId, ...rest } = req.params;
  // extract resources from rest
  // console.log("rest", rest);
  const { reviewId, taskId, objectiveId } = rest;
  let resourceModel;
  let resourceId;
  if (reviewId) {
    console.log("review");
    resourceModel = Review;
    resourceId = reviewId;
  }
  if (taskId) {
    console.log("task");
    resourceModel = Task;
    resourceId = taskId;
  }
  if (objectiveId) {
    console.log("objective");
    resourceModel = ReviewObjective;
    resourceId = objectiveId;
  }
  // console.log("foo bar", projectId, resourceId);
  try {
    const userProjInvolve = [
      ...req.user.projects.map((p) => p._id.toString()),
      ...req.user.userInProjects.map((p) => p._id.toString()),
    ];
    if (userProjInvolve.includes(projectId)) {
      // check resource is part of the target project
      if (resourceModel && resourceId) {
        const resource = await resourceModel.findById(resourceId);
        if (!resource) {
          throw Error("Something went wrong finding the requested resource");
        }
        if (resource.project.toString() === projectId) {
          console.log("resource and project match");
          return next();
        }
      } else return next();
    }
    throw Error("User unauthorised");
  } catch (error) {
    return res.status(401).json({ error: error.message });
  }
};

module.exports = projectViewVerification;
