"use client";
import { motion, AnimatePresence } from "framer-motion";
import { FaEdit, FaTrashAlt, FaTimes } from "react-icons/fa";

export default function RiwayatSesiItem({
  data,
  index,
  onToggleInput,
  onTempNoteChange,
  onSaveNote,
  onDeleteNote,
  onShowPhoto,
}) {
  const { mood, note, tempNote, showInput, showPhoto, photo, time, date } = data;

  const emojiImages = {
    Positif: "/positif.png",
    Negatif: "/negatif.png",
    Netral: "/netral.png",
  };

  return (
    <div className="bg-[#F5F7FB] rounded-xl p-3 mb-3 flex flex-col">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={emojiImages[mood]} alt={mood} className="w-10 h-10 object-contain" />
          <div>
            <p className="font-semibold text-[#2D3570]">{mood}</p>
            <p className="text-xs text-gray-500">
              {time} • {date}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => onToggleInput(index)} className="text-gray-500 hover:text-[#2D3570]">
            <FaEdit size={14} />
          </button>
          <button
            onClick={() => onShowPhoto(index)}
            className="text-[#2D3570] text-sm font-medium hover:underline"
          >
            Lihat Foto
          </button>
        </div>
      </div>

      {showInput && (
        <div className="mt-3 bg-white rounded-lg border border-[#E0E5F5] p-2">
          <textarea
            value={tempNote}
            onChange={(e) => onTempNoteChange(index, e.target.value)}
            placeholder="Tulis catatan disini..."
            className="w-full text-[#2D3570] text-sm outline-none resize-none"
          />
          <div className="flex justify-end gap-2 mt-2">
            <button
              onClick={() => onSaveNote(index)}
              className="bg-[#2D3570] text-white px-3 py-1 rounded-md text-sm font-semibold hover:bg-[#1F2755]"
            >
              Simpan
            </button>
          </div>
        </div>
      )}

      {note && !showInput && (
        <div className="mt-2 flex justify-between items-start bg-white p-2 rounded-lg border border-[#E0E5F5]">
          <p className="text-sm text-[#2D3570] flex-1">{note}</p>
          <button
            onClick={() => onDeleteNote(index)}
            className="text-[#FF5A5A] hover:text-red-700 ml-2"
          >
            <FaTrashAlt size={14} />
          </button>
        </div>
      )}

      {/* Popup Foto */}
      {showPhoto && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50"
          >
            <motion.div
              initial={{ scale: 0.96, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.96, y: 16 }}
              transition={{ duration: 0.18 }}
              className="bg-white rounded-2xl shadow-xl p-6 w-[90%] max-w-md relative"
            >
              <button
                onClick={() => onShowPhoto(index)}
                className="absolute top-3 right-3 text-[#2D3570] hover:text-[#1F2755]"
              >
                <FaTimes size={18} />
              </button>
              <h3 className="text-[#2D3570] font-semibold mb-3 text-lg text-center">
                Hasil Rekaman Foto
              </h3>
              <img
                src={photo}
                alt={`Foto ${mood}`}
                className="w-full h-64 object-cover rounded-xl"
              />
            </motion.div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
