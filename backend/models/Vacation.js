const mongoose = require("mongoose");
// const User = require("./User");

const { channel } = require("../routes/v1/sse");

const vacationSchema = new mongoose.Schema(
  {
    lastWorkDate: {
      type: Date,
      required: true,
    },
    returnToWorkDate: {
      type: Date,
      required: true,
    },

    approvals: {
      type: Map,
      default: new Map(),
    },
    status: {
      type: String,
      enum: ["pending", "rejected", "approved"],
      default: "pending",
    },
    approved: {
      type: Boolean,
      default: false,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    projects: [{ type: mongoose.Schema.Types.ObjectId, ref: "Project" }],
  },
  { timestamps: true }
);

// Check and set approved & keep projects in sync with user?
// vacationSchema.pre("save", async function (next) {
//   // console.log("hererererere$$$$$$", this.user);
//   try {
//     // this.user.constructor
//     const user = await this.model("User").findById(this.user);

//     // check user.remainingVacationDays is sufficient and update user.remainingVacationDays

//     // @@replace this with user.userInProjects:-
//     // .populate("tasks");
//     // const userInProjectIds = user.tasks
//     //   .map((task) => task.project.toString())
//     //   .filter((projId, i, arr) => arr.indexOf(projId) === i)
//     //   .filter((projId, i, arr) => !user.projects.includes(projId));

//     // maintain sync between approvals/status/approved:-
//     const approvalValuesArray = Object.values(
//       Object.fromEntries(this.approvals)
//     ).map((approv) => approv.accepted);
//     console.log(approvalValuesArray);
//     if (
//       // @@
//       // approvalValuesArray.length === user.userInProjectIds.length &&
//       // approvalValuesArray.length === user.userInProjects.length &&
//       approvalValuesArray.length === this.projects.length &&
//       !approvalValuesArray.includes("false")
//     ) {
//       this.status = "approved";
//       this.approved = true;
//       // for (const projId of user.userInProjects) {
//       //   const proj = await this.model("Project").findById(projId);
//       // if (!user.isLoggedIn) {
//       user.recentReceivedVacApproved.push(
//         `/user?vacationId=${this._id}&date=${format(
//           new Date(this.lastWorkDate),
//           "MM/dd/yyyy"
//         )}-${format(
//           new Date(this.returnToWorkDate),
//           "MM/dd/yyyy"
//         )}&intent=vacation-approval`
//       );
//       await user.save();
//       // }
//       channel.publish(
//         `/user?vacationId=${this._id}&date=${format(
//           new Date(this.lastWorkDate),
//           "MM/dd/yyyy"
//         )}-${format(
//           new Date(this.returnToWorkDate),
//           "MM/dd/yyyy"
//         )}&intent=vacation-approval`,
//         `vacation-approved-notification${this.user}`
//       );
//       // }
//     } else if (approvalValuesArray.includes("false")) {
//       // console.log("in includes false");
//       // if (!user.isLoggedIn) {
//       user.recentReceivedVacRejected.push(
//         `/user?vacationId=${this._id}&date=${format(
//           new Date(this.lastWorkDate),
//           "MM/dd/yyyy"
//         )}-${format(
//           new Date(this.returnToWorkDate),
//           "MM/dd/yyyy"
//         )}&intent=vacation-rejected`
//       );
//       await user.save();
//       // }
//       this.status = "rejected";
//       this.approved = false;
//       channel.publish(
//         `/user?vacationId=${this._id}&date=${format(
//           new Date(this.lastWorkDate),
//           "MM/dd/yyyy"
//         )}-${format(
//           new Date(this.returnToWorkDate),
//           "MM/dd/yyyy"
//         )}&intent=vacation-rejected`,
//         `vacation-rejected-notification${this.user}`
//       );
//     }
//     next();
//   } catch (error) {
//     throw Error(error.message);
//   }
// });

// vacationSchema.post("findOneAndDelete", async function (doc, next) {
//   console.log("in findOneAndDelete post hook");
//   console.log(doc.user, doc.model("User"), doc._id);
//   // next();
//   const totalBusDaysGained = differenceInBusinessDays(
//     doc.returnToWorkDate,
//     doc.lastWorkDate
//   );
//   console.log("total bus days $%^£$%^$^", totalBusDaysGained);
//   try {
//     const User = doc.model("User");
//     await User.findByIdAndUpdate(doc.user, {
//       $pull: { vacationRequests: doc._id },
//     });
//     const user = await User.findById(doc.user);
//     user.remainingVacationDays =
//       user.remainingVacationDays + totalBusDaysGained;
//     await user.save();
//     if (doc.projects.length > 0) {
//       for (const project of doc.projects) {
//         await doc
//           .model("Project")
//           .updateOne(
//             { _id: project },
//             { $pull: { vacationRequests: doc._id } }
//           );
//       }
//     }
//     next();
//   } catch (error) {
//     throw Error(
//       "Something went wrong cleaning up user and projects whilst deleting the vacation"
//     );
//   }
// });

module.exports = mongoose.model("Vacation", vacationSchema);
