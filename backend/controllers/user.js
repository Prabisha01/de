const asyncHandler = require("../middleware/async");
const User = require("../models/user");
const path = require("path");
const fs = require("fs");
const Board = require("../models/board");

// @desc    Get all users
// @route   GET /api/v1/users
// @access  Private

exports.getUsers = asyncHandler(async (req, res, next) => {
  const users = await User.find({});
  res.status(200).json({
    success: true,
    count: users.length,
    data: users,
  });
});

// @desc    Get single users
// @route   GET /api/v1/users/:id
// @access  Private

exports.getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return res
      .status(404)
      .json({ message: "User not found with id of ${req.params.id}" });
  } else {
    res.status(200).json({
      success: true,
      data: user,
    });
  }
});

// @desc    Create new user
// @route   POST /api/v1/users
// @access  Public

exports.register = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  console.log(req.body);
  if (user) {
    return res.status(400).send({ message: "User already exists" });
  }

  await User.create(req.body);

  res.status(200).json({
    success: true,
    message: "User created successfully",
  });
});

// @desc   Login user
// @route  POST /api/v1/users/login
// @access Public

exports.login = asyncHandler(async (req, res, next) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Please provide a username and password" });
  }

  // Check if user exists
  const user = await User.findOne({ username }).select("+password");

  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  sendTokenResponse(user, 200, res);
});

exports.logout = (req, res) => {
  res.cookie("token", "", {
    // Change from req.cookie to res.cookie
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ success: true, message: "Logged out successfully" });
};

// @desc    Update user
// @route   PUT /api/v1/users/:id
// @access  Private

exports.updateUser = asyncHandler(async (req, res, next) => {
  const updates = req.body;
  const updatedUser = await User.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  });

  if (!updatedUser) {
    return res.status(404).json({ message: "User not found" });
  }

  res.status(200).json({
    success: true,
    message: "User updated successfully",
    data: updatedUser,
  });
});

// Add this new controller function
exports.getSubscription = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("plan planExpiresAt");

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  res.status(200).json({
    success: true,
    data: {
      plan: user.plan || "free",
      expiresAt: user.planExpiresAt,
    },
  });
});

// Get current user
// @route   GET /api/v1/users/me
// @access  Private

exports.getMe = async (req, res) => {
  console.log(
    "getMe controller START - Request received for user ID:",
    req.user && req.user._id
  ); // Log at start

  try {
    console.log("getMe controller - Inside TRY block"); // Log inside try
    if (!req.user) {
      console.log(
        "getMe controller -  req.user is NULL/undefined - Authorization Problem?"
      ); // Check for req.user issue
      return res
        .status(401)
        .json({ success: false, message: "Not authorized (inside getMe)" });
    }

    console.log("getMe controller -  req.user is:", req.user); // Log the req.user object

    // Count boards associated with the user
    console.log("getMe controller -  Before Board.countDocuments"); // Log before DB query
    const boardCount = await Board.countDocuments({ user: req.user._id });
    console.log(
      "getMe controller -  After Board.countDocuments, count:",
      boardCount
    ); // Log after DB query

    // Add boardCount to the user object being sent in response
    const userDataWithCount = {
      ...req.user.toObject(),
      boardsCount: boardCount,
    };

    console.log("getMe controller -  Response data:", userDataWithCount); // Log response data
    res.status(200).json({ success: true, data: userDataWithCount });
  } catch (error) {
    console.error("getMe controller -  ERROR caught:", error); // Log ERROR with full error object
    res.status(500).json({ success: false, message: "Server error (getMe)" });
  } finally {
    console.log("getMe controller FINISH - Request processing completed"); // Log at the end
  }
};

// @desc    Delete user
// @route   DELETE /api/v1/users/:id
// @access  Private

exports.deleteUser = asyncHandler(async (req, res, next) => {
  console.log(req.params.id);
  User.findByIdAndDelete(req.params.id)
    .then((user) => {
      if (user != null) {
        var imagePath = path.join(
          __dirname,
          "..",
          "public",
          "uploads",
          user.image
        );

        fs.unlink(imagePath, (err) => {
          if (err) {
            console.log(err);
          }
          res.status(200).json({
            success: true,
            message: "User deleted successfully",
          });
        });
      } else {
        res.status(400).json({
          success: false,
          message: "User not found",
        });
      }
    })
    .catch((err) => {
      res.status(500).json({
        success: false,
        message: err.message,
      });
    });
});

// @desc Upload Single Image
// @route POST /api/v1/users/upload
// @access Private
const uploadImage = async (req, res) => {
  // Renamed function
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    res.json({
      message: "Profile picture updated successfully",
      filename: req.file.filename,
    });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

exports.uploadImage = uploadImage; // Correct export

// @desc Upload Single Image
// @route POST /api/v1/users/upload
// @access Private
// In controllers/user.js
exports.updateProfilePicture = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: "No file uploaded" });
  }

  const user = await User.findByIdAndUpdate(
    req.user.id,
    { profilePicture: req.file.path },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    data: (user.profilePicture = `/uploads/${req.file.filename}`),
  });
});

// Send token response
const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();
  const options = {
    expires: new Date(
      Date.now() + (process.env.JWT_COOKIE_EXPIRE || 30) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") {
    options.secure = true;
  }

  res
    .status(statusCode)
    .cookie("token", token, options)
    .json({ success: true, token });
};

// Add admin middleware
exports.checkAdmin = asyncHandler(async (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Not authorized to access this route",
    });
  }
  next();
});

// Admin-only: Get all users with filters
exports.adminGetUsers = asyncHandler(async (req, res, next) => {
  const { role, plan, isBanned } = req.query;
  const filter = {};

  if (role) filter.role = role;
  if (plan) filter.plan = plan;
  if (isBanned) filter.isBanned = isBanned;

  const users = await User.find(filter).select("-password");

  res.status(200).json({
    success: true,
    count: users.length,
    data: users,
  });
});

// Admin: Update user status
exports.adminUpdateUser = asyncHandler(async (req, res, next) => {
  const updates = {
    role: req.body.role,
    isBanned: req.body.isBanned,
    plan: req.body.plan,
  };

  const user = await User.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  res.status(200).json({
    success: true,
    data: user,
  });
});

// Admin: Delete user
exports.adminDeleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  res.status(200).json({
    success: true,
    data: {},
  });
});
