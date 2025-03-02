const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const upload = require("../middleware/uploads");

const {
  getUsers,
  register,
  login,
  logout,
  updateUser,
  deleteUser,
  uploadImage,
  getMe,
  checkAdmin,
  adminGetUsers,
  adminUpdateUser,
  adminDeleteUser,
  getSubscription,
  updateProfilePicture,
} = require("../controllers/user");

router.post("/uploadImage", upload.single("image"), uploadImage);
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/getAllUsers", protect, getUsers);
router.put("/updateUser/:id", protect, updateUser);
router.delete("/deleteUser/:id", protect, deleteUser);
router.get("/getMe", protect, getMe);
router.get("/subscription", protect, getSubscription);

router.put(
  "/updateProfilePicture",
  protect,
  upload.single("profilePicture"),
  updateProfilePicture
);

// Admin routes
router.get("/admin/users", protect, checkAdmin, adminGetUsers);
router.put("/admin/users/:id", protect, checkAdmin, adminUpdateUser);
router.delete("/admin/users/:id", protect, checkAdmin, adminDeleteUser);

module.exports = router;
