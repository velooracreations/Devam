"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

const storyFrames = [
  {
    id: 1,
    tag: "FLOUR",
    title: "Chakki Fresh Atta",
    subtitle: "Stone Ground Perfection",
    description:
      "From the finest Bhalia wheat of Gujarat, our chakki atta is slow-ground the traditional way — retaining its natural sweetness, aroma, and nutrients. The foundation of every perfect rotli.",
    image: "/hero-flour.png",
    cta: { label: "Order Now", href: "/shop?category=flours" },
  },
  {
    id: 2,
    tag: "QUALITY",
    title: "Soft Rotlis, Every Time",
    subtitle: "Just Like Maa Makes",
    description:
      "Devam atta kneads into the softest dough that rolls out beautifully and puffs up perfectly — every single time. Because your family deserves flour that delivers on tradition.",
    image: "/hero-dough.png",
    cta: { label: "Order Now", href: "/product/sharbati-atta-5kg" },
  },
  {
    id: 3,
    tag: "PROMISE",
    title: "Warmth In Every Meal",
    subtitle: "In Every Home, Devam",
    description:
      "When the rotli puffs up on the tawa and the masala brings out the perfect colour and aroma — that's when you know. That warmth, that taste — it's the Devam promise to your family.",
    image: "/hero-rotli-steam.png",
    cta: { label: "Order Now", href: "/shop" },
  },
  {
    id: 4,
    tag: "SPICES",
    title: "Authentic Masala Powders",
    subtitle: "The Heart of Every Dish",
    description:
      "Vibrant haldi, fiery mirchi, aromatic jeera, fresh dhana — every spice powder is crafted from handpicked whole spices, ground fresh to bring alive the true flavour of Indian cooking.",
    image: "/hero-masala.png",
    cta: { label: "Order Now", href: "/shop?category=spice-powders" },
  },
  {
    id: 5,
    tag: "WHOLE SPICES",
    title: "Pure Whole Spices",
    subtitle: "For the Perfect Tadka",
    description:
      "The sizzle of jeera and rai in hot ghee. That unmistakable aroma filling the whole house. Our whole spices are sorted and cleaned to give you the purest, most potent tadka every time.",
    image: "/hero-whole-spice.png",
    cta: { label: "Order Now", href: "/shop?category=whole-spices" },
  },
];

