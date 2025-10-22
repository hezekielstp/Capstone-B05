"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { FaUser, FaPhone, FaEnvelope, FaKey } from "react-icons/fa";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // 🔹 Integrasi ke backend MongoDB
  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("http://localhost:5001/api/users/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          phoneNumber: phone,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Pendaftaran gagal");
      }

      // Simpan nama ke localStorage (tetap seperti logika lama)
      if (name.trim()) {
        localStorage.setItem("userName", name);
      }

      alert("✅ Pendaftaran berhasil!");
      router.push("/dashboard");
    } catch (err) {
      console.error("❌ Register error:", err);
      setError(err.message);
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
      <motion.div
        className="w-full md:w-1/2 bg-[#2D3570] flex flex-col items-center justify-center text-center p-8 text-white relative overflow-hidden"
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <motion.div
          className="absolute w-40 h-40 bg-[#5A6BF7]/20 rounded-full blur-2xl -top-10 -left-10"
          animate={{ scale: [1, 1.2, 1], opacity: [0.8, 1, 0.8] }}
          transition={{ repeat: Infinity, duration: 6 }}
        />
        <motion.div
          className="absolute w-60 h-60 bg-[#FFD84D]/10 rounded-full blur-3xl bottom-10 right-10"
          animate={{ scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ repeat: Infinity, duration: 7 }}
        />

        <motion.img
          src="/affectra.png"
          alt="Affectra Logo"
          className="mx-auto w-40 md:w-60 mb-6 drop-shadow-lg"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        />

        <motion.h1
          className="text-2xl md:text-4xl font-bold mb-2"
          style={{ fontFamily: "Abril Fatface" }}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          AFFECTRA
        </motion.h1>

        <motion.p
          className="text-sm md:text-lg italic"
          style={{ fontFamily: "Aref Ruqaa" }}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1 }}
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
          transition={{ delay: 0.4 }}
        >
          Halo, Daftarkan Akun Barumu!
        </motion.h1>

        <motion.p
          className="text-[#2D3570] mb-8 text-sm md:text-base"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <span className="font-semibold">
            Mulai perjalananmu untuk memahami emosi dari sinyal otakmu
          </span>
        </motion.p>

        <motion.form
          onSubmit={handleRegister}
          className="space-y-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="flex items-center border-2 border-[#2D3570] rounded-lg px-3 py-2 bg-transparent"
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
            <FaPhone className="text-[#2D3570] mr-2" />
            <input
              type="text"
              placeholder="No. Telepon"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="flex-1 outline-none text-gray-700 text-sm md:text-base bg-transparent"
            />
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="flex items-center border-2 border-[#2D3570] rounded-lg px-3 py-2"
          >
            <FaEnvelope className="text-[#2D3570] mr-2" />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
            Daftar
          </motion.button>
        </motion.form>

        {/* Pesan error jika gagal */}
        {error && (
          <p className="text-red-600 text-center mt-4 text-sm">{error}</p>
        )}

        <motion.p
          className="mt-6 text-gray-700 text-xs md:text-sm text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          Sudah punya akun?{" "}
          <a href="/login" className="text-[#2D3570] font-semibold hover:underline">
            Masuk
          </a>
        </motion.p>
      </motion.div>
    </motion.div>
  );
}
