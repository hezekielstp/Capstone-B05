import EEGSession from "../models/eegSession.model.js";

// Ambil semua sesi milik user yg login
export async function getSessions(req, res) {
  try {
    const sessions = await EEGSession.find({ userId: req.userId })
      .sort({ createdAt: -1 });

    return res.status(200).json(sessions);
  } catch (err) {
    return res.status(500).json({ message: "Gagal mengambil sesi", error: err.message });
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
    return res.status(500).json({ message: "Gagal membuat sesi", error: err.message });
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
      return res.status(404).json({ message: "Sesi tidak ditemukan atau tidak memiliki izin." });
    }

    return res.status(200).json(updated);
  } catch (err) {
    return res.status(500).json({ message: "Gagal memperbarui catatan", error: err.message });
  }
}
