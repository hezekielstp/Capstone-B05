import Note from "../models/note.model.js";

/* ============================
   🔹 BUAT NOTE BARU
============================ */
export async function createNote(req, res) {
  try {
    const { noteContent, sessionId, noteType } = req.body;
    const userId = req.user?.id || req.userId;

    if (!noteContent || noteContent.trim() === "") {
      return res.status(400).json({ message: "Isi catatan tidak boleh kosong" });
    }

    const newNote = new Note({
      userId,
      sessionId: sessionId || null,
      noteType: noteType || "general",
      noteContent: noteContent.trim(),
    });

    await newNote.save();

    res.status(201).json({
      message: "Catatan berhasil disimpan",
      note: newNote,
    });
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
    const userId = req.user?.id || req.userId;

    const notes = await Note.find({ userId })
      .populate("sessionId", "emotionLabel createdAt")
      .sort({ createdAt: -1 });

    res.status(200).json(notes);
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
    const userId = req.user?.id || req.userId;

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
