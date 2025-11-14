"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { FaEdit, FaTrashAlt, FaTimes, FaChevronDown } from "react-icons/fa";
import { setGlobalSessions } from "./rekapemosi";

// 🧩 Tambahkan import komponen item
import RiwayatSesiItem from "./riwayatsesiitem";

export default function RiwayatSesi({
  latestEmotion,
  latestTime,
  latestDate,
  latestPhoto,
}) {
  const router = useRouter();
  const fadeUp = { hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0 } };

  const [sessions, setSessions] = useState([]);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(null);

  // ✅ FETCH SESSION + CAPTURE
  useEffect(() => {
    const fetchSessions = async () => {
      console.log("🔥 fetchSessions start");
      try {
        const API_BASE =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("token")
            : null;

        // ✅ GET SESSIONS
        const sessionRes = await fetch(`${API_BASE}/api/sessions`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        });

        const sessionJson = await sessionRes.json();
        const sessionsArray = Array.isArray(sessionJson)
          ? sessionJson
          : sessionJson.data;

        if (!sessionRes.ok || !sessionsArray || sessionsArray.length === 0) {
          setSessions([]);
          setGlobalSessions([]);
          return;
        }

        const sortedSessions = [...sessionsArray].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        let mapped = [];

        // ✅ FETCH CAPTURE PER SESSION
        for (const s of sortedSessions) {
          const capRes = await fetch(
            `${API_BASE}/api/captures/session/${s._id}`,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: token ? `Bearer ${token}` : "",
              },
            }
          );

          const capJson = await capRes.json();

          let photo = "/flowers.png";

          if (capJson?.data && capJson.data.length > 0) {
            let sortedCap = [...capJson.data].sort(
              (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
            );

            if (sortedCap[0]?.imageUrl) {
              photo = sortedCap[0].imageUrl;
            }
          }

          const ts = new Date(s.createdAt);

          mapped.push({
            _id: s._id,
            mood: s.mood || "Netral",
            note: s.note || "",
            tempNote: "",
            showInput: false,
            photo,
            timestamp: ts,
            isoDate: ts.toISOString().slice(0, 10),
            time: ts.toLocaleTimeString("id-ID", { hour12: false }),
            date: ts.toLocaleDateString("id-ID"),
          });
        }

        mapped.sort((a, b) => b.timestamp - a.timestamp);
        console.log("✅ MAPPED DATA →", mapped);

        setSessions(mapped);
        setGlobalSessions(mapped);

        try {
          if (typeof window !== "undefined") {
            sessionStorage.setItem("globalSessions", JSON.stringify(mapped));
          }
        } catch {}
      } catch (err) {
        console.error("Gagal load sessions/captures:", err);
      }
    };

    fetchSessions();

    const interval = setInterval(fetchSessions, 10000);
    return () => clearInterval(interval);
  }, []);

  // ✅ buka/tutup input note
  const handleToggleInput = (idx) => {
    const updated = [...sessions];
    updated[idx].showInput = !updated[idx].showInput;
    updated[idx].tempNote = updated[idx].note;
    setSessions(updated);
  };

  // ✅ typing note
  const handleTempNoteChange = (idx, val) => {
    const updated = [...sessions];
    updated[idx].tempNote = val;
    setSessions(updated);
  };

  // ✅ PATCH NOTE → BACKEND
  const handleSaveNote = async (idx) => {
    try {
      const API_BASE =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("token")
          : null;

      const updated = [...sessions];
      const sessionId = updated[idx]._id;
      const noteToSave = updated[idx].tempNote;

      updated[idx].note = noteToSave;
      updated[idx].showInput = false;
      setSessions(updated);

      const patchRes = await fetch(`${API_BASE}/api/sessions/${sessionId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({ note: noteToSave }),
      });

      if (!patchRes.ok) {
        console.error("⚠️ Gagal update NOTE:", patchRes.status);
      } else {
        console.log("✅ NOTE updated successfully");
      }

      setGlobalSessions(updated);
      try {
        sessionStorage.setItem("globalSessions", JSON.stringify(updated));
      } catch {}
    } catch (err) {
      console.error("⚠️ Error PATCH NOTE:", err);
    }
  };

  // ✅ delete note (kosongkan)
  const handleDeleteNote = async (idx) => {
    await handleSaveNote(idx, "");
  };

  const handleShowPhoto = (idx) => setCurrentPhotoIndex(idx);
  const handleClosePhoto = () => setCurrentPhotoIndex(null);

  // GROUP BY DATE
  const grouped = sessions.reduce((acc, item, idx) => {
    if (!acc[item.isoDate]) acc[item.isoDate] = { items: [], firstIndex: idx };
    acc[item.isoDate].items.push({ ...item, globalIndex: idx });
    return acc;
  }, {});
  const sortedDateKeys = Object.keys(grouped).sort((a, b) =>
    a < b ? 1 : -1
  );

  const formatHeaderDate = (iso) => {
    try {
      return new Date(iso + "T00:00:00").toLocaleDateString("id-ID", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
    } catch {
      return iso;
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[#2D3570] font-semibold text-lg">
          Riwayat Sesi (7 Hari Terakhir)
        </h3>
        <button
          onClick={() => router.push("/dashboard/riwayatdetail")}
          className="text-sm text-white bg-[#2D3570] px-3 py-1 rounded-lg hover:bg-[#1F2755] shadow transition"
        >
          📊 Lihat Detail
        </button>
      </div>

      <div className="relative">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.28, delay: 0.05 }}
          className="bg-white rounded-2xl shadow p-5 max-h-[400px] overflow-y-auto 
                     scrollbar-thin scrollbar-thumb-[#CBD5E1] scrollbar-track-transparent
                     transition-transform duration-200 hover:shadow-lg hover:-translate-y-1"
        >
          {sortedDateKeys.map((iso) => (
            <div key={iso} className="mb-4">
              <div
                className="sticky top-0 bg-[#F5F7FB] z-10 py-1 px-2 rounded-lg shadow-sm border border-[#E0E5F5] 
                           flex items-center justify-center mb-2"
              >
                <p className="text-xs text-gray-600 font-semibold text-center">
                  {formatHeaderDate(iso)}
                </p>
              </div>

              {/* ✅ Ganti blok lama yang error dengan komponen RiwayatSesiItem */}
              {grouped[iso].items.map((s) => (
                <RiwayatSesiItem
                  key={s.globalIndex}
                  data={s}
                  index={s.globalIndex}
                  onToggleInput={handleToggleInput}
                  onTempNoteChange={handleTempNoteChange}
                  onSaveNote={handleSaveNote}
                  onDeleteNote={handleDeleteNote}
                  onShowPhoto={handleShowPhoto}
                />
              ))}
            </div>
          ))}
        </motion.div>

        <div className="absolute bottom-1 left-0 right-0 flex justify-center pointer-events-none">
          <FaChevronDown className="text-gray-400 animate-bounce" size={18} />
        </div>
      </div>

      <AnimatePresence>
        {currentPhotoIndex !== null && sessions[currentPhotoIndex] && (
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
