const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const validator = require("validator");
const { v4: uuidv4 } = require("uuid");
const Tenant = require("./Tenant");

// const { sendVerificationEmail } = require("../util");
const sendVerificationEmail = require("../utility/sendVerificationEmail");

const { format, differenceInBusinessDays } = require("date-fns");

const userSchema = new mongoose.Schema(
  {
    tenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      default: null,
      // required: function () {
      //   return !this.email;
      // },
    },
    objectID: {
      type: String,
      required: function () {
        return this.tenant;
      },
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: function () {
        return !this.tenant;
      },
    },
    tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Task" }],
    secondaryTasks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Task" }],
    isTenantAdmin: {
      type: Boolean,
      default: false,
    },
    isGlobalAdmin: {
      type: Boolean,
      default: false,
    },
    ticketInbox: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Ticket",
      },
    ],
    tickets: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Ticket",
      },
    ],
    isLoggedIn: {
      type: Boolean,
      default: false,
    },
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
    projects: [{ type: mongoose.Schema.Types.ObjectId, ref: "Project" }],
    userInProjects: [{ type: mongoose.Schema.Types.ObjectId, ref: "Project" }],
    recievedNotifications: [{ type: String, default: [] }],
    vacationAllocation: {
      type: Number,
      default: 32,
    },
    vacationRequests: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Vacation" },
    ],
    remainingVacationDays: {
      type: Number,
      min: 0,
      default: function () {
        return this.vacationAllocation;
      },
    },
    vacStatChange: {
      type: Boolean,
      default: false,
    },
    archivedProjects: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
    ],
    isDemo: {
      type: Boolean,
      default: false,
    },
    isTest: {
      type: Boolean,
      default: false,
    },
    isVerified: {
      type: Boolean,
      default: function () {
        return this.tenant !== null || this.isDemo || this.isTest || false;
      },
    },
    verificationToken: { type: String },
    selfWorkLoad: {
      type: Number,
      default: 80,
      min: 50,
      max: 100,
    },
  },
  { timestamps: true }
);

userSchema.statics.signUp = async function ({
  email,
  password,
  isTest,
  isDemo,
}) {
  console.log("In sign up");
  // Check if email and password are present
  if (!email || !password) {
    throw Error("Both email & password are required");
  }
  // Check valid email & password
  if (!validator.isEmail(email)) {
    throw Error("Email provided is not valid");
  }
  if (!validator.isStrongPassword(password)) {
    throw Error("Password not strong enough");
  }
  try {
    // Double check the email isn't already in the db
    const exists = await this.findOne({ email });

    if (exists) {
      throw new Error("Email already in use");
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const verificationToken = uuidv4();

    const user = await this.create({
      email,
      password: hash,
      isTest,
      isDemo,
      verificationToken,
    });

    // Send verification email
    if (!isTest && !isDemo) {
      console.log(
        "send verification email to:",
        `${process.env.VITE_REACT_APP_API_URL}/api/v1/users/verify/${verificationToken}`
      );
      const verificationUrl = `${process.env.VITE_REACT_APP_API_URL}/api/v1/users/verify/${verificationToken}`;
      await sendVerificationEmail(email, verificationUrl);
      return "verify";
    }

    console.log("End of sign up");
    return user;
  } catch (error) {
    console.log("signup Error:", error);
    throw new Error(error.message);
  }
};

userSchema.statics.login = async function (email, password) {
  if (!email || !password) {
    throw Error("Both email & password are required");
  }

  const user = await this.findOne({ email });

  if (!user) {
    throw Error("Email does not exist");
  }

  if (!user.isVerified) {
    return null;
  }

  const match = await bcrypt.compare(password, user.password);

  if (!match) {
    throw Error("Incorrect password");
  }

  user.isLoggedIn = true;
  await user.save();

  return user;
};

userSchema.methods.getOrganisation = async function () {
  if (!this.tenant) return false;
  const tenant = Tenant.findById(this.tenant);
  if (!tenant) result = false;
  return tenant.tenantId !== "9188040d-6c67-4c5b-b112-36a304b66dad";
};
// Virtual property for 'organisation'
// userSchema.virtual("organisation").get(function () {
//   console.log("in organisation virtual");
//   if (!this.tenant) return false;
//   async function innerFunc() {
//    const tenant = Tenant.findById(this.tenant)
//    if (!tenant) result = false;
//    return tenant.tenantId !== "9188040d-6c67-4c5b-b112-36a304b66dad";
//   }
//   const result = await innerFunc()
// });

// Ensure virtual fields are included in JSON output
// userSchema.set("toJSON", { virtuals: true });
// userSchema.set("toObject", { virtuals: true });

//check if tasks have changed and set logic to reset all vac requests if necessary
// userSchema.pre("save", async function (next) {
//   console.log("hit User pre save Hook");
//   try {
//     // const user = await this.populate("tasks");
//     const user = await this.populate(["tasks", "vacationRequests"]);
//     // console.log("user.vacationtionRequests", user.vacationRequests);
//     const userInProjectIds = user.tasks
//       .map((task) => task.project.toString())
//       .filter((projId, i, arr) => arr.indexOf(projId) === i)
//       .filter((projId) => !user.projects.includes(projId));

//     if (
//       (this.userInProjects.length === userInProjectIds.length &&
//         // check if this.userInProjects !== userInProjectIds:
//         !this.userInProjects.reduce((acc, cur) => {
//           if (!acc) {
//             return false;
//           }
//           if (userInProjectIds.includes(cur.toString())) return true;
//           else {
//             return false;
//           }
//         }, true)) ||
//       this.userInProjects.length !== userInProjectIds.length
//     ) {
//       console.log("userInProjects has changed");
//       this.userInProjects = userInProjectIds;
//       //must now reset all approved vacationRequests back to pending since a new project must approve the request
//       for (const vacId of this.vacationRequests) {
//         const vac = await this.model("Vacation").findById(vacId);
//         console.log("vac!!!", vac);
//         if (vac.status === "approved") {
//           vac.status = "pending";
//           await vac.save();
//         }
//       }
//     }
//     if (this.vacStatChange) {
//       console.log("in vacStatChange");
//       const totalNonRejectedVacationsDays =
//         user.vacationRequests.length > 0
//           ? user.vacationRequests.reduce((acc, cur) => {
//               if (cur.status !== "rejected") {
//                 acc += differenceInBusinessDays(
//                   new Date(cur.returnToWorkDate),
//                   new Date(cur.lastWorkDate)
//                 );
//               }
//               return acc;
//             }, 0)
//           : 0;

//       this.remainingVacationDays =
//         this.vacationAllocation - totalNonRejectedVacationsDays;
//       this.vacStatChange = false;
//     }

//     next();
//   } catch (error) {
//     throw Error(error.message);
//   }
// });

module.exports = mongoose.model("User", userSchema);
