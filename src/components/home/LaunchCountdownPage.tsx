"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Sparkles, Mail, MessageCircle } from "lucide-react";

// ─── LAUNCH TARGET: September 14, 2026 at 12:00 PM IST ───
const LAUNCH_DATE = new Date("2026-09-14T12:00:00+05:30").getTime();

// ─── Cursor Trail Particle System ───
interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  life: number;
  vx: number;
  vy: number;
}

const PARTICLE_COLORS = ["#F6A10B", "#ED1F29", "#FFD700", "#FF6B35", "#FFA726"];

function CursorParticleTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: -100, y: -100 });
  const animFrameRef = useRef<number>(0);
  const idCounterRef = useRef(0);
  const lastEmitRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (window.matchMedia("(pointer: coarse)").matches || "ontouchstart" in window) {
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
      const now = Date.now();
      if (now - lastEmitRef.current > 16) {
        const count = 2 + Math.floor(Math.random() * 3);
        for (let i = 0; i < count; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = 0.5 + Math.random() * 2;
          particlesRef.current.push({
            id: idCounterRef.current++,
            x: e.clientX + (Math.random() - 0.5) * 8,
            y: e.clientY + (Math.random() - 0.5) * 8,
            size: 2 + Math.random() * 5,
            color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
            life: 1,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 0.5,
          });
        }
        lastEmitRef.current = now;
      }
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current = particlesRef.current.filter((p) => p.life > 0);

      for (const p of particlesRef.current) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.02;
        p.life -= 0.015;
        p.size *= 0.995;

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.life * 0.8);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = p.size * 3;
        ctx.fill();
        ctx.restore();
      }

      if (particlesRef.current.length > 200) {
        particlesRef.current = particlesRef.current.slice(-150);
      }

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[9997]"
      style={{ mixBlendMode: "screen" }}
    />
  );
}