export function HeroSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Auto slide effect
  useEffect(() => {
    if (isHovered) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % storyFrames.length);
    }, 6000); // 6 seconds per slide
    return () => clearInterval(timer);
  }, [isHovered]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % storyFrames.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + storyFrames.length) % storyFrames.length);
  };

  return (
    <div 
      className="w-full bg-black relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* ─── Slideshow Section ─── */}
      <section className="relative h-screen min-h-[600px] w-full flex items-start pt-16 md:pt-20 overflow-hidden">
          {/* ─── Pre-loaded Hero Background Images for Instant Flash-Free Transitions ─── */}
        <div className="absolute inset-0 z-0">
          {storyFrames.map((frame, idx) => (
            <motion.div
              key={frame.id}
              initial={false}
              animate={{
                opacity: currentIndex === idx ? 1 : 0,
                scale: currentIndex === idx ? 1 : 1.05,
              }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              className="absolute inset-0"
            >
              <Image
                src={frame.image}
                alt={frame.subtitle}
                fill
                className="object-cover"
                priority={idx === 0}
                sizes="100vw"
                quality={80}
              />
            </motion.div>
          ))}
        </div>

        {/* Gradient overlay - Balanced for vivid images and text contrast */}
        <div className="absolute inset-0 z-[1] bg-gradient-to-t from-black/75 via-black/35 to-black/20 pointer-events-none" />

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col items-center justify-center pointer-events-none">
          <AnimatePresence mode="wait">
            {currentIndex === 0 ? (
              /* ─── Slide 1: Flagship Chakki Atta Split Showcase ─── */
              <motion.div
                key="slide-1"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center text-center lg:text-left pointer-events-auto"
              >
                {/* Left Column: Narrative, Typography & Direct Actions */}
                <div className="lg:col-span-7 flex flex-col items-center lg:items-start w-full">
                  {/* Tag pill */}
                  <span className="inline-block px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.3em] text-[var(--color-devam-cream)] bg-[var(--color-devam-red)] rounded-sm mb-4 sm:mb-6 shadow-lg">
                    {storyFrames[0].tag} • SIGNATURE FLAGSHIP
                  </span>

                  {/* Elegant Title */}
                  <h2
                    className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold mb-3 leading-tight tracking-normal"
                    style={{
                      color: "#ffffff",
                      textShadow: "0 4px 14px rgba(0,0,0,0.5), 0 2px 4px rgba(0,0,0,0.3)",
                    }}
                  >
                    {storyFrames[0].title}
                  </h2>

                  {/* Red accent line */}
                  <div className="h-1 w-20 bg-[var(--color-devam-red)] mb-4" />

                  {/* Subtitle */}
                  <h3 className="font-heading text-lg sm:text-xl md:text-2xl font-bold text-[#ffdb58] italic mb-4 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                    &ldquo;{storyFrames[0].subtitle} — स्वाद शुद्धता का...&rdquo;
                  </h3>

                  {/* Description */}
                  <p className="font-body text-sm sm:text-base lg:text-lg text-white/90 leading-relaxed mb-6 font-light max-w-xl drop-shadow-md">
                    {storyFrames[0].description}
                  </p>

                  {/* Value Proposition Pills */}
                  <div className="flex flex-wrap gap-2.5 sm:gap-3 mb-6 sm:mb-8 justify-center lg:justify-start text-xs font-semibold text-amber-100">
                    <span className="bg-black/40 backdrop-blur-md border border-amber-400/30 px-3 py-1 rounded-full shadow-sm">
                      🌾 100% Sharbati Wheat
                    </span>
                    <span className="bg-black/40 backdrop-blur-md border border-amber-400/30 px-3 py-1 rounded-full shadow-sm">
                      ❄️ Cold Chakki Ground
                    </span>
                    <span className="bg-black/40 backdrop-blur-md border border-amber-400/30 px-3 py-1 rounded-full shadow-sm">
                      ✨ Zero Added Maida
                    </span>
                  </div>

                  {/* Action Buttons Row */}
                  <div className="flex flex-col sm:flex-row items-center gap-3.5 sm:gap-4 w-full sm:w-auto">
                    <Link
                      href="/product/chakki-fresh-atta-5kg"
                      className="w-full sm:w-auto group inline-flex items-center justify-center px-8 py-3.5 bg-[var(--color-devam-gold)] text-[var(--color-devam-brown)] font-bold uppercase tracking-wider text-sm rounded-sm transition-all hover:bg-white shadow-xl hover:shadow-2xl hover:scale-105"
                    >
                      Order 5 Kg Pack
                      <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <Link
                      href="/shop?category=flours"
                      className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 bg-black/40 hover:bg-black/60 text-white font-semibold uppercase tracking-wider text-sm rounded-sm border border-white/30 backdrop-blur-sm transition-all"
                    >
                      Explore All Flours
                    </Link>
                  </div>
                </div>

                {/* Right Column: Premium Floating Pouch Pedestal (Desktop) */}
                <div className="lg:col-span-5 flex flex-col items-center justify-center relative mt-4 lg:mt-0">
                  {/* Ambient Golden Radial Glow */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/30 via-amber-300/20 to-transparent blur-3xl rounded-full scale-95 pointer-events-none" />

                  {/* Showcase Pod */}
                  <div className="relative w-52 h-72 sm:w-64 sm:h-88 lg:w-72 lg:h-[400px] flex items-center justify-center p-4">
                    {/* Realistic Ground Shadow */}
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-48 sm:w-56 h-6 bg-black/70 blur-lg rounded-full pointer-events-none" />

                    {/* Transparent Cutout Pouch */}
                    <div className="relative w-full h-full drop-shadow-[0_25px_40px_rgba(0,0,0,0.85)] hover:scale-105 transition-transform duration-700">
                      <Image
                        src="/devam-atta-5kg-pouch.png"
                        alt="Devam Chakki Fresh Atta 5kg Pouch"
                        fill
                        priority
                        className="object-contain"
                      />
                    </div>

                    {/* Floating Quality Badge */}
                    <div className="absolute top-2 -right-2 sm:right-0 bg-black/75 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-amber-400/40 shadow-xl flex items-center gap-2">
                      <span className="text-amber-400 text-xs font-bold">★</span>
                      <span className="text-[11px] font-bold text-white uppercase tracking-wider">Premium Grade</span>
                    </div>

                    {/* Pack Variant Tag */}
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 text-gray-950 font-black text-xs px-4 py-1 rounded-full shadow-2xl border border-white/50 tracking-wide">
                      Family 5 Kg Pack • 1 Kg Soon
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              /* ─── Slides 2 - 5: Centered Editorial Storytelling ─── */
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="max-w-3xl text-center flex flex-col items-center w-full pointer-events-auto"
              >
                {/* Tag pill */}
                <span className="inline-block px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.3em] text-[var(--color-devam-cream)] bg-[var(--color-devam-red)] rounded-sm mb-6 md:mb-7 shadow-lg">
                  {storyFrames[currentIndex].tag}
                </span>

                {/* Elegant Title */}
                <h2
                  className="font-heading text-4xl md:text-6xl lg:text-7xl font-semibold mb-3 leading-tight tracking-normal"
                  style={{
                    color: "#ffffff",
                    textShadow: "0 4px 12px rgba(0,0,0,0.4), 0 2px 4px rgba(0,0,0,0.2)",
                  }}
                >
                  {storyFrames[currentIndex].title}
                </h2>

                {/* Red accent line */}
                <div className="h-1 w-20 bg-[var(--color-devam-red)] mb-4 md:mb-5" />

                {/* Subtitle */}
                <h3 className="font-heading text-lg md:text-xl font-bold text-[#ffdb58] italic mb-4 md:mb-5 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                  &ldquo;{storyFrames[currentIndex].subtitle}&rdquo;
                </h3>

                {/* Description */}
                <p className="font-body text-sm md:text-base lg:text-lg text-white/90 leading-relaxed mb-6 font-light drop-shadow-md">
                  {storyFrames[currentIndex].description}
                </p>

                {/* CTA */}
                {storyFrames[currentIndex].cta && (
                  <Link
                    href={storyFrames[currentIndex].cta.href}
                    className="group inline-flex items-center px-8 py-3.5 bg-[var(--color-devam-gold)] text-[var(--color-devam-brown)] font-bold uppercase tracking-wider text-sm rounded-sm transition-all hover:bg-white shadow-lg hover:shadow-xl hover:scale-105"
                  >
                    {storyFrames[currentIndex].cta.label}
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation Controls */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center space-x-6">
          <button 
            onClick={prevSlide}
            className="p-2 rounded-full bg-black/40 text-white hover:bg-[var(--color-devam-gold)] hover:text-[var(--color-devam-brown)] transition-colors border border-white/20 backdrop-blur-sm shadow-lg"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <div className="flex space-x-3">
            {storyFrames.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  currentIndex === idx 
                    ? "bg-[var(--color-devam-gold)] scale-125 shadow-[0_0_10px_rgba(230,184,0,0.8)]" 
                    : "bg-white/40 hover:bg-white/70"
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

          <button 
            onClick={nextSlide}
            className="p-2 rounded-full bg-black/40 text-white hover:bg-[var(--color-devam-gold)] hover:text-[var(--color-devam-brown)] transition-colors border border-white/20 backdrop-blur-sm shadow-lg"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </section>

      {/* ─── Final Brand Reveal ─── */}
      <section className="relative min-h-[50vh] w-full flex flex-col items-center justify-center text-[var(--color-devam-brown)] text-center px-4 py-16 overflow-hidden bg-[var(--color-devam-cream)]">
        <div className="absolute inset-0 z-0">
          <Image
            src="/hero-wheat.png"
            alt="Golden wheat field on a sunny day"
            fill
            className="object-cover opacity-100"
            sizes="100vw"
            quality={75}
          />
        </div>
        <div className="absolute inset-0 z-[1] bg-gradient-to-b from-black/70 via-black/30 to-[var(--color-devam-cream)] pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 30 }}
            whileInView={{ scale: 1, opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center"
          >
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-heading font-bold text-[var(--color-devam-gold)] mb-6 drop-shadow-lg tracking-wide text-center uppercase max-w-4xl px-4 mt-8 md:mt-0">
              Devam
            </h1>
            <p className="text-2xl md:text-4xl text-[var(--color-devam-cream)] font-body max-w-3xl text-center leading-relaxed drop-shadow-md px-6 font-semibold">
              Freshly Ground Spices &amp; Flours As Per Your Preference
            </p>

            <div className="relative w-56 h-28 md:w-72 md:h-36 my-6 drop-shadow-2xl pointer-events-none">
              <Image 
                src="/logo.svg" 
                alt="Devam Logo" 
                fill 
                className="object-contain"
                priority
              />
            </div>

            <p className="font-body text-sm md:text-base mb-8 text-[var(--color-devam-brown)] font-medium max-w-xl mx-auto leading-relaxed relative z-20 px-4">
              Premium Chakki Atta &amp; Authentic Indian Spices - Rooted in
              Gujarat, Crafted for Every Indian Kitchen.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 w-full px-8 sm:px-0 sm:w-auto">
              <Link
                href="/shop?category=flours"
                className="w-full sm:w-auto inline-flex items-center justify-center px-10 py-4 bg-[var(--color-devam-gold)] text-[var(--color-devam-brown)] font-bold uppercase tracking-wider rounded-sm hover:bg-white transition-all shadow-[0_0_30px_rgba(230,184,0,0.3)] hover:scale-105"
              >
                Shop Flour
              </Link>
              <Link
                href="/shop?category=spice-powders"
                className="w-full sm:w-auto inline-flex items-center justify-center px-10 py-4 border-2 border-[var(--color-devam-brown)] text-[var(--color-devam-brown)] font-bold uppercase tracking-wider rounded-sm hover:bg-[var(--color-devam-brown)] hover:text-[var(--color-devam-cream)] transition-all"
              >
                Shop Spices
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
