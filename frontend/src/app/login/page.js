"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { FaUser, FaKey } from "react-icons/fa";

export default function LoginPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    if (name.trim()) {
      localStorage.setItem("userName", name);
    }

    router.push("/dashboard");
  };

  return (
    <motion.div
      className="flex flex-col md:flex-row min-h-screen font-inter bg-[#F5F7FB]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* 🔹 Bagian Kiri */}
      <motion.div
        className="w-full md:w-1/2 bg-[#2D3570] flex flex-col items-center justify-center text-center p-8 text-white relative overflow-hidden"
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 1 }}
      >
        {/* Efek bubble dinamis */}
        <motion.div
          className="absolute w-48 h-48 bg-[#5A6BF7]/20 rounded-full blur-3xl -top-10 -left-10"
          animate={{ scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ repeat: Infinity, duration: 6 }}
        />
        <motion.div
          className="absolute w-56 h-56 bg-[#FFD84D]/15 rounded-full blur-3xl bottom-10 right-10"
          animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ repeat: Infinity, duration: 7 }}
        />

        <motion.img
          src="/affectra.png"
          alt="Affectra Logo"
          className="mx-auto w-40 md:w-60 mb-6 drop-shadow-lg"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
        />

        <motion.h1
          className="text-2xl md:text-4xl mb-2"
          style={{ fontFamily: "Abril Fatface" }}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          AFFECTRA
        </motion.h1>

        <motion.p
          className="text-sm md:text-lg italic"
          style={{ fontFamily: "Aref Ruqaa" }}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          “EEG Based Emotion Tracking”
        </motion.p>
      </motion.div>

      {/* 🔹 Bagian Kanan */}
      <motion.div
        className="w-full md:w-1/2 bg-white flex flex-col justify-center px-6 md:px-16 py-10"
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <motion.h1
          className="text-2xl md:text-3xl font-bold text-[#2D3570] mb-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          Halo, Yuk masuk dulu!
        </motion.h1>

        <motion.p
          className="text-[#2D3570] mb-8 text-sm md:text-base"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          Masuk ke akunmu untuk mulai melacak emosi.
        </motion.p>

        <motion.form
          onSubmit={handleLogin}
          className="space-y-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="flex items-center border-2 border-[#2D3570] rounded-lg px-3 py-2"
          >
            <FaUser className="text-[#2D3570] mr-2" />
            <input
              type="text"
              placeholder="Nama Lengkap"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="flex-1 outline-none text-gray-700 text-sm md:text-base bg-transparent"
            />
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="flex items-center border-2 border-[#2D3570] rounded-lg px-3 py-2"
          >
            <FaKey className="text-[#2D3570] mr-2" />
            <input
              type="password"
              placeholder="Kata Sandi"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="flex-1 outline-none text-gray-700 text-sm md:text-base bg-transparent"
            />
          </motion.div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            type="submit"
            className="w-full bg-[#2D3570] text-white py-3 rounded-lg font-semibold shadow-md hover:bg-[#1F2755] text-sm md:text-base transition"
          >
            Masuk
          </motion.button>
        </motion.form>

        <motion.p
          className="mt-6 text-gray-700 text-xs md:text-sm text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          Belum punya akun?{" "}
          <a href="/register" className="text-[#2D3570] font-semibold hover:underline">
            Daftar
          </a>
        </motion.p>
      </motion.div>
    </motion.div>
  );
}
