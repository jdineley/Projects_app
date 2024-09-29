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

async function msProjectUpdate(
  projectToUpdate,
  // msProjObj,
  projectMapped,
  currentUser,
  originalFileName
) {
  // const projectMapped = rawMapMsProjToNative(
  //   msProjObj,
  //   currentUser._id,
  //   currentUser.email
  // );
  const { title, owner, users, start, end, tasks } = projectMapped;
  // console.log(projectToUpdate);
  // look up mongoose document.update() method???
  projectToUpdate.title = title;
  projectToUpdate.start = new Date(start);
  projectToUpdate.end = new Date(end);
  projectToUpdate.file = originalFileName;
  projectToUpdate.inWork = true;
  // projectToUpdate.fileJSON = JSON.stringify(msProjObj);

  //   iterate tasks..
  for (const task of tasks) {
    const {
      GUID,
      UID,
      title,
      description,
      daysToComplete,
      deadline,
      startDate,
      user,
      secondaryUsers,
      milestone,
    } = task;

    const storedUser = await User.findOne({ email: user }).populate([
      "tasks",
      "vacationRequests",
      "secondaryTasks",
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
      await createTaskUtil({ task, projectToUpdate, storedUser, currentUser });
      continue;
    }

    taskToUpdate.title = title;
    taskToUpdate.description = description;
    // taskToUpdate.daysToComplete = daysToComplete;
    taskToUpdate.deadline = new Date(deadline);
    taskToUpdate.startDate = new Date(startDate);
    taskToUpdate.milestone = milestone;
    // update taskToUpdate.user, taskToUpdate.secondaryUsers[]..
    if (taskToUpdate.user.toString() !== storedUser._id.toString()) {
      console.log(`task ${taskToUpdate.title} has changed user`);
      const prevUser = await User.findById(taskToUpdate.user).populate([
        "tasks",
        "vacationRequests",
        "secondaryTasks",
      ]);
      prevUser.tasks = prevUser.tasks.filter(
        (t) => t._id.toString() !== taskToUpdate._id.toString()
      );
      taskToUpdate.user = storedUser._id;
      storedUser.tasks.push(taskToUpdate);
      // NOTIFICATION here:
      // prev user:
      if (projectToUpdate.owner.toString() !== prevUser._id.toString()) {
        prevUser.recievedNotifications.push(
          `/projects/${projectToUpdate._id}?taskId=${taskToUpdate._id}&projectTitle=${projectToUpdate.title}&intent=task-owner-change`
        );
        channel.publish(
          `/projects/${projectToUpdate._id}?taskId=${taskToUpdate._id}&projectTitle=${projectToUpdate.title}&intent=task-owner-change`,
          `task-owner-change${prevUser._id}`
        );
      }
      // storedUser:
      if (projectToUpdate.owner.toString() !== storedUser._id.toString()) {
        storedUser.recievedNotifications.push(
          `/projects/${projectToUpdate._id}?taskId=${taskToUpdate._id}&projectTitle=${projectToUpdate.title}&intent=new-task`
        );
        channel.publish(
          `/projects/${projectToUpdate._id}?taskId=${taskToUpdate._id}&projectTitle=${projectToUpdate.title}&intent=new-task`,
          `new-task-notification${storedUser._id}`
        );
      }

      await resyncUserAndVacs(prevUser);
      await prevUser.save();
      await resyncUserAndVacs(storedUser);
      await storedUser.save();
    }

    const noNewSecondaryUsers =
      taskToUpdate.secondaryUsers.length > 0
        ? taskToUpdate.secondaryUsers
            .map((u) => u.email)
            .reduce((acc, cur) => {
              if (!acc) {
                return false;
              }
              if (task.secondaryUsers.includes(cur)) return true;
              else return false;
            }, true)
        : task.secondaryUsers.length > 0
        ? false
        : true;

    if (noNewSecondaryUsers) {
      // find array diff between taskToUpdate.secondaryUsers[] & task.secondaryUsers[]
      if (taskToUpdate.secondaryUsers.length > task.secondaryUsers.length) {
        console.log(`task ${taskToUpdate.title} has removed secondary users`);
        const removedSecondaryUsersArry = taskToUpdate.secondaryUsers
          .map((u) => u.email)
          .reduce((acc, cur) => {
            if (!task.secondaryUsers.includes(cur)) {
              console.log(
                `${cur} has been removed as a secondary users to task ${taskToUpdate.title}`
              );
              acc.push(cur);
            }
            return acc;
          }, []);
        // update each secondaryUser.secondaryTasks[]
        for (const secondaryUser of removedSecondaryUsersArry) {
          const user = await User.find({ email: secondaryUser }).populate([
            "tasks",
            "vacationRequests",
            "secondaryTasks",
          ]);
          user.secondaryTasks = user.secondaryTasks.filter(
            (t) => t._id.toString() !== taskToUpdate._id.toString()
          );
          await resyncUserAndVacs(user);
          await user.save();
        }
        // update taskToUpdate.secondaryUsers[]
        const newSecondaryUsersIds = [];
        for (const user of task.secondaryUsers) {
          const storedUser = await User.find({ email: user });
          newSecondaryUsersIds.push(storedUser._id);
        }
        taskToUpdate.secondaryUsers = newSecondaryUsersIds;
        // await taskToUpdate.save();
      }
    } else {
      console.log(`task ${taskToUpdate.title} has new secondary users`);
      const newSecondaryUsersArray = task.secondaryUsers.reduce((acc, cur) => {
        if (!taskToUpdate.secondaryUsers.map((u) => u.email).includes(cur)) {
          acc.push(cur);
        }
        return acc;
      }, []);
      // update taskToUpdate.secondaryUsers[]
      // update each secondaryUser.secondaryTasks[]
      for (const secondaryUser of newSecondaryUsersArray) {
        const user = await User.findOne({ email: secondaryUser }).populate([
          "tasks",
          "vacationRequests",
          "secondaryTasks",
        ]);
        // console.log("user", user);
        taskToUpdate.secondaryUsers = taskToUpdate.secondaryUsers || [];
        taskToUpdate.secondaryUsers.push(user._id);
        user.secondaryTasks = user.secondaryTasks || [];
        user.secondaryTasks.push(taskToUpdate);
        await resyncUserAndVacs(user);
        await user.save();
      }
    }

    await taskToUpdate.save();
  }

  await resyncProjTasksUsersVacs(projectToUpdate);
  await projectToUpdate.save();

  // because new tasks have been potentially created a new loop through the task from the msProjObj should now happen:
  for (const task of tasks) {
    await updateTaskDepsUtil(task);
  }

  for (const userId of projectToUpdate.users) {
    // console.log("user", user);
    // add general MS Project updated notification logic
    const user = await User.findById(userId);
    console.log("user", user);
    user.recievedNotifications.push(
      `/projects/${projectToUpdate._id}?projectTitle=${projectToUpdate.title}&intent=MS-Project-Resync`
    );

    await user.save();

    channel.publish(
      `/projects/${projectToUpdate._id}?projectTitle=${projectToUpdate.title}&intent=MS-Project-Resync`,
      `ms-project-resync${user._id}`
    );
  }
  // DO IT HERE TO MAKE IT WORK FOR NOW...  FIX THE PROJECT PRESAVE HOOK
  // await projectToUpdate.save();
}

module.exports = { msProjectUpdate };
