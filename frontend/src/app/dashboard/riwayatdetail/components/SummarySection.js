"use client";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

export default function SummarySection({ fadeUp, selectedDay, emotionStats }) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      className="bg-white rounded-2xl shadow p-5 mb-6 flex flex-col sm:flex-row items-center gap-6"
    >
      <div className="flex-1">
        <h2 className="text-[#2D3570] font-semibold text-lg mb-1">
          Ringkasan Emosi – Hari ke-{selectedDay}
        </h2>
        <p className="text-sm text-gray-600">
          Data hasil rekaman aktivitas emosi dari sinyal otak selama 30 menit terakhir.
        </p>
      </div>

      <div className="flex justify-center items-center w-40 h-40">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart key={selectedDay}> {/* ✅ Animasi aktif kembali */}
            <Pie
              data={emotionStats}
              dataKey="value"
              cx="50%"
              cy="50%"
              outerRadius={60}
              innerRadius={40}
              labelLine={false}
              animationDuration={1000} // ✅ smooth spin
            >
              {emotionStats.map((entry, i) => (
                <Cell key={i} fill={entry.color} stroke="none" />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="flex flex-col gap-2 text-sm text-[#2D3570]">
        {emotionStats.map((e, i) => (
          <div key={i} className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: e.color }}
            ></span>
            {e.name}: <span className="font-semibold">{e.value}%</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
