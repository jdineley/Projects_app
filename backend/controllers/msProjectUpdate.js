//models
const Project = require("../models/Project");
const User = require("../models/User");
const Task = require("../models/Task");

const { rawMapMsProjToNative } = require("./rawMapMsProjToNative");
const { createTaskUtil } = require("./createTaskUtil");
const { updateTaskDepsUtil } = require("./updateTaskDepsUtil");

// util
const { resyncUserAndVacs, resyncProjTasksUsersVacs } = require("../util");

const { channel } = require("../routes/v1/sse");

async function msProjectUpdate(projectToUpdate, msProjObj, currentUser) {
  const projectMapped = rawMapMsProjToNative(msProjObj, currentUser._id);
  const { title, owner, users, start, end, tasks } = projectMapped;
  console.log(projectToUpdate);
  // look up mongoose document.update() method???
  projectToUpdate.title = title;
  projectToUpdate.start = new Date(start);
  projectToUpdate.end = new Date(end);

  //   iterate tasks..
  for (const task of tasks) {
    const { GUID, UID, title, description, daysToComplete, deadline, user } =
      task;

    const storedUser = await User.findOne({ email: user }).populate([
      "tasks",
      "vacationRequests",
    ]);
    if (!storedUser) {
      throw Error(
        `${user} does not currently have an account, please sign up before importing`
      );
    }
    const taskToUpdate = projectToUpdate.tasks.find(
      (t) => t.msProjectGUID === GUID
    );

    if (!taskToUpdate) {
      // create new task
      await createTaskUtil(
        { task, projectToUpdate, storedUser }
        // GUID,
        // UID,
        // title,
        // description,
        // daysToComplete,
        // deadline,
        // storedUser,
        // projectToUpdate
      );
      // await updateTaskDepsUtil(task);
      await resyncUserAndVacs(storedUser);
      await storedUser.save();
    }

    taskToUpdate.title = title;
    taskToUpdate.description = description;
    task.daysToComplete = daysToComplete;
    task.deadline = new Date(deadline);
    await taskToUpdate.save();

    // if(projectToUpdate.tasks.map(t => t.msProjectUID).includes(GUID)) {
    // }
  }

  await resyncProjTasksUsersVacs(projectToUpdate);
  await projectToUpdate.save();

  // because new tasks have been potentially created a new loop through the task from the msProjObj should now happen:
  for (const task of tasks) {
    await updateTaskDepsUtil(task);
  }

  // THHIS SHOULD BE HERE!  BUT THE PRESAVE HOOK ISN'T WORKING BACAUSE THE DOCUMENT IN POPULATED, WHICH SCREWS UP THE PREHOOK
  // await projectToUpdate.save();

  for (const user of projectToUpdate.users) {
    console.log("user", user);
    // add general MS Project updated notification logic
    user.recievedNotifications.push(
      `/projects/${projectToUpdate._id}?user=${projectToUpdate.owner.email}&projectTitle=${projectToUpdate.title}&intent=MS-Project-Resync`
    );
    // user.recentReceivedTasks.push(
    //   `/projects/${projectId}?taskId=${task._id}&user=${req.user.email}&projectTitle=${project.title}&intent=new-task`
    // );
    await user.save();

    channel.publish(
      `/projects/${projectToUpdate._id}?user=${projectToUpdate.owner.email}&projectTitle=${projectToUpdate.title}&intent=MS-Project-Resync`,
      `ms-project-resync${user._id}`
    );
  }
  // DO ITS HERE TO MAKE IT WORK FOR NOW...  FIX THE PROJECT PRESAVE HOOK
  // await projectToUpdate.save();
}

module.exports = { msProjectUpdate };
