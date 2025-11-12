"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { FaEdit, FaTrashAlt, FaTimes, FaChevronDown } from "react-icons/fa";
import { setGlobalSessions } from "./rekapemosi";

export default function RiwayatSesi({
  latestEmotion,
  latestTime,
  latestDate,
  latestPhoto,
}) {
  const router = useRouter();
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

  const intervalMs = 10000;
  const durationPerDay = 30 * 60 * 1000;
  const entriesPerDay = durationPerDay / intervalMs;

  const [sessions, setSessions] = useState([]);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(null);

  const monthMapId = {
    januari: 0, februari: 1, maret: 2, april: 3, mei: 4, juni: 5,
    juli: 6, agustus: 7, september: 8, oktober: 9, november: 10, desember: 11,
  };

  const parseLatestDateTime = () => {
    try {
      if (!latestDate) return new Date();
      let cleanTime = (latestTime || "00:00:00").replace(/\./g, ":");
      const parts = cleanTime.split(":").map((t) => parseInt(t || "0", 10));
      const [hh, mm, ss] = [parts[0] || 0, parts[1] || 0, parts[2] || 0];

      const slash = latestDate.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
      if (slash) {
        const [_, d, m, y] = slash;
        return new Date(parseInt(y), parseInt(m) - 1, parseInt(d), hh, mm, ss);
      }

      const words = latestDate.trim().split(/\s+/);
      if (words.length >= 3) {
        const day = parseInt(words[0], 10);
        const monthWord = words[1].toLowerCase();
        const year = parseInt(words[2], 10);
        const monthKey = Object.keys(monthMapId).find((k) =>
          k.startsWith(monthWord)
        );
        if (monthKey && !isNaN(day) && !isNaN(year)) {
          return new Date(year, monthMapId[monthKey], day, hh, mm, ss);
        }
      }

      const parsed = new Date(`${latestDate} ${cleanTime}`);
      if (!isNaN(parsed)) return parsed;
      return new Date();
    } catch {
      return new Date();
    }
  };

  // ✅ ✅ ✅ NEW LOGIC (with Authorization token FIXED)
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

        //
        // ✅ 1) GET ALL EEG SESSIONS
        //
        const sessionRes = await fetch(`${API_BASE}/api/sessions`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        });

        const sessionJson = await sessionRes.json();

        console.log("sessionRes.ok:", sessionRes.ok);
        console.log("sessionJson:", sessionJson);
        console.log("🔥 RESULT /sessions:", sessionJson);

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

        const mapped = [];

        //
        // ✅ 2) GET CAPTURES PER SESSION
        //
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
          console.log(`📷 RESULT /captures/session/${s._id}:`, capJson);

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

    
    const interval = setInterval(fetchSessions, 10000);   // ✅ auto-refresh 10s

    return () => clearInterval(interval);  // cleanup
  }, []);



  const handleToggleInput = (idx) => {
    const updated = [...sessions];
    updated[idx].showInput = !updated[idx].showInput;
    updated[idx].tempNote = updated[idx].note;
    setSessions(updated);
  };
  const handleTempNoteChange = (idx, val) => {
    const updated = [...sessions];
    updated[idx].tempNote = val;
    setSessions(updated);
  };
  const handleSaveNote = (idx) => {
    const updated = [...sessions];
    updated[idx].note = updated[idx].tempNote;
    updated[idx].showInput = false;
    setSessions(updated);
    setGlobalSessions(updated);
    try {
      if (typeof window !== "undefined") {
        sessionStorage.setItem("globalSessions", JSON.stringify(updated));
      }
    } catch {}
  };
  const handleDeleteNote = (idx) => {
    const updated = [...sessions];
    updated[idx].note = "";
    updated[idx].tempNote = "";
    updated[idx].showInput = false;
    setSessions(updated);
    setGlobalSessions(updated);
    try {
      if (typeof window !== "undefined") {
        sessionStorage.setItem("globalSessions", JSON.stringify(updated));
      }
    } catch {}
  };
  const handleShowPhoto = (idx) => setCurrentPhotoIndex(idx);
  const handleClosePhoto = () => setCurrentPhotoIndex(null);

  const grouped = sessions.reduce((acc, item, idx) => {
    if (!acc[item.isoDate]) acc[item.isoDate] = { items: [], firstIndex: idx };
    acc[item.isoDate].items.push({ ...item, globalIndex: idx });
    return acc;
  }, {});
  const sortedDateKeys = Object.keys(grouped).sort((a, b) => (a < b ? 1 : -1));

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

              {grouped[iso].items.map((s) => (
                <div key={s.globalIndex} className="bg-[#F5F7FB] rounded-xl p-3 mb-3 flex flex-col">
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
                        onClick={() => handleToggleInput(s.globalIndex)}
                        className="text-gray-500 hover:text-[#2D3570]"
                      >
                        <FaEdit size={14} />
                      </button>
                      <button
                        onClick={() => handleShowPhoto(s.globalIndex)}
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
                        onChange={(e) =>
                          handleTempNoteChange(s.globalIndex, e.target.value)
                        }
                        placeholder="Tulis catatan disini..."
                        className="w-full text-[#2D3570] text-sm outline-none resize-none"
                      />
                      <div className="flex justify-end gap-2 mt-2">
                        <button
                          onClick={() => handleSaveNote(s.globalIndex)}
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
                        onClick={() => handleDeleteNote(s.globalIndex)}
                        className="text-[#FF5A5A] hover:text-red-700 ml-2"
                      >
                        <FaTrashAlt size={14} />
                      </button>
                    </div>
                  )}
                </div>
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
