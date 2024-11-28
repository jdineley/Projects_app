import { differenceInBusinessDays, isWithinInterval, addDays } from "date-fns";
import xml2js from "xml2js";
// import { useRevalidator } from "react-router-dom";
import { toast } from "react-toastify";

// constants
const mobileScreenWidth = "(max-width:500px)";
const tabletScreenWidth = "(max-width:900px)";

function calculatePercentProjectComplete(project) {
  if (project.tasks.length > 0) {
    const totalProjectDays = project.tasks.reduce((acc, cur) => {
      return acc + cur.daysToComplete;
    }, 0);
    const totalDaysCompleted = project.tasks.reduce((acc, cur) => {
      return acc + (cur.percentageComplete * cur.daysToComplete) / 100;
    }, 0);
    return Math.floor((totalDaysCompleted / totalProjectDays) * 100);
  } else {
    return null;
  }
}

function percentOfTotalTime(bigStart, bigEnd, smallStart, smallEnd) {
  return (
    ((new Date(smallEnd).getTime() - new Date(smallStart).getTime()) * 100) /
    (new Date(bigEnd).getTime() - new Date(bigStart).getTime())
  );
}

function datePercentBetweenDates(startDate, endDate, date) {
  const timeSinceStart =
    new Date(date).getTime() - new Date(startDate).getTime();
  const totalProjectTime =
    new Date(endDate).getTime() - new Date(startDate).getTime();

  return Math.floor((timeSinceStart / totalProjectTime) * 100);
}
function currentDatePercentBetweenDates(startDate, endDate) {
  return datePercentBetweenDates(startDate, endDate, Date.now());
}

function uxFriendlyRemaimingDuration(date) {
  const daysRemaining = Math.floor(
    (new Date(date) - Date.now()) / (1000 * 60 * 60 * 24)
  );
  let message;

  switch (true) {
    case daysRemaining < 28:
      message = `${daysRemaining} days left`;
      break;
    case daysRemaining >= 28 && daysRemaining <= 182:
      message = `${Math.floor(daysRemaining / 7)} weeks left`;
      break;
    case daysRemaining > 182:
      message = `${Math.floor(daysRemaining / 30)} months left`;
      break;
  }

  return message;
}

const generateRandomNumber = (maxNum) => {
  return Math.floor(Math.random() * maxNum);
};

function generateRandomElement(array) {
  return array[generateRandomNumber(array.length)];
}

function goBackToStartOfArrayIndex(arr, i) {
  if (i < arr.length) return i;
  else return i % arr.length;
}

function approvedVacDaysBetweenDates(lastWorkDate, returnWorkDate, d1, d2) {
  if (isWithinInterval(lastWorkDate, { start: d1, end: d2 })) {
    if (isWithinInterval(returnWorkDate, { start: d1, end: d2 })) {
      return differenceInBusinessDays(lastWorkDate, returnWorkDate);
    } else {
      differenceInBusinessDays(lastWorkDate, d2);
    }
  } else {
    return 0;
  }
}

function isTaskAtRisk(task) {
  const taskDaysRemaining =
    (1 - task.percentageComplete / 100) * task.daysToComplete;
  const totalVacDaysBeforeTaskDeadline = task.user.approvedVacations?.reduce(
    (acc, cur) => {
      return (
        acc +
        approvedVacDaysBetweenDates(
          cur.lastWorkDate,
          cur.returnWorkDate,
          new Date(),
          task.deadline
        )
      );
    },
    0
  );

  const daysUntilDeadline = totalVacDaysBeforeTaskDeadline
    ? differenceInBusinessDays(new Date(), new Date(task.deadline)) -
      totalVacDaysBeforeTaskDeadline
    : differenceInBusinessDays(new Date(task.deadline), new Date());

  return taskDaysRemaining / daysUntilDeadline;
}

function createDateScaleArray(startDate, endDate) {
  const projectDuration =
    new Date(endDate).getTime() - new Date(startDate).getTime();
  let dateScaleArray = [];
  for (let i = 0; i <= 5; i++) {
    dateScaleArray.push(
      new Date((projectDuration / 5) * i + new Date(startDate).getTime())
    );
  }
  return dateScaleArray;
}

