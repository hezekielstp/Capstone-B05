"use client";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { FaChevronDown, FaArrowLeft, FaChartPie, FaTimes } from "react-icons/fa";

const COLORS = {
  Positif: "#FFD84D",
  Netral: "#8CA7FF",
  Negatif: "#FF5A5A",
};

// === Dummy generator ===
const generateDummyRiwayat = () => {
  const moods = ["Positif", "Netral", "Negatif"];
  const now = new Date();
  const intervalMs = 10000;
  const durationPerDay = 30 * 60 * 1000;
  const entriesPerDay = durationPerDay / intervalMs;
  const data = [];

  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    const baseTime = new Date(now.getTime() - dayOffset * 86400000);
    for (let i = 0; i < entriesPerDay; i++) {
      const ts = new Date(baseTime.getTime() - i * intervalMs);
      const mood = moods[Math.floor(Math.random() * moods.length)];
      data.push({
        mood,
        time: ts.toLocaleTimeString("id-ID", { hour12: false }),
        date: ts.toLocaleDateString("id-ID"),
        dayOffset,
        // ✅ perbaikan: icon lucu = emojiImages, foto hasil rekaman = capture (bunga EEG)
        emoji:
          mood === "Positif"
            ? "/positif.png"
            : mood === "Netral"
            ? "/netral.png"
            : "/negatif.png",
        photo:
          mood === "Positif"
            ? "/rekaman/positif.png"
            : mood === "Netral"
            ? "/rekaman/netral.png"
            : "/rekaman/negatif.png",
      });
    }
  }
  return data.sort(
    (a, b) => b.date.localeCompare(a.date) || b.time.localeCompare(a.time)
  );
};

