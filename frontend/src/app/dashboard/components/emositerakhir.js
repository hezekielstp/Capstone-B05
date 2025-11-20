// src/app/dashboard/components/emositerakhir.js
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

/*
  Komponen EmosiTerakhir — menampilkan emosi terakhir terdeteksi dari EEG.
  Automatically updates every 3 seconds to show the latest emotion detection.
  Props:
    - firstName: string (nama depan user)
*/

export default function EmosiTerakhir({ firstName }) {
  const [emotion, setEmotion] = useState("Netral");
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(true);

  const fadeUp = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  // Fetch latest emotion from backend
  const fetchLatestEmotion = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch(`${API_BASE}/api/sessions`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const sessions = await response.json();
        
        if (sessions && sessions.length > 0) {
          const latestSession = sessions[0]; // Already sorted by createdAt descending
          
          setEmotion(latestSession.mood || "Netral");
          
          // Format time and date
          const sessionDate = new Date(latestSession.createdAt);
          const formattedTime = sessionDate.toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
          });
          const formattedDate = sessionDate.toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          });
          
          setTime(formattedTime);
          setDate(formattedDate);
        }
        
        setLoading(false);
      }
    } catch (error) {
      console.error("Failed to fetch latest emotion:", error);
      setLoading(false);
    }
  };

  // Fetch on mount and every 3 seconds
  useEffect(() => {
    fetchLatestEmotion();
    const interval = setInterval(fetchLatestEmotion, 3000); // Update every 3 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      transition={{ duration: 0.35 }}
    >
      <h3 className="text-[#2D3570] font-semibold mb-3 text-lg">
        Emosi Terakhir Terdeteksi
      </h3>
      <div className="bg-white rounded-2xl shadow p-5">
        <div className="border border-[#E0E5F5] rounded-xl p-4">
          <div className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <img
                  src={
                    emotion === "Positif"
                      ? "/positif.png"
                      : emotion === "Negatif"
                      ? "/negatif.png"
                      : "/netral.png"
                  }
                  alt={`Emosi ${emotion}`}
                  className="w-14 h-14 sm:w-16 sm:h-16 object-contain"
                />
                {/* Live indicator */}
                <div className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full animate-pulse border-2 border-white" />
              </div>
              <div>
                <p className="text-[#2D3570] text-sm font-semibold">Emosi</p>
                <p
                  className={`text-base font-bold -mt-1 ${
                    emotion === "Positif"
                      ? "text-[#FFD84D]"     // kuning
                      : emotion === "Netral"
                      ? "text-[#2D90FF]"     // biru
                      : emotion === "Negatif"
                      ? "text-[#FF4D4D]"     // merah
                      : ""
                  }`}
                >
                  {loading ? "..." : emotion}
                </p>
              </div>
            </div>
            <div className="text-right text-sm text-[#2D3570]">
              <p>
                <span className="font-semibold">Waktu</span> {time || "--:--"}
              </p>
              <p>
                <span className="font-semibold">Tanggal</span> {date || "--/--/----"}
              </p>
            </div>
          </div>

          <hr className="border-t border-[#E0E5F5] my-3" />

          <p className="text-[#2D3570] font-medium text-center">
            Halo, {firstName}!
          </p>
        </div>
      </div>
    </motion.div>
  );
}
