"use client";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes } from "react-icons/fa";

import HeaderSection from "./components/HeaderSection";
import SummarySection from "./components/SummarySection";
import RecordsSection from "./components/RecordsSection";

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

  const [allData, setAllData] = useState([]);
  const [selectedDay, setSelectedDay] = useState(1);
  const [showDropdown, setShowDropdown] = useState(false);
  const [currentPhoto, setCurrentPhoto] = useState(null);

  // Fetch real sessions from backend
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

        if (!token) {
          console.log("No token, using dummy data");
          setAllData(generateDummyRiwayat());
          return;
        }

        // Fetch sessions
        const sessionRes = await fetch(`${API_BASE}/api/sessions`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!sessionRes.ok) {
          console.error("Failed to fetch sessions");
          setAllData(generateDummyRiwayat());
          return;
        }

        const sessionJson = await sessionRes.json();
        const sessions = Array.isArray(sessionJson) ? sessionJson : sessionJson.data || [];

        if (sessions.length === 0) {
          setAllData(generateDummyRiwayat());
          return;
        }

        // Fetch photos for each session
        const sessionsWithPhotos = sessions.map((session) => {
          // ✅ Use photoPath directly from session (permanently assigned)
          let photo = "/flowers.png"; // Default fallback
          
          if (session.photoPath) {
            photo = `${API_BASE}${session.photoPath}`;
          } else {
            // Fallback to mood-specific default images
            photo = session.mood === "Positif"
              ? "/rekaman/positif.png"
              : session.mood === "Netral"
                ? "/rekaman/netral.png"
                : "/rekaman/negatif.png";
          }

          return {
            ...session,
            photo,
          };
        });

        // Map to display format
        const mapped = sessionsWithPhotos.map((s) => {
          const ts = new Date(s.createdAt);
          const now = new Date();
          const diffDays = Math.floor((now - ts) / 86400000);

          return {
            mood: s.mood,
            time: ts.toLocaleTimeString("id-ID", { hour12: false }),
            date: ts.toLocaleDateString("id-ID"),
            dayOffset: diffDays,
            emoji: s.mood === "Positif"
              ? "/positif.png"
              : s.mood === "Netral"
                ? "/netral.png"
                : "/negatif.png",
            photo: s.photo,
            timestamp: ts,
          };
        });

        // Sort by timestamp descending
        mapped.sort((a, b) => b.timestamp - a.timestamp);

        setAllData(mapped);

        // Save to sessionStorage for other components
        try {
          if (typeof window !== "undefined") {
            sessionStorage.setItem("globalSessions", JSON.stringify(mapped));
          }
        } catch (e) {
          console.warn("Failed to save to sessionStorage:", e);
        }
      } catch (err) {
        console.error("Error fetching sessions:", err);
        setAllData(generateDummyRiwayat());
      }
    };

    fetchSessions();
    const interval = setInterval(fetchSessions, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, []);

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
    <motion.div className="min-h-screen bg-[#F5F7FB] px-4 sm:px-6 md:px-10 py-6 font-inter">

      <HeaderSection
        router={router}
        selectedDay={selectedDay}
        setSelectedDay={setSelectedDay}
        showDropdown={showDropdown}
        setShowDropdown={setShowDropdown}
      />

      <SummarySection fadeUp={fadeUp} selectedDay={selectedDay} emotionStats={emotionStats} />

      <RecordsSection fadeUp={fadeUp} selectedDay={selectedDay} filtered={filtered} setCurrentPhoto={setCurrentPhoto} />

      <AnimatePresence>
        {currentPhoto && (
          <motion.div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
            <motion.div className="bg-white rounded-2xl shadow-xl p-6 w-[90%] max-w-md relative">
              <button onClick={() => setCurrentPhoto(null)} className="absolute top-3 right-3 text-[#2D3570]">
                <FaTimes size={18} />
              </button>
              <h3 className="text-[#2D3570] font-semibold mb-3 text-lg text-center">Hasil Rekaman Foto</h3>
              <img src={currentPhoto} className="w-full h-64 object-cover rounded-xl" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}
