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
  getLearnerUser,
  loginEntraUser,
} = require("../../controllers/userController");

const requireAuth = require("../../middleware/requireAuth");
const requireEntraIDAuth = require("../../middleware/requireEntraIDAuth");

const router = express.Router();

router.post("/login", loginUser);

router.post("/loginEntraID", requireEntraIDAuth, loginEntraUser);

router.post("/signup", signUpUser);

router.get("/getUsers", requireAuth, getUsers);

router.get("/getUser", requireAuth, requireEntraIDAuth, getUser);

router.get("/readUser", requireAuth, readUser);

router.get("/logout", requireAuth, requireEntraIDAuth, logoutUser);

router.patch("/:userId", requireAuth, updateUser);

router.get("/getLearnerUser", getUser);

module.exports = router;
