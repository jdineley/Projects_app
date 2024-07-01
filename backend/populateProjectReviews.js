const mongoose = require("mongoose");
require("dotenv").config();

// mongoose models
const Review = require("./models/Review");
const ReviewObjective = require("./models/ReviewObjective");
const ReviewAction = require("./models/ReviewAction");
const User = require("./models/User");
const Comment = require("./models/Comment");

const {
  projectReviewObjectives,
  projectReviewActions,
  comments,
} = require("./seedData");

// util
const {
  generateRandomElement,
  generateRandomNumberBetweenMinMax,
} = require("./util");

// date-fns

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Mongo connection open!!");
    async function createProjectReviewStructure() {
      const storedReviews = await Review.find();
      const reviewIds = storedReviews.map((review) => review._id);
      const users = await User.find();
      const userIds = users.map((user) => user._id);

      // create objectives:
      const reviewObjectiveHandler = async (objective) => {
        const reviewId = generateRandomElement(reviewIds);
        const review = storedReviews.find((review) => review._id === reviewId);
        const storedObjective = await ReviewObjective.create({
          ...objective,
          review: reviewId,
        });
        review.objectives.push(storedObjective._id);
        await review.save();
      };
      for (const objective of projectReviewObjectives) {
        await reviewObjectiveHandler(objective);
      }
      const storedObjectives = await ReviewObjective.find();
      const storedObjectivesIds = storedObjectives.map((ob) => ob._id);
      // console.log(storedObjectivesIds);

      // create actions:
      const reviewActionHandler = async (action) => {
        const reviewObjectiveId = generateRandomElement(storedObjectivesIds);
        // console.log(reviewObjectiveId);
        const reviewObjective = storedObjectives.find(
          (el) => el._id === reviewObjectiveId
        );
        // console.log(reviewObjective);
        const storedAction = await ReviewAction.create({
          ...action,
          reviewObjective: reviewObjectiveId,
        });
        reviewObjective.actions.push(storedAction._id);
        await reviewObjective.save();

        let userIdsCopy = [...userIds];
        let actionees = [];
        const numberOfActionees = generateRandomNumberBetweenMinMax(1, 4);
        for (let i = 0; i < numberOfActionees; i++) {
          const actionee = generateRandomElement(userIdsCopy);
          userIdsCopy = userIdsCopy.filter((userId) => userId !== actionee);
          actionees.push(actionee);
        }

        storedAction.actionees = actionees;
        await storedAction.save();
      };
      for (const action of projectReviewActions) {
        await reviewActionHandler(action);
      }
      const storedActions = await ReviewAction.find();
      const storedActionIds = storedActions.map((action) => action._id);

      // create action comments:
      const createCommentHandler = async (comment) => {
        const userId = generateRandomElement(userIds);
        const actionId = generateRandomElement(storedActionIds);
        const storedComment = await Comment.create({
          ...comment,
          user: userId,
          action: actionId,
        });
        const action = await ReviewAction.findById(actionId);
        action.comments.push(storedComment._id);
        await action.save();
      };
      for (const comment of comments) {
        await createCommentHandler(comment);
      }
    }

    createProjectReviewStructure()
      .then(() => {
        mongoose.connection.close();
        console.log("Mongo connection closed");
      })
      .catch((err) => console.log(err));
  })
  .catch((err) => console.log(err));