// ─── Floating Ambient Particles ───
function FloatingParticles() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const particles = useMemo(() => {
    if (!isMounted) return [];
    return Array.from({ length: 25 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 2 + Math.random() * 3.5,
      duration: 15 + Math.random() * 20,
      delay: Math.random() * 8,
      opacity: 0.15 + Math.random() * 0.35,
    }));
  }, [isMounted]);

  if (!isMounted) return <div className="absolute inset-0 overflow-hidden pointer-events-none z-[1]" />;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-[1]">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background:
              p.id % 3 === 0
                ? "var(--color-devam-gold)"
                : p.id % 3 === 1
                ? "var(--color-devam-red)"
                : "#FFD700",
          }}
          animate={{
            y: [0, -50, -100, -50, 0],
            x: [0, 15, -10, 20, 0],
            opacity: [p.opacity, p.opacity * 1.4, p.opacity * 0.5, p.opacity],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

// ─── Countdown Digit Card ───
function CountdownCard({ value, label }: { value: number; label: string }) {
  const displayValue = String(value).padStart(2, "0");

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-b from-[var(--color-devam-gold)]/40 to-[var(--color-devam-red)]/30 rounded-xl blur-md opacity-70 group-hover:opacity-100 transition-opacity duration-500" />

        <div className="relative w-[56px] h-[64px] sm:w-[72px] sm:h-[84px] md:w-[88px] md:h-[100px] lg:w-[100px] lg:h-[114px] rounded-xl overflow-hidden border border-white/20 bg-gradient-to-b from-black/60 via-black/40 to-black/70 backdrop-blur-xl">
          <div className="absolute top-1/2 left-0 right-0 h-px bg-white/10 z-10" />

          <div className="absolute top-1/2 -left-[3px] w-[5px] h-2.5 bg-black/90 rounded-r-full -translate-y-1/2 z-20" />
          <div className="absolute top-1/2 -right-[3px] w-[5px] h-2.5 bg-black/90 rounded-l-full -translate-y-1/2 z-20" />

          <AnimatePresence mode="popLayout">
            <motion.div
              key={displayValue}
              initial={{ y: -15, opacity: 0, scale: 0.8 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 15, opacity: 0, scale: 0.8 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <span
                className="font-mono font-black text-2xl sm:text-3xl md:text-4xl lg:text-5xl"
                style={{
                  background: "linear-gradient(180deg, #FFFFFF 0%, #F6A10B 60%, #ED1F29 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  filter: "drop-shadow(0 2px 8px rgba(246,161,11,0.4))",
                }}
              >
                {displayValue}
              </span>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <span className="text-[9px] sm:text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--color-devam-gold)]/90 mt-1">
        {label}
      </span>
    </div>
  );
}

// ─── Main Launch Countdown Page (Single-Frame Layout with Rustic Background) ───
export function LaunchCountdownPage() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const calculate = () => {
      const now = Date.now();
      const diff = LAUNCH_DATE - now;

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      });
    };

    calculate();
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!mounted) {
    return (
      <div className="h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[var(--color-devam-gold)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen h-screen w-full overflow-hidden bg-[#0e0906] text-white flex flex-col justify-between selection:bg-[var(--color-devam-gold)]/30">
      {/* ─── Cursor Particle Trail ─── */}
      <CursorParticleTrail />

      {/* ─── Rustic Flour & Spices Background Layer ─── */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/bg-spices-flour.png"
          alt="Flour, Masala and Whole Spices Background"
          fill
          sizes="100vw"
          className="object-cover object-center filter blur-[1.5px] brightness-[0.38] contrast-[1.15]"
          priority
        />

        {/* Warm Golden Vignette Overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 90% 70% at 50% 50%, rgba(20,10,5,0.4) 0%, rgba(10,5,2,0.82) 70%, rgba(5,2,1,0.95) 100%)",
          }}
        />

        <FloatingParticles />
      </div>

      {/* ─── Top Header Frame ─── */}
      <motion.header
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative z-30 flex items-center justify-between px-4 sm:px-8 md:px-12 pt-3 sm:pt-4 pb-1"
      >
        {/* Left Pill: Pure • Traditional • Premium */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-[var(--color-devam-gold)]/30 text-xs font-semibold text-[var(--color-devam-gold)]">
          <span>🌱</span> Pure • Traditional • Premium
        </div>

        {/* Center: Devam Logo Emblem */}
        <div className="relative w-28 h-12 sm:w-36 sm:h-14 md:w-44 md:h-16 mx-auto sm:mx-0">
          <Image
            src="/logo.svg"
            alt="Devam Logo"
            fill
            sizes="200px"
            className="object-contain filter drop-shadow-[0_4px_16px_rgba(246,161,11,0.4)]"
            priority
          />
        </div>

        {/* Right Info Link */}
        <a
          href="mailto:info@thedevam.com"
          className="hidden sm:flex items-center gap-1.5 text-xs text-white/80 hover:text-[var(--color-devam-gold)] transition-colors font-medium border-b border-white/20 pb-0.5"
        >
          <Mail className="w-3.5 h-3.5" /> info@thedevam.com
        </a>
      </motion.header>

      {/* ─── Central Hero Frame (Single Frame Desktop & Mobile) ─── */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-6 md:px-10 max-w-7xl mx-auto w-full py-1">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-6 items-center justify-items-center">

          {/* ─── Left Side: Ultra-Crisp HD Ganesha & Mouse Artwork ─── */}
          <motion.div
            initial={{ opacity: 0, x: -30, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-4 relative flex justify-center items-center"
          >
            <div className="relative w-[170px] h-[200px] sm:w-[230px] sm:h-[270px] md:w-[270px] md:h-[320px] lg:w-[320px] lg:h-[370px]">
              {/* Warm golden light behind Lord Ganesha */}
              <div
                className="absolute inset-0 rounded-full blur-2xl opacity-50 pointer-events-none"
                style={{
                  background:
                    "radial-gradient(circle at 50% 50%, rgba(246,161,11,0.65) 0%, rgba(237,31,41,0.3) 50%, transparent 80%)",
                }}
              />
              <Image
                src="/ganesha_hd.png"
                alt="Lord Ganesha & Mouse Peeking HD"
                fill
                sizes="(max-width: 768px) 250px, 350px"
                className="object-contain object-center filter drop-shadow-[0_12px_32px_rgba(0,0,0,0.95)]"
                style={{ mixBlendMode: "lighten" }}
                priority
              />
            </div>
          </motion.div>

          {/* ─── Right Side: Title + Countdown + WhatsApp CTA ─── */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-8 flex flex-col items-center lg:items-start text-center lg:text-left space-y-2.5 sm:space-y-3.5 max-w-2xl"
          >
            {/* Tagline */}
            <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-black/50 border border-[var(--color-devam-gold)]/40 backdrop-blur-md">
              <Sparkles className="w-3 h-3 text-[var(--color-devam-gold)]" />
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.25em] text-[var(--color-devam-gold)]">
                SOMETHING FRESH IS COMING
              </span>
              <Sparkles className="w-3 h-3 text-[var(--color-devam-gold)]" />
            </div>

            {/* Headline */}
            <h1 className="font-heading text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight drop-shadow-md">
              Purity In Every{" "}
              <span className="italic font-normal text-[var(--color-devam-gold)] drop-shadow-[0_2px_10px_rgba(246,161,11,0.5)]">
                Grain &amp; Spice
              </span>
            </h1>

            {/* Sub-headline */}
            <p className="text-xs sm:text-sm md:text-base text-white/80 font-body max-w-lg leading-relaxed font-light drop-shadow">
              Bringing you the finest{" "}
              <strong className="text-yellow-300 font-semibold">Atta, Masala &amp; Food Grains</strong> —
              crafted with tradition, purity &amp; love. Launching{" "}
              <span className="text-[var(--color-devam-gold)] font-bold">Sept 14th at 12:00 PM</span>.
            </p>

            {/* Countdown Flip Clock */}
            <div className="py-1">
              <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
                <CountdownCard value={timeLeft.days} label="Days" />
                <span className="text-base sm:text-xl md:text-2xl font-bold text-[var(--color-devam-gold)]/50 self-start mt-4 sm:mt-5">
                  :
                </span>
                <CountdownCard value={timeLeft.hours} label="Hours" />
                <span className="text-base sm:text-xl md:text-2xl font-bold text-[var(--color-devam-gold)]/50 self-start mt-4 sm:mt-5">
                  :
                </span>
                <CountdownCard value={timeLeft.minutes} label="Minutes" />
                <span className="text-base sm:text-xl md:text-2xl font-bold text-[var(--color-devam-gold)]/50 self-start mt-4 sm:mt-5">
                  :
                </span>
                <CountdownCard value={timeLeft.seconds} label="Seconds" />
              </div>
            </div>

            {/* WhatsApp Updates Action Button & Coupon Pill */}
            <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full pt-1">
              <a
                href="https://wa.me/919876543210?text=Hi%20Devam,%20I%20want%20launch%20updates!"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-black font-bold text-xs sm:text-sm tracking-wide transition-all shadow-[0_0_20px_rgba(37,211,102,0.4)] hover:scale-105"
              >
                <MessageCircle className="w-4 h-4 fill-black" /> Get Launch Updates on WhatsApp
              </a>

              <div className="px-3.5 py-2 rounded-full bg-black/60 border border-[var(--color-devam-gold)]/30 text-xs text-white/90 backdrop-blur-md">
                <span>₹50 OFF Code: </span>
                <code className="bg-white/20 px-1.5 py-0.5 rounded font-mono font-bold text-yellow-300">
                  DEVAM50
                </code>
              </div>
            </div>
          </motion.div>

        </div>
      </main>

      {/* ─── Bottom Category Pills ─── */}
      <div className="relative z-20 border-t border-white/10 bg-black/40 backdrop-blur-md py-2 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-3 divide-x divide-white/10 text-center">
          <div className="flex flex-col items-center py-1">
            <span className="text-sm sm:text-base">🌾</span>
            <span className="text-[11px] sm:text-xs font-bold text-white/90">Premium Atta</span>
          </div>
          <div className="flex flex-col items-center py-1">
            <span className="text-sm sm:text-base">🌶️</span>
            <span className="text-[11px] sm:text-xs font-bold text-white/90">Devam Masala</span>
          </div>
          <div className="flex flex-col items-center py-1">
            <span className="text-sm sm:text-base">🫘</span>
            <span className="text-[11px] sm:text-xs font-bold text-white/90">Food Grains</span>
          </div>
        </div>
      </div>

      {/* ─── Footer Bar ─── */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative z-20 bg-black/70 py-2 px-4 text-center border-t border-white/5"
      >
        <p className="text-[10px] sm:text-xs text-white/40 font-body">
          © {new Date().getFullYear()} Devam Atta & Masala Hub. All rights reserved. | FSSAI Approved | Made in India ™
        </p>
      </motion.footer>
    </div>
  );
}
