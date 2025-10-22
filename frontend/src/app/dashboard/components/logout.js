"use client";
import { motion, AnimatePresence } from "framer-motion";
import { FaRedoAlt } from "react-icons/fa";

export default function LogoutPopup({ show, onCancel, onConfirm }) {
  if (!show) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50"
        >
          <motion.div
            initial={{ scale: 0.98, y: 8 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.98, y: 8 }}
            transition={{ duration: 0.18 }}
            className="bg-white p-8 rounded-2xl shadow-xl w-[90%] max-w-sm text-center"
          >
            <div className="flex justify-center mb-4">
              <FaRedoAlt className="text-[#2D3570] text-3xl" />
            </div>
            <p className="text-[#2D3570] font-medium mb-6">
              Selesai untuk hari ini, yakin mau keluar?
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={onCancel}
                className="bg-gray-300 text-[#2D3570] px-4 py-2 rounded-lg font-semibold flex-1 hover:bg-gray-400"
              >
                Batal
              </button>
              <button
                onClick={onConfirm}
                className="bg-[#2D3570] text-white px-4 py-2 rounded-lg font-semibold flex-1 hover:bg-[#1F2755]"
              >
                Ya
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
