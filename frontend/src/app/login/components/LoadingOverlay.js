"use client";
import { motion } from "framer-motion";
import { FaSpinner } from "react-icons/fa";

export default function LoadingOverlay({ show }) {
  if (!show) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.2 }}
        className="bg-white/90 rounded-2xl shadow-lg px-8 py-6 flex flex-col items-center text-center"
      >
        <FaSpinner className="text-[#2D3570] animate-spin mb-3 text-3xl" />
        <p className="text-[#2D3570] font-semibold text-base">
          Sedang masuk...
        </p>
      </motion.div>
    </motion.div>
  );
}
