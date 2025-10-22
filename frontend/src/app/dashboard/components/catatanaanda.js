"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { FaTrashAlt } from "react-icons/fa";

export default function CatatanAnda() {
  const fadeUp = { hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } };
  const [notes, setNotes] = useState([
    "Malam ini saya bersantai dan melihat bunga-bunga di taman sepertinya membuat saya menjadi sedikit lebih tenang dan happy.",
  ]);
  const [newNote, setNewNote] = useState("");

  const handleAddNote = () => {
    if (newNote.trim()) {
      setNotes([...notes, newNote]);
      setNewNote("");
    }
  };

  const handleDeleteMainNote = (i) => {
    const updated = notes.filter((_, index) => index !== i);
    setNotes(updated);
  };

  return (
    <motion.div variants={fadeUp} initial="hidden" animate="visible" transition={{ duration: 0.28, delay: 0.06 }}>
      <h3 className="text-[#2D3570] font-semibold mb-3 text-lg">Catatan Anda</h3>
      <div className="bg-white rounded-2xl shadow p-5">
        {notes.map((note, i) => (
          <div key={i} className="flex items-center justify-between bg-[#F5F7FB] rounded-lg p-3 mb-3">
            <p className="text-sm text-gray-700 flex-1">{note}</p>
            <button
              onClick={() => handleDeleteMainNote(i)}
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
