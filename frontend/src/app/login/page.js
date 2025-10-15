"use client"; // tambahkan ini kalau kamu pakai Next.js App Router

import { useRouter } from "next/navigation";
import { FaUser, FaKey } from "react-icons/fa";

export default function LoginPage() {
  const router = useRouter();

  const handleLogin = (e) => {
    e.preventDefault(); // biar tidak reload halaman
    router.push("/dashboard"); // langsung arahkan ke dashboard
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

        <h1
          className="text-2xl md:text-4xl mb-2"
          style={{ fontFamily: "Abril Fatface" }}
        >
          AFFECTRA
        </h1>

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
          Halo, Yuk masuk dulu!
        </h1>
        <p className="text-[#2D3570] mb-8 text-sm md:text-base">
          Masuk ke akunmu untuk mulai melacak emosi.
        </p>

        {/* Form Login */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="flex items-center border-2 border-[#2D3570] rounded-lg px-3 py-2">
            <FaUser className="text-[#2D3570] mr-2" />
            <input
              type="text"
              placeholder="Nama Lengkap"
              className="flex-1 outline-none text-gray-700 text-sm md:text-base bg-transparent"
            />
          </div>

          <div className="flex items-center border-2 border-[#2D3570] rounded-lg px-3 py-2">
            <FaKey className="text-[#2D3570] mr-2" />
            <input
              type="password"
              placeholder="Kata Sandi"
              className="flex-1 outline-none text-gray-700 text-sm md:text-base bg-transparent"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#2D3570] text-white py-3 rounded-lg font-semibold shadow-md hover:bg-[#1F2755] text-sm md:text-base"
          >
            Masuk
          </button>
        </form>

        <p className="mt-6 text-gray-700 text-xs md:text-sm text-center">
          Sudah punya akun?{" "}
          <a href="/register" className="text-[#2D3570] font-semibold">
            Daftar
          </a>
        </p>
      </div>
    </div>
  );
}
