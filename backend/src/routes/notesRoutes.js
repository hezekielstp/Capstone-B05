import express from "express";
import { createNote, getNotes, deleteNote } from "../controllers/noteController.js";
import { verifyToken } from "../middlewares/authMiddleware.js"; // middleware auth untuk ambil user dari token

const router = express.Router();

// Semua route pakai token
router.post("/", verifyToken, createNote);
router.get("/", verifyToken, getNotes);
router.delete("/:id", verifyToken, deleteNote);

export default router;
