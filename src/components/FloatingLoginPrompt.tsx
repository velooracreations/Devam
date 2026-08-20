"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, Gift, Flame } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export function FloatingLoginPrompt() {
  const { user, loading } = useAuth();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (loading || user) return;

    const isDismissed = sessionStorage.getItem("devam_login_prompt_dismissed");
    if (isDismissed) return;

    // Trigger floating welcome card after 3 seconds
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, [user, loading]);

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem("devam_login_prompt_dismissed", "true");
  };

  if (!isVisible || user) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 70, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.95 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="fixed bottom-6 left-6 z-50 max-w-sm w-[calc(100vw-3rem)] sm:w-84 bg-[var(--color-devam-cream)] rounded-2xl p-5 shadow-[0_20px_50px_rgba(62,39,35,0.25)] border-2 border-[var(--color-devam-gold)]/40 relative overflow-hidden"
      >
        {/* Background Subtle Red Accent Glow */}
        <div className="absolute -top-12 -right-12 w-28 h-28 bg-[var(--color-devam-red)]/10 rounded-full blur-xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={handleDismiss}
          className="absolute top-3.5 right-3.5 text-gray-400 hover:text-[var(--color-devam-brown)] p-1.5 rounded-full hover:bg-black/5 transition-colors z-10"
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Top Header Badge */}
        <div className="flex items-center space-x-2 mb-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[var(--color-devam-red)] text-white text-[10px] font-black uppercase tracking-wider rounded-full shadow-sm">
            <Flame className="w-3 h-3 text-yellow-300 animate-bounce" />
            First Order Special
          </span>
          <span className="text-[11px] font-bold text-[var(--color-devam-brown)]/70 italic">
            Pure &amp; Fresh
          </span>
        </div>

        {/* Card Body */}
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-white p-1.5 flex items-center justify-center flex-shrink-0 shadow-md border border-[var(--color-devam-gold)]/30 relative">
            <Image
              src="/logo.svg"
              alt="Devam Logo"
              width={40}
              height={40}
              className="object-contain"
            />
          </div>

          <div className="flex-1 pr-3">
            <h4 className="font-heading font-extrabold text-[var(--color-devam-brown)] text-base leading-tight">
              Enjoy ₹50 OFF Your First Order! 🌾
            </h4>
            <p className="text-xs text-[var(--color-devam-brown)]/80 font-body mt-1 leading-relaxed font-medium">
              Sign in to unlock exclusive savings on 100% Stone-Ground Atta &amp; Fresh Masalas.
            </p>
          </div>
        </div>

        {/* Coupon Code Pill */}
        <div className="mt-3.5 py-2 px-3 bg-white/90 rounded-xl border border-dashed border-[var(--color-devam-gold)] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Gift className="w-4 h-4 text-[var(--color-devam-red)]" />
            <span className="text-[11px] font-bold text-gray-700">Use Code:</span>
            <span className="font-mono font-black text-xs text-[var(--color-devam-red)] tracking-wider bg-red-50 px-1.5 py-0.5 rounded">
              DEVAM50
            </span>
          </div>
          <span className="text-[10px] font-extrabold text-green-700 uppercase">Save ₹50</span>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 flex items-center gap-2">
          <Link
            href="/login"
            onClick={() => setIsVisible(false)}
            className="flex-1 inline-flex items-center justify-center px-4 py-2.5 bg-gradient-to-r from-[var(--color-devam-red)] to-red-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:shadow-[0_4px_15px_rgba(237,31,41,0.4)] transition-all transform active:scale-95 group"
          >
            Claim Offer &amp; Sign In
            <ArrowRight className="w-3.5 h-3.5 ml-1.5 group-hover:translate-x-1 transition-transform" />
          </Link>
          
          <button
            onClick={handleDismiss}
            className="px-2.5 py-2.5 text-xs font-bold text-[var(--color-devam-brown)]/60 hover:text-[var(--color-devam-brown)] transition-colors"
          >
            Later
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
