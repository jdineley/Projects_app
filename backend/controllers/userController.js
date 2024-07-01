// const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const Project = require("../models/Project");

const createToken = (_id) => {
  return jwt.sign({ _id }, process.env.SECRET, { expiresIn: "3d" });
};

const signUpUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.signUp(email, password);
    const token = createToken(user._id);

    res.status(201).json({ _id: user._id, email, token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const loginUser = async (req, res) => {
  console.log("hit loginUser route");
  const { email, password } = req.body;
  let payload = {};
  try {
    const user = await User.login(email, password);
    const token = createToken(user._id);
    payload._id = user._id;
    payload.email = email;
    payload.token = token;
    // payload.recentReceivedComments = user.recentReceivedComments || [];
    // payload.recentReceivedReplies = user.recentReceivedReplies || [];
    // payload.recentReceivedTasks = user.recentReceivedTasks || [];
    // payload.recentReceivedVacAccepted = user.recentReceivedVacAccepted || [];
    // payload.recentReceivedVacRejected = user.recentReceivedVacRejected || [];
    // payload.recentReceivedVacApproved = user.recentReceivedVacApproved || [];
    // payload.recentReceivedVacRequest = user.recentReceivedVacRequest || [];

    console.log("login payload", payload);
    res.status(200).json(payload);
    // user.recentReceivedComments = [];
    // user.recentReceivedReplies = [];
    // user.recentReceivedTasks = [];
    // user.recentReceivedVacAccepted = [];
    // user.recentReceivedVacRejected = [];
    // user.recentReceivedVacApproved = [];
    // user.recentReceivedVacRequest = [];
    // await user.save();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const logoutUser = async (req, res) => {
  console.log("hit logoutUser route");
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      throw Error("not user found");
    }
    user.isLoggedIn = false;
    await user.save();
    res.status(200).json("logged out");
  } catch (error) {
    res.status(400).json(error.message);
  }
};

const getUsers = async (req, res) => {
  console.log("hit getUsers route");
  const { assignUser } = req.query;

  const users = await User.find({
    email: { $regex: assignUser, $options: "i" },
  });
  res.status(200).json(users);
};

const getUser = async (req, res) => {
  console.log("hit getUser route");

  try {
    const user = await User.findById(req.user._id).populate([
      {
        path: "tasks",
        populate: {
          path: "project",
        },
      },
      {
        path: "projects",
        populate: [
          "owner",
          "tasks",
          "reviews",
          "users",
          { path: "vacationRequests", populate: "user" },
        ],
      },
      {
        path: "userInProjects",
        populate: ["owner", "tasks", "reviews"],
      },
      {
        path: "vacationRequests",
        // populate: ["user", "lastWorkDate", "returnToWorkDate"],
        populate: "user",
      },
      "vacationAllocation",
    ]);

    res.status(200).json(user);
  } catch (error) {
    res.status(400).json(error.message);
  }
};

const updateUser = async (req, res) => {
  console.log("****************hit updateUser route*********************");
  // console.log(req.body);
  const { intent, ...notificationObj } = req.body;
  console.log("intent", intent);

  try {
    const user = await User.findById(req.user._id);
    if (intent === "clear-notifications") {
      user.recentReceivedComments = [];
      user.recentReceivedReplies = [];
      user.recentReceivedTasks = [];
      user.recentReceivedVacRequest = [];
      user.recentReceivedVacAccepted = [];
      user.recentReceivedVacRejected = [];
      user.recentReceivedVacApproved = [];
      user.recentReceivedVacDeleted = [];
      user.recentReceivedActions = [];
      await user.save();
      res.status(200).json(user);
    }
    if (intent === "filter-notifications") {
      const notificationType = Object.keys(notificationObj)[0];
      const url = notificationObj[notificationType];
      let receivedNotications = "";
      switch (notificationType) {
        case "comment":
          receivedNotications = "recentReceivedComments";
          break;
        case "reply":
          receivedNotications = "recentReceivedReply";
          break;
        case "task":
          receivedNotications = "recentReceivedTasks";
          break;
        case "vacation":
          receivedNotications = "recentReceivedVacRequest";
          break;
        case "vacation-accepted":
          receivedNotications = "recentReceivedVacAccepted";
          break;
        case "vacation-rejected":
          receivedNotications = "recentReceivedVacRejected";
          break;
        case "vacation-approved":
          receivedNotications = "recentReceivedVacApproved";
          break;
        default:
          console.log("no match.. try again");
      }
      // const user = await User.findById(req.user._id);
      // console.log("receivedNotications 1", user[receivedNotications]);
      if (user[receivedNotications].length > 0) {
        user[receivedNotications] = user[receivedNotications].filter((not) => {
          return not !== url;
        });
        console.log("receivedNotications 2", user[receivedNotications]);
        await user.save();
      }

      res.status(200).json(user);
    }
  } catch (error) {
    res.status(400).json(error.message);
  }
};

module.exports = {
  signUpUser,
  loginUser,
  getUsers,
  logoutUser,
  getUser,
  updateUser,
};
