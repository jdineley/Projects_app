const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const validator = require("validator");

const { format, differenceInBusinessDays } = require("date-fns");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Task" }],
    isAdmin: {
      type: Boolean,
      default: false,
    },
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
  },
  { timestamps: true }
);

userSchema.statics.signUp = async function (email, password) {
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

  // Double check the email isn't already in the db
  const exists = await this.findOne({ email });

  if (exists) {
    throw Error("Email already in use");
  }

  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);

  const user = await this.create({ email, password: hash });
  console.log("End of sign up");
  return user;
};

userSchema.statics.login = async function (email, password) {
  if (!email || !password) {
    throw Error("Both email & password are required");
  }

  const user = await this.findOne({ email });

  if (!user) {
    throw Error("Email does not exist");
  }

  const match = await bcrypt.compare(password, user.password);

  if (!match) {
    throw Error("Incorrect password");
  }

  user.isLoggedIn = true;
  await user.save();

  return user;
};

//check if tasks have changed and set logic to reset all vac requests if necessary
userSchema.pre("save", async function (next) {
  console.log("hit User pre save Hook");
  try {
    // const user = await this.populate("tasks");
    const user = await this.populate(["tasks", "vacationRequests"]);
    // console.log("user.vacationtionRequests", user.vacationRequests);
    const userInProjectIds = user.tasks
      .map((task) => task.project.toString())
      .filter((projId, i, arr) => arr.indexOf(projId) === i)
      .filter((projId, i, arr) => !user.projects.includes(projId));

    if (
      (this.userInProjects.length === userInProjectIds.length &&
        !this.userInProjects.reduce((acc, cur) => {
          if (!acc) {
            return false;
          }
          if (userInProjectIds.includes(cur.toString())) return true;
          else {
            return false;
          }
        }, true)) ||
      this.userInProjects.length !== userInProjectIds.length
    ) {
      console.log("userInProjects has changed");
      this.userInProjects = userInProjectIds;
      //must now reset all approved vacationRequests back to pending since a new project must approve the request
      for (const vacId of this.vacationRequests) {
        const vac = await this.model("Vacation").findById(vacId.toString());
        console.log("vac!!!", vac);
        if (vac.status === "approved") {
          vac.status = "pending";
          await vac.save();
        }
      }
    }
    if (this.vacStatChange) {
      console.log("in vacStatChange");
      const totalNonRejectedVacationsDays =
        user.vacationRequests.length > 0
          ? user.vacationRequests.reduce((acc, cur) => {
              if (cur.status !== "rejected") {
                acc += differenceInBusinessDays(
                  new Date(cur.returnToWorkDate),
                  new Date(cur.lastWorkDate)
                );
              }
              return acc;
            }, 0)
          : 0;
      // console.log(
      //   "totalNonRejectedVacationsDays",
      //   totalNonRejectedVacationsDays
      // );
      this.remainingVacationDays =
        this.vacationAllocation - totalNonRejectedVacationsDays;
      this.vacStatChange = false;
    }

    next();
  } catch (error) {
    throw Error(error.message);
  }
});

module.exports = mongoose.model("User", userSchema);
