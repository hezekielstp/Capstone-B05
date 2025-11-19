"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { FaCheckCircle, FaTimesCircle, FaKey } from "react-icons/fa";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState(token ? "loading" : "manual"); // "loading" | "success" | "error" | "manual"
  const [message, setMessage] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [email, setEmail] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  // Auto-verify with token if present
  useEffect(() => {
    const verifyEmailByToken = async () => {
      try {
        const res = await fetch(
          `http://localhost:5001/api/users/verify?token=${token}`
        );

        const data = await res.json();

        if (!res.ok) throw new Error(data.message || "Verifikasi gagal");

        setStatus("success");
        setMessage("Email Anda berhasil diverifikasi!");

        setTimeout(() => router.push("/login"), 3000);
      } catch (err) {
        setStatus("error");
        setMessage(
          err.message || "Token verifikasi tidak valid atau sudah kadaluarsa."
        );
      }
    };

    if (token) verifyEmailByToken();
  }, [token, router]);

  // Manual verification by code
  const handleManualVerify = async (e) => {
    e.preventDefault();
    
    if (!email || !verificationCode) {
      setMessage("Email dan kode verifikasi harus diisi");
      return;
    }

    if (verificationCode.length !== 6) {
      setMessage("Kode verifikasi harus 6 digit");
      return;
    }

    setIsVerifying(true);
    setMessage("");

    try {
      const res = await fetch(
        `http://localhost:5001/api/users/verify?code=${verificationCode}&email=${encodeURIComponent(email)}`
      );

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Verifikasi gagal");

      setStatus("success");
      setMessage("Email Anda berhasil diverifikasi!");

      setTimeout(() => router.push("/login"), 3000);
    } catch (err) {
      setStatus("error");
      setMessage(err.message || "Kode verifikasi tidak valid atau email salah");
      setIsVerifying(false);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center bg-[#2D3570]/70 backdrop-blur-sm z-50 px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <AnimatePresence mode="wait">
        {status === "manual" && (
          <motion.div
            key="manual"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-white px-8 py-10 rounded-2xl shadow-xl w-full max-w-md"
          >
            <div className="flex flex-col items-center mb-6">
              <FaKey className="text-[#2D3570] text-5xl mb-3" />
              <h2 className="text-2xl font-bold text-[#2D3570] mb-2">
                Verifikasi Email
              </h2>
              <p className="text-sm text-gray-600 text-center">
                Masukkan kode 6 digit yang dikirim ke email Anda
              </p>
            </div>

            <form onSubmit={handleManualVerify} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[#2D3570] mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#2D3570] focus:outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#2D3570] mb-2">
                  Kode Verifikasi (6 digit)
                </label>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                    setVerificationCode(value);
                  }}
                  placeholder="123456"
                  required
                  maxLength={6}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#2D3570] focus:outline-none transition text-center text-2xl font-mono tracking-widest"
                />
              </div>

              {message && (
                <div className={`p-3 rounded-lg text-sm ${
                  status === "error" 
                    ? "bg-red-50 text-red-700 border border-red-200"
                    : "bg-blue-50 text-blue-700 border border-blue-200"
                }`}>
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={isVerifying}
                className="w-full bg-[#2D3570] text-white py-3 rounded-lg font-semibold hover:bg-[#1F2755] transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isVerifying ? "Memverifikasi..." : "Verifikasi"}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-200 text-center">
              <p className="text-xs text-gray-500">
                Tidak menerima email?{" "}
                <button
                  onClick={() => router.push("/register")}
                  className="text-[#2D3570] font-semibold hover:underline"
                >
                  Daftar ulang
                </button>
              </p>
            </div>
          </motion.div>
        )}

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
              Mengalihkan ke login...
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
