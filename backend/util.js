const { projectReviewObjectives, projectReviewActions } = require("./seedData");

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

module.exports = {
  generateRandomNumber,
  generateRandomElement,
  generateRandomNumberBetweenMinMax,
  getMidTermDate,
  fixReviews,
  createReviewObjectives,
  createReviewActions,
  generateRandomElementAndRemove,
};
