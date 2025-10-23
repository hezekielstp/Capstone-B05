"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaEnvelope } from "react-icons/fa";

// 🔹 Reuse sisi kiri dari login
import LoginLeftSection from "../login/components/LoginLeftSection";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleForgot = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5001/api/users/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Terjadi kesalahan, coba lagi.");
      } else {
        setMessage("Tautan reset kata sandi telah dikirim ke email Anda!");
      }
    } catch (err) {
      console.error(err);
      setError("Server error, coba lagi nanti.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="flex flex-col md:flex-row min-h-screen font-inter bg-[#F5F7FB]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* 🔹 Kiri (logo & background biru) */}
      <LoginLeftSection />

      {/* 🔹 Kanan (form lupa password) */}
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
          transition={{ delay: 0.4 }}
        >
          Lupa Kata Sandi?
        </motion.h1>

        <motion.p
          className="text-[#2D3570] mb-8 text-sm md:text-base"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          Masukkan alamat emailmu untuk menerima tautan reset kata sandi.
        </motion.p>

        <motion.form
          onSubmit={handleForgot}
          className="space-y-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="flex items-center border-2 border-[#2D3570] rounded-lg px-3 py-2"
          >
            <FaEnvelope className="text-[#2D3570] mr-2" />
            <input
              type="email"
              placeholder="Alamat Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1 outline-none text-gray-700 text-sm md:text-base bg-transparent"
            />
          </motion.div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={loading}
            className="w-full bg-[#2D3570] text-white py-3 rounded-lg font-semibold shadow-md hover:bg-[#1F2755] text-sm md:text-base transition"
          >
            {loading ? "Mengirim..." : "Kirim Tautan Reset"}
          </motion.button>

          {message && (
            <p className="text-green-600 text-sm text-center mt-2">{message}</p>
          )}
          {error && (
            <p className="text-red-500 text-sm text-center mt-2">{error}</p>
          )}
        </motion.form>

        <motion.p
          className="mt-6 text-gray-700 text-xs md:text-sm text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          Ingat kata sandi Anda?{" "}
          <a
            href="/login"
            className="text-[#2D3570] font-semibold hover:underline"
          >
            Kembali ke login
          </a>
        </motion.p>
      </motion.div>
    </motion.div>
  );
}
