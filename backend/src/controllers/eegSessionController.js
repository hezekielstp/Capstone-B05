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

/* ===============================================================
   🧩 KODE LAMA — Jalankan Python langsung ke MongoDB (❌ Sekarang dikomentari)
=================================================================
// 🧩 Fitur baru — Generate 5 data dummy EEGSession lewat Python
export async function generateDummySessions(req, res) {
  try {
    const userId = req.userId; // ✅ didapat dari middleware verifyToken

    if (!userId) {
      return res.status(400).json({ message: "User ID tidak ditemukan." });
    }

    console.log(`🚀 Menjalankan generator dummy untuk userId: ${userId}`);

    // Jalankan Python script di folder backend/
    const process = spawn("python", ["generate_dummy_session.py", userId]);

    // Output dari Python script (stdout)
    process.stdout.on("data", (data) => {
      console.log(`[PYTHON LOG]: ${data}`);
    });

    // Jika terjadi error di Python
    process.stderr.on("data", (data) => {
      console.error(`[PYTHON ERROR]: ${data}`);
    });

    // Ketika script selesai
    process.on("close", (code) => {
      console.log(`✅ Python process exited with code ${code}`);
    });

    // Balas ke client agar tidak menunggu Python selesai
    return res.status(200).json({
      message: "🚀 Proses generate dummy data dimulai.",
      userId,
    });
  } catch (err) {
    console.error("❌ Gagal menjalankan generator dummy:", err);
    return res.status(500).json({
      message: "Gagal menjalankan generator dummy.",
      error: err.message,
    });
  }
}
================================================================= */

/* ===============================================================
   🧩 KODE BARU — Python hanya generate mood, Node.js simpan ke DB
================================================================= */
export async function generateDummySessions(req, res) {
  try {
    const userId = req.userId; // ✅ dari middleware verifyToken

    if (!userId) {
      return res.status(400).json({ message: "User ID tidak ditemukan." });
    }

    console.log(`🚀 Generate dummy untuk userId: ${userId}`);

    // Jalankan Python script (tanpa kirim userId)
    const process = spawn("python", ["generate_dummy.py"]);

    let output = "";

    // Ambil hasil output Python
    process.stdout.on("data", (data) => {
      output += data.toString();
    });

    // Tangani error dari Python
    process.stderr.on("data", (data) => {
      console.error("[PYTHON ERROR]:", data.toString());
    });

    // Ketika proses selesai
    process.on("close", async (code) => {
      if (code !== 0) {
        console.error("❌ Python exited with code", code);
        return res.status(500).json({ message: "Python script error." });
      }

      try {
        // Parsing hasil JSON dari Python
        const dummySessions = JSON.parse(output);

        // 🧠 Masukkan ke MongoDB via Mongoose
        const inserted = await EEGSession.insertMany(
          dummySessions.map((d) => ({
            userId,
            mood: d.mood,
            photoPath: d.photoPath,
          }))
        );

        console.log(`✅ ${inserted.length} dummy session berhasil ditambahkan.`);
        return res.status(201).json({
          message: "Dummy session berhasil dibuat.",
          data: inserted,
        });
      } catch (err) {
        console.error("⚠️ Gagal parsing/insert hasil Python:", err);
        return res.status(500).json({
          message: "Gagal menyimpan hasil dari Python.",
          error: err.message,
        });
      }
    });
  } catch (err) {
    console.error("❌ Gagal menjalankan generator dummy:", err);
    return res.status(500).json({
      message: "Gagal menjalankan generator dummy.",
      error: err.message,
    });
  }
}
