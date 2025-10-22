"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { FaChevronDown } from "react-icons/fa";

export default function RekapEmosi() {
  const fadeUp = { hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } };

  const datasets = {
    "Rekap Emosi 1 Hari": [
      { name: "Positif", value: 45, color: "#FFD84D" },
      { name: "Netral", value: 25, color: "#8CA7FF" },
      { name: "Negatif", value: 30, color: "#FF5A5A" },
    ],
    "Rekap Emosi 3 Hari": [
      { name: "Positif", value: 50, color: "#FFD84D" },
      { name: "Netral", value: 20, color: "#8CA7FF" },
      { name: "Negatif", value: 30, color: "#FF5A5A" },
    ],
    "Rekap Emosi 7 Hari": [
      { name: "Positif", value: 60, color: "#FFD84D" },
      { name: "Netral", value: 15, color: "#8CA7FF" },
      { name: "Negatif", value: 25, color: "#FF5A5A" },
    ],
  };

  const [selectedRange, setSelectedRange] = useState("Rekap Emosi 1 Hari");
  const [showDropdown, setShowDropdown] = useState(false);
  const data = datasets[selectedRange];

  return (
    <div>
      <div className="flex items-center gap-2 mb-3 relative">
        <h3 className="text-[#2D3570] font-semibold text-lg">{selectedRange}</h3>
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="text-[#2D3570] hover:text-[#1F2755] flex items-center"
        >
          <FaChevronDown size={14} />
        </button>

        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18 }}
            className="absolute top-7 left-0 bg-white border border-[#E0E5F5] shadow rounded-md z-10"
          >
            {Object.keys(datasets).map((range) => (
              <button
                key={range}
                onClick={() => {
                  setSelectedRange(range);
                  setShowDropdown(false);
                }}
                className={`block w-full text-left px-4 py-2 text-sm ${
                  selectedRange === range
                    ? "bg-[#E9ECF6] text-[#2D3570] font-semibold"
                    : "text-[#2D3570] hover:bg-[#F5F7FB]"
                }`}
              >
                {range}
              </button>
            ))}
          </motion.div>
        )}
      </div>

      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.28 }}
        className="bg-white rounded-2xl shadow p-5 min-h-[360px] flex flex-col justify-center items-center transition-transform duration-200 hover:shadow-lg hover:-translate-y-1"
        style={{ minHeight: 320 }}
      >
        <div className="relative flex justify-center items-center w-full" style={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="52%"
                innerRadius={70}
                outerRadius={105}
                dataKey="value"
                fill="#ddd"
                stroke="none"
                opacity={0.25}
                isAnimationActive={false}
              />
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                dataKey="value"
                isAnimationActive={true}
              >
                {data.map((entry, i) => (
                  <Cell key={i} fill={entry.color} stroke="none" />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="flex justify-center gap-6 mt-6 text-sm flex-wrap">
          <div className="flex items-center gap-1 text-[#2D3570]">
            <span className="w-3 h-3 bg-[#FF5A5A] rounded-full"></span> Negatif
          </div>
          <div className="flex items-center gap-1 text-[#2D3570]">
            <span className="w-3 h-3 bg-[#FFD84D] rounded-full"></span> Positif
          </div>
          <div className="flex items-center gap-1 text-[#2D3570]">
            <span className="w-3 h-3 bg-[#8CA7FF] rounded-full"></span> Netral
          </div>
        </div>
      </motion.div>
    </div>
  );
}