export default function RiwayatDetailPage() {
  const router = useRouter();
  const fadeUp = { hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0 } };

  const allData = useMemo(() => {
    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem("globalSessions");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          // ✅ samakan key agar konsisten dengan RiwayatSesi
          return parsed.map((it) => ({
            ...it,
            emoji:
              it.emoji ||
              (it.mood === "Positif"
                ? "/positif.png"
                : it.mood === "Netral"
                ? "/netral.png"
                : "/negatif.png"),
            photo:
              it.photo ||
              (it.mood === "Positif"
                ? "/rekaman/positif.png"
                : it.mood === "Netral"
                ? "/rekaman/netral.png"
                : "/rekaman/negatif.png"),
            dayOffset: (() => {
              try {
                if (it.timestamp) {
                  const base = new Date(it.timestamp);
                  const diff = Math.floor((new Date() - base) / 86400000);
                  return diff;
                }
                if (it.isoDate) {
                  const base = new Date(it.isoDate + "T00:00:00");
                  const diff = Math.floor((new Date() - base) / 86400000);
                  return Math.max(0, diff);
                }
                return 0;
              } catch {
                return 0;
              }
            })(),
          }));
        } catch {}
      }
    }
    return generateDummyRiwayat();
  }, []);

  useEffect(() => {
    try {
      if (typeof window !== "undefined" && allData && allData.length) {
        sessionStorage.setItem("globalSessions", JSON.stringify(allData));
      }
    } catch {}
  }, [allData]);

  const [selectedDay, setSelectedDay] = useState(1);
  const [showDropdown, setShowDropdown] = useState(false);
  const [currentPhoto, setCurrentPhoto] = useState(null);

  const filtered = allData.filter((d) => d.dayOffset === selectedDay - 1);

  const emotionStats = useMemo(() => {
    const counts = { Positif: 0, Netral: 0, Negatif: 0 };
    filtered.forEach((r) => (counts[r.mood] += 1));
    const total = filtered.length || 1;
    return Object.keys(counts).map((k) => ({
      name: k,
      value: Math.round((counts[k] / total) * 100),
      color: COLORS[k],
    }));
  }, [filtered]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-[#F5F7FB] px-4 sm:px-6 md:px-10 py-6 font-inter"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
        <button
          onClick={() => router.push("/dashboard")}
          className="flex items-center gap-2 text-[#2D3570] font-semibold hover:underline"
        >
          <FaArrowLeft /> Kembali ke Dashboard
        </button>

        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="bg-white border border-[#E0E5F5] rounded-lg px-4 py-2 text-[#2D3570] flex items-center gap-2 shadow-sm hover:shadow-md transition"
          >
            Hari ke-{selectedDay}
            <FaChevronDown size={14} />
          </button>

          {showDropdown && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 mt-2 w-40 bg-white border border-[#E0E5F5] rounded-md shadow-lg z-10"
            >
              {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                <button
                  key={d}
                  onClick={() => {
                    setSelectedDay(d);
                    setShowDropdown(false);
                  }}
                  className={`block w-full text-left px-4 py-2 text-sm ${
                    selectedDay === d
                      ? "bg-[#E9ECF6] text-[#2D3570] font-semibold"
                      : "hover:bg-[#F5F7FB] text-[#2D3570]"
                  }`}
                >
                  Hari ke-{d}
                </button>
              ))}
            </motion.div>
          )}
        </div>
      </div>

      {/* Ringkasan Pie Chart */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.25 }}
        className="bg-white rounded-2xl shadow p-5 mb-6 flex flex-col sm:flex-row items-center gap-6"
      >
        <div className="flex-1 text-center sm:text-left">
          <h2 className="text-[#2D3570] font-semibold text-lg mb-1">
            Ringkasan Emosi – Hari ke-{selectedDay}
          </h2>
          <p className="text-sm text-gray-600">
            Data hasil rekaman aktivitas emosi dari sinyal otak selama 30 menit terakhir.
          </p>
        </div>

        <div className="flex justify-center items-center w-40 h-40">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={emotionStats}
                dataKey="value"
                cx="50%"
                cy="50%"
                outerRadius={60}
                innerRadius={40}
                labelLine={false}
              >
                {emotionStats.map((entry, i) => (
                  <Cell key={i} fill={entry.color} stroke="none" />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="flex flex-col gap-2 text-sm text-[#2D3570]">
          {emotionStats.map((e, i) => (
            <div key={i} className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: e.color }}
              ></span>
              {e.name}: <span className="font-semibold">{e.value}%</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Tabel Utama */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.25 }}
        className="bg-white rounded-2xl shadow p-4 sm:p-6"
      >
        <h3 className="text-[#2D3570] font-semibold text-lg mb-4 text-center flex items-center justify-center gap-2">
          <FaChartPie className="text-[#2D3570]" /> Data Rekaman Emosi – Hari ke-{selectedDay}
        </h3>

        <div className="hidden md:block overflow-x-auto">
          <table className="w-full border-collapse text-sm text-[#2D3570]">
            <thead>
              <tr className="bg-[#E9ECF6] text-left">
                <th className="p-2 border-b">No</th>
                <th className="p-2 border-b">Emosi</th>
                <th className="p-2 border-b">Waktu</th>
                <th className="p-2 border-b">Tanggal</th>
                <th className="p-2 border-b">Lihat Foto</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, i) => (
                <tr key={i} className="hover:bg-[#F5F7FB]">
                  <td className="p-2 border-b">{i + 1}</td>
                  {/* ✅ fix: gunakan emoji utk kolom emosi, bukan foto bunga */}
                  <td className="p-2 border-b flex items-center gap-2">
                    <img
                      src={row.emoji}
                      alt={row.mood}
                      className="w-6 h-6 object-contain"
                    />
                    <span className="font-semibold">{row.mood}</span>
                  </td>
                  <td className="p-2 border-b">{row.time}</td>
                  <td className="p-2 border-b">{row.date}</td>
                  <td className="p-2 border-b text-center">
                    <button
                      onClick={() => setCurrentPhoto(row.photo)}
                      className="text-[#2D3570] font-medium hover:underline"
                    >
                      Lihat Foto
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-3">
          {filtered.map((row, i) => (
            <div
              key={i}
              className="border border-[#E0E5F5] rounded-xl p-3 shadow-sm bg-[#F5F7FB]"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold text-[#2D3570] flex items-center gap-2">
                  <img src={row.emoji} alt={row.mood} className="w-5 h-5" />
                  {i + 1}. {row.mood}
                </p>
                <button
                  onClick={() => setCurrentPhoto(row.photo)}
                  className="text-[#2D3570] text-xs font-medium hover:underline"
                >
                  Lihat Foto
                </button>
              </div>
              <p className="text-xs text-gray-600">Waktu: {row.time}</p>
              <p className="text-xs text-gray-600">Tanggal: {row.date}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Modal Foto */}
      <AnimatePresence>
        {currentPhoto && (
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
                onClick={() => setCurrentPhoto(null)}
                className="absolute top-3 right-3 text-[#2D3570] hover:text-[#1F2755]"
              >
                <FaTimes size={18} />
              </button>
              <h3 className="text-[#2D3570] font-semibold mb-3 text-lg text-center">
                Hasil Rekaman Foto
              </h3>
              <img
                src={currentPhoto}
                alt="Foto Rekaman"
                className="w-full h-64 object-cover rounded-xl"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
