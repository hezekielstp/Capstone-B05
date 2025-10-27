import express from "express";
import { verifyToken } from "../middlewares/authMiddleware.js";
import { getSessions, createSession, updateSessionNote } from "../controllers/eegSessionController.js";

const router = express.Router();

// GET semua sesi user
router.get("/", verifyToken, getSessions);

// POST tambah sesi baru
router.post("/", verifyToken, createSession);

// PATCH update catatan
router.patch("/:id", verifyToken, updateSessionNote);

export default router;
