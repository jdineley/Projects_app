//models
const Project = require("../models/Project");
const User = require("../models/User");
const Task = require("../models/Task");

const { rawMapMsProjToNative } = require("./rawMapMsProjToNative");
const { msProjectUpdate } = require("./msProjectUpdate");
const { updateTaskDepsUtil } = require("./updateTaskDepsUtil");
const { createTaskUtil } = require("./createTaskUtil");

// util
const { resyncUserAndVacs, resyncProjTasksUsersVacs } = require("../util");

// I need to map the xml object into a useable form:
// project: {
// title: string,
// owner: _id,
// users: [emails], ****could get this from tasks[]*****
// start: Date,
// end: Date,
// msProjectGUID: string
// secondaryUsers: [emails]
// tasks: [{
//  GUID: GUID
//  UID: UID
//  title: string,
//  description: string,
//  daysToComplete: Number,
//  user: email,
//  deadline: Date,
//  dependencies: [GUID],
//  secondaryUsers: [emails]
// }]
// }

async function msProjectUpload(msProjObj, currentUser, originalFileName) {
  if (msProjObj.Project.$.xmlns !== "http://schemas.microsoft.com/project") {
    throw Error("invalid ms Project xml type");
  }

  const existingProject = await Project.findOne({
    msProjectGUID: msProjObj.Project.GUID[0],
  }).populate(["owner", "tasks"]);
  // console.log("existing Project ID", existingProject.owner._id, currentUser);
  if (existingProject) {
    //logic to update the existing project
    // console.log("the imported file has previously been added to Projects");
    if (existingProject.owner._id.toString() !== currentUser._id) {
      throw Error(
        `This MS Project is already being actively managed by ${existingProject.owner.email}`
      );
    }
    throw Error(
      `You have already uploaded ${existingProject.title}.  If you wish to update changes use edit project`
    );
    // return msProjectUpdate(existingProject, msProjObj, userId);
  }

  const projectMapped = rawMapMsProjToNative(
    msProjObj,
    currentUser._id,
    currentUser.email
  );

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
    fileJSON: JSON.stringify(msProjObj),
  };
  // console.log("hello", createProjObj);
  const newProject = await Project.create(createProjObj);
  // console.log("newProject", newProject);
  // console.log("newProject.owner", newProject.owner);
  currentUser.projects.push(newProject._id);
  await currentUser.save();

  // loop project.tasks[] to create task, add task to user.tasks[], add task to newProject.tasks[]
  for (const task of tasks) {
    const {
      GUID,
      UID,
      title,
      description,
      daysToComplete,
      deadline,
      user,
      secondaryUsers,
      milestone,
    } = task;

    let storedUser = await User.findOne({ email: user }).populate([
      "tasks",
      "vacationRequests",
      "secondaryTasks",
    ]);
    if (!storedUser && !milestone) {
      throw Error(
        `${user} does not currently have an account, please sign up before importing`
      );
    } else if (!storedUser && milestone) {
      storedUser = currentUser;
    }
    await createTaskUtil({ task, storedUser, newProject, currentUser });
  }

  await resyncProjTasksUsersVacs(newProject);
  await newProject.save();

  // create dependencies array with _ids
  for (const task of tasks) {
    updateTaskDepsUtil(task);
    // const taskStored = await Task.findOne({ msProjectGUID: task.GUID });
    // const { dependencies } = task;
    // if (dependencies?.length > 0) {
    //   for (const dep of dependencies) {
    //     const precedingTask = await Task.findOne({ msProjectGUID: dep });
    //     console.log("world", precedingTask);
    //     taskStored.dependencies.push(precedingTask._id);
    //   }
    //   await taskStored.save();
    // }
  }

  // The project manager (current user) .projects[newProject._id]
  // const projOwner = await User.findById(userId.toString());
}

module.exports = { msProjectUpload };
