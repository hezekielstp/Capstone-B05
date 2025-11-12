"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { FaKey } from "react-icons/fa";
import LoginLeftSection from "../login/components/LoginLeftSection"; // 🔹 Gunakan komponen kiri yang sama

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token"); // Token reset dari URL

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (password !== confirmPassword) {
      setError("Kata sandi tidak cocok!");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("http://localhost:5001/api/users/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          newPassword: password,   // ✅ kirim newPassword sesuai backend
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Gagal mereset kata sandi.");
      } else {
        setMessage("✅ Kata sandi berhasil direset! Mengalihkan ke halaman login...");
        setTimeout(() => router.push("/login"), 2000);
      }
    } catch (err) {
      console.error(err);
      setError("Terjadi kesalahan pada server.");
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
      {/* 🔹 Bagian Kiri */}
      <LoginLeftSection />

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
          transition={{ delay: 0.4 }}
        >
          Atur Ulang Kata Sandi
        </motion.h1>

        <motion.p
          className="text-[#2D3570] mb-8 text-sm md:text-base"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          Masukkan kata sandi baru untuk akunmu.
        </motion.p>

        <motion.form
          onSubmit={handleResetPassword}
          className="space-y-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          {/* Password baru */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="flex items-center border-2 border-[#2D3570] rounded-lg px-3 py-2"
          >
            <FaKey className="text-[#2D3570] mr-2" />
            <input
              type="password"
              placeholder="Kata Sandi Baru"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="flex-1 outline-none text-gray-700 text-sm md:text-base bg-transparent"
            />
          </motion.div>

          {/* Konfirmasi password */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="flex items-center border-2 border-[#2D3570] rounded-lg px-3 py-2"
          >
            <FaKey className="text-[#2D3570] mr-2" />
            <input
              type="password"
              placeholder="Konfirmasi Kata Sandi"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="flex-1 outline-none text-gray-700 text-sm md:text-base bg-transparent"
            />
          </motion.div>

          {/* Tombol simpan */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={loading}
            className="w-full bg-[#2D3570] text-white py-3 rounded-lg font-semibold shadow-md hover:bg-[#1F2755] text-sm md:text-base transition"
          >
            {loading ? "Menyimpan..." : "Simpan Kata Sandi"}
          </motion.button>

          {/* Pesan sukses atau error */}
          {message && (
            <p className="text-green-600 text-center text-sm mt-2">{message}</p>
          )}
          {error && (
            <p className="text-red-600 text-center text-sm mt-2">{error}</p>
          )}
        </motion.form>

        <motion.p
          className="mt-6 text-gray-700 text-xs md:text-sm text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          Sudah ingat kata sandimu?{" "}
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
