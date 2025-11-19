import express from "express";
import { verifyToken } from "../middlewares/authMiddleware.js";
import { 
  getSessions, 
  createSession, 
  updateSessionNote,
  runRealtimeInference,
  startInferenceSession,
  stopInferenceSession,
  pauseInferenceSession,
  resumeInferenceSession,
  getInferenceStatus,
} from "../controllers/eegSessionController.js";

const router = express.Router();

// GET semua sesi user
router.get("/", verifyToken, getSessions);

// POST tambah sesi baru
router.post("/", verifyToken, createSession);

// PATCH update catatan
router.patch("/:id", verifyToken, updateSessionNote);

// 🧠 Jalankan inference Python → simpan ke MongoDB (single run)
router.post("/inference", verifyToken, runRealtimeInference);

// 🎮 Inference session controls
router.post("/inference/start", verifyToken, startInferenceSession);
router.post("/inference/stop", verifyToken, stopInferenceSession);
router.post("/inference/pause", verifyToken, pauseInferenceSession);
router.post("/inference/resume", verifyToken, resumeInferenceSession);
router.get("/inference/status", verifyToken, getInferenceStatus);

export default router;
