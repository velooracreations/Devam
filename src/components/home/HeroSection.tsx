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
    image: "/hero-flour-new.png",
    cta: { label: "Shop Flour Range", href: "/shop?category=flours" },
  },
  {
    id: 2,
    tag: "QUALITY",
    title: "Soft Rotlis, Every Time",
    subtitle: "Just Like Maa Makes",
    description:
      "Devam atta kneads into the softest dough that rolls out beautifully and puffs up perfectly — every single time. Because your family deserves flour that delivers on tradition.",
    image: "/hero-dough.png",
    cta: { label: "Shop Sharbati Atta", href: "/product/sharbati-atta-5kg" },
  },
  {
    id: 3,
    tag: "PROMISE",
    title: "Warmth In Every Meal",
    subtitle: "In Every Home, Devam",
    description:
      "When the rotli puffs up on the tawa and the masala brings out the perfect colour and aroma — that's when you know. That warmth, that taste — it's the Devam promise to your family.",
    image: "/hero-rotli-steam.png",
    cta: { label: "Discover Our Collection", href: "/shop" },
  },
  {
    id: 4,
    tag: "SPICES",
    title: "Authentic Masala Powders",
    subtitle: "The Heart of Every Dish",
    description:
      "Vibrant haldi, fiery mirchi, aromatic jeera, fresh dhana — every spice powder is crafted from handpicked whole spices, ground fresh to bring alive the true flavour of Indian cooking.",
    image: "/hero-masala.png",
    cta: { label: "Shop Spice Powders", href: "/shop?category=spice-powders" },
  },
  {
    id: 5,
    tag: "WHOLE SPICES",
    title: "Pure Whole Spices",
    subtitle: "For the Perfect Tadka",
    description:
      "The sizzle of jeera and rai in hot ghee. That unmistakable aroma filling the whole house. Our whole spices are sorted and cleaned to give you the purest, most potent tadka every time.",
    image: "/hero-whole-spice.png",
    cta: { label: "Shop Whole Spices", href: "/shop?category=whole-spices" },
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
      <section className="relative h-screen min-h-[650px] w-full flex items-start pt-24 md:pt-32 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="absolute inset-0 z-0"
          >
            <Image
              src={storyFrames[currentIndex].image}
              alt={storyFrames[currentIndex].subtitle}
              fill
              className="object-cover"
              priority={currentIndex === 0}
              loading={currentIndex === 0 ? "eager" : "lazy"}
              sizes="(max-width: 768px) 100vw, 100vw"
              quality={75}
            />
          </motion.div>
        </AnimatePresence>

        {/* Gradient overlay - Darkened for better contrast */}
        <div className="absolute inset-0 z-[1] bg-gradient-to-t from-black/90 via-black/60 to-black/70" />

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col items-center justify-center pointer-events-none">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 30, filter: "blur(5px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -30, filter: "blur(5px)" }}
              transition={{ duration: 0.6, ease: "easeOut" }}
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
              <h3 
                className="font-heading text-lg md:text-xl font-bold text-[#ffdb58] italic mb-4 md:mb-5 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
              >
                &ldquo;{storyFrames[currentIndex].subtitle}&rdquo;
              </h3>

              {/* Description */}
              <p className="font-body text-sm md:text-base lg:text-lg text-white/90 leading-relaxed mb-8 font-light drop-shadow-md">
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
            src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2000&auto=format&fit=crop"
            alt="Golden wheat field on a sunny day"
            fill
            className="object-cover opacity-80"
          />
        </div>
        <div className="absolute inset-0 z-[1] bg-gradient-to-b from-black/80 via-white/50 to-[var(--color-devam-cream)]" />

        <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 30 }}
            whileInView={{ scale: 1, opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center"
          >
            <p className="text-xs md:text-sm font-bold uppercase tracking-[0.4em] text-[var(--color-devam-gold)] drop-shadow-md mb-2 md:mb-4 relative z-20 mt-8 md:mt-0">
              Flour &bull; Spices &bull; Purity
            </p>

            <div className="relative w-48 h-48 md:w-80 md:h-80 my-2 md:-mt-16 md:-mb-20 drop-shadow-2xl pointer-events-none">
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
