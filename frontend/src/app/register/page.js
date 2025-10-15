"use client"; // tambahkan jika kamu pakai Next.js App Router

import { useRouter } from "next/navigation";
import { FaUser, FaPhone, FaEnvelope, FaKey } from "react-icons/fa";

export default function RegisterPage() {
  const router = useRouter();

  const handleRegister = (e) => {
    e.preventDefault(); // biar tidak reload halaman
    router.push("/dashboard"); // langsung ke dashboard setelah klik "Daftar"
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen font-inter">
      {/* Bagian Kiri */}
      <div className="w-full md:w-1/2 bg-[#2D3570] flex flex-col items-center justify-center text-center p-8 text-white">
        <div className="mb-6">
          <img
            src="/logo.png"
            alt="Affectra Logo"
            className="mx-auto w-40 md:w-60"
          />
        </div>

        {/* Logo: font Abril Fatface */}
        <h1
          className="text-2xl md:text-4xl font-bold mb-2"
          style={{ fontFamily: "Abril Fatface" }}
        >
          AFFECTRA
        </h1>

        {/* Tagline: font Aref Ruqaa */}
        <p
          className="text-sm md:text-lg italic"
          style={{ fontFamily: "Aref Ruqaa" }}
        >
          “EEG Based Emotion Tracking”
        </p>
      </div>

      {/* Bagian Kanan */}
      <div className="w-full md:w-1/2 bg-white flex flex-col justify-center px-6 md:px-16 py-10">
        <h1 className="text-2xl md:text-3xl font-bold text-[#2D3570] mb-2">
          Halo, Daftarkan Akun Barumu!
        </h1>
        <p className="text-[#2D3570] mb-8 text-sm md:text-base">
          <span className="font-semibold">
            Mulai perjalananmu untuk memahami emosi dari sinyal otakmu
          </span>
        </p>

        {/* Form */}
        <form onSubmit={handleRegister} className="space-y-4">
          {/* Nama */}
          <div className="flex items-center border-2 border-[#2D3570] rounded-lg px-3 py-2">
            <FaUser className="text-[#2D3570] mr-2" />
            <input
              type="text"
              placeholder="Nama Lengkap"
              className="flex-1 outline-none text-gray-700 text-sm md:text-base bg-transparent"
            />
          </div>

          {/* Telepon */}
          <div className="flex items-center border-2 border-[#2D3570] rounded-lg px-3 py-2">
            <FaPhone className="text-[#2D3570] mr-2" />
            <input
              type="text"
              placeholder="No.Telepon"
              className="flex-1 outline-none text-gray-700 text-sm md:text-base bg-transparent"
            />
          </div>

          {/* Email */}
          <div className="flex items-center border-2 border-[#2D3570] rounded-lg px-3 py-2">
            <FaEnvelope className="text-[#2D3570] mr-2" />
            <input
              type="email"
              placeholder="Email"
              className="flex-1 outline-none text-gray-700 text-sm md:text-base bg-transparent"
            />
          </div>

          {/* Password */}
          <div className="flex items-center border-2 border-[#2D3570] rounded-lg px-3 py-2">
            <FaKey className="text-[#2D3570] mr-2" />
            <input
              type="password"
              placeholder="Kata Sandi"
              className="flex-1 outline-none text-gray-700 text-sm md:text-base bg-transparent"
            />
          </div>

          {/* Tombol Daftar */}
          <button
            type="submit"
            className="w-full bg-[#2D3570] text-white py-3 rounded-lg font-semibold shadow-md hover:bg-[#1F2755] text-sm md:text-base"
          >
            Daftar
          </button>
        </form>

        {/* Link ke Login */}
        <p className="mt-6 text-gray-700 text-xs md:text-sm text-center">
          Sudah punya akun?{" "}
          <a href="/login" className="text-[#2D3570] font-semibold">
            Masuk
          </a>
        </p>
      </div>
    </div>
  );
}
