import express from "express";
import {
  registerUser,
  loginUser,
  getCurrentUser,
  forgotPassword, // ✅ tambahan baru
} from "../controllers/userController.js";

const router = express.Router();

// 🔹 Route User
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", getCurrentUser);

// 🔹 Route Forgot Password (baru)
router.post("/forgot-password", forgotPassword);

export default router;
