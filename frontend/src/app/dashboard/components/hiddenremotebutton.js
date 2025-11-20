"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function HiddenRemoteButton() {
  const [clickCount, setClickCount] = useState(0);
  const [lastClickTime, setLastClickTime] = useState(0);
  const router = useRouter();

  const handleClick = () => {
    const now = Date.now();
    
    // Reset if more than 2 seconds since last click
    if (now - lastClickTime > 2000) {
      setClickCount(1);
    } else {
      const newCount = clickCount + 1;
      setClickCount(newCount);
      
      // Activate remote control after 5 rapid clicks
      if (newCount >= 5) {
        console.log("🎮 Remote control activated");
        localStorage.setItem("remoteControlMode", "true");
        router.push("/remote-control");
      }
    }
    
    setLastClickTime(now);
  };

  return (
    <div
      onClick={handleClick}
      style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        width: "40px",
        height: "40px",
        opacity: 0.01,
        cursor: "pointer",
        zIndex: 9999,
      }}
      title="Hidden control"
    />
  );
}
