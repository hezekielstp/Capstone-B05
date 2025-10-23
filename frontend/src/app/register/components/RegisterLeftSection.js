"use client";

import { motion } from "framer-motion";

export default function RegisterLeftSection() {
  return (
    <motion.div
      className="w-full md:w-1/2 bg-[#2D3570] flex flex-col items-center justify-center text-center p-8 text-white relative overflow-hidden"
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <motion.div
        className="absolute w-40 h-40 bg-[#5A6BF7]/20 rounded-full blur-2xl -top-10 -left-10"
        animate={{ scale: [1, 1.2, 1], opacity: [0.8, 1, 0.8] }}
        transition={{ repeat: Infinity, duration: 6 }}
      />
      <motion.div
        className="absolute w-60 h-60 bg-[#FFD84D]/10 rounded-full blur-3xl bottom-10 right-10"
        animate={{ scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ repeat: Infinity, duration: 7 }}
      />

      <motion.img
        src="/affectra.png"
        alt="Affectra Logo"
        className="mx-auto w-40 md:w-60 mb-6 drop-shadow-lg"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.8 }}
      />

      <motion.h1
        className="text-2xl md:text-4xl font-bold mb-2"
        style={{ fontFamily: "Abril Fatface" }}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        AFFECTRA
      </motion.h1>

      <motion.p
        className="text-sm md:text-lg italic"
        style={{ fontFamily: "Aref Ruqaa" }}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1 }}
      >
        “EEG Based Emotion Tracking”
      </motion.p>
    </motion.div>
  );
}
