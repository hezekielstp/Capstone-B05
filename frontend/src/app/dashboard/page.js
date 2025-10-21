"use client";

import { useState, useEffect } from "react";
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
} from "react-icons/fa";

export default function DashboardPage() {
  const router = useRouter();

  // ambil nama user dari localStorage
  const [userName, setUserName] = useState("User");
  const [firstName, setFirstName] = useState("User");

  useEffect(() => {
    const storedName = localStorage.getItem("userName");
    if (storedName) {
      setUserName(storedName);
      setFirstName(storedName.split(" ")[0]);
    }
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

  return (
    <div className="flex min-h-screen font-inter bg-[#F5F7FB] relative">
      {/* Sidebar */}
      <div className="w-60 bg-[#2D3570] text-white flex flex-col justify-between py-8 px-6">
        <div>
          <div className="flex items-center mb-8">
            <img src="/affectra.png" alt="Affectra Logo" className="w-10 h-10 mr-3" />
            <h1 className="text-xl font-bold" style={{ fontFamily: "Abril Fatface" }}>
              AFFECTRA
            </h1>
          </div>

          <button className="flex items-center w-full text-left py-2 px-3 rounded-lg bg-[#404A88] mb-4 hover:bg-[#1F2755] transition">
            <FaHome className="mr-3" /> Halaman Utama
          </button>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center text-left py-2 px-3 rounded-lg hover:bg-[#1F2755] transition"
        >
          <FaSignOutAlt className="mr-3" /> Keluar
        </button>
      </div>

      {/* Konten utama */}
      <div className="flex-1 px-8 py-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 bg-[#E9ECF6] px-6 py-3 rounded-xl shadow-sm">
          <h2 className="text-2xl font-semibold text-[#2D3570]">{userName}</h2>
          <img
            src="/akun3.png"
            alt="Profile"
            className="w-12 h-12 rounded-full object-cover cursor-pointer"
            onClick={handleLogout}
          />
        </div>

        {/* Baris atas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Emosi Terakhir */}
          <div>
            <h3 className="text-[#2D3570] font-semibold mb-3 text-lg">Emosi Terakhir Terdeteksi</h3>
            <div className="bg-white rounded-2xl shadow p-5">
              <div className="border border-[#E0E5F5] rounded-xl p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <img src="/positif.png" alt="Emosi Positif" className="w-16 h-16 object-contain" />
                    <div>
                      <p className="text-[#2D3570] text-sm font-semibold">Emosi</p>
                      <p className="text-[#FFD84D] text-base font-bold -mt-1">Positif</p>
                    </div>
                  </div>
                  <div className="text-right text-sm text-[#2D3570]">
                    <p><span className="font-semibold">Waktu</span> 21:00:30</p>
                    <p><span className="font-semibold">Tanggal</span> 03-06-2025</p>
                  </div>
                </div>
                <hr className="border-t border-[#E0E5F5] my-3" />
                <p className="text-[#2D3570] font-medium text-center">Halo, {firstName}!</p>
              </div>
            </div>
          </div>

          {/* Hasil Rekaman Foto */}
          <div>
            <h3 className="text-[#2D3570] font-semibold mb-3 text-lg">Hasil Rekaman Foto</h3>
            <div className="bg-white rounded-2xl shadow p-5">
              <img src="/flowers.png" alt="Hasil Rekaman" className="w-full h-40 object-cover rounded-xl" />
            </div>
          </div>
        </div>

        {/* Rekap + Riwayat */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Rekap */}
          <div>
            <div className="flex items-center gap-2 mb-3 relative">
              {/* ✅ teks sudah tidak dobel */}
              <h3 className="text-[#2D3570] font-semibold text-lg">{selectedRange}</h3>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="text-[#2D3570] hover:text-[#1F2755] flex items-center"
              >
                <FaChevronDown size={14} />
              </button>

              {showDropdown && (
                <div className="absolute top-7 left-0 bg-white border border-[#E0E5F5] shadow rounded-md z-10">
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
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl shadow p-5">
              <div className="h-52">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={data} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value">
                      {data.map((entry, i) => (
                        <Cell key={i} fill={entry.color} stroke="none" />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-6 mt-2 text-sm">
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
            </div>
          </div>

           {/* Riwayat Sesi */}
          <div>
            <h3 className="text-[#2D3570] font-semibold mb-3 text-lg">Riwayat Sesi</h3>
            <div className="relative">
              <div className="bg-white rounded-2xl shadow p-5 max-h-[400px] overflow-y-auto scrollbar scrollbar-thumb-[#CBD5E1] scrollbar-track-transparent">
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
                      <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
                        <div className="bg-white rounded-2xl shadow-xl p-6 w-[90%] max-w-md relative">
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
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* 👇 Icon Scroll Indicator di bawah */}
              <div className="absolute bottom-1 left-0 right-0 flex justify-center pointer-events-none">
                <FaChevronDown className="text-gray-400 animate-bounce" size={18} />
              </div>
            </div>
          </div>
        </div> {/* ✅ penutup grid Rekap + Riwayat */}

        {/* Catatan */}
        <div>
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
        </div>
      </div>

      {/* Popup Logout */}
      {showLogoutPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
          <div className="bg-white p-8 rounded-2xl shadow-xl w-96 text-center">
            <div className="flex justify-center mb-4">
              <FaRedoAlt className="text-[#2D3570] text-3xl" />
            </div>
            <p className="text-[#2D3570] font-medium mb-6">
              Selesai untuk hari ini, yakin mau keluar?
            </p>
            <div className="flex gap-3">
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
          </div>
        </div>
      )}
    </div>
  );
}
