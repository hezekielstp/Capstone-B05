"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

// Komponen RekamFoto — menampilkan foto terbaru hasil deteksi EEG
export default function RekamFoto({ latestEmotion, onPhotoUpdate }) {
  const fadeUp = { hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } };
  const [photo, setPhoto] = useState("/flowers.png");

  // simulasi update real-time tiap 10 detik
  useEffect(() => {
    const updatePhoto = () => {
      // nanti diganti real EEG capture
      setPhoto("/flowers.png");
      if (onPhotoUpdate) onPhotoUpdate("/flowers.png");
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
