const User = require("./models/User");
// const Vacation = require("./models/Vacation");
const Project = require("./models/Project");

// const mongoose = require("mongoose");

const { differenceInBusinessDays, isWithinInterval } = require("date-fns");

const { projectReviewObjectives, projectReviewActions } = require("./seedData");
// const {
//   default: userProfileAction,
// } = require("../frontend/src/actions/userProfileAction");

const generateRandomNumber = (maxNum) => {
  return Math.floor(Math.random() * maxNum);
};

function generateRandomElement(array) {
  return array[generateRandomNumber(array.length)];
}
function generateRandomElementAndRemove(array) {
  if (array.length) {
    const element = array[generateRandomNumber(array.length)];
    array = array.filter((el) => el !== element);
  } else {
    return null;
  }
  return [element, array];
}

const generateRandomNumberBetweenMinMax = (min, max) => {
  return generateRandomNumber(max - min) + min;
};

function getRandomDateInRange(startDate, endDate) {
  return new Date(
    startDate.getTime() +
      Math.random() * (endDate.getTime() - startDate.getTime())
  );
}

function getMidTermDate(start, end) {
  return start.getTime() + (end.getTime() - start.getTime()) / 2;
}

function fixReviews(reviews, intent) {
  //Needs changing to allow for any number of reviews
  // reviews arrive like this:
  // {
  //   reviewId: ... ,
  //   title: ... ,
  //   date: ... ,
  //   reviewId: ... ,
  //   title: ... ,
  //   date: ... ,
  // }
  // or..
  // {
  //   title: ... ,
  //   date: ... ,
  //   title: ... ,
  //   date: ... ,
  // }
  // We need this:
  // [{reviewId: ..., title: ..., date: ...}, {}, {}]
  // or
  // [{title: ..., date: ...}, {}, {}]

  let reviewArray = [];
  let newReviewArray = [];

  if (intent === "edit-project") {
    for (const prop in reviews) {
      if (prop[0] === "r") {
        let revObj = {
          reviewId: reviews[prop],
        };
        reviewArray.push(revObj);
      } else if (prop[0] === "t") {
        reviewArray[reviewArray.length - 1].title = reviews[prop];
      } else if (prop[0] === "d") {
        reviewArray[reviewArray.length - 1].date = reviews[prop];
      } else if (prop[0] === "n") {
        newReviewArray.push({});
      } else if (prop[0] === "T") {
        newReviewArray[newReviewArray.length - 1].title = reviews[prop];
      } else {
        newReviewArray[newReviewArray.length - 1].date = reviews[prop];
      }
    }
  }

  if (intent === "create-new-project") {
    for (const prop in reviews) {
      if (prop[0] === "t") {
        reviewArray.push({ title: reviews[prop] });
      } else if (prop[0] === "d") {
        reviewArray[reviewArray.length - 1].date = reviews[prop];
      }
    }
  }

  return [reviewArray, newReviewArray];
}

async function createReviewActions(actions, reviewObjective, userIds) {
  let actionsCopy = [...actions];
  const numberOfActions = generateRandomNumberBetweenMinMax(2, 5);
  const projectReviewActions = [];
  for (let i = 0; i <= numberOfActions; i++) {
    const action = generateRandomElement(actionsCopy);
    const index = actionsCopy.indexOf(action);
    actionsCopy.splice(index, 1);
    const reviewAction = await ReviewAction.create({
      ...action,
      reviewObjective,
    });
    projectReviewActions.push(reviewAction);
  }
  return projectReviewActions;
}

async function createReviewObjectives(objectives, review, userIds) {
  let objectivesCopy = [...objectives];
  const numberOfObjectives = generateRandomNumberBetweenMinMax(4, 7);
  const projectReviewObjectives = [];
  for (let i = 0; i <= numberOfObjectives; i++) {
    const objective = generateRandomElement(objectivesCopy);
    console.log(objective);
    const index = objectivesCopy.indexOf(objective);
    objectivesCopy.splice(index, 1);
    const reviewObjective = await ReviewObjective.create({
      ...objective,
      review,
    });
    const actions = await createReviewActions(
      projectReviewActions,
      reviewObjective._id,
      userIds
    );
    reviewObjective.actions = actions;
    await reviewObjective.save();
    projectReviewObjectives.push(reviewObjective);
  }
  return projectReviewObjectives;
}

