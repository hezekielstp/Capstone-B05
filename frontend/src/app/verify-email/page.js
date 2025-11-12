"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import RegisterLeftSection from "../register/components/RegisterLeftSection";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState("loading"); // "loading" | "success" | "error"
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        // ✅ Sesuaikan dengan backend: GET + query param
        const res = await fetch(
          `http://localhost:5001/api/users/verify?token=${token}`,
          {
            method: "GET",
          }
        );

        const data = await res.json();

        if (!res.ok) throw new Error(data.message || "Verifikasi gagal");

        setStatus("success");
        setMessage("✅ Email Anda berhasil diverifikasi!");

        // Redirect otomatis
        setTimeout(() => router.push("/dashboard"), 2500);
      } catch (err) {
        setStatus("error");
        setMessage(err.message || "Token verifikasi tidak valid atau sudah kadaluarsa.");
      }
    };

    if (token) verifyEmail();
    else {
      setStatus("error");
      setMessage("Token tidak ditemukan. Silakan daftar ulang.");
    }
  }, [token, router]);

  return (
    <motion.div
      className="flex flex-col md:flex-row min-h-screen font-inter bg-[#F5F7FB]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* 🔹 Kiri */}
      <RegisterLeftSection />

      {/* 🔹 Kanan */}
      <motion.div
        className="w-full md:w-1/2 bg-white flex flex-col justify-center items-center px-6 md:px-16 py-10 text-center"
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 1 }}
      >
        {status === "loading" && (
          <>
            <motion.div
              className="w-12 h-12 border-4 border-[#2D3570] border-t-transparent rounded-full animate-spin mb-4"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            />
            <p className="text-[#2D3570] font-semibold text-lg">
              Memverifikasi email Anda...
            </p>
          </>
        )}

        {status === "success" && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <FaCheckCircle className="text-green-500 text-6xl mb-3" />
            <h2 className="text-2xl font-bold text-[#2D3570] mb-2">
              Verifikasi Berhasil!
            </h2>
            <p className="text-gray-700 text-base">{message}</p>
            <p className="text-sm text-gray-500 mt-3">
              Mengalihkan ke dashboard...
            </p>
          </motion.div>
        )}

        {status === "error" && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <FaTimesCircle className="text-red-500 text-6xl mb-3" />
            <h2 className="text-2xl font-bold text-[#2D3570] mb-2">
              Verifikasi Gagal
            </h2>
            <p className="text-gray-700 text-base">{message}</p>
            <button
              onClick={() => router.push("/register")}
              className="mt-6 bg-[#2D3570] text-white px-5 py-2 rounded-lg hover:bg-[#1F2755] transition text-sm font-semibold"
            >
              Kembali ke Pendaftaran
            </button>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}
