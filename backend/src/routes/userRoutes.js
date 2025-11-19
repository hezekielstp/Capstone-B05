import express from "express";
import {
  registerUser,
  loginUser,
  getCurrentUser,
  forgotPassword,
  verifyEmail,
  resetPassword,
  verifyResetToken,
  resendUserId, // ✅ New: Resend User ID email
} from "../controllers/userController.js";
import { verifyToken } from "../middlewares/authMiddleware.js"; // ✅ Import auth middleware

const router = express.Router();

// 🔹 Route User
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", getCurrentUser);
router.get("/verify", verifyEmail);
router.post("/reset-password", resetPassword);
router.get("/verify-reset", verifyResetToken);

// 🔹 Route Forgot Password
router.post("/forgot-password", forgotPassword);

// 🔹 Route Resend User ID (requires authentication)
router.post("/resend-userid", verifyToken, resendUserId);

export default router;
