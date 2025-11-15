import EEGSession from "../models/eegSession.model.js";
import { spawn } from "child_process"; // 🧩 Tambahan untuk jalankan Python script

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
