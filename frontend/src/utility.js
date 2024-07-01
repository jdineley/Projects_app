import { differenceInBusinessDays, isWithinInterval, addDays } from "date-fns";

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
};
