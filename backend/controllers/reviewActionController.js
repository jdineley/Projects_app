const mongoose = require("mongoose");

const ReviewAction = require("../models/ReviewAction");
const ReviewObjective = require("../models/ReviewObjective");
const Review = require("../models/Review");

const createReviewAction = async (req, res) => {
  console.log("hit createReviewAction route");
  const { objectiveId } = req.params;
  const { content, project } = req.body;
  const { isDemo, isTest } = req.user;

  if (!mongoose.Types.ObjectId.isValid(objectiveId)) {
    return res.status(404).json({ error: "No such reviewObjective" });
  }

  try {
    const newAction = await ReviewAction.create({
      content,
      project,
      reviewObjective: objectiveId,
      isDemo,
      isTest,
    });
    const objective = await ReviewObjective.findById(objectiveId);
    if (!objective) {
      res.status(404).json({ error: "not such objective" });
    }
    objective.actions.push(newAction._id);
    await objective.save();

    const review = await Review.findById(objective.review).populate([
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
    // console.log(review);
    res.status(200).json({ newAction, review });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

module.exports = {
  createReviewAction,
};