function createMonthScaleArray(startDate, endDate) {
  const startDateObj = new Date(startDate);

  const endDateObj = new Date(endDate);

  let movingDateObj = new Date(startDate);

  let allFirstOfMonths = [];

  while (movingDateObj < endDateObj) {
    if (movingDateObj.getDate() === 1) allFirstOfMonths.push(movingDateObj);
    movingDateObj = new Date(addDays(movingDateObj, 1));
  }

  // [[firstDateObj, percentageThroughProject], .....]
  let firstMonthAsPercentArray = [];

  allFirstOfMonths.forEach((first) => {
    firstMonthAsPercentArray.push([
      first,
      ((first.getTime() - startDateObj.getTime()) /
        (endDateObj.getTime() - startDateObj.getTime())) *
        100,
    ]);
  });

  return firstMonthAsPercentArray;
}

async function rawMapMsProjToNative(msProjObj, userId, userEmail, userToken) {
  const { VITE_REACT_APP_API_URL } = import.meta.env;
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
  const unAssignedTasks = [];
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

        const unAssignedTask = projectMapped.tasks.find(
          (el) => el.UID === assignment.TaskUID[0]
        );
        console.log(unAssignedTask);
        if (!unAssignedTask.milestone) {
          unAssignedTasks.push(unAssignedTask);
          // throw Error(
          //   `TASK: ${unAssignedTask.title} has not been assigned a user.  Update MS Project plan so that all tasks are assigned a responsible user`
          // );
        } else {
          taskToResourceUID.TaskUID = assignment.TaskUID[0];
          taskToResourceUID.ResourceUID = "PM";
          taskToResourceMapUID.push(taskToResourceUID);
        }
      }
    }
    // taskToResourceUID = {};
  }

  if (unAssignedTasks.length > 0) {
    throw {
      errors: `Task(s): ${unAssignedTasks.map(
        (t) => " " + t.title
      )} has not been assigned a user.  Update MS Project plan so that all tasks are assigned a responsible user`,
      type: "work-resource-for-work-tasks",
    };
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

  console.log("taskToResourceMapGUIDToEmail", taskToResourceMapGUIDToEmail);
  // console.log("@taskToResourceMapGUIDToEmail");

  // Check:
  // 1. If emails are valid
  // 2. All predecessors are non-summary

  // 1.
  const emailsAssigned = taskToResourceMapGUIDToEmail
    .map((el) => el.resourceEmail)
    .filter((el, i, ar) => ar.indexOf(el) === i);
  console.log("emailsAssigned", emailsAssigned);
  const noAccountUsers = [];
  for (const email of emailsAssigned) {
    const resp = await fetch(
      `${VITE_REACT_APP_API_URL}/api/v1/users/readUser?userEmail=${email}`,
      {
        method: "GET",
        mode: "cors",
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      }
    );
    console.log(resp.ok);
    if (!resp.ok) {
      noAccountUsers.push(email);
    }
  }
  if (noAccountUsers.length > 0) {
    throw {
      errors: `${noAccountUsers.map(
        (u) => " " + u
      )} do not have valid accounts.`,
      type: "invalid-email",
    };
  }

  console.log("here1", projectMapped);

  // populate projectMapped.tasks[] with user(email)
  // Change projectMapped.tasks.dependencies[] from UID to GUID
  projectMapped.tasks.forEach((task, i, arr) => {
    // Check if multiple users on same task:
    const taskToResourceArray = taskToResourceMapGUIDToEmail.filter((map) => {
      if (map.taskGUID === task.GUID) return map;
    });
    console.log("taskToResourceArray", taskToResourceArray);
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
    console.log(arr[i]);
  });

  console.log("here2");

  // populate projectMapped.users[]
  const userMembers = projectMapped.tasks
    .map((t) => t.user)
    .filter((u) => u !== userEmail)
    // .filter((user) => user !== undefined)   unecessary with user error handling above
    .filter((user, i, ar) => ar.indexOf(user) === i);
  projectMapped.users = userMembers;

  console.dir(projectMapped, { depth: null });

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
      type: "summary-predecessor",
    };
  }

  return projectMapped;
}

const delay = (time) => {
  return new Promise((res) => {
    setTimeout(res, time);
  });
};

