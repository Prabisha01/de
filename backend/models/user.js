const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  isBanned: {
    type: Boolean,
    default: false,
  },
  plan: {
    type: String,
    enum: ["free", "premium"],
    default: "free",
  },
  lastLogin: Date,
  loginCount: {
    type: Number,
    default: 0,
  },
  username: {
    type: String,
    required: true,
    trim: true,
    unique: true, // Prevent duplicate usernames
  },
  email: {
    type: String,
    required: true,
    trim: true,
    unique: true, // Prevent duplicate emails
  },
  password: {
    type: String,
    required: true,
    trim: true,
  },
  profilePicture: {
    type: String,
    default: null,
  },
  boards: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "Board",
    },
  ],
  plan: {
    type: String,
    enum: ["free", "premium"],
    default: "free",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  planExpiresAt: Date,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
});

// Encrypt password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Generate JWT Token
userSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "30d",
  });
};

// Compare entered password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate and hash password reset token
userSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");

  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

  return resetToken;
};

module.exports = mongoose.model("User", userSchema);
