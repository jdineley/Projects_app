const express = require("express");
// Used to validate JWT access tokens
// const { expressjwt: jwt } = require("express-jwt");
// const jwks = require("jwks-rsa");

// const jwtAuthz = require("express-jwt-authz");

// // MS Identity
// const config = {
//   auth: {
//     // 'Directory (tenant) ID' of app registration in the Microsoft Entra admin center - this value is a GUID
//     tenant: "ff447367-496a-49c8-a501-4779ea49961f",
//     // ff447367-496a-49c8-a501-4779ea49961f

//     // 'Application (client) ID' of app registration in the Microsoft Entra admin center - this value is a GUID
//     audience: "a0b43e71-70ed-400a-9d58-f7c4bd5eb163",
//   },
// };

const verifyToken = require("../../middleware/authMiddleware");

const {
  signUpUser,
  loginUser,
  getUsers,
  logoutUser,
  getUser,
  updateUser,
  readUser,
  getLearnerUser,
} = require("../../controllers/userController");

const requireAuth = require("../../middleware/requireAuth");

const router = express.Router();

router.post(
  "/login",
  verifyToken,
  // jwt({
  //   secret: jwks.expressJwtSecret({
  //     jwksUri:
  //       "https://login.microsoftonline.com/" +
  //       config.auth.tenant +
  //       "/discovery/v2.0/keys",
  //   }),
  //   audience: config.auth.audience,
  //   issuer: "https://login.microsoftonline.com/" + config.auth.tenant + "/v2.0",
  //   algorithms: ["RS256"],
  // }),
  // jwtAuthz(["Data.ReadAndWrite"], {
  //   customScopeKey: "scp",
  //   customUserKey: "auth",
  // }),
  loginUser
);

router.post("/signup", signUpUser);

router.get("/getUsers", requireAuth, getUsers);

router.get("/getUser", requireAuth, getUser);

router.get("/readUser", requireAuth, readUser);

router.get("/logout", requireAuth, logoutUser);

router.patch("/:userId", requireAuth, updateUser);

router.get("/getLearnerUser", getUser);

module.exports = router;
