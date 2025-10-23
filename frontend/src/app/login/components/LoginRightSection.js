"use client";
import { motion } from "framer-motion";
import { FaUser, FaKey } from "react-icons/fa";

export default function LoginRightSection({
  email,
  setEmail,
  password,
  setPassword,
  error,
  handleLogin,
}) {
  return (
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
        {/* 🔹 Input Email */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="flex items-center border-2 border-[#2D3570] rounded-lg px-3 py-2"
        >
          <FaUser className="text-[#2D3570] mr-2" />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="flex-1 outline-none text-gray-700 text-sm md:text-base bg-transparent"
          />
        </motion.div>

        {/* 🔹 Input Password */}
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

        {/* 🔹 Link Lupa Kata Sandi */}
        <p className="text-right text-xs md:text-sm text-[#2D3570] mt-1">
          <a href="/forgotpassword" className="hover:underline font-semibold">
            Lupa kata sandi?
          </a>
        </p>

        {/* 🔹 Tombol Login */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          type="submit"
          className="w-full bg-[#2D3570] text-white py-3 rounded-lg font-semibold shadow-md hover:bg-[#1F2755] text-sm md:text-base transition"
        >
          Masuk
        </motion.button>

        {/* 🔹 Pesan Error */}
        {error && (
          <p className="text-red-500 text-sm text-center mt-2">{error}</p>
        )}
      </motion.form>

      {/* 🔹 Link Daftar */}
      <motion.p
        className="mt-6 text-gray-700 text-xs md:text-sm text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
      >
        Belum punya akun?{" "}
        <a
          href="/register"
          className="text-[#2D3570] font-semibold hover:underline"
        >
          Daftar
        </a>
      </motion.p>
    </motion.div>
  );
}
