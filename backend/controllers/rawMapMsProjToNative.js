const User = require("../models/User");
const Task = require("../models/Task");

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

// I should have a check list that ensures during this mapping phase that certain input criteria are met:
// 1. All tasks (non-summary) must be assigned at least one work resource
// 2. All work resources must have an assigned valid email address
// 3. All assigned predecessors must be non summary
// 4. All summary tasks shouldn't have a resource assigned (as a good practice to drive responsibility on actual tasks)
const delay = (time) => {
  return new Promise((res) => {
    setTimeout(res, time);
  });
};

async function rawMapMsProjToNative(msProjObj, userId, userEmail) {
  // await delay(4000);
  const projectMapped = {
    title: msProjObj.Project.Title[0],
    owner: userId.toString(),
    users: [],
    start: new Date(msProjObj.Project.StartDate[0]),
    end: new Date(msProjObj.Project.FinishDate[0]),
    tasks: [],
    msProjectGUID: msProjObj.Project.GUID[0],
  };
  console.log("userEmail", userEmail);
  // populate tasks[] except user & dependencies
  for (const msTask of msProjObj.Project.Tasks[0].Task) {
    const task = {};
    if (msTask.Summary[0] === "0") {
      task.GUID = msTask.GUID[0];
      task.UID = msTask.UID[0];
      task.title = msTask.Name[0];
      task.description = msTask.Notes ? msTask.Notes[0] : "TBD";
      // Duration: ['PT160H0M0S']:
      // extract hours -
      const workHIndex = msTask.Duration[0].indexOf("H");
      const daysToComplete = Math.ceil(
        Number(msTask.Duration[0].slice(2, workHIndex)) / 8
      );
      task.daysToComplete = daysToComplete;
      task.deadline = new Date(msTask.Finish[0]);
      task.startDate = new Date(msTask.Start[0]);
      task.milestone = msTask.Milestone[0] === "0" ? false : true;
      // populate dependencies with taskUID:
      if (msTask.PredecessorLink?.length > 0) {
        task.dependencies = [];
        msTask.PredecessorLink.forEach((preLink) => {
          task.dependencies.push(preLink.PredecessorUID[0]);
        });
      }
      task.secondaryUsers = [];
      projectMapped.tasks.push(task);
      // task = {};
    }
  }
  // console.log("projectMapped", projectMapped);
  const taskUIDArray = projectMapped.tasks.map((task) => task.UID);
  const taskToResourceMapUID = [];
  // [{TaskUID: '2', ResourceUID: '1'}]
  for (const assignment of msProjObj.Project.Assignments[0].Assignment) {
    const taskToResourceUID = {};
    if (taskUIDArray.includes(assignment.TaskUID[0])) {
      if (assignment.ResourceUID[0] !== "-65535") {
        // check resource is 'Type: 1' work resource
        // only pick up the Work based resources
        const targetResource = msProjObj.Project.Resources[0].Resource.find(
          (r) => r.UID[0] === assignment.ResourceUID[0]
        );
        if (targetResource.Type[0] === "1") {
          taskToResourceUID.TaskUID = assignment.TaskUID[0];
          taskToResourceUID.ResourceUID = assignment.ResourceUID[0];
          // console.log("£££££", taskToResourceUID);
          taskToResourceMapUID.push(taskToResourceUID);
        }
      } else {
        // task hasn't been assigned a resource

        // const unAssignedTask = projectMapped.tasks.find(
        //   (el) => el.UID === assignment.TaskUID[0]
        // );
        // console.log(unAssignedTask);
        // if (!unAssignedTask.milestone) {
        //   throw Error(
        //     `TASK: ${unAssignedTask.title} has not been assigned a user.  Update MS Project plan so that all tasks are assigned a responsible user`
        //   );
        // }
        taskToResourceUID.TaskUID = assignment.TaskUID[0];
        taskToResourceUID.ResourceUID = "PM";
        taskToResourceMapUID.push(taskToResourceUID);
      }
    }
    // taskToResourceUID = {};
  }
  // console.dir(taskToResourceMapUID);
  // console.log(JSON.stringify(taskToResourceMapUID, null, 4));
  console.log("@taskToResourceMapUID");

  const taskToResourceMapGUIDToEmail = [];
  // [{resourceEmail: 'willy@mail.com', taskGUID: "ffds-454235-%%$566"}]
  for (const mapping of taskToResourceMapUID) {
    const taskToResourceGUIDToEmail = {};
    for (const resource of msProjObj.Project.Resources[0].Resource) {
      if (resource.UID[0] === mapping.ResourceUID) {
        taskToResourceGUIDToEmail.resourceEmail = resource.EmailAddress[0];
      } else if (mapping.ResourceUID === "PM") {
        taskToResourceGUIDToEmail.resourceEmail = userEmail;
      }
    }
    for (const task of msProjObj.Project.Tasks[0].Task) {
      if (task.UID[0] === mapping.TaskUID) {
        taskToResourceGUIDToEmail.taskGUID = task.GUID[0];
      }
    }
    taskToResourceMapGUIDToEmail.push(taskToResourceGUIDToEmail);
    // taskToResourceGUIDToEmail = {};
  }

  // console.log("taskToResourceMapGUIDToEmail", taskToResourceMapGUIDToEmail);
  console.log("@taskToResourceMapGUIDToEmail");

  // Check:
  // 1. If emails are valid
  // 2. All predecessors are non-summary

  // 1.
  const emailsAssigned = taskToResourceMapGUIDToEmail
    .map((el) => el.resourceEmail)
    .filter((el, i, ar) => ar.indexOf(el) === i);

  const noAccountUsers = [];
  for (const email of emailsAssigned) {
    const storedUser = await User.findOne({ email });
    if (!storedUser) {
      noAccountUsers.push(email);
    }
  }
  if (noAccountUsers.length > 0) {
    throw {
      errors: `${noAccountUsers.map(
        (u) => " " + u
      )} do not have valid accounts. Please correct typos and/or ensure email is associated with a valid account before attempting to upload`,
    };
  }

  // populate projectMapped.tasks[] with user(email)
  // Change projectMapped.tasks.dependencies[] from UID to GUID
  projectMapped.tasks.forEach((task, i, arr) => {
    // Check if multiple users on same task:
    const taskToResourceArray = taskToResourceMapGUIDToEmail.filter((map) => {
      if (map.taskGUID === task.GUID) return map;
    });
    // console.log("taskToResourceArray", taskToResourceArray);
    // const matchedTask = taskToResourceMapGUIDToEmail.find(
    //   (map) => map.taskGUID === task.GUID
    // );
    // if (!matchedTask.resourceEmail) {
    //   throw Error(
    //     `${task.title} has not been assigned a user.  Update MS Project plan so that all tasks are assigned a responsible user`
    //   );
    // }
    // if (taskToResourceArray.length === 0) {
    //   throw Error(
    //     `${task.title} has not been assigned a user.  Update MS Project plan so that all tasks are assigned a responsible user`
    //   );
    // }
    // arr[i].user = matchedTask.resourceEmail;
    arr[i].user = taskToResourceArray[0].resourceEmail;

    // check if multiple users to one project
    // then add the secondary users to task.secondaryUsers[]
    if (taskToResourceArray.length > 1) {
      taskToResourceArray.shift();
      taskToResourceArray.forEach((taskRes) => {
        // arr[i].secondaryUsers.push(taskRes.resourceEmail);

        if (!arr[i].secondaryUsers.includes(taskRes.resourceEmail)) {
          arr[i].secondaryUsers.push(taskRes.resourceEmail);
        }
      });
    }

    if (task.dependencies) {
      task.dependencies.forEach((dep, i, arr) => {
        arr[i] = msProjObj.Project.Tasks[0].Task.find(
          (task) => task.UID[0] === dep
        ).GUID[0];
      });
    }
  });

  // populate projectMapped.users[]
  const userMembers = projectMapped.tasks
    .map((t) => t.user)
    .filter((u) => u !== userEmail)
    // .filter((user) => user !== undefined)   unecessary with user error handling above
    .filter((user, i, ar) => ar.indexOf(user) === i);
  projectMapped.users = userMembers;

  // console.dir(projectMapped, { depth: null });

  const { tasks } = projectMapped;

  // 2. All predecessors are non-summary
  const unknownPredecessors = [];
  for (const task of tasks) {
    const { dependencies } = task;
    console.log("dependencies", dependencies);
    if (dependencies?.length > 0) {
      for (const dep of dependencies) {
        const precedingTask = msProjObj.Project.Tasks[0].Task.find(
          (t) => t.GUID[0] === dep
        );
        const precedingTaskIsSummary = precedingTask.Summary[0] === "1";
        if (precedingTaskIsSummary) {
          const unknownDepTitle = precedingTask.Name[0];
          unknownPredecessors.push(unknownDepTitle);
        }
      }
    }
  }
  if (unknownPredecessors.length > 0) {
    throw {
      errors: `Predecessor task(s) with name(s): ${unknownPredecessors.map(
        (pre) => " " + pre
      )} was/were not found, the likely cause is the task is a summary task.  Please ensure summary tasks are not used as predecessors.`,
    };
  }

  return projectMapped;
}

module.exports = { rawMapMsProjToNative };
