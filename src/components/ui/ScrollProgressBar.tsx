"use client";

import { motion, useScroll, useSpring } from "framer-motion";

export function ScrollProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 200,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-[var(--color-devam-red)] via-[var(--color-devam-gold)] to-yellow-400 z-[100] origin-left shadow-[0_0_10px_rgba(246,161,11,0.6)]"
      style={{ scaleX }}
    />
  );
}
