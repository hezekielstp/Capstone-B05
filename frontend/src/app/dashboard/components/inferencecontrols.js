"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaPlay, FaPause, FaStop } from "react-icons/fa";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

export default function InferenceControls() {
  const [status, setStatus] = useState({
    isActive: false,
    isPaused: false,
    message: "No active session",
  });
  const [loading, setLoading] = useState(false);

  // Fetch inference status on mount and periodically
  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 3000); // Check every 3 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchStatus = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch(`${API_BASE}/api/sessions/inference/status`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStatus(data);
      }
    } catch (error) {
      console.error("Failed to fetch inference status:", error);
    }
  };

  const handleStart = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE}/api/sessions/inference/start`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        await fetchStatus();
      }
    } catch (error) {
      console.error("Failed to start inference:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStop = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE}/api/sessions/inference/stop`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        await fetchStatus();
      }
    } catch (error) {
      console.error("Failed to stop inference:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePause = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE}/api/sessions/inference/pause`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        await fetchStatus();
      }
    } catch (error) {
      console.error("Failed to pause inference:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleResume = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE}/api/sessions/inference/resume`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        await fetchStatus();
      }
    } catch (error) {
      console.error("Failed to resume inference:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-md p-6"
    >
      <h2 className="text-xl font-bold text-[#2D3570] mb-4">
        🧠 Kontrol Inference
      </h2>

      {/* Status Display */}
      <div className="mb-6 p-4 bg-[#F5F7FB] rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">Status:</p>
            <p className={`font-semibold ${
              status.isActive 
                ? status.isPaused 
                  ? "text-yellow-600" 
                  : "text-green-600"
                : "text-gray-500"
            }`}>
              {status.isActive
                ? status.isPaused
                  ? "⏸️ Dijeda (tidak menyimpan data)"
                  : "▶️ Aktif (merekam emosi)"
                : "⏹️ Tidak aktif"}
            </p>
          </div>
          <div className={`h-3 w-3 rounded-full ${
            status.isActive
              ? status.isPaused
                ? "bg-yellow-500 animate-pulse"
                : "bg-green-500 animate-pulse"
              : "bg-gray-400"
          }`} />
        </div>
        {status.startedAt && (
          <p className="text-xs text-gray-500 mt-2">
            Dimulai: {new Date(status.startedAt).toLocaleString("id-ID")}
          </p>
        )}
      </div>

      {/* Control Buttons */}
      <div className="grid grid-cols-2 gap-3">
        {/* Start Button */}
        {!status.isActive && (
          <button
            onClick={handleStart}
            disabled={loading}
            className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaPlay size={14} />
            Mulai
          </button>
        )}

        {/* Stop Button */}
        {status.isActive && (
          <button
            onClick={handleStop}
            disabled={loading}
            className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaStop size={14} />
            Stop
          </button>
        )}

        {/* Pause/Resume Button */}
        {status.isActive && (
          <button
            onClick={status.isPaused ? handleResume : handlePause}
            disabled={loading}
            className="flex items-center justify-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-3 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaPause size={14} />
            {status.isPaused ? "Lanjutkan" : "Jeda"}
          </button>
        )}
      </div>

      {/* Info Text */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs text-blue-800">
          ℹ️ Inference otomatis berjalan setiap 10 detik. Gunakan &quot;Jeda&quot; untuk 
          menghentikan penyimpanan data sementara tanpa menghentikan inference.
        </p>
      </div>
    </motion.div>
  );
}
