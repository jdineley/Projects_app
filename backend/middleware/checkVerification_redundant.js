const User = require("../models/User");

const checkVerification = async (req, res, next) => {
  const { _id } = req.user;
  try {
    const user = await User.findById(_id);
    if (!user.isVerified) {
      return res
        .status(403)
        .json({ message: "Please verify your email first" });
    }
    next();
  } catch (error) {
    res.status(403).json({ error: error.message });
  }
};

module.exports = checkVerification;
