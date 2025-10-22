"use client";
import { motion, AnimatePresence } from "framer-motion";
import { FaHome, FaSignOutAlt, FaTimes } from "react-icons/fa";

export default function Sidebar({ router, sidebarOpen, setSidebarOpen, setShowLogoutPopup }) {
  const sidebarVariants = {
    hidden: { x: -280, opacity: 0 },
    visible: { x: 0, opacity: 1 },
    exit: { x: -280, opacity: 0 },
  };

  return (
    <>
      <AnimatePresence>
        {(sidebarOpen || typeof window === "undefined" || (typeof window !== "undefined" && window.innerWidth >= 1024)) && (
          <motion.aside
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
              onClick={() => setShowLogoutPopup(true)}
              className="flex items-center text-left py-2 px-3 rounded-lg hover:bg-[#1F2755] transition"
            >
              <FaSignOutAlt className="mr-3" /> Keluar
            </button>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Overlay untuk mobile */}
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
    </>
  );
}