function submitMsProject(
  e,
  setLoading,
  setValidEmailError,
  setValidEmailCheck,
  setSummaryPredecessorError,
  setSummaryPredecessorCheck,
  setWorkTasksResourceError,
  setWorkTaskResourceCheck,
  revalidator,
  user,
  setOpen,
  project
) {
  console.log("clicked");
  e.preventDefault();
  const { VITE_REACT_APP_API_URL } = import.meta.env;
  setLoading(true);
  setValidEmailError("");
  setValidEmailCheck(false);
  setSummaryPredecessorError("");
  setSummaryPredecessorCheck(false);
  setWorkTasksResourceError("");
  setWorkTaskResourceCheck(false);

  const testUsers = [
    "henryTest@mail.com",
    "georgeTest@mail.com",
    "catherineTest@mail.com",
    "penelopeTest@mail.com",
    "jamesTest@mail.com",
    "rubyTest@mail.com",
  ];
  const isTest = testUsers.includes(user.email);

  if (
    window.confirm("Are you sure you want to submit a MS Project .xml file?")
  ) {
    let file = e.target.uploadFile.files[0];
    console.log(file.name);
    const reader = new FileReader();
    reader.readAsText(file);
    reader.onload = async function () {
      console.log(reader.result);

      try {
        const result = await xml2js.parseStringPromise(reader.result);
        if (result.Project.$.xmlns !== "http://schemas.microsoft.com/project") {
          throw { errors: "invalid ms Project xml type" };
        }
        if (project && project.msProjectGUID !== result.Project.GUID[0]) {
          throw { errors: "You are uploading the wrong .xml" };
        }
        const data = await rawMapMsProjToNative(
          result,
          user._id,
          user.email,
          user.token
        );
        setValidEmailCheck(true);
        setSummaryPredecessorCheck(true);
        setWorkTaskResourceCheck(true);

        await delay(1000);
        let resp;
        if (!project) {
          resp = await fetch(`${VITE_REACT_APP_API_URL}/api/v1/projects`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${user.token}`,
            },
            body: JSON.stringify({
              msProjObj: result,
              projectMapped: data,
              originalFileName: file.name,
              isTest,
            }),
          });
        } else {
          resp = await fetch(
            `${VITE_REACT_APP_API_URL}/api/v1/projects/${project._id}`,
            {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${user.token}`,
              },
              body: JSON.stringify({
                msProjObj: result,
                projectMapped: data,
                originalFileName: file.name,
              }),
            }
          );
        }

        const json = await resp.json();
        console.log(json);
        if (!resp.ok) {
          console.log("1");
          throw { errors: json.errors };
        }

        setOpen(false);
        toast(`${json.title} imported from MS Project`);
        setLoading(false);
        revalidator.revalidate();
      } catch (err) {
        console.log("2");

        if (err.type) {
          console.log("3");

          switch (err.type) {
            case "invalid-email":
              setValidEmailError(err.errors);
              break;
            case "work-resource-for-work-tasks":
              setValidEmailCheck(true);
              setWorkTasksResourceError(err.errors);
              break;
            case "summary-predecessor":
              setValidEmailCheck(true);
              setWorkTaskResourceCheck(true);
              setSummaryPredecessorError(err.errors);
              break;
          }
        } else if (err.newProjectId) {
          console.log("4");

          try {
            const resp2 = await fetch(
              `${VITE_REACT_APP_API_URL}/api/v1/projects/${err.newProjectId}`,
              {
                method: "PATCH",
                mode: "cors",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${user.token}`,
                },
                body: JSON.stringify({ intent: "archive-project" }),
              }
            );
            const json2 = await resp2.json();
            if (!resp2.ok) {
              console.log("5");

              throw { errors: json2.errors };
            }
            const resp3 = await fetch(
              `${VITE_REACT_APP_API_URL}/api/v1/projects/${err.newProjectId}`,
              {
                method: "DELETE",
                mode: "cors",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${user.token}`,
                },
                body: JSON.stringify({ intent: "delete-project" }),
              }
            );
            const json3 = await resp3.json();
            if (!resp3.ok) {
              console.log("6");

              throw { errors: json3.errors };
            }
            console.log("7");

            alert(err.errors);
          } catch (error) {
            console.log("8");

            alert(
              "An unknown error has occured. If a partial project has been uploaded, manually delete and restart the upload process"
            );
          }
        } else {
          console.log("9");

          alert(err.errors);
        }
        setLoading(false);
      }
    };
  }
}

const msProjectGuidance = [
  "No Summary Tasks as Predecessors",
  "All work based tasks should be assigned a work resource.",
  "All work resources must have a valid email with an existing account.",
  "Tasks with 0 days duration will be appear as milestones on the project timeline",
];

export {
  calculatePercentProjectComplete,
  uxFriendlyRemaimingDuration,
  currentDatePercentBetweenDates,
  generateRandomNumber,
  generateRandomElement,
  goBackToStartOfArrayIndex,
  approvedVacDaysBetweenDates,
  isTaskAtRisk,
  createDateScaleArray,
  createMonthScaleArray,
  datePercentBetweenDates,
  percentOfTotalTime,
  mobileScreenWidth,
  tabletScreenWidth,
  rawMapMsProjToNative,
  submitMsProject,
  msProjectGuidance,
};

