"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaTrashAlt } from "react-icons/fa";

export default function CatatanAnda() {
  const fadeUp = { hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } };

  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState("");

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

  // ✅ Ambil catatan saat pertama kali page dibuka
  useEffect(() => {
    async function fetchNotes() {
      try {
        const res = await fetch(`${API_URL}/api/notes`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        setNotes(data.data || []); // backend mengirim { data: [...] }
      } catch (err) {
        console.error("Gagal mengambil catatan:", err);
      }
    }

    if (token) fetchNotes();
  }, [token]);

  // ✅ Tambah catatan ke database
  const handleAddNote = async () => {
    if (!newNote.trim()) return;

    try {
      const res = await fetch(`${API_URL}/api/notes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ noteContent: newNote, noteType: "general" }),
      });

      const data = await res.json();

      if (data.data) {
        setNotes([...notes, data.data]); // Tambah note baru ke UI
        setNewNote("");
      }
    } catch (err) {
      console.error("Gagal menambah catatan:", err);
    }
  };

  // ✅ Hapus catatan dari database
  const handleDeleteMainNote = async (id) => {
    try {
      await fetch(`${API_URL}/api/notes/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      setNotes(notes.filter((n) => n._id !== id));
    } catch (err) {
      console.error("Gagal menghapus catatan:", err);
    }
  };

  return (
    <motion.div variants={fadeUp} initial="hidden" animate="visible" transition={{ duration: 0.28, delay: 0.06 }}>
      <h3 className="text-[#2D3570] font-semibold mb-3 text-lg">Catatan Anda</h3>
      <div className="bg-white rounded-2xl shadow p-5">
        {notes.map((note) => (
          <div key={note._id} className="flex items-center justify-between bg-[#F5F7FB] rounded-lg p-3 mb-3">
            <p className="text-sm text-gray-700 flex-1">{note.noteContent}</p>
            <button
              onClick={() => handleDeleteMainNote(note._id)}
              className="text-[#FF5A5A] hover:text-red-700 ml-3"
            >
              <FaTrashAlt />
            </button>
          </div>
        ))}

        <p className="text-[#2D3570] font-semibold mt-6 mb-2 text-sm">Berikan catatan tambahan disini</p>

        <textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Ketik disini..."
          className="w-full border-2 border-[#E0E5F5] rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-[#2D3570] resize-none h-24 mb-3 text-[#2D3570]"
        />

        <button
          onClick={handleAddNote}
          className="bg-[#2D3570] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#1F2755] shadow text-sm"
        >
          Tambah
        </button>
      </div>
    </motion.div>
  );
}
