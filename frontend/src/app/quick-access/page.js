"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FaDesktop, FaMobileAlt, FaCopy, FaCheck } from "react-icons/fa";

export default function QuickAccessPage() {
  const [localIP, setLocalIP] = useState("...");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Try to detect local IP from browser
    if (typeof window !== "undefined") {
      const host = window.location.hostname;
      if (host !== "localhost" && host !== "127.0.0.1") {
        setLocalIP(host);
      } else {
        setLocalIP("localhost");
      }
    }
  }, []);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const dashboardURL = `http://${localIP}:3000/dashboard`;
  const phoneURL = localIP === "localhost" 
    ? "http://<your-laptop-ip>:3000/phone-controller"
    : `http://${localIP}:3000/phone-controller`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2D3570] to-[#1a1f4a] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl w-full"
      >
        {/* Logo & Title */}
        <div className="text-center mb-12">
          <motion.img
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            src="https://i.ibb.co.com/v4Sm80KR/AFFECTRA-LOGO.png"
            alt="Affectra"
            className="w-32 h-32 mx-auto mb-6"
          />
          <h1 className="text-5xl font-bold text-white mb-3">AFFECTRA</h1>
          <p className="text-[#FFD84D] text-xl italic">EEG Based Emotion Tracking</p>
          <p className="text-white/70 mt-4">Choose your access point</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Dashboard Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl p-8 shadow-2xl"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-[#2D3570] rounded-2xl flex items-center justify-center">
                <FaDesktop className="text-3xl text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[#2D3570]">Dashboard</h2>
                <p className="text-gray-600">Main interface</p>
              </div>
            </div>

            <p className="text-gray-700 mb-6">
              Access the full dashboard with emotion tracking, history, and controls. Requires login.
            </p>

            <div className="bg-[#F5F7FB] rounded-xl p-4 mb-4">
              <p className="text-xs text-gray-600 mb-2">URL:</p>
              <div className="flex items-center justify-between">
                <code className="text-sm text-[#2D3570] break-all">{dashboardURL}</code>
                <button
                  onClick={() => copyToClipboard(dashboardURL)}
                  className="ml-2 p-2 hover:bg-white rounded-lg transition"
                >
                  {copied ? (
                    <FaCheck className="text-green-600" />
                  ) : (
                    <FaCopy className="text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            <a
              href="/dashboard"
              className="block w-full py-4 bg-[#2D3570] hover:bg-[#1f2550] text-white text-center font-semibold rounded-xl transition"
            >
              Open Dashboard →
            </a>
          </motion.div>

          {/* Phone Controller Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl p-8 shadow-2xl border-4 border-[#FFD84D]"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-[#FFD84D] rounded-2xl flex items-center justify-center">
                <FaMobileAlt className="text-3xl text-[#2D3570]" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[#2D3570]">Phone Controller</h2>
                <p className="text-gray-600">Remote control</p>
              </div>
            </div>

            <p className="text-gray-700 mb-6">
              Control emotions from your phone or tablet. No login required! 
              <strong> Connect to same WiFi.</strong>
            </p>

            <div className="bg-yellow-50 border-2 border-[#FFD84D] rounded-xl p-4 mb-4">
              <p className="text-xs text-gray-600 mb-2">URL for phone:</p>
              <div className="flex items-center justify-between">
                <code className="text-sm text-[#2D3570] break-all">{phoneURL}</code>
                <button
                  onClick={() => copyToClipboard(phoneURL)}
                  className="ml-2 p-2 hover:bg-white rounded-lg transition"
                >
                  {copied ? (
                    <FaCheck className="text-green-600" />
                  ) : (
                    <FaCopy className="text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            {localIP === "localhost" && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-4 text-sm">
                <p className="text-blue-800 mb-2">
                  <strong>📱 To find your laptop IP:</strong>
                </p>
                <p className="text-blue-700 text-xs">
                  Windows: Run <code>ipconfig</code> in PowerShell<br/>
                  Mac/Linux: Run <code>ifconfig</code> in Terminal
                </p>
              </div>
            )}

            <a
              href="/phone-controller"
              className="block w-full py-4 bg-[#FFD84D] hover:bg-[#e5c245] text-[#2D3570] text-center font-semibold rounded-xl transition"
            >
              Open Controller →
            </a>
          </motion.div>
        </div>

        {/* Quick Guide */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 bg-white/10 backdrop-blur-md rounded-2xl p-6 text-white"
        >
          <h3 className="text-xl font-bold mb-4 text-center">🎮 Quick Setup</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="text-3xl mb-2">1️⃣</div>
              <p className="font-semibold mb-1">Laptop</p>
              <p className="text-white/70">Open Dashboard & Login</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">2️⃣</div>
              <p className="font-semibold mb-1">Phone</p>
              <p className="text-white/70">Open Controller (same WiFi)</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">3️⃣</div>
              <p className="font-semibold mb-1">Control</p>
              <p className="text-white/70">Select emotions remotely!</p>
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <p className="text-center text-white/50 text-sm mt-8">
          © {new Date().getFullYear()} Affectra • All Rights Reserved
        </p>
      </motion.div>
    </div>
  );
}
