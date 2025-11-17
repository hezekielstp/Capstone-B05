import express from "express";
import {
  uploadFromESP32,
  createCameraCapture,
  getAllCaptures,
  getCaptureById,
  getCapturesBySession,
  deleteCapture,
  deleteAllCaptures
} from "../controllers/cameraCaptureController.js";

const router = express.Router();

// ====== ROUTES ======

// ✅ ESP32-CAM upload endpoint (raw binary JPEG)
// This route is mounted at /api/camera with express.raw middleware in server.js
router.post("/upload", uploadFromESP32);

// ✅ Create new capture record
router.post("/", createCameraCapture);

// ✅ Get all captures (sorted)
router.get("/", getAllCaptures);

// ✅ Get captures by session (MUST come before /:captureId)
router.get("/session/:sessionId", getCapturesBySession);

// ✅ Get capture by sequential ID
router.get("/:captureId", getCaptureById);

// ✅ Delete all captures (MUST come before /:captureId)
router.delete("/all", deleteAllCaptures);

// ✅ Delete 1 capture
router.delete("/:captureId", deleteCapture);

export default router;
