"use client";

import { useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { FaHome, FaSignOutAlt, FaTrashAlt, FaEdit } from "react-icons/fa";

export default function DashboardPage() {
  const [notes, setNotes] = useState([
    "Malam ini saya bersantai dan melihat bunga-bunga di taman sepertinya membuat saya menjadi sedikit lebih tenang dan happy.",
  ]);
  const [newNote, setNewNote] = useState("");

  const handleAddNote = () => {
    if (newNote.trim()) {
      setNotes([...notes, newNote]);
      setNewNote("");
    }
  };

  const handleDeleteNote = (index) => {
    const updated = notes.filter((_, i) => i !== index);
    setNotes(updated);
  };

  const data = [
    { name: "Positif", value: 45, color: "#FFD84D" },
    { name: "Netral", value: 25, color: "#8CA7FF" },
    { name: "Negatif", value: 30, color: "#FF5A5A" },
  ];

  return (
    <div className="flex min-h-screen font-inter bg-[#F5F7FB]">
      {/* Sidebar */}
      <div className="w-60 bg-[#2D3570] text-white flex flex-col justify-between py-8 px-6">
        <div>
          <div className="flex items-center mb-8">
            <img
              src="/logo.png"
              alt="Affectra Logo"
              className="w-10 h-10 mr-3"
            />
            <h1
              className="text-xl font-bold"
              style={{ fontFamily: "Abril Fatface" }}
            >
              AFFECTRA
            </h1>
          </div>

          <button className="flex items-center w-full text-left py-2 px-3 rounded-lg bg-[#404A88] mb-4 hover:bg-[#1F2755] transition">
            <FaHome className="mr-3" /> Halaman Utama
          </button>
        </div>

        <button className="flex items-center text-left py-2 px-3 rounded-lg hover:bg-[#1F2755] transition">
          <FaSignOutAlt className="mr-3" /> Keluar
        </button>
      </div>

      {/* Konten utama */}
      <div className="flex-1 px-8 py-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-[#2D3570]">
            Shafa Aura
          </h2>
          <img
            src="/profile.jpg"
            alt="Profile"
            className="w-12 h-12 rounded-full object-cover"
          />
        </div>

        {/* Baris atas: Emosi terakhir dan hasil foto */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Emosi Terakhir */}
          <div className="bg-white rounded-2xl shadow p-5 flex flex-col items-center justify-center">
            <div className="flex flex-col items-center text-center">
              {/* Tempat untuk ikon emosi */}
              <div className="w-20 h-20 rounded-full flex items-center justify-center mb-3 border-2 border-[#FFD84D] bg-[#FFF9E5]">
                {/* kamu tambahkan image/icon emosi di sini */}
              </div>
              <p className="text-lg font-semibold text-[#2D3570]">
                Emosi <span className="text-[#FFD84D]">Positif</span>
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Waktu 21:00:30 • 03-06-2025
              </p>
              <p className="mt-3 text-[#2D3570] font-medium">Halo, Shafa!</p>
            </div>
          </div>

          {/* Hasil Rekaman Foto */}
          <div className="bg-white rounded-2xl shadow p-5">
            <h3 className="text-[#2D3570] font-semibold mb-2">
              Hasil Rekaman Foto
            </h3>
            <img
              src="/flowers.jpg"
              alt="Hasil Rekaman"
              className="w-full h-40 object-cover rounded-xl"
            />
          </div>
        </div>

        {/* Rekap Emosi Hari Ini & Riwayat */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Rekap Emosi Hari Ini */}
          <div className="bg-white rounded-2xl shadow p-5">
            <h3 className="text-[#2D3570] font-semibold mb-3">
              Rekap Emosi Hari Ini
            </h3>
            <div className="h-52">
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    dataKey="value"
                  >
                    {data.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        stroke="none"
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-2 text-sm">
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 bg-[#FF5A5A] rounded-full"></span>
                Negatif
              </div>
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 bg-[#FFD84D] rounded-full"></span>
                Positif
              </div>
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 bg-[#8CA7FF] rounded-full"></span>
                Netral
              </div>
            </div>
          </div>

          {/* Riwayat Sesi */}
          <div className="bg-white rounded-2xl shadow p-5 overflow-y-auto">
            <h3 className="text-[#2D3570] font-semibold mb-3">Riwayat Sesi</h3>

            {/* Card sesi */}
            {["Netral", "Negatif", "Positif"].map((mood, i) => (
              <div
                key={i}
                className="flex items-center justify-between bg-[#F5F7FB] rounded-xl p-3 mb-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border">
                    {/* tempat untuk icon emosi */}
                  </div>
                  <div>
                    <p className="font-semibold text-[#2D3570]">{mood}</p>
                    <p className="text-xs text-gray-500">
                      21:00:10 • 03-06-2025
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button className="text-gray-500 hover:text-[#2D3570]">
                    <FaEdit size={14} />
                  </button>
                  <a
                    href="#"
                    className="text-[#2D3570] text-sm font-medium hover:underline"
                  >
                    Lihat Foto
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Catatan */}
        <div className="bg-white rounded-2xl shadow p-5">
          <h3 className="text-[#2D3570] font-semibold mb-3">Catatan Anda</h3>

          {notes.map((note, i) => (
            <div
              key={i}
              className="flex items-center justify-between bg-[#F5F7FB] rounded-lg p-3 mb-3"
            >
              <p className="text-sm text-gray-700 flex-1">{note}</p>
              <button
                onClick={() => handleDeleteNote(i)}
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
            className="w-full border-2 border-[#E0E5F5] rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-[#2D3570] resize-none h-24 mb-3"
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
  );
}
