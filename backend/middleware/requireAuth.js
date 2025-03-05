const jwt = require("jsonwebtoken");
const User = require("../models/User");
const jwksClient = require("jwks-rsa");

const clientId = process.env.CLIENTID;

const client = jwksClient({
  jwksUri: `https://login.microsoftonline.com/common/discovery/v2.0/keys`,
});

// Get signing key from the JWKS endpoint
const getKey = (header, callback) => {
  client.getSigningKey(header.kid, (err, key) => {
    if (err) {
      return callback(err);
    }
    const signingKey = key.getPublicKey();
    callback(null, signingKey);
  });
};

const requireAuth = async (req, res, next) => {
  // verify authenication
  console.log("in require Auth");
  const { authorization } = req.headers;
  if (!authorization) {
    return res.status(401).json({ error: "Authorization token required" });
  }

  const token = authorization.split(" ")[1];
  try {
    //verify provides the payload unhashed if no error {_id: 5443wfr435...}
    const { _id } = jwt.verify(token, process.env.SECRET);

    req.user = await User.findOne({ _id }).populate([
      "projects",
      "userInProjects",
    ]);
    // .select([
    //   "_id",
    //   "email",
    //   "isDemo",
    //   "isTest",
    //   "isVerified",
    // ]);
    // console.log("req.user", req.user);
    if (!req.user.isVerified) {
      return res
        .status(401)
        .json({ error: "User's email requires verification" });
    }
    next();
  } catch (error) {
    console.log(error);

    console.log("in requireEntraIDAuth");
    if (req.user?._id) {
      return next();
    }
    const authHeader = req.headers.authorization;
    // const { _id } = req.headers;
    // console.log("_id", _id);
    if (!authHeader) {
      return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    // console.log("token", token);
    jwt.verify(
      token,
      getKey,
      {
        audience: clientId,
        issuer: (iss) => {
          // console.log("Issuer:", iss);
          if (
            iss ===
            "https://login.microsoftonline.com/9188040d-6c67-4c5b-b112-36a304b66dad/v2.0"
          ) {
            return true;
          }
          if (
            iss.startsWith("https://login.microsoftonline.com/") &&
            iss.endsWith("/v2.0")
          ) {
            return true;
          }
          return false;
        },
        algorithms: ["RS256"],
      },
      async (err, decoded) => {
        if (err) {
          console.error("Token Verification Error:", err);
          return res.status(401).json({ error: "Invalid token" });
        }
        // console.log("Decoded Token:", decoded);
        const { scp } = decoded;
        if (scp === "Data.ReadAndWrite") {
          const user = await User.findOne({ objectID: decoded.oid })
            .populate(["projects", "userInProjects"])
            .lean();
          req.user = { ...user, decoded, accessToken: token };
          // _id: user?._id
          next();
        } else {
          return res.status(401).json({
            error: "The necessary permissions haven't been granted",
          });
        }
      }
    );
  }
};

module.exports = requireAuth;
