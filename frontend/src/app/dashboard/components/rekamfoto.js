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
        // ✅ Ambil data dari backend
        const res = await fetch(
          process.env.NEXT_PUBLIC_API_URL + "/api/captures"
        );
        const json = await res.json();

        // Jika tidak ada data → fallback
        if (!json?.data || json.data.length === 0) {
          setPhoto("/flowers.png");
          if (onPhotoUpdate) onPhotoUpdate("/flowers.png");
          return;
        }

        // ✅ Sort berdasarkan createdAt DESC → terbaru pertama
        const sorted = [...json.data].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        const latest = sorted[0];

        if (latest?.imageUrl) {
          setPhoto(latest.imageUrl);
          if (onPhotoUpdate) onPhotoUpdate(latest.imageUrl);
        } else {
          // fallback
          setPhoto("/flowers.png");
          if (onPhotoUpdate) onPhotoUpdate("/flowers.png");
        }
      } catch (err) {
        console.error("Gagal fetch foto:", err);

        // fallback
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
