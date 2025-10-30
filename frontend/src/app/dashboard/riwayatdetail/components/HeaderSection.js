"use client";
import { motion } from "framer-motion";
import { FaArrowLeft, FaChevronDown } from "react-icons/fa";

export default function HeaderSection({
  router,
  selectedDay,
  setSelectedDay,
  showDropdown,
  setShowDropdown,
}) {
  return (
    <motion.div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
      <button
        onClick={() => router.push("/dashboard")}
        className="flex items-center gap-2 text-[#2D3570] font-semibold hover:underline"
      >
        <FaArrowLeft /> Kembali ke Dashboard
      </button>

      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="bg-white border border-[#E0E5F5] rounded-lg px-4 py-2 text-[#2D3570] flex items-center gap-2 shadow-sm hover:shadow-md transition"
        >
          Hari ke-{selectedDay}
          <FaChevronDown
            size={14}
            className={`${showDropdown ? "rotate-180" : ""} transition`}
          />
        </button>

        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-40 bg-white border border-[#E0E5F5] rounded-md shadow-lg z-10"
          >
            {[1, 2, 3, 4, 5, 6, 7].map((d) => (
              <button
                key={d}
                onClick={() => {
                  setSelectedDay(d);
                  setShowDropdown(false);
                }}
                className={`block w-full text-left px-4 py-2 text-sm ${
                  selectedDay === d
                    ? "bg-[#E9ECF6] text-[#2D3570] font-semibold"
                    : "hover:bg-[#F5F7FB] text-[#2D3570]"
                }`}
              >
                Hari ke-{d}
              </button>
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
