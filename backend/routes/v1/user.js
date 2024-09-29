const express = require("express");

const {
  signUpUser,
  loginUser,
  getUsers,
  logoutUser,
  getUser,
  updateUser,
  readUser,
} = require("../../controllers/userController");

const requireAuth = require("../../middleware/requireAuth");

const router = express.Router();

router.post("/login", loginUser);

router.post("/signup", signUpUser);

router.get("/getUsers", requireAuth, getUsers);

router.get("/getUser", requireAuth, getUser);

router.get("/readUser", requireAuth, readUser);

router.get("/logout", requireAuth, logoutUser);

router.patch("/:userId", requireAuth, updateUser);

module.exports = router;