// function submitMsProject(e) {
//   e.preventDefault();
//   setLoading(true);
//   setValidEmailError("");
//   setValidEmailCheck(false);
//   setSummaryPredecessorError("");
//   setSummaryPredecessorCheck(false);
//   setWorkTasksResourceError("");
//   setWorkTaskResourceCheck(false);
//   if (
//     window.confirm("Are you sure you want to submit a MS Project .xml file?")
//   ) {
//     let file = e.target.uploadFile.files[0];
//     console.log(file.name);
//     const reader = new FileReader();
//     reader.readAsText(file);
//     reader.onload = async function () {
//       console.log(reader.result);
//       // const parser = new DOMParser();
//       // var doc = parser.parseFromString(reader.result, "application/xml");
//       // console.log(doc);

//       try {
//         const result = await xml2js.parseStringPromise(reader.result);
//         const data = await rawMapMsProjToNative(
//           result,
//           user._id,
//           user.email,
//           user.token
//         );
//         setValidEmailCheck(true);
//         setSummaryPredecessorCheck(true);
//         setWorkTaskResourceCheck(true);

//         await delay(1000);

//         const resp = await fetch(
//           `${VITE_REACT_APP_API_URL}/api/v1/projects`,
//           {
//             method: "POST",
//             headers: {
//               "Content-Type": "application/json",
//               Authorization: `Bearer ${user.token}`,
//             },
//             body: JSON.stringify({
//               msProjObj: result,
//               projectMapped: data,
//               originalFileName: file.name,
//             }),
//           }
//         );

//         const json = await resp.json();
//         console.log(json);
//         if (!resp.ok) {
//           console.log("1");
//           throw { errors: json.errors };
//         }

//         setOpen(false);
//         toast(`${json.title} imported from MS Project`);
//         setLoading(false);
//         revalidator.revalidate();
//       } catch (err) {
//         console.log("2");

//         if (err.type) {
//           console.log("3");

//           switch (err.type) {
//             case "invalid-email":
//               setValidEmailError(err.errors);
//               break;
//             case "work-resource-for-work-tasks":
//               setValidEmailCheck(true);
//               setWorkTasksResourceError(err.errors);
//               break;
//             case "summary-predecessor":
//               setValidEmailCheck(true);
//               setWorkTaskResourceCheck(true);
//               setSummaryPredecessorError(err.errors);
//               break;
//           }
//         } else if (err.newProjectId) {
//           console.log("4");

//           try {
//             const resp2 = await fetch(
//               `${VITE_REACT_APP_API_URL}/api/v1/projects/${err.newProjectId}`,
//               {
//                 method: "PATCH",
//                 mode: "cors",
//                 headers: {
//                   "Content-Type": "application/json",
//                   Authorization: `Bearer ${user.token}`,
//                 },
//                 body: JSON.stringify({ intent: "archive-project" }),
//               }
//             );
//             const json2 = await resp2.json();
//             if (!resp2.ok) {
//               console.log("5");

//               throw { errors: json2.errors };
//             }
//             const resp3 = await fetch(
//               `${VITE_REACT_APP_API_URL}/api/v1/projects/${err.newProjectId}`,
//               {
//                 method: "DELETE",
//                 mode: "cors",
//                 headers: {
//                   "Content-Type": "application/json",
//                   Authorization: `Bearer ${user.token}`,
//                 },
//                 body: JSON.stringify({ intent: "delete-project" }),
//               }
//             );
//             const json3 = await resp3.json();
//             if (!resp3.ok) {
//               console.log("6");

//               throw { errors: json3.errors };
//             }
//             console.log("7");

//             alert(err.errors);
//           } catch (error) {
//             console.log("8");

//             alert(
//               "An unknown error has occured. If a partial project has been uploaded, manually delete and restart the upload process"
//             );
//           }
//         } else {
//           console.log("9");

//           alert(err.errors);
//         }
//         setLoading(false);
//         // setOpen(false);
//       }

