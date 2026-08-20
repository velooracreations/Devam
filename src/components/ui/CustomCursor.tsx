"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export function CustomCursor() {
  const [mousePosition, setMousePosition] = useState({ x: -100, y: -100 });
  const [isHovered, setIsHovered] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if touch device
    if (window.matchMedia("(pointer: coarse)").matches || 'ontouchstart' in window) {
      setIsTouchDevice(true);
      return;
    }

    const onMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);

      // Check if hovering over interactive element
      const target = e.target as HTMLElement | null;
      if (target) {
        const isInteractive = target.closest(
          "a, button, input, select, textarea, [role='button'], .group, .interactive-card, .hover-trigger"
        );
        setIsHovered(!!isInteractive);
      }
    };

    const onMouseLeave = () => setIsVisible(false);
    const onMouseEnter = () => setIsVisible(true);

    window.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseleave", onMouseLeave);
    document.addEventListener("mouseenter", onMouseEnter);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseleave", onMouseLeave);
      document.removeEventListener("mouseenter", onMouseEnter);
    };
  }, [isVisible]);

  if (isTouchDevice || !isVisible) return null;

  return (
    <>
      {/* Small Central Dot */}
      <motion.div
        className="fixed top-0 left-0 w-2.5 h-2.5 bg-[var(--color-devam-red)] rounded-full pointer-events-none z-[9999] mix-blend-difference"
        animate={{
          x: mousePosition.x - 5,
          y: mousePosition.y - 5,
          scale: isHovered ? 0 : 1,
        }}
        transition={{ type: "spring", stiffness: 1000, damping: 50, mass: 0.1 }}
      />

      {/* Smooth Outer Follower Ring */}
      <motion.div
        className={`fixed top-0 left-0 rounded-full pointer-events-none z-[9998] border transition-colors duration-200 ${
          isHovered
            ? "border-[var(--color-devam-gold)] bg-[var(--color-devam-gold)]/15 shadow-[0_0_20px_rgba(246,161,11,0.4)]"
            : "border-[var(--color-devam-red)]/60 bg-transparent"
        }`}
        animate={{
          x: mousePosition.x - (isHovered ? 24 : 16),
          y: mousePosition.y - (isHovered ? 24 : 16),
          width: isHovered ? 48 : 32,
          height: isHovered ? 48 : 32,
        }}
        transition={{ type: "spring", stiffness: 350, damping: 25, mass: 0.5 }}
      />
    </>
  );
}
