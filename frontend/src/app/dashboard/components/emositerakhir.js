// src/app/dashboard/components/emositerakhir.js
"use client";

import { motion } from "framer-motion";

/*
  Komponen EmosiTerakhir — menampilkan emosi terakhir terdeteksi dari EEG.
  Props:
    - emotion: string ("Positif" | "Netral" | "Negatif")
    - time: string (waktu deteksi)
    - date: string (tanggal deteksi)
    - firstName: string (nama depan user)
  Semua style & layout disalin persis dari file page.js.
*/

export default function EmosiTerakhir({ emotion, time, date, firstName }) {
  const fadeUp = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      transition={{ duration: 0.35 }}
    >
      <h3 className="text-[#2D3570] font-semibold mb-3 text-lg">
        Emosi Terakhir Terdeteksi
      </h3>
      <div className="bg-white rounded-2xl shadow p-5">
        <div className="border border-[#E0E5F5] rounded-xl p-4">
          <div className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-4">
            <div className="flex items-center gap-4">
              <img
                src={
                  emotion === "Positif"
                    ? "/positif.png"
                    : emotion === "Negatif"
                    ? "/negatif.png"
                    : "/netral.png"
                }
                alt={`Emosi ${emotion}`}
                className="w-14 h-14 sm:w-16 sm:h-16 object-contain"
              />
              <div>
                <p className="text-[#2D3570] text-sm font-semibold">Emosi</p>
                <p className="text-[#FFD84D] text-base font-bold -mt-1">
                  {emotion}
                </p>
              </div>
            </div>
            <div className="text-right text-sm text-[#2D3570]">
              <p>
                <span className="font-semibold">Waktu</span> {time}
              </p>
              <p>
                <span className="font-semibold">Tanggal</span> {date}
              </p>
            </div>
          </div>

          <hr className="border-t border-[#E0E5F5] my-3" />

          <p className="text-[#2D3570] font-medium text-center">
            Halo, {firstName}!
          </p>
        </div>
      </div>
    </motion.div>
  );
}
