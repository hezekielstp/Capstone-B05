"use client";
import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { FaChevronDown } from "react-icons/fa";

// ===== GLOBAL STORE untuk sinkronisasi dengan RiwayatSesi =====
let globalSessions = [];

export const setGlobalSessions = (sessions) => {
  globalSessions = sessions;
  // 🟢 Simpan juga ke sessionStorage agar tetap sinkron antar halaman
  try {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("globalSessions", JSON.stringify(sessions));
    }
  } catch (e) {
    console.warn("Gagal simpan sessionStorage di rekapemosi:", e);
  }
};

// ===== DUMMY EEG REALISTIC: 7 HARI × 30 MENIT/HARI × 10 DETIK =====
const generateDummyRiwayat = () => {
  const moods = ["Positif", "Netral", "Negatif"];
  const now = new Date();
  const intervalMs = 10000; // tiap 10 detik
  const durationPerDay = 30 * 60 * 1000; // 30 menit per hari
  const entriesPerDay = durationPerDay / intervalMs; // 180 entri per hari

  const data = [];
  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    const dayDate = new Date(now);
    dayDate.setDate(now.getDate() - dayOffset);
    const baseTime = new Date(dayDate);
    baseTime.setHours(9, 0, 0, 0); // alat aktif 09.00–09.30

    for (let i = 0; i < entriesPerDay; i++) {
      const timestamp = new Date(baseTime.getTime() + i * intervalMs);
      const mood = moods[Math.floor(Math.random() * moods.length)];
      data.push({
        mood,
        date: timestamp.toLocaleDateString("id-ID"),
        timestamp,
      });
    }
  }

  // urutkan terbaru → lama
  return data.sort((a, b) => b.timestamp - a.timestamp);
};

const dummyRiwayat = generateDummyRiwayat();

export default function RekapEmosi() {
  const fadeUp = { hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } };

  const [selectedRange, setSelectedRange] = useState("Rekap Emosi 1 Hari");
  const [showDropdown, setShowDropdown] = useState(false);
  const [sessionsData, setSessionsData] = useState(globalSessions.length ? globalSessions : dummyRiwayat);

  // ===== Sinkronisasi real-time dengan globalSessions & sessionStorage =====
  useEffect(() => {
    const syncData = () => {
      try {
        const stored = typeof window !== "undefined" ? sessionStorage.getItem("globalSessions") : null;
        const parsed = stored ? JSON.parse(stored) : [];
        if (parsed.length && parsed.length !== sessionsData.length) {
          setSessionsData(parsed);
        } else if (globalSessions.length && globalSessions.length !== sessionsData.length) {
          setSessionsData(globalSessions);
        }
      } catch (e) {
        console.warn("Sync rekapemosi error:", e);
      }
    };

    syncData(); // sync langsung di awal
    const interval = setInterval(syncData, 2000);
    return () => clearInterval(interval);
  }, [sessionsData]);

  // ===== Hitung persentase emosi berdasarkan range =====
  const data = useMemo(() => {
    const now = new Date();
    let days = 1;
    if (selectedRange.includes("3")) days = 3;
    if (selectedRange.includes("7")) days = 7;

    const startDate = new Date(now);
    startDate.setDate(now.getDate() - (days - 1));
    startDate.setHours(0, 0, 0, 0);

    const rangeData = sessionsData.filter(
      (s) => new Date(s.timestamp) >= startDate && new Date(s.timestamp) <= now
    );

    const counts = { Positif: 0, Netral: 0, Negatif: 0 };
    rangeData.forEach((s) => counts[s.mood]++);

    const total = rangeData.length || 1;

    return [
      { name: "Positif", value: Math.round((counts.Positif / total) * 100), color: "#FFD84D" },
      { name: "Netral", value: Math.round((counts.Netral / total) * 100), color: "#8CA7FF" },
      { name: "Negatif", value: Math.round((counts.Negatif / total) * 100), color: "#FF5A5A" },
    ];
  }, [selectedRange, sessionsData]);

  return (
    <div>
      {/* Header + dropdown */}
      <div className="flex items-center gap-2 mb-3 relative">
        <h3 className="text-[#2D3570] font-semibold text-lg">{selectedRange}</h3>
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="text-[#2D3570] hover:text-[#1F2755] flex items-center"
        >
          <FaChevronDown size={14} />
        </button>

        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18 }}
            className="absolute top-7 left-0 bg-white border border-[#E0E5F5] shadow rounded-md z-10"
          >
            {["Rekap Emosi 1 Hari", "Rekap Emosi 3 Hari", "Rekap Emosi 7 Hari"].map((range) => (
              <button
                key={range}
                onClick={() => {
                  setSelectedRange(range);
                  setShowDropdown(false);
                }}
                className={`block w-full text-left px-4 py-2 text-sm ${
                  selectedRange === range
                    ? "bg-[#E9ECF6] text-[#2D3570] font-semibold"
                    : "text-[#2D3570] hover:bg-[#F5F7FB]"
                }`}
              >
                {range}
              </button>
            ))}
          </motion.div>
        )}
      </div>

      {/* Chart */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.28 }}
        className="bg-white rounded-2xl shadow p-5 min-h-[360px] flex flex-col justify-center items-center transition-transform duration-200 hover:shadow-lg hover:-translate-y-1"
        style={{ minHeight: 320 }}
      >
        <div className="relative flex justify-center items-center w-full" style={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              {/* Lapisan background samar */}
              <Pie
                data={data}
                cx="50%"
                cy="52%"
                innerRadius={70}
                outerRadius={105}
                dataKey="value"
                fill="#ddd"
                stroke="none"
                opacity={0.25}
                isAnimationActive={false}
              />
              {/* Pie utama */}
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                dataKey="value"
                isAnimationActive={true}
              >
                {data.map((entry, i) => (
                  <Cell key={i} fill={entry.color} stroke="none" />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex justify-center gap-6 mt-6 text-sm flex-wrap">
          {data.map((d, i) => (
            <div key={i} className="flex items-center gap-1 text-[#2D3570]">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }}></span>
              {d.name} ({d.value}%)
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