//user.tasks[] changes - check if userInProjects has changed and correct vacReqs back to pending
async function resyncUserAndVacs(storedUser) {
  console.log("in resyncUserAndVacs");
  console.log("storedUser.email", storedUser.email);
  let userInProjectIds =
    storedUser.tasks?.length > 0
      ? storedUser.tasks
          .map((task) => task.project.toString())
          .filter((projId, i, arr) => arr.indexOf(projId) === i)
          .filter((projId) => !storedUser.projects.includes(projId))
      : [];

  // console.log("userInProjectIds", userInProjectIds);

  // need to include storedUser.secondaryTasks
  if (storedUser.secondaryTasks?.length > 0) {
    for (const secondTask of storedUser.secondaryTasks) {
      if (
        !userInProjectIds.includes(secondTask.project.toString()) &&
        !storedUser.projects.includes(secondTask.project.toString())
      ) {
        userInProjectIds.push(secondTask.project.toString());
      }
    }
  }

  // console.log("2userInProjectIds2", userInProjectIds);

  const noNewUserInProjects = userInProjectIds.reduce((acc, cur) => {
    if (!acc) {
      return false;
    }
    if (storedUser.userInProjects.includes(cur.toString())) return true;
    else {
      return false;
    }
  }, true);

  if (
    !noNewUserInProjects ||
    storedUser.userInProjects.length !== userInProjectIds.length
  ) {
    console.log("userInProjects has changed");
    storedUser.userInProjects = userInProjectIds;

    let projectIds = [];
    // let projects = [];
    //must now reset all approved vacationRequests back to pending since a new project must approve the request
    if (storedUser.vacationRequests.length > 0) {
      for (const userVacReq of storedUser.vacationRequests) {
        // const vac = await Vacation.findById(vacId);
        // only reset vacations if:
        // if (!noNewUserInProjects) {
        //   if (userVacReq.status === "approved") {
        //     userVacReq.status = "pending";
        //   }
        // }
        for (const userInProjectId of userInProjectIds) {
          const userInProject = await Project.findById(userInProjectId);

          if (
            isWithinInterval(new Date(userVacReq.lastWorkDate), {
              start: new Date(userInProject.start),
              end: new Date(userInProject.end),
            }) ||
            isWithinInterval(new Date(userVacReq.returnToWorkDate), {
              start: new Date(userInProject.start),
              end: new Date(userInProject.end),
            })
          ) {
            projectIds.push(userInProject._id);
            // projects.push(userInProject);
          }
        }
        // console.log("projectIds", projectIds);
        userVacReq.projects = projectIds;
        const projects = [];
        for (const projId of projectIds) {
          const project = await Project.findById(projId);
          projects.push(project);
        }
        // userVacReq = await userVacReq.populate("projects");
        // console.log("userVacReq", userVacReq);

        const vacApprovalMap = new Map();
        for (const projectId of projectIds) {
          const existingApproval = userVacReq.approvals.get(projectId);
          if (existingApproval) {
            vacApprovalMap.set(projectId, existingApproval);
          }
        }
        // console.log("vacApprovalMap", vacApprovalMap);
        userVacReq.approvals = vacApprovalMap;

        const approvalValuesArray = Object.values(
          Object.fromEntries(userVacReq.approvals)
        ).map((approv) => approv.accepted);

        if (
          approvalValuesArray.length ===
            projects.filter((p) => !p.archived).length &&
          !approvalValuesArray.includes("false")
        ) {
          userVacReq.status = "approved";
          userVacReq.approved = true;
        } else if (approvalValuesArray.includes("false")) {
          userVacReq.status = "rejected";
          userVacReq.approved = false;
        } else {
          userVacReq.status = "pending";
          userVacReq.approved = false;
        }
        await userVacReq.save();
      }
    }
  }
}

