"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X, LogIn, Sparkles, ShoppingBag } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export function FloatingLoginPrompt() {
  const { user, loading } = useAuth();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Don't show if user is already logged in or auth state is loading
    if (loading || user) return;

    // Check if dismissed in this session
    const isDismissed = sessionStorage.getItem("devam_login_prompt_dismissed");
    if (isDismissed) return;

    // Show floating prompt after 3.5 seconds
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 3500);

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
        initial={{ opacity: 0, y: 60, scale: 0.92 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 40, scale: 0.95 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="fixed bottom-6 left-6 z-50 max-w-sm w-[calc(100vw-3rem)] sm:w-80 bg-white rounded-2xl p-5 shadow-[0_15px_40px_rgba(0,0,0,0.18)] border border-gray-100/80 backdrop-blur-md"
      >
        {/* Close Button */}
        <button
          onClick={handleDismiss}
          className="absolute top-3.5 right-3.5 text-gray-400 hover:text-gray-700 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--color-devam-red)] to-red-600 text-white flex items-center justify-center flex-shrink-0 shadow-md">
            <Sparkles className="w-5 h-5" />
          </div>

          <div className="flex-1 pr-4">
            <span className="inline-flex items-center text-[10px] font-extrabold uppercase tracking-widest text-[var(--color-devam-red)] bg-red-50 px-2 py-0.5 rounded-full mb-1">
              Member Benefit
            </span>
            <h4 className="font-heading font-bold text-gray-900 text-base leading-snug">
              Welcome to Devam!
            </h4>
            <p className="text-xs text-gray-600 font-body mt-1 leading-relaxed">
              Sign in to track orders, save your delivery address &amp; get member discounts.
            </p>
          </div>
        </div>

        {/* Perks pill list */}
        <div className="mt-3 py-2 px-3 bg-[var(--color-devam-cream)]/50 rounded-lg flex items-center justify-between text-[11px] font-semibold text-[var(--color-devam-brown)]">
          <span className="flex items-center gap-1">
            <ShoppingBag className="w-3.5 h-3.5 text-[var(--color-devam-gold)]" /> Easy Re-order
          </span>
          <span className="text-gray-300">•</span>
          <span>⚡ Fast Checkout</span>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 flex items-center gap-2">
          <Link
            href="/login"
            onClick={() => setIsVisible(false)}
            className="flex-1 inline-flex items-center justify-center px-4 py-2.5 bg-[var(--color-devam-red)] text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-red-800 transition-all shadow-md hover:shadow-lg active:scale-95"
          >
            <LogIn className="w-3.5 h-3.5 mr-1.5" />
            Log In / Sign Up
          </Link>
          
          <button
            onClick={handleDismiss}
            className="px-3 py-2.5 text-xs font-semibold text-gray-500 hover:text-gray-800 transition-colors"
          >
            Maybe Later
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
