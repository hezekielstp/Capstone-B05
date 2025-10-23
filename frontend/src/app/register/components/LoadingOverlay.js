"use client";

import { motion } from "framer-motion";

export default function LoadingOverlay() {
  return (
    <div className="fixed inset-0 bg-[#2D3570]/70 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.25 }}
        className="bg-white px-8 py-6 rounded-2xl shadow-xl flex flex-col items-center"
      >
        <motion.div
          className="w-8 h-8 border-4 border-[#2D3570] border-t-transparent rounded-full animate-spin mb-3"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        />
        <p className="text-[#2D3570] font-semibold text-base">
          Sedang memproses...
        </p>
      </motion.div>
    </div>
  );
}
