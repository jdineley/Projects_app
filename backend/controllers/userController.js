const jwt = require("jsonwebtoken");

const User = require("../models/User");

const createToken = (_id) => {
  return jwt.sign({ _id }, process.env.SECRET, { expiresIn: "3d" });
};

const signUpUser = async (req, res) => {
  const testUsers = [
    "henryTest@mail.com",
    "georgeTest@mail.com",
    "catherineTest@mail.com",
    "penelopeTest@mail.com",
    "jamesTest@mail.com",
    "rubyTest@mail.com",
  ];
  let isTest;
  const { email, password } = req.body;
  if (testUsers.includes(email)) isTest = true;
  else isTest = false;

  try {
    const user = await User.signUp(email, password, isTest);
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
    console.log("login payload", payload);
    res.status(200).json(payload);
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
  const { isDemo } = req.user;

  const users = await User.find({
    email: { $regex: assignUser, $options: "i" },
    isDemo,
  });
  res.status(200).json(users);
};

const getUser = async (req, res) => {
  console.log("hit getUser route");
  const { email } = req.query;
  console.log(email);
  let user;
  try {
    if (email) {
      user = await User.findOne({ email });
    } else {
      user = await User.findById(req.user._id);
    }

    await user.populate([
      {
        path: "tasks",
        populate: "project",
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
        populate: "user",
      },
      "vacationAllocation",
    ]);

    res.status(200).json(user);
  } catch (error) {
    res.status(400).json(error.message);
  }
};

const readUser = async (req, res) => {
  console.log("hit readUser route");
  const { userEmail } = req.query;

  try {
    const user = await User.findOne({ email: userEmail });

    if (!user) {
      throw Error(`User with that ID not found`);
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(404).json(error.message);
  }
};

const updateUser = async (req, res) => {
  console.log("****************hit updateUser route*********************");
  const { intent, ...notificationObj } = req.body;
  console.log("intent", intent);

  try {
    const user = await User.findById(req.user._id);
    if (intent === "clear-notifications") {
      user.recievedNotifications = [];
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

// const getLearnerUser = async (req, res) => {
//   console.log("in get learner user");
// };

module.exports = {
  signUpUser,
  loginUser,
  getUsers,
  logoutUser,
  getUser,
  updateUser,
  readUser,
  // getLearnerUser,
};
