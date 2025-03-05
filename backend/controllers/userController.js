const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../models/User");
const Tenant = require("../models/Tenant");

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
    const user = await User.signUp({ email, password, isTest });
    if (user === "verify") {
      return res.status(200).json({
        message:
          "Email verification required. Go to your inbox to complete the verification. Please check your spam folder",
      });
    }
    const token = createToken(user._id);

    return res.status(201).json({ user: { _id: user._id, email, token } });
  } catch (error) {
    console.log("signup error", error);
    res.status(400).json({ error: error.message });
  }
};

const loginUser = async (req, res) => {
  console.log("hit loginUser route");
  const { email, password } = req.body;
  // if (accessToken) {
  //   console.log("accessToken", accessToken);
  //   return res.status(200).json({ accessToken });
  // }
  let payload = {};
  try {
    const user = await User.login(email, password);
    if (!user) {
      return res.status(200).json({
        message:
          "Email verification required. Go to your inbox to complete the verification. Please check your spam folder",
      });
    }
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

const loginEntraUser = async (req, res) => {
  console.log("hit loginEntra route");
  const { decoded, accessToken } = req.user;
  const { oid, tid, preferred_username } = decoded;

  // const { oid, tid, preferred_username } = req.user;
  console.log("req.user", req.user);
  // Business logic to handle user login/signup/tenant creation
  // No sign-up option for entra sign in, so that must be handled here
  try {
    if (!oid || !tid) {
      throw Error("incomplete access token");
    }
    let user = await User.findOne({ objectID: oid });
    let tenant = await Tenant.findOne({ tenantId: tid });
    if (!tenant) {
      // create tenant
      tenant = await Tenant.create({
        tenantId: tid,
      });
    }
    if (!user) {
      // create user
      user = await User.create({
        tenant: tenant._id,
        objectID: oid,
        email: preferred_username,
      });
    }
    return res
      .status(200)
      .json({ accessToken, email: preferred_username, _id: user._id });
  } catch (error) {
    return res.status(401).json({ error: error.message });
  }
};

const logoutUser = async (req, res) => {
  console.log("hit logoutUser route");
  try {
    let user;
    if (req.user.accessToken) {
      const { oid } = req.user.decoded;
      user = await User.findOne({ objectID: oid });
    } else {
      user = await User.findById(req.user._id);
    }
    if (!user) {
      throw Error("no user found");
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
  const { assignUser, intent, projectId } = req.query;
  const { isDemo } = req.user;
  console.log("req.user", req.user);
  try {
    // const users = await User.find({
    //   email: { $regex: assignUser, $options: "i" },
    //   isDemo,
    // });
    let users;
    let query;
    // #6823
    // if for task then taken from tenant or global only
    if (intent === "task") {
      console.log("in task");
      query = {
        tenant: req.user.tenant,
        isDemo,
      };
      if (assignUser === "*") {
        // Match all titles by omitting the $regex condition
      } else {
        query.email = { $regex: assignUser, $options: "i" };
      }
      users = await User.find(query);
      // users = await User.find({
      //   email: { $regex: assignUser, $options: "i" },
      //   tenant: req.user.tenant,
      // });
      // validUsers = users.filter((user) => {
      //   if (req.user.organisation) {
      //     return user.tenant === req.user.tenant;
      //   }
      //   return !user.organisation;
      // });
    } else if (intent === "reviewAction") {
      // if for review action then taken from project
      console.log("in reviewAction");
      query = {
        $or: [
          { projects: new mongoose.Types.ObjectId(projectId) },
          { userInProjects: new mongoose.Types.ObjectId(projectId) },
        ],
        isDemo,
      };
      if (assignUser === "*") {
        // Match all titles by omitting the $regex condition
      } else {
        query.email = { $regex: assignUser, $options: "i" };
      }

      users = await User.find(query);
      // users = await User.find({
      //   email: { $regex: assignUser, $options: "i" },
      //   $or: [
      //     { projects: new mongoose.Types.ObjectId(projectId) },
      //     { userInProjects: new mongoose.Types.ObjectId(projectId) },
      //   ],
      // });
      // validUsers = users.filter((user) => {
      //   if (
      //     user.userInProjects.map((p) => p.toString()).includes(projectId) ||
      //     user.projects.map((p) => p.toString()).includes(projectId)
      //   ) {
      //     return true;
      //   }
      // });
    }
    // else if (isDemo) {
    //   users = await User.find({
    //     email: { $regex: assignUser, $options: "i" },
    //     isDemo,
    //   });
    // }
    // console.log("validUsers", validUsers);
    res.status(200).json(users);
  } catch (error) {
    return res.status(404).json({ error: error.message });
  }
};

const getUser = async (req, res) => {
  console.log("hit getUser route");
  const { email } = req.query;
  const oid = req.user?.decoded?.oid;
  let user;
  try {
    if (email) {
      user = await User.findOne({ email });
    } else if (oid) {
      user = await User.findOne({ objectID: oid });
    } else {
      user = req.user;
    }
    // console.log("user", user);
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
  const { decoded } = req.user;

  try {
    // #5832
    // get user within tenant or global scope
    let user;
    if (!decoded) {
      // personal account
      // user.tenant === null
      user = await User.findOne({ email: userEmail, tenant: null });
    } else {
      // user.tenant !== null
      user = await User.findOne({ email: userEmail, tenant: decoded.tid });
      if (!user) {
        throw Error;
      }
    }
    if (!user) {
      throw Error(
        "something went wrong finding the user, either the email doesn't exist of the user email belongs to a user outside the target tenant or domain"
      );
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(404).json(error.message);
  }
};

const updateUser = async (req, res) => {
  console.log("****************hit updateUser route*********************");
  const { intent } = req.body;
  // const { intent, ...notificationObj } = req.body;
  console.log("intent", intent);

  try {
    const user = await User.findById(req.user._id);
    if (intent === "clear-notifications") {
      user.recievedNotifications = [];
      await user.save();
      return res.status(200).json(user);
    }

    // if (intent === "filter-notifications") {
    //   const notificationType = Object.keys(notificationObj)[0];
    //   const url = notificationObj[notificationType];
    //   let receivedNotications = "";
    //   switch (notificationType) {
    //     case "comment":
    //       receivedNotications = "recentReceivedComments";
    //       break;
    //     case "reply":
    //       receivedNotications = "recentReceivedReply";
    //       break;
    //     case "task":
    //       receivedNotications = "recentReceivedTasks";
    //       break;
    //     case "vacation":
    //       receivedNotications = "recentReceivedVacRequest";
    //       break;
    //     case "vacation-accepted":
    //       receivedNotications = "recentReceivedVacAccepted";
    //       break;
    //     case "vacation-rejected":
    //       receivedNotications = "recentReceivedVacRejected";
    //       break;
    //     case "vacation-approved":
    //       receivedNotications = "recentReceivedVacApproved";
    //       break;
    //     default:
    //       console.log("no match.. try again");
    //   }
    //   if (user[receivedNotications].length > 0) {
    //     user[receivedNotications] = user[receivedNotications].filter((not) => {
    //       return not !== url;
    //     });
    //     console.log("receivedNotications 2", user[receivedNotications]);
    //     await user.save();
    //   }

    //   res.status(200).json(user);
    // }
  } catch (error) {
    res.status(400).json(error.message);
  }
};

const verifyEmail = async (req, res) => {
  console.log("in verifyEmail route");
  const { token } = req.params;

  // Find user by token
  try {
    const user = await User.findOne({ verificationToken: token });
    if (!user) {
      return res.redirect(
        `${process.env.VITE_REACT_URL}/account/login?email=notVerified`
      );
    }

    // Verify user
    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    return res.redirect(
      `${process.env.VITE_REACT_URL}/account/login?email=verified`
    );
    // res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    return res.redirect(
      `${process.env.VITE_REACT_URL}/account/login?email=notVerified`
    );
    // res.status(403).json({ error: error.message });
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
  loginEntraUser,
  verifyEmail,
};
