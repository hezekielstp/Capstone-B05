"use client";

import { motion } from "framer-motion";
import { FaBrain, FaSmile, FaChartPie } from "react-icons/fa";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="font-sans bg-gradient-to-b from-[#4A54A3] via-[#5C6CD9] to-[#8A93FF] text-white min-h-screen flex flex-col">
      {/* 🔹 Navbar */}
      <nav className="flex justify-between items-center px-8 py-4 bg-[#404A99]/50 backdrop-blur-md shadow-lg fixed w-full top-0 z-50 border-b border-white/10">
        <div className="flex items-center gap-3">
          <img src="/affectra.png" alt="Affectra Logo" className="w-10 h-10" />
          <h1 className="text-2xl font-bold tracking-wide bg-gradient-to-r from-[#A0B4FF] to-[#FFD84D] text-transparent bg-clip-text">
            AFFECTRA
          </h1>
        </div>
        <div className="hidden md:flex gap-8 text-[#E3E8FF]">
          <a href="#features" className="hover:text-[#FFD84D] font-medium transition">
            Fitur
          </a>
          <a href="#about" className="hover:text-[#FFD84D] font-medium transition">
            Tentang
          </a>
          <a href="#team" className="hover:text-[#FFD84D] font-medium transition">
            Tim
          </a>
        </div>
        <button
          onClick={() => router.push("/login")}
          className="bg-gradient-to-r from-[#FFD84D] to-[#FFB347] text-[#343C6A] px-5 py-2 rounded-xl font-semibold hover:scale-105 hover:shadow-lg transition"
        >
          Masuk
        </button>
      </nav>

      {/* 🔹 Hero Section */}
      <section className="flex flex-col md:flex-row items-center justify-between px-8 md:px-20 py-32 md:py-40 mt-16">
        <motion.div
          className="md:w-1/2 mb-12 md:mb-0"
          initial={{ opacity: 0, x: -80 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
        >
          <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6 text-white">
            Lacak Emosi Anda <br /> dengan{" "}
            <span className="bg-gradient-to-r from-[#FFD84D] to-[#FF82A9] text-transparent bg-clip-text">
              AFFECTRA
            </span>
          </h1>
          <p className="text-lg text-[#E0E4FF] mb-8 leading-relaxed max-w-xl">
            Platform berbasis AI yang mendeteksi emosi Anda melalui sinyal otak (EEG)
            dan menampilkannya secara real-time dengan visualisasi yang elegan dan intuitif.
          </p>
          <button
            onClick={() => router.push("/login")}
            className="bg-gradient-to-r from-[#FFD84D] to-[#FFB347] text-[#2D3570] px-6 py-3 rounded-xl font-semibold text-lg shadow-lg hover:scale-105 hover:shadow-2xl transition"
          >
            Mulai Sekarang
          </button>
        </motion.div>

        <motion.div
          className="md:w-1/2 flex justify-center"
          initial={{ opacity: 0, x: 80 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
        >
          <motion.img
            src="affectralengkap.png"
            alt="Hero"
            className="w-[85%] md:w-[450px] object-contain drop-shadow-[0_0_40px_rgba(255,216,77,0.4)]"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.5 }}
          />
        </motion.div>
      </section>

      {/* 🔹 Features Section */}
      <section
        id="features"
        className="py-20 px-8 md:px-20 bg-gradient-to-b from-[#F5F7FB] via-[#E9EBFF] to-[#F6F8FF] text-[#2D3570]"
      >
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 bg-gradient-to-r from-[#343C6A] to-[#5A6BF7] text-transparent bg-clip-text">
          Fitur Unggulan
        </h2>
        <div className="grid md:grid-cols-3 gap-10">
          <motion.div
            className="bg-white rounded-2xl shadow-xl p-8 text-center hover:shadow-2xl transition border border-[#E0E3FA]"
            whileHover={{ scale: 1.05 }}
          >
            <FaBrain size={50} className="mx-auto mb-4 text-[#5A6BF7]" />
            <h3 className="text-xl font-semibold mb-2 text-[#2D3570]">
              Deteksi Emosi Otomatis
            </h3>
            <p className="text-[#5B5E8F] text-sm leading-relaxed">
              Mendeteksi emosi dari data EEG dengan akurasi tinggi dan menampilkannya secara real-time.
            </p>
          </motion.div>

          <motion.div
            className="bg-white rounded-2xl shadow-xl p-8 text-center hover:shadow-2xl transition border border-[#E0E3FA]"
            whileHover={{ scale: 1.05 }}
          >
            <FaSmile size={50} className="mx-auto mb-4 text-[#FFD84D]" />
            <h3 className="text-xl font-semibold mb-2 text-[#2D3570]">
              Visualisasi Interaktif
            </h3>
            <p className="text-[#5B5E8F] text-sm leading-relaxed">
              Antarmuka visual intuitif membantu Anda memahami emosi secara menyenangkan.
            </p>
          </motion.div>

          <motion.div
            className="bg-white rounded-2xl shadow-xl p-8 text-center hover:shadow-2xl transition border border-[#E0E3FA]"
            whileHover={{ scale: 1.05 }}
          >
            <FaChartPie size={50} className="mx-auto mb-4 text-[#FF5A91]" />
            <h3 className="text-xl font-semibold mb-2 text-[#2D3570]">
              Rekap Emosi
            </h3>
            <p className="text-[#5B5E8F] text-sm leading-relaxed">
              Lihat perbandingan dan tren emosimu selama 1, 3, dan 7 hari terakhir dengan tampilan menarik.
            </p>
          </motion.div>
        </div>
      </section>

      {/* 🔹 About Section */}
      <section
        id="about"
        className="py-20 px-8 md:px-20 bg-[#F5F7FB] text-center text-[#2D3570]"
      >
        <motion.h2
          className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-[#5A6BF7] to-[#FF5A91] text-transparent bg-clip-text"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          Tentang AFFECTRA
        </motion.h2>
        <p className="text-[#4B4F78] max-w-3xl mx-auto leading-relaxed text-base">
          AFFECTRA adalah sistem berbasis EEG yang dirancang untuk mengenali dan
          menampilkan emosi manusia secara ilmiah. Dengan kombinasi AI dan desain antarmuka
          yang humanis, AFFECTRA membantu Anda memahami keseharian emosional dengan cara yang menyenangkan dan bermakna.
        </p>
      </section>

      {/* 🔹 Footer */}
      <footer className="bg-gradient-to-r from-[#343C6A] to-[#5A6BF7] text-white py-6 text-center">
        <p className="text-sm opacity-90">
          © {new Date().getFullYear()} <span className="font-semibold">AFFECTRA</span> Team — Capstone Project B05
        </p>
      </footer>
    </div>
  );
}
