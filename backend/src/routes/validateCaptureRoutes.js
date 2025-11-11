import express from "express";
import { validateCapture } from "../controllers/validateCaptureController.js";

const router = express.Router();

// ✅ Validate metadata BEFORE uploading image
router.post("/", validateCapture);

export default router;
