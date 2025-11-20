"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaRobot, FaGamepad, FaUser, FaSync } from "react-icons/fa";

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

export default function PhoneControllerPage() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isManualMode, setIsManualMode] = useState(false);
  const [selectedEmotion, setSelectedEmotion] = useState(null);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastSentEmotion, setLastSentEmotion] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (selectedUser) {
      fetchStatus();
      const interval = setInterval(fetchStatus, 3000);
      return () => clearInterval(interval);
    }
  }, [selectedUser]);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/remote/users`);
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
        
        // Auto-select if only one user
        if (data.length === 1 && !selectedUser) {
          setSelectedUser(data[0]);
        }
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
  };

  const fetchStatus = async () => {
    if (!selectedUser) return;

    try {
      const response = await fetch(`${API_BASE}/api/remote/status/${selectedUser.id}`);
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
    if (!selectedUser) return;

    setLoading(true);
    try {
      const newMode = !isManualMode;
      const response = await fetch(`${API_BASE}/api/remote/toggle/${selectedUser.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
    if (!selectedUser || !isManualMode) {
      alert("Please enable manual mode first");
      return;
    }

    setLoading(true);
    setSelectedEmotion(emotion);
    setLastSentEmotion(emotion);

    try {
      const response = await fetch(`${API_BASE}/api/remote/emotion/${selectedUser.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2D3570] to-[#1a1f4a] p-4 pb-8">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6 pt-4"
        >
          <h1 className="text-3xl font-bold text-white mb-2">
            🎮 Remote Controller
          </h1>
          <p className="text-white/70 text-sm">
            Control EEG emotions from your phone
          </p>
        </motion.div>

        {/* User Selection */}
        {!selectedUser ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 shadow-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-[#2D3570]">Select User</h2>
              <button
                onClick={fetchUsers}
                className="p-2 bg-[#F5F7FB] rounded-lg hover:bg-gray-200 transition"
              >
                <FaSync className="text-[#2D3570]" />
              </button>
            </div>

            <div className="space-y-2">
              {users.length === 0 ? (
                <p className="text-center text-gray-500 py-4">
                  No active users found
                </p>
              ) : (
                users.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => setSelectedUser(user)}
                    className="w-full p-4 bg-[#F5F7FB] hover:bg-[#2D3570] hover:text-white rounded-xl transition flex items-center gap-3"
                  >
                    <FaUser className="text-xl" />
                    <div className="text-left">
                      <p className="font-semibold">{user.name}</p>
                      <p className="text-sm opacity-70">{user.email}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </motion.div>
        ) : (
          <>
            {/* Selected User Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/10 backdrop-blur-md rounded-xl p-4 mb-4 text-white"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FaUser className="text-2xl" />
                  <div>
                    <p className="font-semibold">{selectedUser.name}</p>
                    <p className="text-sm text-white/70">{selectedUser.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedUser(null);
                    setIsManualMode(false);
                  }}
                  className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-sm transition"
                >
                  Change
                </button>
              </div>
            </motion.div>

            {/* Mode Toggle */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl p-5 mb-4 shadow-lg"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  {isManualMode ? (
                    <FaGamepad className="text-[#FFD84D] text-2xl" />
                  ) : (
                    <FaRobot className="text-gray-400 text-2xl" />
                  )}
                  <div>
                    <p className="font-bold text-[#2D3570]">
                      {isManualMode ? "Manual Mode" : "Auto Mode"}
                    </p>
                    <p className="text-xs text-gray-600">
                      {isManualMode ? "You're in control" : "AI inference active"}
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={toggleMode}
                disabled={loading || !status?.isActive}
                className={`w-full py-3 rounded-xl font-semibold transition ${
                  isManualMode
                    ? "bg-gray-200 hover:bg-gray-300 text-[#2D3570]"
                    : "bg-[#2D3570] hover:bg-[#1f2550] text-white"
                } disabled:opacity-50`}
              >
                {loading ? "..." : isManualMode ? "Switch to Auto" : "Enable Manual"}
              </button>

              {!status?.isActive && (
                <p className="text-xs text-red-600 mt-2 text-center">
                  ⚠️ User session not active
                </p>
              )}
            </motion.div>

            {/* Emotion Controllers */}
            <AnimatePresence>
              {isManualMode && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="bg-white rounded-2xl p-5 shadow-lg">
                    <h3 className="text-lg font-bold text-[#2D3570] mb-4 text-center">
                      Select Emotion
                    </h3>

                    <div className="space-y-3">
                      {/* Positif */}
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => sendEmotion("Positif")}
                        disabled={loading}
                        className={`w-full p-4 rounded-xl border-3 transition flex items-center gap-4 ${
                          selectedEmotion === "Positif" || lastSentEmotion === "Positif"
                            ? "border-green-500 bg-green-50"
                            : "border-green-200 hover:border-green-400 bg-white"
                        } disabled:opacity-50`}
                      >
                        <img
                          src="/positif.png"
                          alt="Positif"
                          className="w-16 h-16"
                        />
                        <div className="text-left flex-1">
                          <p className="text-xl font-bold text-green-600">Positif</p>
                          <p className="text-xs text-gray-600">Happy & Relaxed</p>
                        </div>
                        {lastSentEmotion === "Positif" && (
                          <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse" />
                        )}
                      </motion.button>

                      {/* Netral */}
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => sendEmotion("Netral")}
                        disabled={loading}
                        className={`w-full p-4 rounded-xl border-3 transition flex items-center gap-4 ${
                          selectedEmotion === "Netral" || lastSentEmotion === "Netral"
                            ? "border-blue-500 bg-blue-50"
                            : "border-blue-200 hover:border-blue-400 bg-white"
                        } disabled:opacity-50`}
                      >
                        <img
                          src="/netral.png"
                          alt="Netral"
                          className="w-16 h-16"
                        />
                        <div className="text-left flex-1">
                          <p className="text-xl font-bold text-blue-600">Netral</p>
                          <p className="text-xs text-gray-600">Calm & Balanced</p>
                        </div>
                        {lastSentEmotion === "Netral" && (
                          <div className="h-3 w-3 bg-blue-500 rounded-full animate-pulse" />
                        )}
                      </motion.button>

                      {/* Negatif */}
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => sendEmotion("Negatif")}
                        disabled={loading}
                        className={`w-full p-4 rounded-xl border-3 transition flex items-center gap-4 ${
                          selectedEmotion === "Negatif" || lastSentEmotion === "Negatif"
                            ? "border-red-500 bg-red-50"
                            : "border-red-200 hover:border-red-400 bg-white"
                        } disabled:opacity-50`}
                      >
                        <img
                          src="/negatif.png"
                          alt="Negatif"
                          className="w-16 h-16"
                        />
                        <div className="text-left flex-1">
                          <p className="text-xl font-bold text-red-600">Negatif</p>
                          <p className="text-xs text-gray-600">Stressed & Anxious</p>
                        </div>
                        {lastSentEmotion === "Negatif" && (
                          <div className="h-3 w-3 bg-red-500 rounded-full animate-pulse" />
                        )}
                      </motion.button>
                    </div>

                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-xs text-yellow-800 text-center">
                        ⚡ Emotion will be injected every 10 seconds
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Status */}
            {status && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mt-4 bg-white/10 backdrop-blur-md rounded-xl p-3 text-white text-xs space-y-1"
              >
                <p>
                  <strong>Session:</strong> {status.isActive ? "✅ Active" : "❌ Inactive"}
                </p>
                <p>
                  <strong>Paused:</strong> {status.isPaused ? "⏸️ Yes" : "▶️ No"}
                </p>
                <p>
                  <strong>Mode:</strong>{" "}
                  {status.isManualMode ? "🎮 Manual" : "🤖 Auto"}
                </p>
              </motion.div>
            )}
          </>
        )}

        {/* Connection Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 text-center text-white/50 text-xs"
        >
          <p>Connected to: {API_BASE}</p>
          <p className="mt-1">🔒 No login required</p>
        </motion.div>
      </div>
    </div>
  );
}
