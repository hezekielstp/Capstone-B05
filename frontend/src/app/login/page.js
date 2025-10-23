"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";

// 🔹 Import komponen
import LoginLeftSection from "./components/LoginLeftSection";
import LoginRightSection from "./components/LoginRightSection";
import LoadingOverlay from "./components/LoadingOverlay";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // overlay state

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true); // tampilkan overlay

    try {
      const res = await fetch("http://localhost:5001/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Login gagal, periksa kembali data Anda.");
        setLoading(false);
        return;
      }

      // ✅ Simpan token & data user
      localStorage.setItem("token", data.token);
      localStorage.setItem("userName", data.user.name);
      localStorage.setItem("userEmail", data.user.email);
      localStorage.setItem("userPhone", data.user.phone);

      // ✅ Arahkan ke dashboard
      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      setError("Terjadi kesalahan pada server.");
    } finally {
      setLoading(false); // sembunyikan overlay
    }
  };

  return (
    <motion.div
      className="flex flex-col md:flex-row min-h-screen font-inter bg-[#F5F7FB]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* 🔹 Bagian kiri */}
      <LoginLeftSection />

      {/* 🔹 Bagian kanan */}
      <LoginRightSection
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        error={error}
        handleLogin={handleLogin}
      />

      {/* 🔹 Overlay loading */}
      <LoadingOverlay show={loading} />
    </motion.div>
  );
}