async function correctRemainingVacDays(userId) {
  console.log("in correctRemainingVacDays");
  const storedUser = await User.findById(userId).populate(["vacationRequests"]);

  const totalNonRejectedVacationsDays =
    storedUser.vacationRequests.length > 0
      ? storedUser.vacationRequests.reduce((acc, cur) => {
          if (cur.status !== "rejected") {
            acc += differenceInBusinessDays(
              new Date(cur.returnToWorkDate),
              new Date(cur.lastWorkDate)
            );
          }
          return acc;
        }, 0)
      : 0;

  storedUser.remainingVacationDays =
    storedUser.vacationAllocation - totalNonRejectedVacationsDays;
  await storedUser.save();
}

// if project.tasks[] changes, resychronise project.users[] and update project.vacationRequests[].  This is before project.save()
async function resyncProjTasksUsersVacs(storedProject) {
  console.log("in resyncProjTasksUsersVacs");
  // console.log("storedProject.owner", storedProject.owner);
  // const storedProject = await Project.findById(projId).populate(["tasks"]);
  if (storedProject.tasks.length > 0) {
    let projectUsersIds = storedProject.tasks
      .map((task) => task.user.toString())
      .filter((userId) => userId !== storedProject.owner.toString())
      .filter((userId, i, arr) => {
        return arr.indexOf(userId) === i;
      });

    // have to add storedProject.tasks[task.secondaryUsers] to the projectUsersIds[]
    for (const task of storedProject.tasks) {
      if (task.secondaryUsers.length > 0) {
        task.secondaryUsers.forEach((u) => {
          if (
            !projectUsersIds.includes(u._id.toString()) &&
            u._id !== storedProject.owner.toString()
          )
            projectUsersIds.push(u._id.toString());
        });
      }
    }

    console.log("projectUsersIds", projectUsersIds);
    // console.log("storedProject.users", storedProject.users);
    const noNewProjectUsers = projectUsersIds.reduce((acc, cur) => {
      if (!acc) {
        return false;
      }
      if (storedProject.users.includes(cur.toString())) return true;
      else {
        return false;
      }
    }, true);

    console.log("noNewProjectUsers", noNewProjectUsers);

    // if (
    //   (storedProject.users.length === projectUsersIds.length &&
    //     !noNewProjectUsers) ||
    //   storedProject.users.length !== projectUsersIds.length
    // ) {
    if (
      !noNewProjectUsers ||
      storedProject.users.length !== projectUsersIds.length
    ) {
      console.log("active users has changed%%%%%%%%%%%%%%%");
      storedProject.users = projectUsersIds;
      //keep vacationRequests in sync with project.users
      let vacationRequests = [];
      for (const userId of storedProject.users) {
        const user = await User.findById(userId).populate("vacationRequests");
        if (user.vacationRequests.length > 0) {
          for (userVacReq of user.vacationRequests) {
            if (
              isWithinInterval(new Date(userVacReq.lastWorkDate), {
                start: new Date(storedProject.start),
                end: new Date(storedProject.end),
              }) ||
              isWithinInterval(new Date(userVacReq.returnToWorkDate), {
                start: new Date(storedProject.start),
                end: new Date(storedProject.end),
              })
            ) {
              vacationRequests.push(userVacReq._id);
            }
          }
          storedProject.vacationRequests = vacationRequests;
        }
        // await storedProject.save();
      }
    }
  }
}

module.exports = {
  generateRandomNumber,
  generateRandomElement,
  generateRandomNumberBetweenMinMax,
  getMidTermDate,
  fixReviews,
  createReviewObjectives,
  createReviewActions,
  generateRandomElementAndRemove,
  resyncUserAndVacs,
  correctRemainingVacDays,
  resyncProjTasksUsersVacs,
};
