const express = require("express");
const {
  createUser,
  loginUser,
  getAllUsers,
  getUser,
  deleteUser,
  updateUser,
  blockUser,
  unBlockUser,
  refreshTokenHandler,
} = require("../controllers/user");
const {
  authMiddleware,
  isAdminMiddleware,
} = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/register", createUser);
router.post("/login", loginUser);

// Get all Users details API
router.get("/users", authMiddleware, isAdminMiddleware, getAllUsers);
// Handle Refresh Token
router.get("/refresh", refreshTokenHandler);
// Get User details API
router.get("/:id", authMiddleware, getUser);
// Delete User API
router.delete("/:id", authMiddleware, isAdminMiddleware, deleteUser);
// Update User API
router.put("/edit", authMiddleware, isAdminMiddleware, updateUser);
router.put("/block-user/:id", authMiddleware, isAdminMiddleware, blockUser);
router.put("/unblock-user/:id", authMiddleware, isAdminMiddleware, unBlockUser);

module.exports = router;
