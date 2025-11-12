import express from "express";
import {
  createCameraCapture,
  getAllCaptures,
  getCaptureById,
  getCapturesBySession,
  deleteCapture,
  deleteAllCaptures
} from "../controllers/cameraCaptureController.js";

const router = express.Router();

// ====== ROUTES ======

// ✅ Create new capture record
router.post("/", createCameraCapture);

// ✅ Get all captures (sorted)
router.get("/", getAllCaptures);

// ✅ Get captures by session
router.get("/session/:sessionId", getCapturesBySession);

// ✅ Get capture by sequential ID
router.get("/:captureId", getCaptureById);

// ✅ Delete 1 capture
router.delete("/:captureId", deleteCapture);

// ✅ Delete all captures
router.delete("/", deleteAllCaptures);

export default router;
