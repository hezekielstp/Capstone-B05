import Note from "../models/note.model.js";

/* ============================
   🔹 BUAT NOTE BARU
============================ */
export async function createNote(req, res) {
  try {
    const { noteContent, sessionId, noteType } = req.body;
    const userId = req.userId;  // ✅ Fixed: authMiddleware sets req.userId directly

    if (!noteContent || noteContent.trim() === "") {
      return res.status(400).json({ message: "Isi catatan tidak boleh kosong" });
    }

    const newNote = await Note.create({
      userId,
      sessionId: sessionId || null,
      noteType: noteType || "general",
      noteContent: noteContent.trim(),
    });

    return res.status(201).json({ data: newNote }); // ✅ FORMAT SESUAI FRONTEND
  } catch (error) {
    console.error("❌ Error createNote:", error);
    res.status(500).json({ message: "Gagal menyimpan catatan" });
  }
}

/* ============================
   🔹 AMBIL SEMUA NOTE USER
============================ */
export async function getNotes(req, res) {
  try {
    const userId = req.userId;  // ✅ Fixed: authMiddleware sets req.userId directly

    const notes = await Note.find({ userId })
      .populate("sessionId", "emotionLabel createdAt")
      .sort({ createdAt: -1 });

    return res.status(200).json({ data: notes }); // ✅ FORMAT SESUAI FRONTEND
  } catch (error) {
    console.error("❌ Error getNotes:", error);
    res.status(500).json({ message: "Gagal mengambil catatan" });
  }
}
/* ============================
   🔹 HAPUS NOTE
============================ */
export async function deleteNote(req, res) {
  try {
    const noteId = req.params.id;
    const userId = req.userId;  // ✅ Fixed: authMiddleware sets req.userId directly

    const note = await Note.findOne({ _id: noteId, userId });
    if (!note) {
      return res.status(404).json({ message: "Catatan tidak ditemukan" });
    }

    await Note.findByIdAndDelete(noteId);

    res.status(200).json({ message: "Catatan berhasil dihapus" });
  } catch (error) {
    console.error("❌ Error deleteNote:", error);
    res.status(500).json({ message: "Gagal menghapus catatan" });
  }
}
