import express from "express";
import { uploadPhotoFromESP32, triggerPhotoCapture } from "../controllers/esp32CameraController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

// ====== ESP32-CAM ROUTES ======

/**
 * POST /api/camera/upload
 * Endpoint untuk ESP32-CAM mengirim foto (raw JPEG binary data)
 * Header required: X-User-ID (MongoDB ObjectId user)
 * Body: Raw binary JPEG image data
 */
router.post(
  "/upload",
  express.raw({ type: "image/jpeg", limit: "5mb" }), // Accept raw binary JPEG data
  uploadPhotoFromESP32
);

/**
 * POST /api/camera/trigger
 * Endpoint dari web UI untuk memicu ESP32-CAM mengambil foto
 * Requires JWT authentication
 */
router.post("/trigger", verifyToken, triggerPhotoCapture);

export default router;
