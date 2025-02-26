const express = require("express");

// const verifyToken = require("../../middleware/requireEntraIDAuth");

const {
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
} = require("../../controllers/userController");

const requireAuth = require("../../middleware/requireAuth");
// const requireEntraIDAuth = require("../../middleware/requireEntraIDAuth");
// const checkVerification = require("../../middleware/checkVerification");

const router = express.Router();

router.post("/login", loginUser);

router.post("/loginEntraID", requireAuth, loginEntraUser);

router.post("/signup", signUpUser);

router.get("/getUsers", requireAuth, getUsers);

router.get("/getUser", requireAuth, getUser);

router.get("/readUser", requireAuth, readUser);

router.get("/logout", requireAuth, logoutUser);

router.patch("/", requireAuth, updateUser);
// router.patch("/:userId", requireAuth, updateUser);

router.get("/getLearnerUser", getUser);

router.get("/verify/:token", verifyEmail);

module.exports = router;
