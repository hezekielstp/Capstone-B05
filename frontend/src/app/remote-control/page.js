"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FaArrowLeft, FaRobot, FaGamepad } from "react-icons/fa";

// Dynamically detect backend URL based on current host
const getApiBase = () => {
  if (typeof window !== "undefined") {
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    return `${protocol}//${hostname}:5001`;
  }
  return "http://localhost:5001";
};

const API_BASE = getApiBase();

export default function RemoteControlPage() {
  const router = useRouter();
  const [isManualMode, setIsManualMode] = useState(false);
  const [selectedEmotion, setSelectedEmotion] = useState(null);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if remote control mode is enabled
    const remoteMode = localStorage.getItem("remoteControlMode");
    if (remoteMode !== "true") {
      router.push("/dashboard");
      return;
    }

    fetchStatus();
  }, [router]);

  const fetchStatus = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE}/api/sessions/inference/status`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setStatus(data);
        setIsManualMode(data.isManualMode || false);
      }
    } catch (error) {
      console.error("Failed to fetch status:", error);
    }
  };

  const toggleMode = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const newMode = !isManualMode;

      const response = await fetch(`${API_BASE}/api/sessions/inference/manual/toggle`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ enabled: newMode }),
      });

      if (response.ok) {
        setIsManualMode(newMode);
        await fetchStatus();
      }
    } catch (error) {
      console.error("Failed to toggle mode:", error);
    } finally {
      setLoading(false);
    }
  };

  const sendEmotion = async (emotion) => {
    if (!isManualMode) {
      alert("Please enable manual mode first");
      return;
    }

    setLoading(true);
    setSelectedEmotion(emotion);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE}/api/sessions/inference/manual/emotion`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ emotion }),
      });

      if (response.ok) {
        // Visual feedback
        setTimeout(() => setSelectedEmotion(null), 1000);
      }
    } catch (error) {
      console.error("Failed to send emotion:", error);
    } finally {
      setLoading(false);
    }
  };

  const exitRemoteControl = () => {
    localStorage.removeItem("remoteControlMode");
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2D3570] to-[#1a1f4a] p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-6 text-white"
        >
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={exitRemoteControl}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition"
            >
              <FaArrowLeft />
              <span>Kembali ke Dashboard</span>
            </button>

            <div className="flex items-center gap-3">
              {isManualMode ? (
                <FaGamepad className="text-[#FFD84D] text-2xl" />
              ) : (
                <FaRobot className="text-gray-300 text-2xl" />
              )}
            </div>
          </div>

          <h1 className="text-3xl font-bold mb-2">🎮 Remote Control</h1>
          <p className="text-white/70">
            Control emotion detection manually (secret mode)
          </p>
        </motion.div>

        {/* Mode Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-6 mb-6 shadow-lg"
        >
          <h2 className="text-xl font-bold text-[#2D3570] mb-4">Control Mode</h2>

          <div className="flex items-center justify-between p-4 bg-[#F5F7FB] rounded-xl">
            <div>
              <p className="font-semibold text-[#2D3570]">
                {isManualMode ? "🎮 Manual Mode" : "🤖 Auto Mode"}
              </p>
              <p className="text-sm text-gray-600">
                {isManualMode
                  ? "You control the emotions manually"
                  : "Python inference is running automatically"}
              </p>
            </div>

            <button
              onClick={toggleMode}
              disabled={loading}
              className={`px-6 py-3 rounded-xl font-semibold transition ${
                isManualMode
                  ? "bg-[#FFD84D] hover:bg-[#e5c245] text-[#2D3570]"
                  : "bg-[#2D3570] hover:bg-[#1f2550] text-white"
              } disabled:opacity-50`}
            >
              {loading ? "..." : isManualMode ? "Disable Manual" : "Enable Manual"}
            </button>
          </div>
        </motion.div>

        {/* Emotion Controllers */}
        {isManualMode && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-6 shadow-lg"
          >
            <h2 className="text-xl font-bold text-[#2D3570] mb-6">
              Select Emotion to Inject
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Positif Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => sendEmotion("Positif")}
                disabled={loading}
                className={`p-8 rounded-2xl border-4 transition ${
                  selectedEmotion === "Positif"
                    ? "border-green-500 bg-green-50"
                    : "border-green-200 hover:border-green-400 bg-white"
                } disabled:opacity-50`}
              >
                <img
                  src="/positif.png"
                  alt="Positif"
                  className="w-20 h-20 mx-auto mb-4"
                />
                <p className="text-2xl font-bold text-green-600">Positif</p>
                <p className="text-sm text-gray-600 mt-2">Happy & Relaxed</p>
              </motion.button>

              {/* Netral Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => sendEmotion("Netral")}
                disabled={loading}
                className={`p-8 rounded-2xl border-4 transition ${
                  selectedEmotion === "Netral"
                    ? "border-blue-500 bg-blue-50"
                    : "border-blue-200 hover:border-blue-400 bg-white"
                } disabled:opacity-50`}
              >
                <img
                  src="/netral.png"
                  alt="Netral"
                  className="w-20 h-20 mx-auto mb-4"
                />
                <p className="text-2xl font-bold text-blue-600">Netral</p>
                <p className="text-sm text-gray-600 mt-2">Calm & Balanced</p>
              </motion.button>

              {/* Negatif Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => sendEmotion("Negatif")}
                disabled={loading}
                className={`p-8 rounded-2xl border-4 transition ${
                  selectedEmotion === "Negatif"
                    ? "border-red-500 bg-red-50"
                    : "border-red-200 hover:border-red-400 bg-white"
                } disabled:opacity-50`}
              >
                <img
                  src="/negatif.png"
                  alt="Negatif"
                  className="w-20 h-20 mx-auto mb-4"
                />
                <p className="text-2xl font-bold text-red-600">Negatif</p>
                <p className="text-sm text-gray-600 mt-2">Stressed & Anxious</p>
              </motion.button>
            </div>

            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
              <p className="text-sm text-yellow-800">
                ⚠️ <strong>Secret Mode:</strong> The selected emotion will be added to the
                database every 10 seconds. The dashboard will display it as if it came from
                real EEG inference.
              </p>
            </div>
          </motion.div>
        )}

        {/* Status Info */}
        {status && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6 bg-white/10 backdrop-blur-md rounded-xl p-4 text-white text-sm"
          >
            <p>
              <strong>Session Active:</strong> {status.isActive ? "✅ Yes" : "❌ No"}
            </p>
            <p>
              <strong>Paused:</strong> {status.isPaused ? "⏸️ Yes" : "▶️ No"}
            </p>
            <p>
              <strong>Manual Mode:</strong>{" "}
              {status.isManualMode ? "🎮 Enabled" : "🤖 Disabled"}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
