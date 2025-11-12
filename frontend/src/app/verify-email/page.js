"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState("loading"); // "loading" | "success" | "error"
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const res = await fetch("http://localhost:5001/api/users/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        const data = await res.json();

        if (!res.ok) throw new Error(data.message || "Verifikasi gagal");

        setStatus("success");
        setMessage("Email Anda berhasil diverifikasi!");

        // ✅ Redirect otomatis ke dashboard
        setTimeout(() => router.push("/dashboard"), 3000);
      } catch (err) {
        setStatus("error");
        setMessage(err.message || "Token tidak valid atau sudah kadaluarsa.");
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
      className="fixed inset-0 flex items-center justify-center bg-[#2D3570]/70 backdrop-blur-sm z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <AnimatePresence mode="wait">
        {status === "loading" && (
          <motion.div
            key="loading"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-white px-8 py-10 rounded-2xl shadow-xl flex flex-col items-center text-center w-[90%] max-w-md"
          >
            <motion.div
              className="w-10 h-10 border-4 border-[#2D3570] border-t-transparent rounded-full animate-spin mb-5"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            />
            <p className="text-[#2D3570] font-semibold text-lg">
              Memverifikasi email Anda...
            </p>
          </motion.div>
        )}

        {status === "success" && (
          <motion.div
            key="success"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-white px-10 py-10 rounded-2xl shadow-2xl flex flex-col items-center text-center w-[90%] max-w-md"
          >
            <FaCheckCircle className="text-green-500 text-7xl mb-4 drop-shadow-md" />
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
            key="error"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-white px-10 py-10 rounded-2xl shadow-2xl flex flex-col items-center text-center w-[90%] max-w-md"
          >
            <FaTimesCircle className="text-red-500 text-7xl mb-4 drop-shadow-md" />
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
      </AnimatePresence>
    </motion.div>
  );
}
