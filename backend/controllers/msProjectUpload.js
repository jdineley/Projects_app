//models
const Project = require("../models/Project");
const User = require("../models/User");
const Task = require("../models/Task");

const { rawMapMsProjToNative } = require("./rawMapMsProjToNative");
const { msProjectUpdate } = require("./msProjectUpdate");
const { updateTaskDepsUtil } = require("./updateTaskDepsUtil");
const { createTaskUtil } = require("./createTaskUtil");

// util
const { resyncProjTasksUsersVacs } = require("../util");

async function msProjectUpload(
  msProjObj,
  projectMapped,
  currentUser,
  originalFileName,
  isDemo
) {
  // Loop over projectMapped to create the new project and tasks
  const {
    title,
    owner,
    users,
    start,
    end,
    tasks,
    msProjectGUID,
    secondaryUsers,
  } = projectMapped;

  const createProjObj = {
    title,
    owner,
    start,
    end,
    msProjectGUID,
    file: originalFileName,
    isDemo,
  };
  // console.log("hello", createProjObj);
  const newProject = await Project.create(createProjObj);

  // console.log("newProject", newProject);
  // console.log("newProject.owner", newProject.owner);
  currentUser.projects.push(newProject._id);
  await currentUser.save();

  // loop project.tasks[] to create task, add task to user.tasks[], add task to newProject.tasks[]
  for (const task of tasks) {
    const { user } = task;

    const storedUser = await User.findOne({ email: user, isDemo }).populate([
      "tasks",
      "vacationRequests",
      "secondaryTasks",
    ]);
    if (!storedUser) {
      throw {
        errors: `${user} does not currently have an account, please sign up before importing`,
        newProjectId: newProject._id,
      };
    }

    await createTaskUtil({ task, storedUser, newProject, currentUser, isDemo });
  }
  await newProject.populate([{ path: "tasks", populate: ["secondaryUsers"] }]);
  await resyncProjTasksUsersVacs(newProject);
  await newProject.save();

  // create dependencies array with _ids
  for (const task of tasks) {
    const unknownDepGUID = await updateTaskDepsUtil(task);
    if (unknownDepGUID) {
      const unknownDepTitle = msProjObj.Project.Tasks[0].Task.find(
        (t) => t.GUID[0] === unknownDepGUID
      ).Name[0];
      throw {
        errors: `Predecessor task with name: ${unknownDepTitle} was not found, the likely cause is this task is a summary task.  Please ensure summary tasks are not used as predecessors.`,
        newProjectId: newProject._id,
      };
    }
  }
  return newProject;
}

module.exports = { msProjectUpload };