//       // .then(function (result) {
//       //   // console.log(result.Project);
//       //   // console.log("Done");
//       //   return rawMapMsProjToNative(
//       //     result,
//       //     user._id,
//       //     user.email,
//       //     user.token
//       //   );
//       // })
//       // .then((data) => {
//       //   console.dir(JSON.stringify(data));
//       //   setValidEmailCheck(true);
//       //   setSummaryPredecessorCheck(true);
//       //   setWorkTaskResourceCheck(true);
//       //   return data;
//       // })
//       // .then((data) => {
//       //   delay(2000);
//       //   return data;
//       // })
//       // .then(() => {
//       //   return fetch(`${VITE_REACT_APP_API_URL}/api/v1/projects`, {
//       //     method: "POST",
//       //     headers: {
//       //       "Content-Type": "application/json",
//       //       Authorization: `Bearer ${user.token}`,
//       //     },
//       //     body: JSON.stringify({
//       //       msProjObj: result,
//       //       projectMapped: data,
//       //       originalFileName: file.name,
//       //     }),
//       //   });
//       // })
//       // .then((resp) => resp.json())
//       // .then((data) => {
//       //   setOpen(false);
//       //   toast(`${data.newProject.title} imported from MS Project`);
//       //   setLoading(false);
//       //   revalidator.revalidate();
//       // })
//       // .catch((err) => {
//       //   // fail
//       //   // Archive and delete any project saved during failed attempt
//       //   console.log(err);
//       //   if (err.type) {
//       //     switch (err.type) {
//       //       case "invalid-email":
//       //         setValidEmailError(err.errors);
//       //         break;
//       //       case "work-resource-for-work-tasks":
//       //         setValidEmailCheck(true);
//       //         setWorkTasksResourceError(err.errors);
//       //         break;
//       //       case "summary-predecessor":
//       //         setValidEmailCheck(true);
//       //         setWorkTaskResourceCheck(true);
//       //         setSummaryPredecessorError(err.errors);
//       //         break;
//       //     }
//       //   } else {
//       //     alert(err.errors.error);
//       //   }
//       //   setLoading(false);
//       //   setOpen(false);
//       // });
//     };

//     // let formData = new FormData();
//     // formData.append("file", file);
//     // fetch(`${VITE_REACT_APP_API_URL}/api/v1/projects`, {
//     //   method: "POST",
//     //   headers: {
//     //     Authorization: `Bearer ${user.token}`,
//     //   },
//     //   body: formData,
//     // })
//     //   .then((resp) => resp.json())
//     //   .then((data) => {
//     //     if (data.errors && data.newProjectId) {
//     //       fetch(
//     //         `${VITE_REACT_APP_API_URL}/api/v1/projects/${data.newProjectId}`,
//     //         {
//     //           method: "PATCH",
//     //           mode: "cors",
//     //           headers: {
//     //             "Content-Type": "application/json",
//     //             Authorization: `Bearer ${user.token}`,
//     //           },
//     //           body: JSON.stringify({ intent: "archive-project" }),
//     //         }
//     //       ).then((resp) => {
//     //         if (resp.ok) {
//     //           fetch(
//     //             `${VITE_REACT_APP_API_URL}/api/v1/projects/${data.newProjectId}`,
//     //             {
//     //               method: "DELETE",
//     //               mode: "cors",
//     //               headers: {
//     //                 "Content-Type": "application/json",
//     //                 Authorization: `Bearer ${user.token}`,
//     //               },
//     //               body: JSON.stringify({ intent: "delete-project" }),
//     //             }
//     //           ).then((resp) => {
//     //             if (resp.ok) {
//     //               setLoading(false);
//     //               alert(data.errors);
//     //             } else {
//     //               setLoading(false);
//     //               alert(
//     //                 data.errors +
//     //                   " " +
//     //                   "***Something went wrong attempting to delete the invalid project, please delete manually if necessary***"
//     //               );
//     //             }
//     //           });
//     //         }
//     //       });
//     //       // fetch(
//     //       //   `${VITE_REACT_APP_API_URL}/api/v1/projects/${data.newProjectId}`,
//     //       //   {
//     //       //     method: "DELETE",
//     //       //     mode: "cors",
//     //       //     headers: {
//     //       //       Authorization: `Bearer ${user.token}`,
//     //       //     },
//     //       //     body: JSON.stringify({ intent: "delete-project" }),
//     //       //   }
//     //       // ).then((resp) => {
//     //       //   if (resp.ok) {
//     //       //     setLoading(false);
//     //       //     alert(data.errors);
//     //       //   } else {
//     //       //     setLoading(false);
//     //       //     alert(
//     //       //       data.errors +
//     //       //         " " +
//     //       //         "***Something went wrong attempting to delete the invalid project, please delete manually if necessary***"
//     //       //     );
//     //       //   }
//     //       // });
//     //     } else if (data.errors) {
//     //       setLoading(false);
//     //       alert(data.errors);
//     //     } else {
//     //       console.log(data);
//     //       setOpen(false);
//     //       toast(`${data.newProject.title} imported from MS Project`);
//     //       setLoading(false);
//     //       revalidator.revalidate();
//     //     }
//     //   });
//   }
// }
