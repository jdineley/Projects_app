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
  msProjObj,
  currentUser,
  originalFileName
) {
  const projectMapped = rawMapMsProjToNative(msProjObj, currentUser._id);
  const { title, owner, users, start, end, tasks } = projectMapped;
  // console.log(projectToUpdate);
  // look up mongoose document.update() method???
  projectToUpdate.title = title;
  projectToUpdate.start = new Date(start);
  projectToUpdate.end = new Date(end);
  projectToUpdate.file = originalFileName;

  //   iterate tasks..
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
    } = task;

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
        { task, projectToUpdate, storedUser, currentUser }
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
      // await resyncUserAndVacs(storedUser);
      // await storedUser.save();
      continue;
    }

    taskToUpdate.title = title;
    taskToUpdate.description = description;
    taskToUpdate.daysToComplete = daysToComplete;
    taskToUpdate.deadline = new Date(deadline);
    // update taskToUpdate.user, taskToUpdate.secondaryUsers[]..
    if (taskToUpdate.user.toString() !== storedUser._id.toString()) {
      console.log(`task ${taskToUpdate.title} has changed user`);
      const prevUser = await User.findById(taskToUpdate.user).populate("tasks");
      prevUser.tasks = prevUser.tasks.filter(
        (t) => t._id.toString() !== taskToUpdate._id.toString()
      );
      taskToUpdate.user = storedUser._id;
      // NOTIFICATION here:
      await resyncUserAndVacs(prevUser);
      await prevUser.save();
    }

    // console.log(
    //   `task ${title}; secondaryUsers ${
    //     secondaryUsers.length > 0 ? secondaryUsers.map((u) => `${u}`) : "none"
    //   }`
    // );

    // console.log("taskToUpdate", taskToUpdate);

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
                `${cur} has been removed as a sondary users to task ${taskToUpdate.title}`
              );
              acc.push(cur);
            }
            return acc;
          }, []);
        // update each secondaryUser.secondaryTasks[]
        for (const secondaryUser of removedSecondaryUsersArry) {
          const user = await User.find({ email: secondaryUser }).populate(
            "secondaryTasks"
          );
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
        const user = await User.findOne({ email: secondaryUser }).populate(
          "tasks"
        );
        console.log("user", user);
        taskToUpdate.secondaryUsers = taskToUpdate.secondaryUsers || [];
        taskToUpdate.secondaryUsers.push(user._id);
        user.secondaryTasks = user.secondaryTasks || [];
        user.secondaryTasks.push(taskToUpdate._id);
        await resyncUserAndVacs(user);
        await user.save();
      }
      // await taskToUpdate.save();
    }

    // if (
    //   taskToUpdate.secondaryUsers.length !== task.secondaryUsers.length ||
    //   (taskToUpdate.secondaryUsers.length === task.secondaryUsers.length &&
    //     !noNewSecondaryUsers)
    // ) {
    //   console.log(`task ${taskToUpdate.title} has changed secondary users`);
    //   // loop taskToUpdate.secondayUsers[]...
    //   // - reset taskToUpdate.secondayUsers[]
    //   // - to add or remove relevant task from user.secondaryTasks[]
    //   let secdUsrs = [];
    //   for (const secondUser of task.secondaryUsers) {
    //     const user = await User.find({ email: secondUser });
    //     secdUsrs.push(user);
    //     if (
    //       // new secondary users added..
    //       !taskToUpdate.secondaryUsers.map((u) => u.email).includes(secondUser)
    //     ) {
    //       // remove task from user.secondaryTasks[]
    //       // user.secondaryTasks = user.secondaryTasks.filter(
    //       //   (t) => t.toString() !== taskToUpdate._id.toString()
    //       // );
    //       console.log(`secondary users added: ${secondUser}`);
    //       user.secondaryTasks.push(taskToUpdate._id);
    //     }
    //     await resyncUserAndVacs(user);
    //     await user.save();

    //     // notify user of their removal from the task collaboration
    //     console.log(
    //       `${secondUser.email} has been removed from task ${taskToUpdate.title}`
    //     );
    //   }
    //   taskToUpdate.secondaryUsers = secdUsrs;
    // }

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

  for (const userId of projectToUpdate.users) {
    // console.log("user", user);
    // add general MS Project updated notification logic
    const user = await User.findById(userId);
    // user.recievedNotifications.push(
    //   `/projects/${projectToUpdate._id}?user=${projectToUpdate.owner.email}&projectTitle=${projectToUpdate.title}&intent=MS-Project-Resync`
    // );
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
