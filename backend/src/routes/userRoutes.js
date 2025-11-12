import express from "express";
import {
  registerUser,
  loginUser,
  getCurrentUser,
  forgotPassword, // ✅ tambahan baru
  verifyEmail,
  resetPassword,
  verifyResetToken
} from "../controllers/userController.js";

const router = express.Router();

// 🔹 Route User
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", getCurrentUser);
router.get("/verify", verifyEmail);
router.post("/reset-password", resetPassword);
router.get("/verify-reset", verifyResetToken);


// 🔹 Route Forgot Password (baru)
router.post("/forgot-password", forgotPassword);

export default router;
