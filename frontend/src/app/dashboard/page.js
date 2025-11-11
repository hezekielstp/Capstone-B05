"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FaBars } from "react-icons/fa";

// 🔹 Import semua komponen
import Sidebar from "./components/sidebar";
import LogoutPopup from "./components/logout";
import EmosiTerakhir from "./components/emositerakhir";
import RekamFoto from "./components/rekamfoto";
import RekapEmosi from "./components/rekapemosi";
import RiwayatSesi from "./components/riwayatsesi";
import CatatanAnda from "./components/catatanaanda";

export default function DashboardPage() {
  const router = useRouter();

  // 🧠 STATE GLOBAL
  const [userName, setUserName] = useState("User");
  const [firstName, setFirstName] = useState("User");
  const [emotion, setEmotion] = useState("Positif");
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    setUserName("User");
    setFirstName("User");
    setShowLogoutPopup(false);
    router.push("/login");
  };

  // ============================================================
  // 🔹 1. Fetch user dari token (ambil nama) + fallback setelah register
  // ============================================================
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");

        // ✅ kalau token belum ada (baru register)
        if (!token) {
          let storedName = localStorage.getItem("userName");

          // kalau belum sempat tersimpan, cek ulang tiap 0.5 detik selama 2 detik
          if (!storedName) {
            let retries = 0;
            const interval = setInterval(() => {
              retries++;
              storedName = localStorage.getItem("userName");
              if (storedName || retries >= 4) {
                clearInterval(interval);
                if (storedName) {
                  setUserName(storedName);
                  setFirstName(storedName.split(" ")[0]);
                }
              }
            }, 500);
          } else {
            setUserName(storedName);
            setFirstName(storedName.split(" ")[0]);
          }
          return;
        }

        // ✅ kalau token ada (sudah login)
        const res = await fetch("http://localhost:5001/api/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        if (res.ok) {
          setUserName(data.name || "User");
          setFirstName(data.name?.split(" ")[0] || "User");
          localStorage.setItem("userName", data.name || "User");
        } else {
          console.error("Gagal ambil user:", data.message);
        }
      } catch (error) {
        console.error("Error ambil user:", error);
      }
    };

    fetchUser();
  }, []);

  // ============================================================
  // 🔹 2. Update waktu & tanggal setiap 10 detik (real-time)
  // ============================================================
  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString("id-ID", { hour12: false }));
      setDate(now.toLocaleDateString("id-ID"));
    };
    updateDateTime();
    const interval = setInterval(updateDateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  // ============================================================
  // 🔹 3. Fetch emosi dari EEG server (real-time)
  //      ❗ PERBAIKAN: gunakan base URL dari env (5001), tambah token opsional,
  //      dan tangani abort/response non-OK.
  // ============================================================
  useEffect(() => {
    const API_BASE =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
  
      const updateEmotionFromSession = async () => {
        try {
          const token = localStorage.getItem("token");
      
          const res = await fetch(`${API_BASE}/api/sessions`, {
            headers: {
              "Content-Type": "application/json",
              Authorization: token ? `Bearer ${token}` : "",
            },
          });
      
          if (!res.ok) {
            console.error("Fetch sessions gagal:", res.status);
            return;
          }
      
          const json = await res.json();
      
          const sessions = json?.data || json?.sessions || [];
      
          if (sessions.length > 0) {
            const latest = [...sessions].sort(
              (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
            )[0];
      
            if (latest?.mood) {
              setEmotion(latest.mood);
            }
          }
        } catch (err) {
          console.error("Gagal ambil session:", err);
        }
      };
  
    updateEmotionFromSession(); // initial
    const interval = setInterval(updateEmotionFromSession, 10000);
  
    return () => clearInterval(interval);
  }, []);

  // ============================================================
  // 🔹 4. Tutup sidebar saat klik di luar (mobile)
  // ============================================================
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target)) {
        setSidebarOpen(false);
      }
    };
    if (sidebarOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [sidebarOpen]);

  // ============================================================
  // 🔹 5. Render UI
  // ============================================================
  return (
    <div className="min-h-screen font-inter bg-[#F5F7FB] overflow-x-hidden">
      <div className="w-full lg:grid lg:grid-cols-[240px_1fr] lg:gap-6">
        {/* Sidebar */}
        <Sidebar
          router={router}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          setShowLogoutPopup={setShowLogoutPopup}
        />

        {/* Main Content */}
        <main className="px-4 sm:px-6 md:px-8 py-6">
          {/* Header (dengan bar abu-abu di belakang) */}
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="bg-[#E9ECF6] rounded-2xl shadow p-4 sm:p-5 mb-6 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-[#2D3570] p-2 rounded-md hover:bg-white/60"
                aria-label="Buka sidebar"
              >
                <FaBars />
              </button>
              <motion.h2
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.28 }}
                className="text-2xl font-semibold text-[#2D3570]"
              >
                {userName}
              </motion.h2>
            </div>

            <motion.img
              src="/akun3.png"
              alt="Profile"
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover cursor-pointer"
              onClick={() => setShowLogoutPopup(true)}
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.15 }}
            />
          </motion.div>

          {/* Baris atas: Emosi + Rekaman */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <EmosiTerakhir
              emotion={emotion}
              time={time}
              date={date}
              firstName={firstName}
            />
            <RekamFoto />
          </div>

          {/* Rekap + Riwayat */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <RekapEmosi />
            {/* 🔹 REVISI: kirim data dari EmosiTerakhir ke RiwayatSesi */}
            <RiwayatSesi
              latestEmotion={emotion}
              latestTime={time}
              latestDate={date}
            />
          </div>

          {/* Catatan */}
          <CatatanAnda />
        </main>
      </div>

      <LogoutPopup
        show={showLogoutPopup}
        onCancel={() => setShowLogoutPopup(false)}
        onConfirm={handleLogout}
      />
    </div>
  );
}
