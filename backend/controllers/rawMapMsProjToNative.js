function rawMapMsProjToNative(msProjObj, userId) {
  const projectMapped = {
    title: msProjObj.Project.Title[0],
    owner: userId.toString(),
    users: [],
    start: new Date(msProjObj.Project.StartDate[0]),
    end: new Date(msProjObj.Project.FinishDate[0]),
    tasks: [],
    msProjectGUID: msProjObj.Project.GUID[0],
  };

  // populate tasks[] except user & dependencies
  for (const msTask of msProjObj.Project.Tasks[0].Task) {
    const task = {};
    if (msTask.Summary[0] === "0") {
      task.GUID = msTask.GUID[0];
      task.UID = msTask.UID[0];
      task.title = msTask.Name[0];
      task.description = msTask.Notes ? msTask.Notes[0] : "TBD";
      // Work: ['PT160H0M0S']:
      // extract hours -
      const workHIndex = msTask.Work[0].indexOf("H");
      const daysToComplete = Math.ceil(
        Number(msTask.Work[0].slice(2, workHIndex)) / 8
      );
      task.daysToComplete = daysToComplete;
      task.deadline = new Date(msTask.Finish[0]);
      // populate dependencies with taskUID:
      if (msTask.PredecessorLink?.length > 0) {
        task.dependencies = [];
        msTask.PredecessorLink.forEach((preLink) => {
          task.dependencies.push(preLink.PredecessorUID[0]);
        });
      }
      projectMapped.tasks.push(task);
      // task = {};
    }
  }

  const taskToResourceMapUID = [];
  // [{TaskUID: '2', ResourceUID: '1'}]
  for (const assignment of msProjObj.Project.Assignments[0].Assignment) {
    const taskToResourceUID = {};
    if (
      projectMapped.tasks
        .map((task) => task.UID)
        .includes(assignment.TaskUID[0])
    ) {
      taskToResourceUID.TaskUID = assignment.TaskUID[0];
      taskToResourceUID.ResourceUID = assignment.ResourceUID[0];
      // console.log("£££££", taskToResourceUID);
      taskToResourceMapUID.push(taskToResourceUID);
    }
    // taskToResourceUID = {};
  }
  console.log("taskToResourceMapUID", taskToResourceMapUID);

  const taskToResourceMapGUIDToEmail = [];
  // [{resourceEmail: 'willy@mail.com', taskGUID: "ffds-454235-%%$566"}]
  for (const mapping of taskToResourceMapUID) {
    const taskToResourceGUIDToEmail = {};
    for (const resource of msProjObj.Project.Resources[0].Resource) {
      if (resource.UID[0] === mapping.ResourceUID) {
        taskToResourceGUIDToEmail.resourceEmail = resource.EmailAddress[0];
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

  console.log("taskToResourceMapGUIDToEmail", taskToResourceMapGUIDToEmail);

  // populate projectMapped.tasks[] with user(email)
  // Change projectMapped.tasks.dependencies[] from UID to GUID
  projectMapped.tasks.forEach((task, i, arr) => {
    const matchedTask = taskToResourceMapGUIDToEmail.find(
      (map) => map.taskGUID === task.GUID
    );
    arr[i].user = matchedTask.resourceEmail;
    if (!matchedTask.resourceEmail) {
      throw Error(
        `${task.title} has not been assigned a user.  Update MS Project plan so that all tasks are assigned a responsible user`
      );
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
    // .filter((user) => user !== undefined)   unecessary with user error handling above
    .filter((user, i, ar) => ar.indexOf(user) === i);
  projectMapped.users = userMembers;

  console.dir(projectMapped, { depth: null });

  return projectMapped;
}

module.exports = { rawMapMsProjToNative };
