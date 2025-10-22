"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

// Template RekamFoto yang sinkron dengan EmosiTerakhir
export default function RekamFoto({ latestPhoto, latestEmotion }) {
  const fadeUp = { hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } };
  const [photo, setPhoto] = useState(latestPhoto || "/flowers.png");

  // Simulasi update real-time tiap 10 detik
  useEffect(() => {
    const interval = setInterval(() => {
      // Nanti diganti dengan fetch foto terbaru dari hardware EEG sesuai latestEmotion
      setPhoto(latestPhoto || "/flowers.png");
    }, 10000); // update tiap 10 detik

    return () => clearInterval(interval);
  }, [latestPhoto]);

  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      transition={{ duration: 0.35, delay: 0.05 }}
    >
      <h3 className="text-[#2D3570] font-semibold mb-3 text-lg">Hasil Rekaman Foto</h3>
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
