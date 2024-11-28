//models
const User = require("../models/User");
const Task = require("../models/Task");

const { channel } = require("../routes/v1/sse");

// util
const { resyncUserAndVacs } = require("../util");

async function createTaskUtil({ task, ...rest }) {
  console.log("in create task utility");
  console.log(task, rest);
  const {
    GUID,
    UID,
    title,
    description,
    daysToComplete,
    deadline,
    startDate,
    secondaryUsers,
    milestone,
  } = task;
  const {
    storedUser,
    newProject,
    currentUser,
    projectToUpdate,
    isDemo,
    isTest,
  } = rest;
  const secondaryUsersIds = [];
  if (secondaryUsers.length > 0) {
    for (const secondUser of secondaryUsers) {
      const storedSecondUser = await User.findOne({ email: secondUser });
      if (!storedSecondUser) {
        if (projectToUpdate) {
          throw Error(
            `A user with email address ${secondUser} was not found, register the user before importing the msProject`
          );
        }
        // else if(newProject) = remove entire project and start again...
        else if (newProject) {
          // newProject.archived = true;
          // await newProject.save();
          throw {
            errors: `A user with email address ${secondUser} was not found, register the user before importing the msProject`,
            newProjectId: newProject._id,
          };
        }
      }
      secondaryUsersIds.push(storedSecondUser._id);
    }
  }
  const newTask = await Task.create({
    title,
    description,
    daysToComplete,
    deadline: new Date(deadline),
    msProjectGUID: GUID,
    msProjectUID: UID,
    user: storedUser._id,
    project: projectToUpdate?._id || newProject?._id,
    // description,
    startDate: new Date(startDate),
    secondaryUsers: secondaryUsersIds,
    milestone,
    isDemo,
    isTest,
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

  // same for secondaryUsers..
  // add new task to user.secondaryTasks[]
  if (newTask.secondaryUsers.length > 0) {
    for (const secondaryUserId of newTask.secondaryUsers) {
      const secondaryUser = await User.findById(secondaryUserId).populate([
        "tasks",
        "vacationRequests",
        "secondaryTasks",
      ]);
      // console.log("secondaryUser", secondaryUser);
      if (!secondaryUser) {
        if (projectToUpdate) {
          throw Error(
            `Something went wrong trying to find a user with id: ${secondaryUserId}`
          );
        } else if (newProject) {
          // newProject.archived = true;
          // await newProject.save();
          throw {
            errors: `Something went wrong trying to find a user with id: ${secondaryUserId}`,
            newProjectId: newProject._id,
          };
        }
      }
      if (
        !secondaryUser.secondaryTasks
          .map((t) => t._id.toString())
          .includes(newTask._id.toString())
      ) {
        secondaryUser.secondaryTasks.push(newTask);
      }

      // if (newTask.user.toString() !== secondaryUser._id.toString()) {
      if (
        (newProject?.owner.toString() || projectToUpdate.owner.toString()) !==
        secondaryUser._id.toString()
      ) {
        secondaryUser.recievedNotifications.push(
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
          `new-task-notification${secondaryUser._id}`
        );
      }

      await resyncUserAndVacs(secondaryUser);
      await secondaryUser.save();
    }
  }

  projectToUpdate?.tasks.push(newTask);
  newProject?.tasks.push(newTask);

  await resyncUserAndVacs(storedUser);
  await storedUser.save();
}

module.exports = { createTaskUtil };
