const jwt = require("jsonwebtoken");
const jwksClient = require("jwks-rsa");
const User = require("../models/User");

// Replace with your Entra ID Tenant ID
// const tenantId = "ff447367-496a-49c8-a501-4779ea49961f";
const clientId = process.env.CLIENTID;

// Configure JWKS Client
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

// Middleware to verify token
const verifyToken = (req, res, next) => {
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
  console.log("token", token);
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
      console.log("Decoded Token:", decoded);
      const { scp } = decoded;
      if (scp === "Data.ReadAndWrite") {
        const user = await User.findOne({ objectID: decoded.oid });

        req.user = { decoded, accessToken: token, _id: user?._id };
        next();
      } else {
        return res
          .status(401)
          .json({ error: "The necessary permissions haven't been granted" });
      }
    }
  );
};

module.exports = verifyToken;
