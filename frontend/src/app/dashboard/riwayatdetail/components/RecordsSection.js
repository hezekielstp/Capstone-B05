"use client";
import { motion } from "framer-motion";
import { FaChartPie } from "react-icons/fa";

export default function RecordsSection({ fadeUp, selectedDay, filtered, setCurrentPhoto }) {
  return (
    <motion.div variants={fadeUp} initial="hidden" animate="visible" className="bg-white rounded-2xl shadow p-4 sm:p-6">
      <h3 className="text-[#2D3570] font-semibold text-lg mb-4 text-center flex items-center justify-center gap-2">
        <FaChartPie className="text-[#2D3570]" /> Data Rekaman Emosi – Hari ke-{selectedDay}
      </h3>

      <div className="hidden md:block overflow-x-auto">
        <table className="w-full border-collapse text-sm text-[#2D3570]">
          <thead>
            <tr className="bg-[#E9ECF6]">
              <th className="p-2 border-b">No</th>
              <th className="p-2 border-b">Emosi</th>
              <th className="p-2 border-b">Waktu</th>
              <th className="p-2 border-b">Tanggal</th>
              <th className="p-2 border-b">Lihat Foto</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row,i)=>(
              <tr key={i} className="hover:bg-[#F5F7FB]">
                <td className="p-2 border-b">{i+1}</td>
                <td className="p-2 border-b flex items-center gap-2">
                  <img src={row.emoji} className="w-6 h-6" />
                  <span className="font-semibold">{row.mood}</span>
                </td>
                <td className="p-2 border-b">{row.time}</td>
                <td className="p-2 border-b">{row.date}</td>
                <td className="p-2 border-b text-center">
                  <button onClick={()=>setCurrentPhoto(row.photo)} className="text-[#2D3570] font-medium hover:underline">
                    Lihat Foto
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="md:hidden space-y-3">
        {filtered.map((row,i)=>(
          <div key={i} className="border border-[#E0E5F5] rounded-xl p-3 shadow-sm bg-[#F5F7FB]">
            <div className="flex items-center justify-between mb-2">
              <p className="font-semibold text-[#2D3570] flex items-center gap-2">
                <img src={row.emoji} className="w-5 h-5" />
                {i+1}. {row.mood}
              </p>
              <button onClick={()=>setCurrentPhoto(row.photo)} className="text-[#2D3570] text-xs font-medium hover:underline">
                Lihat Foto
              </button>
            </div>
            <p className="text-xs text-gray-600">Waktu: {row.time}</p>
            <p className="text-xs text-gray-600">Tanggal: {row.date}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
