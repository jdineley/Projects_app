const mongoose = require("mongoose");

const ReviewObjective = require("../models/ReviewObjective");
const Review = require("../models/Review");

// shared controller
const updateObjective = require("./sharedController");

// const getReviewObjective = async (req, res) => {
//   console.log("hit getReviewObjective route");
//   const { objectiveId } = req.params;

//   if (!mongoose.Types.ObjectId.isValid(objectiveId)) {
//     return res.status(404).json({ error: "No such objective!" });
//   }

//   try {
//     // #1111
//     // Get, only if user is member of review.project
//     const objective = await ReviewObjective.findById(objectiveId).populate(
//       "actions"
//     );
//     if (!objective) {
//       res.status(404).json({ error: "no such objective" });
//     }
//     return res.status(200).json({ objective });
//   } catch (error) {}
// };

const createReviewObjective = async (req, res) => {
  console.log("hit createReviewObjective route");
  const { reviewId } = req.params;
  const { title, project } = req.body;
  const { isDemo, isTest } = req.user;

  if (!mongoose.Types.ObjectId.isValid(reviewId)) {
    return res.status(404).json({ error: "No such reviewObjective" });
  }

  try {
    let review = await Review.findById(reviewId);
    if (!review) {
      res.status(404).json({ error: "not such review" });
    }
    const newObjective = await ReviewObjective.create({
      title,
      project,
      review: reviewId,
      isDemo,
      isTest,
    });
    review.objectives.push(newObjective._id);
    await review.save();
    console.log(review);
    review = await Review.findById(reviewId).populate([
      {
        path: "objectives",
        populate: {
          path: "actions",
          populate: [
            "actionees",
            {
              path: "comments",
              populate: ["user", "replies"],
            },
          ],
        },
      },
      "project",
    ]);
    res.status(200).send({ newObjective, review });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

// const updateReviewObjective = async (req, res) => {
//   console.log("hit updateReview route");
// };

module.exports = {
  createReviewObjective,
  // getReviewObjective,
};
