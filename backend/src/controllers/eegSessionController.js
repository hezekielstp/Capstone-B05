import EEGSession from "../models/eegSession.model.js";
import { spawn } from "child_process";
import {
  startUserInferenceSession,
  stopUserInferenceSession,
  pauseUserInferenceSession,
  resumeUserInferenceSession,
  getUserInferenceStatus,
  toggleManualMode,
  queueManualEmotion,
} from "../services/inferenceService.js";

// Ambil semua sesi milik user yg login
export async function getSessions(req, res) {
  try {
    const sessions = await EEGSession.find({ userId: req.userId }).sort({
      createdAt: -1,
    });

    return res.status(200).json(sessions);
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Gagal mengambil sesi", error: err.message });
  }
}

// Tambah sesi baru
export async function createSession(req, res) {
  try {
    const { mood, photoPath } = req.body;

    const session = await EEGSession.create({
      userId: req.userId,
      mood,
      photoPath,
    });

    return res.status(201).json(session);
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Gagal membuat sesi", error: err.message });
  }
}

// Update catatan sebuah sesi
export async function updateSessionNote(req, res) {
  try {
    const { note } = req.body;

    const updated = await EEGSession.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId }, // memastikan user hanya bisa update datanya sendiri
      { note },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({
        message: "Sesi tidak ditemukan atau tidak memiliki izin.",
      });
    }

    return res.status(200).json(updated);
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Gagal memperbarui catatan", error: err.message });
  }
}

// ===============================================================
// 🧠 FITUR BARU — Jalankan inference EEG (Python) & simpan ke MongoDB
// ===============================================================
export async function runRealtimeInference(req, res) {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(400).json({ message: "User ID tidak ditemukan." });
    }

    // Jalankan script Python inference
    const py = spawn("python", ["inference/inference.py"]);

    let output = "";

    py.stdout.on("data", (data) => {
      output += data.toString();
    });

    py.stderr.on("data", (data) => {
      console.error("[PYTHON ERROR]:", data.toString());
    });

    py.on("close", async (code) => {
      if (code !== 0) {
        return res.status(500).json({
          message: "Python inference error",
        });
      }

      try {
        // Ambil hasil JSON dari Python
        const result = JSON.parse(output);

        // Simpan session baru ke DB
        const saved = await EEGSession.create({
          userId,
          mood: result.prediction,     // Negatif / Netral / Positif
          probabilities: result.probabilities,
          photoPath: null,
          note: "",
        });

        return res.status(201).json({
          message: "Inference berhasil",
          data: saved,
        });
      } catch (err) {
        return res.status(500).json({
          message: "Gagal parsing hasil Python",
          error: err.message,
        });
      }
    });
  } catch (err) {
    return res.status(500).json({
      message: "Gagal menjalankan inference",
      error: err.message,
    });
  }
}

// ===============================================================
// 🎮 INFERENCE SESSION CONTROLS
// ===============================================================

/**
 * Start automatic inference session (every 10 seconds)
 */
export function startInferenceSession(req, res) {
  try {
    const userId = req.userId;
    const result = startUserInferenceSession(userId);
    
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({
      message: "Failed to start inference session",
      error: err.message,
    });
  }
}

/**
 * Stop automatic inference session
 */
export function stopInferenceSession(req, res) {
  try {
    const userId = req.userId;
    const result = stopUserInferenceSession(userId);
    
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({
      message: "Failed to stop inference session",
      error: err.message,
    });
  }
}

/**
 * Pause inference session (keeps running but doesn't save to DB)
 */
export function pauseInferenceSession(req, res) {
  try {
    const userId = req.userId;
    const result = pauseUserInferenceSession(userId);
    
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({
      message: "Failed to pause inference session",
      error: err.message,
    });
  }
}

/**
 * Resume inference session (start saving to DB again)
 */
export function resumeInferenceSession(req, res) {
  try {
    const userId = req.userId;
    const result = resumeUserInferenceSession(userId);
    
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({
      message: "Failed to resume inference session",
      error: err.message,
    });
  }
}

/**
 * Get inference session status
 */
export function getInferenceStatus(req, res) {
  try {
    const userId = req.userId;
    const status = getUserInferenceStatus(userId);
    
    return res.status(200).json(status);
  } catch (err) {
    return res.status(500).json({
      message: "Failed to get inference status",
      error: err.message,
    });
  }
}

/**
 * Toggle manual control mode
 */
export function toggleManualControl(req, res) {
  try {
    const userId = req.userId;
    const { enabled } = req.body;
    
    const result = toggleManualMode(userId, enabled);
    
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({
      message: "Failed to toggle manual mode",
      error: err.message,
    });
  }
}

/**
 * Set manual emotion (queues emotion for next inference cycle)
 */
export function setManualEmotion(req, res) {
  try {
    const userId = req.userId;
    const { emotion } = req.body;
    
    if (!["Positif", "Netral", "Negatif"].includes(emotion)) {
      return res.status(400).json({
        message: "Invalid emotion. Must be Positif, Netral, or Negatif",
      });
    }
    
    queueManualEmotion(userId, emotion);
    
    // Broadcast via Socket.IO
    const io = req.app.get("io");
    io.emit("emotion-override", { userId: userId.toString(), emotion });
    
    return res.status(200).json({
      success: true,
      message: "Manual emotion queued",
      emotion,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Failed to set manual emotion",
      error: err.message,
    });
  }
}
