"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { FaRobot, FaEnvelope, FaCopy, FaCheckCircle } from "react-icons/fa";

export default function UserIdCard() {
  const fadeUp = { hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } };

  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

  // Get and display User ID
  const handleGetUserId = async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (data._id) {
        setUserId(data._id);
      }
    } catch (err) {
      console.error("Gagal mengambil User ID:", err);
    } finally {
      setLoading(false);
    }
  };

  // Send User ID to email
  const handleSendToEmail = async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    
    setLoading(true);
    setEmailSent(false);
    
    try {
      const res = await fetch(`${API_URL}/api/users/resend-userid`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (res.ok) {
        setEmailSent(true);
        if (data.userId) {
          setUserId(data.userId);
        }
        setTimeout(() => setEmailSent(false), 5000);
      }
    } catch (err) {
      console.error("Gagal mengirim User ID ke email:", err);
    } finally {
      setLoading(false);
    }
  };

  // Copy User ID to clipboard
  const handleCopyUserId = () => {
    if (userId) {
      navigator.clipboard.writeText(userId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <motion.div 
      variants={fadeUp} 
      initial="hidden" 
      animate="visible" 
      transition={{ duration: 0.28, delay: 0.04 }}
    >
      <h3 className="text-[#2D3570] font-semibold mb-3 text-lg">ESP32-CAM Configuration</h3>
      <div className="bg-white rounded-2xl shadow p-5">
        <div className="flex items-start gap-3 mb-4">
          <div className="bg-[#FFD84D] p-2 rounded-lg">
            <FaRobot className="text-[#2D3570] text-xl" />
          </div>
          <div className="flex-1">
            <h4 className="text-[#2D3570] font-semibold text-sm mb-1">
              User ID untuk ESP32-CAM
            </h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              Gunakan User ID ini untuk konfigurasi ESP32-CAM Anda di <strong>http://192.168.4.1</strong>
            </p>
          </div>
        </div>

        {/* User ID Display Box */}
        {userId && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#F5F7FB] border-2 border-[#2D3570] rounded-lg p-4 mb-4"
          >
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-2">
              Your User ID
            </p>
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm text-[#2D3570] font-mono font-bold break-all flex-1">
                {userId}
              </p>
              <button
                onClick={handleCopyUserId}
                className="bg-[#2D3570] text-white p-2 rounded-lg hover:bg-[#1F2755] transition-all flex-shrink-0"
                title="Copy User ID"
              >
                {copied ? <FaCheckCircle className="text-[#FFD84D]" /> : <FaCopy />}
              </button>
            </div>
            {copied && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-green-600 font-semibold mt-2"
              >
                ✅ User ID tersalin!
              </motion.p>
            )}
          </motion.div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={handleGetUserId}
            disabled={loading}
            className="flex-1 bg-[#2D3570] text-white px-4 py-2.5 rounded-lg font-semibold hover:bg-[#1F2755] shadow text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "⏳ Loading..." : userId ? "🔄 Refresh ID" : "📋 Tampilkan User ID"}
          </button>

          <button
            onClick={handleSendToEmail}
            disabled={loading}
            className="flex-1 bg-[#FFD84D] text-[#2D3570] px-4 py-2.5 rounded-lg font-semibold hover:bg-[#FFC700] shadow text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <FaEnvelope />
            {emailSent ? "✅ Terkirim!" : "Kirim ke Email"}
          </button>
        </div>

        {emailSent && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg"
          >
            <p className="text-xs text-green-700 font-medium">
              📧 User ID telah dikirim ke email Anda! Periksa inbox/spam.
            </p>
          </motion.div>
        )}

        {/* Instructions */}
        <div className="mt-4 p-3 bg-[#FFF9E6] border-l-4 border-[#FFD84D] rounded">
          <p className="text-xs text-[#2D3570] font-semibold mb-2">💡 Cara Menggunakan:</p>
          <ol className="text-xs text-gray-700 space-y-1 pl-4 list-decimal">
            <li>Nyalakan ESP32-CAM</li>
            <li>Hubungkan ke WiFi <strong>&quot;Affectra-Setup&quot;</strong></li>
            <li>Buka browser: <strong>http://192.168.4.1</strong></li>
            <li>Paste User ID ini pada form konfigurasi</li>
            <li>Simpan - ESP32-CAM siap digunakan!</li>
          </ol>
        </div>
      </div>
    </motion.div>
  );
}
