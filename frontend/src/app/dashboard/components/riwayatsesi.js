"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaEdit, FaTrashAlt, FaTimes, FaChevronDown } from "react-icons/fa";

export default function RiwayatSesi({
  latestEmotion,
  latestTime,
  latestDate,
  latestPhoto,
}) {
  const fadeUp = { hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0 } };

  const moods = ["Positif", "Netral", "Negatif"];
  const emojiPaths = {
    Positif: "/rekaman/positif.png",
    Netral: "/rekaman/netral.png",
    Negatif: "/rekaman/negatif.png",
  };
  const emojiImages = {
    Positif: "/positif.png",
    Negatif: "/negatif.png",
    Netral: "/netral.png",
  };

  const now = new Date();

  // === SIMULASI EEG 7 HARI TERAKHIR ===
  const [sessions, setSessions] = useState(() => {
    const allSessions = [];
    const intervalMs = 10000;
    const durationPerDay = 30 * 60 * 1000;
    const entriesPerDay = durationPerDay / intervalMs;

    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const dayDate = new Date(now);
      dayDate.setDate(now.getDate() - dayOffset);
      const baseTime = new Date(dayDate);
      baseTime.setHours(9, 0, 0, 0);

      for (let i = 0; i < entriesPerDay; i++) {
        const timestamp = new Date(baseTime.getTime() + i * intervalMs);
        const mood = moods[Math.floor(Math.random() * moods.length)];
        allSessions.push({
          mood,
          note: "",
          tempNote: "",
          showInput: false,
          photo: emojiPaths[mood],
          time: timestamp.toLocaleTimeString("id-ID", { hour12: false }),
          date: timestamp.toLocaleDateString("id-ID"),
          timestamp,
        });
      }
    }
    return allSessions.sort((a, b) => b.timestamp - a.timestamp);
  });

  // 🟢 sinkronisasi entri terbaru dengan emosi & foto real-time
  useEffect(() => {
    if (!latestEmotion || !latestTime || !latestDate) return;
    setSessions((prev) => {
      const updated = [...prev];
      if (updated.length > 0) {
        updated[0].mood = latestEmotion;
        updated[0].time = latestTime;
        updated[0].date = latestDate;
        updated[0].photo = latestPhoto || "/flowers.png";
        updated[0].timestamp = new Date();
      }
      return updated;
    });
  }, [latestEmotion, latestTime, latestDate, latestPhoto]);

  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(null);

  const handleToggleInput = (i) => {
    const updated = [...sessions];
    updated[i].showInput = !updated[i].showInput;
    updated[i].tempNote = updated[i].note;
    setSessions(updated);
  };

  const handleTempNoteChange = (i, val) => {
    const updated = [...sessions];
    updated[i].tempNote = val;
    setSessions(updated);
  };

  const handleSaveNote = (i) => {
    const updated = [...sessions];
    updated[i].note = updated[i].tempNote;
    updated[i].showInput = false;
    setSessions(updated);
  };

  const handleDeleteNote = (i) => {
    const updated = [...sessions];
    updated[i].note = "";
    updated[i].tempNote = "";
    updated[i].showInput = false;
    setSessions(updated);
  };

  const handleShowPhoto = (i) => setCurrentPhotoIndex(i);
  const handleClosePhoto = () => setCurrentPhotoIndex(null);

  return (
    <div>
      <h3 className="text-[#2D3570] font-semibold mb-3 text-lg">
        Riwayat Sesi (7 Hari Terakhir)
      </h3>
      <div className="relative">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.28, delay: 0.05 }}
          className="bg-white rounded-2xl shadow p-5 max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-[#CBD5E1] scrollbar-track-transparent transition-transform duration-200 hover:shadow-lg hover:-translate-y-1"
        >
          {sessions.map((s, i) => (
            <div key={i} className="bg-[#F5F7FB] rounded-xl p-3 mb-3 flex flex-col">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={emojiImages[s.mood]}
                    alt={s.mood}
                    className="w-10 h-10 object-contain"
                  />
                  <div>
                    <p className="font-semibold text-[#2D3570]">{s.mood}</p>
                    <p className="text-xs text-gray-500">
                      {s.time} • {s.date}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleToggleInput(i)}
                    className="text-gray-500 hover:text-[#2D3570]"
                  >
                    <FaEdit size={14} />
                  </button>
                  <button
                    onClick={() => handleShowPhoto(i)}
                    className="text-[#2D3570] text-sm font-medium hover:underline"
                  >
                    Lihat Foto
                  </button>
                </div>
              </div>

              {s.showInput && (
                <div className="mt-3 bg-white rounded-lg border border-[#E0E5F5] p-2">
                  <textarea
                    value={s.tempNote}
                    onChange={(e) => handleTempNoteChange(i, e.target.value)}
                    placeholder="Tulis catatan disini..."
                    className="w-full text-[#2D3570] text-sm outline-none resize-none"
                  />
                  <div className="flex justify-end gap-2 mt-2">
                    <button
                      onClick={() => handleSaveNote(i)}
                      className="bg-[#2D3570] text-white px-3 py-1 rounded-md text-sm font-semibold hover:bg-[#1F2755]"
                    >
                      Simpan
                    </button>
                  </div>
                </div>
              )}

              {s.note && !s.showInput && (
                <div className="mt-2 flex justify-between items-start bg-white p-2 rounded-lg border border-[#E0E5F5]">
                  <p className="text-sm text-[#2D3570] flex-1">{s.note}</p>
                  <button
                    onClick={() => handleDeleteNote(i)}
                    className="text-[#FF5A5A] hover:text-red-700 ml-2"
                  >
                    <FaTrashAlt size={14} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </motion.div>

        <div className="absolute bottom-1 left-0 right-0 flex justify-center pointer-events-none">
          <FaChevronDown className="text-gray-400 animate-bounce" size={18} />
        </div>
      </div>

      {/* Modal Foto */}
      <AnimatePresence>
        {currentPhotoIndex !== null && (
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
                onClick={handleClosePhoto}
                className="absolute top-3 right-3 text-[#2D3570] hover:text-[#1F2755]"
              >
                <FaTimes size={18} />
              </button>
              <h3 className="text-[#2D3570] font-semibold mb-3 text-lg text-center">
                Hasil Rekaman Foto
              </h3>
              <img
                src={sessions[currentPhotoIndex].photo}
                alt={`Foto ${sessions[currentPhotoIndex].mood}`}
                className="w-full h-64 object-cover rounded-xl"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
