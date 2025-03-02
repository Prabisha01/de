//PROTECT THE MIDDLEWARE
const jwt = require("jsonwebtoken");
const asyncHandler = require("./async");
const User = require("../models/user");


exports.protect = async (req, res, next) => {
  let token = req.cookies.token || null; // Check token in cookies

  // If token exists in the header, use it
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    console.warn("❌ No token provided in request!");
    return res.status(401).json({ success: false, message: "Not authorized, no token" });
  }

  try {
    console.log("🔍 Verifying Token:", token);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      console.error("❌ User not found for token");
      return res.status(401).json({ success: false, message: "User not found" });
    }

    console.log("✅ Authenticated User:", req.user.id);
    next();
  } catch (error) {
    console.error("🔴 Token Verification Failed:", error.message);
    return res.status(401).json({ success: false, message: "Token is invalid" });
  }
};


// Grant access to specific roles , i.e publisher and admin

exports.authorize = (...roles) => {
  return (req, res, next) => {
    ///check if it is admin or publisher. user cannot access
    //  console.log(req.user.role);
    if (!roles.includes(req.user.role)) {
      // return next(new ErrorResponse(`User role ${req.user.roles} is not authorized to access this route`, 403));
      return res.status(403).json({
        message: `User role ${req.user.roles} is not authorized to access this route`,
      });
    }
    next();
  };
};
