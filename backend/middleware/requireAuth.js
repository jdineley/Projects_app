const jwt = require("jsonwebtoken");
const User = require("../models/User");

const requireAuth = async (req, res, next) => {
  // verify authenication
  console.log("in require Auth");
  const { authorization } = req.headers;
  // authorization = 'bearer dfdsf43grs.gfgdf6e56367.hjncbdgtjdgj663456yh'
  if (!authorization) {
    return res.status(401).json({ error: "Authorization token required" });
  }

  const token = authorization.split(" ")[1];
  try {
    //verify provides the payload unhashed if no error {_id: 5443wfr435...}
    const { _id } = jwt.verify(token, process.env.SECRET);

    req.user = await User.findOne({ _id }).select([
      "_id",
      "email",
      "isDemo",
      "isTest",
    ]);
    next();
  } catch (error) {
    console.log(error);
    next();
    // res.status(401).json({ error: "Request is not authorized" });
  }
};

module.exports = requireAuth;
