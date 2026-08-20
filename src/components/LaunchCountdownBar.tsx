"use client";

import { useState, useEffect } from "react";
import { Sparkles, Clock, ArrowRight, X } from "lucide-react";
import Link from "next/link";

interface CountdownProps {
  targetDate?: string; // ISO date string e.g. "2026-08-31T00:00:00"
}

export function LaunchCountdownBar({ targetDate = "2026-08-31T00:00:00" }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isDismissed, setIsDismissed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const destination = new Date(targetDate).getTime();

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const difference = destination - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  if (!mounted || isDismissed) return null;

  return (
    <div className="bg-gradient-to-r from-[var(--color-devam-brown)] via-[#4a2e1d] to-[var(--color-devam-brown)] text-white py-2.5 px-4 sticky top-0 z-[60] shadow-md border-b border-[var(--color-devam-gold)]/40 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
        
        {/* Left Tag */}
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-devam-gold)] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--color-devam-gold)]"></span>
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-devam-gold)] flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> Devam Store Launch Offer
          </span>
          <span className="hidden md:inline text-xs text-white/80 font-medium">
            • Get <strong className="text-yellow-300">₹50 OFF</strong> on First Order (Code: <code className="bg-white/20 px-1.5 py-0.5 rounded font-mono font-bold text-white">DEVAM50</code>)
          </span>
        </div>

        {/* Center Countdown Digit Boxes */}
        <div className="flex items-center gap-1.5 sm:gap-2 my-1 sm:my-0">
          <div className="flex items-center gap-1 bg-black/40 border border-[var(--color-devam-gold)]/30 px-2 py-1 rounded-md">
            <span className="font-mono font-bold text-sm text-[var(--color-devam-gold)]">{String(timeLeft.days).padStart(2, '0')}</span>
            <span className="text-[10px] uppercase font-bold text-white/70">d</span>
          </div>
          <span className="text-xs font-bold text-[var(--color-devam-gold)]">:</span>

          <div className="flex items-center gap-1 bg-black/40 border border-[var(--color-devam-gold)]/30 px-2 py-1 rounded-md">
            <span className="font-mono font-bold text-sm text-[var(--color-devam-gold)]">{String(timeLeft.hours).padStart(2, '0')}</span>
            <span className="text-[10px] uppercase font-bold text-white/70">h</span>
          </div>
          <span className="text-xs font-bold text-[var(--color-devam-gold)]">:</span>

          <div className="flex items-center gap-1 bg-black/40 border border-[var(--color-devam-gold)]/30 px-2 py-1 rounded-md">
            <span className="font-mono font-bold text-sm text-[var(--color-devam-gold)]">{String(timeLeft.minutes).padStart(2, '0')}</span>
            <span className="text-[10px] uppercase font-bold text-white/70">m</span>
          </div>
          <span className="text-xs font-bold text-[var(--color-devam-gold)]">:</span>

          <div className="flex items-center gap-1 bg-black/40 border border-[var(--color-devam-gold)]/30 px-2 py-1 rounded-md">
            <span className="font-mono font-bold text-sm text-[var(--color-devam-gold)]">{String(timeLeft.seconds).padStart(2, '0')}</span>
            <span className="text-[10px] uppercase font-bold text-white/70">s</span>
          </div>
        </div>

        {/* Right CTA */}
        <div className="flex items-center gap-3">
          <Link
            href="/shop"
            className="inline-flex items-center text-xs font-bold uppercase tracking-wider text-[var(--color-devam-brown)] bg-[var(--color-devam-gold)] hover:bg-white px-3 py-1.5 rounded transition-colors shadow-sm"
          >
            Claim Offer <ArrowRight className="w-3 h-3 ml-1" />
          </Link>
          <button
            onClick={() => setIsDismissed(true)}
            className="text-white/60 hover:text-white p-1 transition-colors"
            title="Dismiss launch banner"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
