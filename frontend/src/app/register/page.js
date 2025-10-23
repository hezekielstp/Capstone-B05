"use client";

import { motion } from "framer-motion";
import RegisterLeftSection from "./components/RegisterLeftSection";
import RegisterRightSection from "./components/RegisterRightSection";

export default function RegisterPage() {
  return (
    <motion.div
      className="flex flex-col md:flex-row min-h-screen font-inter bg-[#F5F7FB]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <RegisterLeftSection />
      <RegisterRightSection />
    </motion.div>
  );
}
