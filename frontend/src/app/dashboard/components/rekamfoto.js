"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

// Komponen RekamFoto — menampilkan foto terbaru hasil deteksi EEG
export default function RekamFoto({ latestEmotion, onPhotoUpdate }) {
  const fadeUp = { hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } };
  const [photo, setPhoto] = useState("/flowers.png");

  // real-time update tiap 10 detik
  useEffect(() => {
    const updatePhoto = async () => {
      try {
        const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

        if (!token) {
          setPhoto("/flowers.png");
          return;
        }

        // Get user's sessions first
        const sessionRes = await fetch(`${API_BASE}/api/sessions`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!sessionRes.ok) {
          setPhoto("/flowers.png");
          return;
        }

        const sessionJson = await sessionRes.json();
        const sessions = Array.isArray(sessionJson) ? sessionJson : sessionJson.data || [];

        if (sessions.length === 0) {
          setPhoto("/flowers.png");
          return;
        }

        // Get latest session
        const latestSession = sessions.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        )[0];

        // ✅ Use photoPath directly from session (permanently assigned)
        if (latestSession.photoPath) {
          const photoUrl = `${API_BASE}${latestSession.photoPath}`;
          setPhoto(photoUrl);
          if (onPhotoUpdate) onPhotoUpdate(photoUrl);
        } else {
          setPhoto("/flowers.png");
          if (onPhotoUpdate) onPhotoUpdate("/flowers.png");
        }
      } catch (err) {
        console.error("Gagal fetch foto:", err);
        setPhoto("/flowers.png");
        if (onPhotoUpdate) onPhotoUpdate("/flowers.png");
      }
    };

    updatePhoto(); // initial render
    const interval = setInterval(updatePhoto, 10000);
    return () => clearInterval(interval);
  }, [onPhotoUpdate]);

  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      transition={{ duration: 0.35, delay: 0.05 }}
    >
      <h3 className="text-[#2D3570] font-semibold mb-3 text-lg">
        Hasil Rekaman Foto
      </h3>
      <div className="bg-white rounded-2xl shadow p-5">
        <img
          src={photo}
          alt={`Foto terbaru - Emosi: ${latestEmotion || "Netral"}`}
          className="w-full h-40 sm:h-48 object-cover rounded-xl"
        />
      </div>
    </motion.div>
  );
}
