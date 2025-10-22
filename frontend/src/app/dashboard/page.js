  "use client";

  import { useState, useEffect, useRef } from "react";
  import { useRouter } from "next/navigation";
  import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
  import {
    FaHome,
    FaSignOutAlt,
    FaTrashAlt,
    FaEdit,
    FaRedoAlt,
    FaTimes,
    FaChevronDown,
    FaBars,
  } from "react-icons/fa";
  import { motion, AnimatePresence } from "framer-motion";

  /*
    Final revisi: spacing & alignment diperbaiki agar terlihat pas di
    komputer, laptop, iPad, dan HP tanpa mengubah logic fungsional.
    Sidebar fixed width 240px (w-60), namun layout menggunakan grid pada lg
    sehingga jarak antara sidebar dan konten lebih proporsional.
    Patch tambahan: overflow-x-hidden di wrapper paling luar untuk mencegah
    horizontal scroll / bisa digeser-geser.
  */

  export default function DashboardPage() {
    const router = useRouter();

    // ambil nama user dari localStorage
    const [userName, setUserName] = useState("User");
const [firstName, setFirstName] = useState("User");

useEffect(() => {
  const fetchUser = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      // 🔹 Ganti port ke 5001 (sesuai server.js kamu)
      const res = await fetch("http://localhost:5001/api/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (res.ok) {
        // ✅ Pastikan data.name ada, lalu ambil nama depan
        setUserName(data.name || "User");
        setFirstName(data.name?.split(" ")[0] || "User");
      } else {
        console.error("Gagal ambil user:", data.message);
      }
    } catch (error) {
      console.error("Error ambil user:", error);
    }
  };

  fetchUser();
}, []);

    const [notes, setNotes] = useState([
      "Malam ini saya bersantai dan melihat bunga-bunga di taman sepertinya membuat saya menjadi sedikit lebih tenang dan happy.",
    ]);
    const [newNote, setNewNote] = useState("");
    const [showLogoutPopup, setShowLogoutPopup] = useState(false);

    // ✅ tiap sesi punya gambar sesuai mood-nya, lengkap dengan waktu & tanggal (10 sesi acak dgn jarak waktu 10 detik)
    const now = new Date();
    const moods = ["Positif", "Netral", "Negatif"];
    const emojiPaths = {
      Positif: "/rekaman/positif.png",
      Netral: "/rekaman/netral.png",
      Negatif: "/rekaman/negatif.png",
    };

    const [sessions, setSessions] = useState(() => {
      return Array.from({ length: 10 }, (_, i) => {
        const mood = moods[Math.floor(Math.random() * moods.length)];
        const time = new Date(now.getTime() - i * 10000).toLocaleTimeString("id-ID", {
          hour12: false,
        });
        const date = now.toLocaleDateString("id-ID");
        return {
          mood,
          note: "",
          tempNote: "",
          showInput: false,
          showPhoto: false,
          photo: emojiPaths[mood],
          time,
          date,
        };
      });
    });

    const emojiImages = {
      Positif: "/positif.png",
      Negatif: "/negatif.png",
      Netral: "/netral.png",
    };

    const handleToggleInput = (index) => {
      const updated = [...sessions];
      updated[index].showInput = !updated[index].showInput;
      updated[index].tempNote = updated[index].note;
      setSessions(updated);
    };

    const handleTempNoteChange = (index, value) => {
      const updated = [...sessions];
      updated[index].tempNote = value;
      setSessions(updated);
    };

    const handleSaveNote = (index) => {
      const updated = [...sessions];
      updated[index].note = updated[index].tempNote;
      updated[index].showInput = false;
      setSessions(updated);
    };

    const handleDeleteNote = (index) => {
      const updated = [...sessions];
      updated[index].note = "";
      updated[index].tempNote = "";
      updated[index].showInput = false;
      setSessions(updated);
    };

    // toggle popup foto
    const handleShowPhoto = (index) => {
      const updated = [...sessions];
      updated[index].showPhoto = !updated[index].showPhoto;
      setSessions(updated);
    };

    const handleAddNote = () => {
      if (newNote.trim()) {
        setNotes([...notes, newNote]);
        setNewNote("");
      }
    };

    const handleDeleteMainNote = (index) => {
      const updated = notes.filter((_, i) => i !== index);
      setNotes(updated);
    };

    const handleLogout = () => {
      setShowLogoutPopup(true);
    };

    const confirmLogout = () => {
      router.push("/login");
    };

    const cancelLogout = () => {
      setShowLogoutPopup(false);
    };

    // 🔹 Data dropdown rekap
    const datasets = {
      "Rekap Emosi 1 Hari": [
        { name: "Positif", value: 45, color: "#FFD84D" },
        { name: "Netral", value: 25, color: "#8CA7FF" },
        { name: "Negatif", value: 30, color: "#FF5A5A" },
      ],
      "Rekap Emosi 3 Hari": [
        { name: "Positif", value: 50, color: "#FFD84D" },
        { name: "Netral", value: 20, color: "#8CA7FF" },
        { name: "Negatif", value: 30, color: "#FF5A5A" },
      ],
      "Rekap Emosi 7 Hari": [
        { name: "Positif", value: 60, color: "#FFD84D" },
        { name: "Netral", value: 15, color: "#8CA7FF" },
        { name: "Negatif", value: 25, color: "#FF5A5A" },
      ],
    };

    const [selectedRange, setSelectedRange] = useState("Rekap Emosi 1 Hari");
    const [showDropdown, setShowDropdown] = useState(false);
    const data = datasets[selectedRange];

    // ✅ Tambahan: emosi + waktu real-time tiap 10 detik
    const [emotion, setEmotion] = useState("Positif");
    const [time, setTime] = useState("");
    const [date, setDate] = useState("");

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

    useEffect(() => {
      const fetchEEGData = async () => {
        try {
          const response = await fetch("http://localhost:5000/api/eeg-latest");
          const data = await response.json();
          setEmotion(data.emotion || "Netral");
        } catch (error) {
          console.error("Gagal ambil data EEG:", error);
        }
      };

      fetchEEGData();
      const interval = setInterval(fetchEEGData, 10000);
      return () => clearInterval(interval);
    }, []);

    // Sidebar state & refs to manage closing on outside click
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const sidebarRef = useRef(null);

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

    // Motion variants
    const sidebarVariants = {
      hidden: { x: -280, opacity: 0 },
      visible: { x: 0, opacity: 1 },
      exit: { x: -280, opacity: 0 },
    };

    const fadeUp = {
      hidden: { opacity: 0, y: 10 },
      visible: { opacity: 1, y: 0 },
    };

    return (
      <div className="min-h-screen font-inter bg-[#F5F7FB] overflow-x-hidden">
        {/* Layout grid wrapper:
            - On lg and up, use two columns: sidebar (240px) + main content (1fr)
            - On smaller screens, main content is full width and sidebar becomes overlay when opened */}
        <div className="w-full lg:grid lg:grid-cols-[240px_1fr] lg:gap-6">

          {/* Sidebar (overlay on mobile, static in lg grid column) */}
          <AnimatePresence>
            {(sidebarOpen || typeof window === "undefined" || (typeof window !== "undefined" && window.innerWidth >= 1024)) && (
              <motion.aside
                ref={sidebarRef}
                variants={sidebarVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.26, ease: "easeInOut" }}
                className={`bg-[#2D3570] text-white flex flex-col justify-between py-6 px-5 z-40
                  ${typeof window !== "undefined" && window.innerWidth >= 1024 ? "relative" : "fixed inset-y-0 left-0 w-60"}`}
                style={{ minHeight: "100vh" }}
              >
                <div>
                  <div className="flex items-center mb-6 justify-between">
                    <div className="flex items-center">
                      <img src="/affectra.png" alt="Affectra Logo" className="w-10 h-10 mr-3" />
                      <h1 className="text-xl font-bold" style={{ fontFamily: "Abril Fatface" }}>
                        AFFECTRA
                      </h1>
                    </div>
                    {/* Close button only visible on mobile overlay */}
                    <button
                      className="lg:hidden text-white"
                      onClick={() => setSidebarOpen(false)}
                      aria-label="Tutup sidebar"
                    >
                      <FaTimes />
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      router.push("/dashboard");
                      setSidebarOpen(false);
                    }}
                    className="flex items-center w-full text-left py-2 px-3 rounded-lg bg-[#404A88] mb-4 hover:bg-[#1F2755] transition"
                  >
                    <FaHome className="mr-3" /> Halaman Utama
                  </button>
                </div>

                <button
                  onClick={handleLogout}
                  className="flex items-center text-left py-2 px-3 rounded-lg hover:bg-[#1F2755] transition"
                >
                  <FaSignOutAlt className="mr-3" /> Keluar
                </button>
              </motion.aside>
            )}
          </AnimatePresence>

          {/* Overlay for mobile when sidebar open */}
          <AnimatePresence>
            {sidebarOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.45 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="fixed inset-0 bg-black z-30 lg:hidden"
                onClick={() => setSidebarOpen(false)}
              />
            )}
          </AnimatePresence>

          {/* Main Content (second column in lg grid) */}
          <main className="px-4 sm:px-6 md:px-8 py-6">
            {/* Hamburger for mobile */}
            <div className="flex items-center justify-between mb-6">
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
                onClick={handleLogout}
                whileHover={{ scale: 1.03 }}
                transition={{ duration: 0.15 }}
              />
            </div>

            {/* Baris atas */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Emosi Terakhir */}
              <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                transition={{ duration: 0.35 }}
              >
                <h3 className="text-[#2D3570] font-semibold mb-3 text-lg">Emosi Terakhir Terdeteksi</h3>
                <div className="bg-white rounded-2xl shadow p-5">
                  <div className="border border-[#E0E5F5] rounded-xl p-4">
                    <div className="flex flex-col sm:flex-row items:center justify-between mb-4 gap-4">
                      <div className="flex items-center gap-4">
                        <img
                          src={emotion === "Positif" ? "/positif.png" : emotion === "Negatif" ? "/negatif.png" : "/netral.png"}
                          alt={`Emosi ${emotion}`}
                          className="w-14 h-14 sm:w-16 sm:h-16 object-contain"
                        />
                        <div>
                          <p className="text-[#2D3570] text-sm font-semibold">Emosi</p>
                          <p className="text-[#FFD84D] text-base font-bold -mt-1">{emotion}</p>
                        </div>
                      </div>
                      <div className="text-right text-sm text-[#2D3570]">
                        <p><span className="font-semibold">Waktu</span> {time}</p>
                        <p><span className="font-semibold">Tanggal</span> {date}</p>
                      </div>
                    </div>
                    <hr className="border-t border-[#E0E5F5] my-3" />
                    <p className="text-[#2D3570] font-medium text-center">Halo, {firstName}!</p>
                  </div>
                </div>
              </motion.div>

              {/* Hasil Rekaman Foto */}
              <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                transition={{ duration: 0.35, delay: 0.05 }}
              >
                <h3 className="text-[#2D3570] font-semibold mb-3 text-lg">Hasil Rekaman Foto</h3>
                <div className="bg-white rounded-2xl shadow p-5">
                  <img src="/flowers.png" alt="Hasil Rekaman" className="w-full h-40 sm:h-48 object-cover rounded-xl" />
                </div>
              </motion.div>
            </div>

            {/* Rekap + Riwayat */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Rekap */}
              <div>
                <div className="flex items-center gap-2 mb-3 relative">
                  <h3 className="text-[#2D3570] font-semibold text-lg">{selectedRange}</h3>
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="text-[#2D3570] hover:text-[#1F2755] flex items-center"
                  >
                    <FaChevronDown size={14} />
                  </button>

                  {showDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.18 }}
                      className="absolute top-7 left-0 bg-white border border-[#E0E5F5] shadow rounded-md z-10"
                    >
                      {["Rekap Emosi 1 Hari", "Rekap Emosi 3 Hari", "Rekap Emosi 7 Hari"].map((range) => (
                        <button
                          key={range}
                          onClick={() => {
                            setSelectedRange(range);
                            setShowDropdown(false);
                          }}
                          className={`block w-full text-left px-4 py-2 text-sm ${
                            selectedRange === range
                              ? "bg-[#E9ECF6] text-[#2D3570] font-semibold"
                              : "text-[#2D3570] hover:bg-[#F5F7FB]"
                          }`}
                        >
                          {range}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.28 }}
                  className="bg-white rounded-2xl shadow p-5 min-h-[360px] flex flex-col justify-center items-center transition-transform duration-200 hover:shadow-lg hover:-translate-y-1"
                  style={{ minHeight: 320 }}
                >
                  <div className="relative flex justify-center items-center w-full" style={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        {/* Lapisan bawah (bayangan 3D) */}
                        <Pie
                          data={data}
                          cx="50%"
                          cy="52%"
                          innerRadius={70}
                          outerRadius={105}
                          dataKey="value"
                          fill="#ddd"
                          stroke="none"
                          opacity={0.25}
                          isAnimationActive={false}
                        />
                        {/* Lapisan utama (warna utama + animasi) */}
                        <Pie
                          data={data}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          dataKey="value"
                          isAnimationActive={true}
                        >
                          {data.map((entry, i) => (
                            <Cell key={i} fill={entry.color} stroke="none" />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="flex justify-center gap-6 mt-6 text-sm flex-wrap">
                    <div className="flex items-center gap-1 text-[#2D3570]">
                      <span className="w-3 h-3 bg-[#FF5A5A] rounded-full"></span> Negatif
                    </div>
                    <div className="flex items-center gap-1 text-[#2D3570]">
                      <span className="w-3 h-3 bg-[#FFD84D] rounded-full"></span> Positif
                    </div>
                    <div className="flex items-center gap-1 text-[#2D3570]">
                      <span className="w-3 h-3 bg-[#8CA7FF] rounded-full"></span> Netral
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Riwayat Sesi */}
              <div>
                <h3 className="text-[#2D3570] font-semibold mb-3 text-lg">Riwayat Sesi</h3>
                <div className="relative">
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.28, delay: 0.05 }}
                    className="bg-white rounded-2xl shadow p-5 max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-[#CBD5E1] scrollbar-track-transparent transition-transform duration-200 hover:shadow-lg hover:-translate-y-1"
                  >
                    {sessions.map((s, i) => (
                      <div key={i} className="bg-[#F5F7FB] rounded-xl p-3 mb-3 flex flex-col">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <img src={emojiImages[s.mood]} alt={s.mood} className="w-10 h-10 object-contain" />
                            <div>
                              <p className="font-semibold text-[#2D3570]">{s.mood}</p>
                              <p className="text-xs text-gray-500">{s.time} • {s.date}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <button onClick={() => handleToggleInput(i)} className="text-gray-500 hover:text-[#2D3570]">
                              <FaEdit size={14} />
                            </button>
                            <button
                              onClick={() => handleShowPhoto(i)}
                              className="text-[#2D3570] text-sm font-medium hover:underline"
                            >
                              Lihat Foto
                            </button>
                          </div>
                        </div>

                        {s.showInput && (
                          <div className="mt-3 bg-white rounded-lg border border-[#E0E5F5] p-2">
                            <textarea
                              value={s.tempNote}
                              onChange={(e) => handleTempNoteChange(i, e.target.value)}
                              placeholder="Tulis catatan disini..."
                              className="w-full text-[#2D3570] text-sm outline-none resize-none"
                            />
                            <div className="flex justify-end gap-2 mt-2">
                              <button
                                onClick={() => handleSaveNote(i)}
                                className="bg-[#2D3570] text-white px-3 py-1 rounded-md text-sm font-semibold hover:bg-[#1F2755]"
                              >
                                Simpan
                              </button>
                            </div>
                          </div>
                        )}

                        {s.note && !s.showInput && (
                          <div className="mt-2 flex justify-between items-start bg-white p-2 rounded-lg border border-[#E0E5F5]">
                            <p className="text-sm text-[#2D3570] flex-1">{s.note}</p>
                            <button
                              onClick={() => handleDeleteNote(i)}
                              className="text-[#FF5A5A] hover:text-red-700 ml-2"
                            >
                              <FaTrashAlt size={14} />
                            </button>
                          </div>
                        )}

                        {/* ✅ Popup Foto per sesi */}
                        {s.showPhoto && (
                          <AnimatePresence>
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50"
                            >
                              <motion.div
                                initial={{ scale: 0.96, y: 16 }}
                                animate={{ scale: 1, y: 0 }}
                                exit={{ scale: 0.96, y: 16 }}
                                transition={{ duration: 0.18 }}
                                className="bg-white rounded-2xl shadow-xl p-6 w-[90%] max-w-md relative"
                              >
                                <button
                                  onClick={() => handleShowPhoto(i)}
                                  className="absolute top-3 right-3 text-[#2D3570] hover:text-[#1F2755]"
                                >
                                  <FaTimes size={18} />
                                </button>
                                <h3 className="text-[#2D3570] font-semibold mb-3 text-lg text-center">
                                  Hasil Rekaman Foto
                                </h3>
                                <img
                                  src={s.photo}
                                  alt={`Foto ${s.mood}`}
                                  className="w-full h-64 object-cover rounded-xl"
                                />
                              </motion.div>
                            </motion.div>
                          </AnimatePresence>
                        )}
                      </div>
                    ))}
                  </motion.div>

                  {/* 👇 Icon Scroll Indicator di bawah */}
                  <div className="absolute bottom-1 left-0 right-0 flex justify-center pointer-events-none">
                    <FaChevronDown className="text-gray-400 animate-bounce" size={18} />
                  </div>
                </div>
              </div>
            </div> {/* ✅ penutup grid Rekap + Riwayat */}

            {/* Catatan */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.28, delay: 0.06 }}
            >
              <h3 className="text-[#2D3570] font-semibold mb-3 text-lg">Catatan Anda</h3>
              <div className="bg-white rounded-2xl shadow p-5">
                {notes.map((note, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between bg-[#F5F7FB] rounded-lg p-3 mb-3"
                  >
                    <p className="text-sm text-gray-700 flex-1">{note}</p>
                    <button
                      onClick={() => handleDeleteMainNote(i)}
                      className="text-[#FF5A5A] hover:text-red-700 ml-3"
                    >
                      <FaTrashAlt />
                    </button>
                  </div>
                ))}

                <p className="text-[#2D3570] font-semibold mt-6 mb-2 text-sm">
                  Berikan catatan tambahan disini
                </p>

                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Ketik disini..."
                  className="w-full border-2 border-[#E0E5F5] rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-[#2D3570] resize-none h-24 mb-3 text-[#2D3570]"
                />

                <button
                  onClick={handleAddNote}
                  className="bg-[#2D3570] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#1F2755] shadow text-sm"
                >
                  Tambah
                </button>
              </div>
            </motion.div>
          </main>
        </div>

        {/* Popup Logout */}
        <AnimatePresence>
          {showLogoutPopup && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50"
            >
              <motion.div
                initial={{ scale: 0.98, y: 8 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.98, y: 8 }}
                transition={{ duration: 0.18 }}
                className="bg-white p-8 rounded-2xl shadow-xl w-[90%] max-w-sm text-center"
              >
                <div className="flex justify-center mb-4">
                  <FaRedoAlt className="text-[#2D3570] text-3xl" />
                </div>
                <p className="text-[#2D3570] font-medium mb-6">
                  Selesai untuk hari ini, yakin mau keluar?
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={cancelLogout}
                    className="bg-gray-300 text-[#2D3570] px-4 py-2 rounded-lg font-semibold flex-1 hover:bg-gray-400"
                  >
                    Batal
                  </button>
                  <button
                    onClick={confirmLogout}
                    className="bg-[#2D3570] text-white px-4 py-2 rounded-lg font-semibold flex-1 hover:bg-[#1F2755]"
                  >
                    Ya
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }
