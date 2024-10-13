const mongoose = require("mongoose");
const Project = require("./Project");

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
      // default: "Description to be added..",
    },
    daysToComplete: {
      type: Number,
      required: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    percentageComplete: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    percentageCompleteHistory: {
      type: Map,
      // required: true,
      default: new Map(),
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    secondaryUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        // default: [],
      },
    ],
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
    deadline: {
      type: Date,
      required: true,
    },
    dependencies: [{ type: mongoose.Schema.Types.ObjectId, ref: "Task" }],
    // createdAt: {
    //   type: Date,
    // },
    archived: {
      type: Boolean,
      default: false,
    },
    msProjectGUID: {
      type: String,
      default: null,
    },
    // isMsProjectTask: {
    //   type: Boolean,
    //   default: function () {
    //     return this.msProjectGUID !== "";
    //   },
    // },
    msProjectUID: {
      type: String,
    },
    startDate: {
      type: Date,
      required: true,
    },
    milestone: {
      type: Boolean,
      default: false,
    },
    isDemo: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// 346FBF06-40E8-E111-ACCD-F0DEF1A69BD1

// populate the user field to keep in sync with tasks
// taskSchema.post("save", async function (doc, next) {
//   try {
//     let project = await Project.findById(this.project).populate("tasks");

//     const projectUsersIds = project.tasks
//       .map((task) => task.user)
//       .filter((userId, i, arr) => {
//         return arr.indexOf(userId) === i;
//       });

//     project.users = projectUsersIds;
//     await project.save();
//     next();
//   } catch (error) {
//     throw Error(error.message);
//   }
// });

module.exports = mongoose.model("Task", taskSchema);
