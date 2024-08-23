const mongoose = require("mongoose");

const { isWithinInterval } = require("date-fns");

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "Review" }],
    start: {
      type: Date,
      required: true,
    },
    end: {
      type: Date,
      required: true,
    },
    tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Task" }],
    vacationRequests: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Vacation" },
    ],
    archived: {
      type: Boolean,
      default: false,
    },
    descendentsAtArchive: mongoose.Schema.Types.Mixed,
    msProjectGUID: {
      type: String,
    },
  },
  { timestamps: true }
);

// populate the user field to keep in sync with tasks
// populate vacationRequests field to keep in sync with users
// projectSchema.pre("save", async function (next) {
//   try {
//     let project = await this.populate("tasks");

//     const projectUsersIds = project.tasks
//       .map((task) => task.user.toString())
//       .filter((userId) => userId !== this.owner.toString())
//       .filter((userId, i, arr) => {
//         return arr.indexOf(userId) === i;
//       });

//     if (
//       (this.users.length === projectUsersIds.length &&
//         !this.users.reduce((acc, cur) => {
//           if (!acc) {
//             return false;
//           }
//           if (projectUsersIds.includes(cur.toString())) return true;
//           else {
//             return false;
//           }
//         }, true)) ||
//       this.users.length !== projectUsersIds.length
//     ) {
//       console.log("active users has changed%%%%%%%%%%%%%%%");
//       this.users = projectUsersIds;
//       //keep vacationRequests in sync with users
//       let vacationRequests = [];
//       for (const userId of this.users) {
//         const user = await this.model("User")
//           .findById(userId)
//           .populate("vacationRequests");
//         if (user.vacationRequests.length > 0) {
//           for (userVacReq of user.vacationRequests) {
//             if (
//               isWithinInterval(new Date(userVacReq.lastWorkDate), {
//                 start: new Date(this.start),
//                 end: new Date(this.end),
//               }) ||
//               isWithinInterval(new Date(userVacReq.returnToWorkDate), {
//                 start: new Date(this.start),
//                 end: new Date(this.end),
//               })
//             ) {
//               vacationRequests.push(userVacReq._id);
//             }
//           }
//           this.vacationRequests = vacationRequests;
//         }
//       }
//     }
//     next();
//   } catch (error) {
//     throw Error(error.message);
//   }
// });

// when save project sync vacation(s) project array field with the vacationRequest field in Project:
// projectSchema.post("save", async function (doc, next) {
//   try {
//     let project = await doc
//       .model("Project")
//       .findById(this._id)
//       .populate("tasks");

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

module.exports = mongoose.model("Project", projectSchema);
