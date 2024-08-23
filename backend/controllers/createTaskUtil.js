//models
const User = require("../models/User");
const Task = require("../models/Task");

const { channel } = require("../routes/v1/sse");

async function createTaskUtil({ task, ...rest }) {
  // GUID,
  // UID,
  // title,
  // description,
  // daysToComplete,
  // deadline,
  // storedUser,
  // projectToUpdate,
  // currentUser
  console.log("in create task utility");
  const { GUID, UID, title, description, daysToComplete, deadline } = task;
  const { storedUser, newProject, currentUser, projectToUpdate } = rest;
  const newTask = await Task.create({
    title,
    description,
    daysToComplete,
    deadline: new Date(deadline),
    msProjectGUID: GUID,
    msProjectUID: UID,
    user: storedUser._id,
    project: projectToUpdate?._id || newProject?._id,
    description,
  });
  // All users with new tasks to have these tasks added to their .tasks[]
  storedUser.tasks.push(newTask);
  // await storedUser.save();
  if (newTask.user.toString() !== currentUser._id.toString()) {
    storedUser.recievedNotifications.push(
      `/projects/${newProject?._id || projectToUpdate?._id}?taskId=${
        newTask._id
      }&user=${currentUser.email}&projectTitle=${
        newProject?.title || projectToUpdate?.title
      }&intent=new-task`
    );
    // await storedUser.save();

    channel.publish(
      `/projects/${newProject?._id || projectToUpdate?._id}?taskId=${
        newTask._id
      }&user=${currentUser.email}&projectTitle=${
        newProject?.title || projectToUpdate?.title
      }&intent=new-task`,
      `new-task-notification${newTask.user}`
    );
  }
  projectToUpdate?.tasks.push(newTask);
  newProject?.tasks.push(newTask);
}

module.exports = { createTaskUtil };
