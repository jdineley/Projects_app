const Project = require("../models/Project");
const Task = require("../models/Task");
const User = require("../models/User");
const Review = require("../models/Review");
const ReviewObjective = require("../models/ReviewObjective");
const ReviewAction = require("../models/ReviewAction");
const Comment = require("../models/Comment");
const Reply = require("../models/Reply");
const Vacation = require("../models/Vacation");
const mongoose = require("mongoose");

const fs = require("node:fs/promises");
const path = require("node:path");
const xml2js = require("xml2js");

// util
const { fixReviews } = require("../util");
const { msProjectUpload } = require("./msProjectUpload");
const { msProjectUpdate } = require("./msProjectUpdate");
const { msProjectExportXML } = require("./msProjectExportXML");
// const { channel } = require("node:diagnostics_channel");
const { resyncUserAndVacs, resyncProjTasksUsersVacs } = require("../util");

const { channel } = require("../routes/v1/sse");

const getAllProjects = async (req, res) => {
  console.log("In get all projects..");
  try {
    const projects = await Project.find()
      .populate(["owner", "tasks", "reviews"])
      .sort({
        createdAt: -1,
      });
    res.status(200).json(projects);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

const getProject = async (req, res) => {
  console.log("hit project get project route");
  const { projectId } = req.params;
  const { intent } = req.query;
  console.log("intent", intent);

  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    return res.status(404).json({ error: "No such Project" });
  }
  try {
    const project = await Project.findById(projectId).populate([
      "owner",
      // "tasks",
      "reviews",
      "users",
      { path: "vacationRequests", populate: "user" },
    ]);
    if (!project) {
      return res.status(404).json({ error: "No such Project" });
    }

    let projectTasks = [];
    for (const task of project.tasks) {
      const populatedTask = await Task.findById(task).populate([
        "user",
        "comments",
        "dependencies",
        "secondaryUsers",
      ]);
      projectTasks.push(populatedTask);
    }
    // if (intent === "exportXML") {
    //   await msProjectExportXML(project, projectTasks);

    //   return res.download(project.file, async function (err) {
    //     if (err) {
    //       throw Error("something went wrong downloading the file");
    //     } else {
    //       try {
    //         await fs.unlink(project.file);
    //         project.inWork = false;
    //         await project.save();
    //       } catch (error) {
    //         throw Error(error.message);
    //       }
    //     }
    //   });
    // }

    res.status(200).json({ project, projectTasks });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

const createProject = async (req, res) => {
  console.log("hit the createProject route");
  console.log(req.body);
  console.log(req.file);
  // const folderPath = "../public/data/uploads/";
  // console.log(fs.readdirSync(folderPath));

  const {
    intent,
    title,
    start,
    end,
    originalFileName,
    projectMapped,
    msProjObj,
    // isTest,
    ...reviews
  } = req.body;
  const { _id: userId, isDemo, isTest } = req.user;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(404).json({ error: "Invalid user id" });
  }

  const [reviewArray] = fixReviews(reviews, intent);

  try {
    const currentUser = await User.findById(userId);
    // .populate([
    //   "tasks",
    //   "vacationRequests",
    //   "secondaryTasks",
    // ]);
    if (originalFileName) {
      console.log("Adding MS Project...");

      const existingProject = await Project.findOne({
        msProjectGUID: msProjObj.Project.GUID[0],
      }).populate(["owner", "tasks"]);

      if (existingProject) {
        if (
          existingProject.owner._id.toString() !== currentUser._id.toString()
        ) {
          throw {
            errors: `This MS Project is already being actively managed by ${existingProject.owner.email}`,
          };
        }
        throw {
          errors: `You have already uploaded ${existingProject.title}.  If you wish to update changes use edit project`,
        };
      }

      const newProject = await msProjectUpload(
        msProjObj,
        projectMapped,
        currentUser,
        originalFileName,
        isDemo,
        isTest
      );
      return res.status(200).json(newProject);
    }
    // if (req.file) {
    //   console.log("trying to import MS Project xml file..");
    //   const xml = await fs.readFile(req.file.path, { encoding: "utf8" });
    //   // console.log(data);
    //   const msProjObj = await xml2js.parseStringPromise(xml);
    //   const originalFileName = req.file.originalname;
    //   console.log(msProjObj);
    //   const newProject = await msProjectUpload(
    //     msProjObj,
    //     currentUser,
    //     originalFileName
    //   );

    //   // return res.status(200).json(msProjObj);
    //   return res.status(200).json({ newProject });
    // }
    const project = await Project.create({
      title,
      start,
      end,
      owner: req.user._id,
      isDemo,
    });

    for (let review of reviewArray) {
      const reviewNew = await Review.create({
        ...review,
        project: project._id,
        isDemo,
        isTest,
      });
      project.reviews.push(reviewNew._id);
      await project.save();
    }
    currentUser.projects.push(project._id);
    await currentUser.save();
    res.status(200).json({ project, result: intent });
  } catch (error) {
    res
      .status(error.status || 400)
      .json({ errors: error.errors, newProjectId: error.newProjectId });
  }
};

const updateProject = async (req, res) => {
  console.log("Hit update project handler");
  const {
    intent,
    title,
    start,
    end,
    freeze,
    originalFileName,
    projectMapped,
    msProjObj,
    ...reviews
  } = req.body;
  const { projectId } = req.params;
  const { _id: userId, isDemo, isTest } = req.user;
  console.log("intent", intent);
  console.log("projectId", projectId);
  console.log("req.file", req.file);
  // Add archive project logic starting here:
  // https://www.reddit.com/r/node/comments/9nudkk/update_many_nested_objects_in_mongoose/
  // Set project.archived = true
  // Use above to recursively set all [docs] achived:true
  // Then change the application logic to look for doc.archived (true/false) when rendering
  // Probably need to look at making the overall application User centric, such that most pages take the userObject as the starting point...  Instead of, for example, getting all projects from the api and fitering on the front end..  instead only find the resources that are applicable based on the logged on user object

  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    return res.status(404).json({ error: "No such project!" });
  }

  const [reviewArray, newReviewArray] = fixReviews(reviews, intent);

  console.log(reviewArray);

  try {
    const projectToUpdate = await Project.findById(projectId).populate([
      // "owner",
      // "tasks",
      // "users",
      // { path: "tasks", populate: "user" },
      { path: "tasks", populate: ["secondaryUsers"] },
    ]);

    if (projectToUpdate.owner.toString() !== req.user._id.toString()) {
      return res
        .status(401)
        .json({ error: "Not authorised to update project" });
    }

    const currentUser = await User.findById(userId);
    // .populate([
    //   "tasks",
    //   "vacationRequests",
    //   "secondaryTasks",
    // ]);

    if (originalFileName) {
      console.log("Updating MS Project..");
      await msProjectUpdate(
        projectToUpdate,
        projectMapped,
        currentUser,
        originalFileName,
        isDemo
      );
      return res.status(200).json(projectToUpdate);
    }

    // if (req.file) {
    //   console.log("trying to import MS Project xml file..");
    //   const xml = await fs.readFile(req.file.path, { encoding: "utf8" });
    //   // console.log(data);
    //   const msProjObj = await xml2js.parseStringPromise(xml);
    //   if (msProjObj.Project.GUID[0] !== projectToUpdate.msProjectGUID) {
    //     throw Error("You are trying to update the wrong project");
    //   }
    //   console.log(
    //     msProjObj.Project.Assignments[0].Assignment.find(
    //       (el) => el.TaskUID[0] === "421"
    //     )
    //   );
    //   const originalFileName = req.file.originalname;
    //   console.log("originalFileName", originalFileName);

    //   await msProjectUpdate(
    //     projectToUpdate,
    //     msProjObj,
    //     currentUser,
    //     originalFileName
    //   );

    //   return res.status(200).json(msProjObj);
    // }

    if (intent === "edit-project") {
      console.log("in edit project, thingy");
      const project = await Project.findOneAndUpdate(
        { _id: projectId },
        {
          title,
          start,
          end,
        },
        { returnDocument: "after" }
      );
      if (!project) {
        res.status(404).json({ error: "no such project" });
      }

      // Address number of reviews has changed:
      if (
        projectToUpdate.reviews.length !==
        [...reviewArray, ...newReviewArray].length
      ) {
        console.log("$$$$ changed number of reviews $$$$");
        // create new reviews:
        let newReviewIds = [];
        for (const newReview of newReviewArray) {
          const newReviewObj = await Review.create({
            ...newReview,
            project: projectId,
            isDemo,
            isTest,
          });
          newReviewIds.push(newReviewObj._id);
        }
        const revArrayIds = reviewArray.map((rev) => rev.reviewId);
        projectToUpdate.reviews = [...revArrayIds, ...newReviewIds];
        await projectToUpdate.save();
      }

      // Update modified existing reviews:
      for (let review of reviewArray) {
        const reviewNew = await Review.findOneAndUpdate(
          {
            _id: review.reviewId,
          },
          {
            title: review.title,
            date: review.date,
          },
          { returnDocument: "after" }
        );
      }
      res.status(200).json({ project, result: intent });
    } else if (intent === "archive-project") {
      console.log("in achived project");
      const archivedProject = await Project.findOneAndUpdate(
        { _id: projectId },
        {
          archived: true,
        },
        { returnDocument: "after" }
      );
      const user = await User.findById(req.user._id);
      user.archivedProjects.push(archivedProject._id);
      await user.save();
      // for (const userId of archivedProject.users) {
      //   const user = await User.findById(userId);
      //   user.hasArchivedProjects = true;
      //   await user.save();
      // }
      console.log(archivedProject);
      let allArchivedProjectDescendentIds = {};
      if (archivedProject.reviews.length > 0) {
        for (const reviewid of archivedProject.reviews) {
          const review = await Review.findById(reviewid);
          review.archived = true;
          await review.save();
          if (!allArchivedProjectDescendentIds.Review) {
            allArchivedProjectDescendentIds.Review = [];
          }
          allArchivedProjectDescendentIds.Review.push(review._id);
          if (review.objectives.length > 0) {
            for (const objectiveId of review.objectives) {
              const objective = await ReviewObjective.findById(objectiveId);
              objective.archived = true;
              await objective.save();
              if (!allArchivedProjectDescendentIds.ReviewObjective) {
                allArchivedProjectDescendentIds.ReviewObjective = [];
              }
              allArchivedProjectDescendentIds.ReviewObjective.push(
                objective._id
              );
              if (objective.actions.length > 0) {
                for (const actionId of objective.actions) {
                  const action = await ReviewAction.findById(actionId);
                  action.archived = true;
                  await action.save();
                  if (!allArchivedProjectDescendentIds.ReviewAction) {
                    allArchivedProjectDescendentIds.ReviewAction = [];
                  }
                  allArchivedProjectDescendentIds.ReviewAction.push(action._id);
                  if (action.comments.length > 0) {
                    for (const commentId of action.comments) {
                      const comment = await Comment.findById(commentId);
                      comment.archived = true;
                      await comment.save();
                      if (!allArchivedProjectDescendentIds.Comment) {
                        allArchivedProjectDescendentIds.Comment = [];
                      }
                      allArchivedProjectDescendentIds.Comment.push(comment._id);
                      if (comment.replies.length > 0) {
                        for (const replyId of comment.replies) {
                          const reply = await Reply.findById(replyId);
                          reply.archived = true;
                          await reply.save();
                          if (!allArchivedProjectDescendentIds.Reply) {
                            allArchivedProjectDescendentIds.Reply = [];
                          }
                          allArchivedProjectDescendentIds.Reply.push(reply._id);
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
      if (archivedProject.tasks.length > 0) {
        for (const taskId of archivedProject.tasks) {
          const task = await Task.findById(taskId);
          task.archived = true;
          await task.save();
          if (!allArchivedProjectDescendentIds.Task) {
            allArchivedProjectDescendentIds.Task = [];
          }
          allArchivedProjectDescendentIds.Task.push(task._id);
          if (task.comments.length > 0) {
            for (const commentId of task.comments) {
              const comment = await Comment.findById(commentId);
              comment.archived = true;
              await comment.save();
              if (!allArchivedProjectDescendentIds.Comment) {
                allArchivedProjectDescendentIds.Comment = [];
              }
              allArchivedProjectDescendentIds.Comment.push(comment._id);
              if (comment.replies.length > 0) {
                for (const replyId of comment.replies) {
                  const reply = await Reply.findById(replyId);
                  reply.archived = true;
                  await reply.save();
                  if (!allArchivedProjectDescendentIds.Reply) {
                    allArchivedProjectDescendentIds.Reply = [];
                  }
                  allArchivedProjectDescendentIds.Reply.push(reply._id);
                }
              }
            }
          }
        }
      }
      if (archivedProject.vacationRequests.length > 0) {
        // check if project had passed an acceptance/rejection to vacReq
        // If it had then this instance should be removed from the approval map
        // The project should remain everywhere is was before but as an archived project
        for (const vacReqId of archivedProject.vacationRequests) {
          const vacReq = await Vacation.findById(vacReqId).populate("projects");
          // .populate({
          //   path: "user",
          //   populate: ["tasks", "vacationRequests", "secondaryTasks"],
          // });
          if (vacReq.approvals.get(archivedProject._id)) {
            vacReq.approvals.delete(archivedProject._id);
          }
          const approvalValuesArray = Object.values(
            Object.fromEntries(vacReq.approvals)
          ).map((approv) => approv.accepted);
          console.log("approvalValuesArray", approvalValuesArray);
          if (
            approvalValuesArray.length ===
              vacReq.projects.filter((p) => !p.archived).length &&
            !approvalValuesArray.includes("false")
          ) {
            vacReq.status = "approved";
            vacReq.approved = true;
          } else if (approvalValuesArray.includes("false")) {
            vacReq.status = "rejected";
            vacReq.approved = false;
          } else {
            vacReq.status = "pending";
            vacReq.approved = false;
          }
          await vacReq.save();

          // await resyncUserAndVacs(vacReq.user);
        }
      }
      archivedProject.descendentsAtArchive = allArchivedProjectDescendentIds;
      await archivedProject.save();
      console.log(
        "@@@ allArchivedProjectDescendentIds @@@",
        allArchivedProjectDescendentIds
      );
      console.log("%%% archivedProject %%%", archivedProject);
      res.status(200).json({ archivedProject, result: intent });
    } else if (intent === "unarchive-project") {
      const projectToUnarchive = await Project.findById(projectId);
      if (!projectToUnarchive) {
        res.status(404).json({ error: "no such project" });
      }
      console.log(
        "projectToUnarchive.descendentsAtArchive",
        projectToUnarchive.descendentsAtArchive
      );
      projectToUnarchive.archived = false;

      if (projectToUnarchive.descendentsAtArchive?.Review?.length > 0) {
        console.log("in Review");
        for (const reviewId of projectToUnarchive.descendentsAtArchive.Review) {
          const review = await Review.findById(reviewId);
          review.archived = false;
          await review.save();
        }
      }
      if (
        projectToUnarchive.descendentsAtArchive?.ReviewObjective?.length > 0
      ) {
        console.log("in ReviewObjective");
        for (const reviewObjectiveId of projectToUnarchive.descendentsAtArchive
          .ReviewObjective) {
          const reviewObjective = await ReviewObjective.findById(
            reviewObjectiveId
          );
          reviewObjective.archived = false;
          await reviewObjective.save();
        }
      }
      if (projectToUnarchive.descendentsAtArchive?.ReviewAction?.length > 0) {
        console.log("in ReviewAction");
        for (const reviewActionId of projectToUnarchive.descendentsAtArchive
          .ReviewAction) {
          console.log("reviewActionId", reviewActionId);
          const reviewAction = await ReviewAction.findById(reviewActionId);
          console.log("reviewAction", reviewAction);
          reviewAction.archived = false;
          await reviewAction.save();
        }
      }
      if (projectToUnarchive.descendentsAtArchive?.Comment?.length > 0) {
        console.log("in Comment");
        for (const commentId of projectToUnarchive.descendentsAtArchive
          .Comment) {
          const comment = await Comment.findById(commentId);
          comment.archived = false;
          await comment.save();
        }
      }
      if (projectToUnarchive.descendentsAtArchive?.Task?.length > 0) {
        console.log("in Task");
        for (const taskId of projectToUnarchive.descendentsAtArchive.Task) {
          const task = await Task.findById(taskId);
          task.archived = false;
          await task.save();
        }
      }
      if (projectToUnarchive.descendentsAtArchive?.Reply?.length > 0) {
        console.log("in Reply");
        for (const replyId of projectToUnarchive.descendentsAtArchive.Reply) {
          const reply = await Reply.findById(replyId);
          reply.archived = false;
          await reply.save();
        }
      }
      await projectToUnarchive.save();
      if (projectToUnarchive.vacationRequests?.length > 0) {
        for (const vacReqId of projectToUnarchive.vacationRequests) {
          const vacReq = await Vacation.findById(vacReqId).populate("projects");
          const approvalValuesArray = Object.values(
            Object.fromEntries(vacReq.approvals)
          ).map((approv) => approv.accepted);
          console.log("approvalValuesArray", approvalValuesArray);
          if (
            approvalValuesArray.length ===
              vacReq.projects.filter((p) => !p.archived).length &&
            !approvalValuesArray.includes("false")
          ) {
            vacReq.status = "approved";
            vacReq.approved = true;
          } else if (approvalValuesArray.includes("false")) {
            vacReq.status = "rejected";
            vacReq.approved = false;
          } else {
            vacReq.status = "pending";
            vacReq.approved = false;
          }
          await vacReq.save();
        }
      }

      const user = await User.findByIdAndUpdate(req.user._id, {
        $pull: {
          archivedProjects: projectToUnarchive._id,
        },
      });

      res.status(200).json({ projectToUnarchive, result: intent });
    } else if (intent === "change-freeze-state") {
      if (freeze === "true") {
        projectToUpdate.inWork = false;
        for (const userId of projectToUpdate.users) {
          const user = await User.findById(userId);
          user.recievedNotifications.push(
            `/projects?intent=project:${projectToUpdate.title}-freeze`
          );
          await user.save();
          channel.publish(
            `/projects?intent=project:${projectToUpdate.title}-freeze`,
            `project-freeze-notification${user._id}`
          );
        }
      } else {
        projectToUpdate.inWork = true;
        for (const userId of projectToUpdate.users) {
          const user = await User.findById(userId);
          user.recievedNotifications.push(
            `/projects?intent=project:${projectToUpdate.title}-unfreeze`
          );
          await user.save();
          channel.publish(
            `/projects?intent=project:${projectToUpdate.title}-unfreeze`,
            `project-unfreeze-notification${user._id}`
          );
        }
      }
      await projectToUpdate.save();
      // Notifications to send to all users of the project to highligh that the project is not in work

      res.status(200).json({ projectToUpdate, result: intent });
    }
  } catch (error) {
    console.log("patch error", error.message);
    res.status(error.status || 400).json({ errors: error.message });
  }
};

const deleteProject = async (req, res) => {
  console.log("in delete route handler");
  const { intent } = req.body;
  const { projectId } = req.params;
  const { _id: userId } = req.user;
  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    return res.status(404).json({ error: "No such project" });
  }
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(404).json({ error: "Invalid user id" });
  }
  try {
    const currentUser = await User.findById(userId);
    const projectToDelete = await Project.findById(projectId);
    if (projectToDelete.owner._id.toString() !== userId.toString()) {
      return res
        .status(401)
        .json({ error: "Not authorised to delete project" });
    }
    if (!projectToDelete.archived) {
      return res
        .status(401)
        .json({ error: "Project must be archived before deletion" });
    }
    const project = await Project.findByIdAndDelete(projectId).populate(
      "vacationRequests"
    );
    // if (!project) {
    //   return res.status(404).json({ error: "No such project" });
    // }
    // post project delete/archive clean-up:
    // 1. remove deleted project from user.projects
    // 2.
    for (const decendentGroup in project.descendentsAtArchive) {
      for (const docId of project.descendentsAtArchive[decendentGroup]) {
        const Model = {
          Review,
          ReviewObjective,
          ReviewAction,
          Comment,
          Task,
          Reply,
        }[decendentGroup];
        // if (decendentGroup === "Task") {
        //   const task = await Task.findById(docId).populate([
        //     // "user",
        //     "secondaryUsers",
        //   ]);
        //   // await task.user.updateOne({ $pull: { tasks: docId } });
        //   // const user = await task.user.populate([
        //   //   "tasks",
        //   //   "vacationRequests",
        //   //   "secondaryTasks",
        //   // ]);
        //   // await resyncUserAndVacs(user);
        //   // await user.save();
        //   if (task.secondaryUsers?.length > 0) {
        //     for (let secUser of task.secondaryUsers) {
        //       await secUser
        //         .updateOne({ $pull: { secondaryTasks: docId } })
        //         .populate(["tasks", "vacationRequests", "secondaryTasks"]);

        //       // const storedSecUser = await User.findById(secUser._id).populate([
        //       //   "tasks",
        //       //   "vacationRequests",
        //       //   "secondaryTasks",
        //       // ]);
        //       await resyncUserAndVacs(storedSecUser);
        //       await secUser.save();
        //     }
        //   }
        // }
        await Model.findByIdAndDelete(docId);
      }
    }
    // currentUser.projects = currentUser.projects.filter(
    //   (project) => project.toString() !== projectId
    // );
    // await currentUser.save();
    await currentUser.updateOne({
      $pull: { projects: project._id, archivedProjects: project._id },
    });
    for (const userId of project.users) {
      await User.updateOne(
        { _id: userId },
        { $pull: { userInProjects: project._id } }
      );
    }
    // remove project from relevant vacations
    if (project.vacationRequests.length > 0) {
      for (const vacationRequest of project.vacationRequests) {
        vacationRequest.projects = vacationRequest.projects.filter(
          (p) => p.toString() !== project._id.toString()
        );
        await vacationRequest.save();
      }
    }
    res.status(200).json({ project, result: intent });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

const getLocalMSProject = async (req, res) => {
  console.log("in export local project for MS Project update");
  // Return object with following format:
  // {
  //    projectGUID: String,
  //    exportDate: Date,
  //    tasks: [
  //              {
  //                GUID: String,
  //                percentageComplete: Number,
  //                Description: String
  //              }, ....
  //           ]
  // }
};

module.exports = {
  getAllProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
};
