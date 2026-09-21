"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, CheckCircle, ShieldCheck, Sparkles, ArrowRight, Wheat, Flame } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { toast } from "sonner";
import { useState } from "react";

export function FlagshipSpotlight() {
  const addItem = useCartStore((state) => state.addItem);
  const [added, setAdded] = useState(false);

  const handleAdd5Kg = () => {
    addItem({
      id: "chakki-fresh-atta-5kg",
      name: "Devam Chakki Fresh Atta",
      price: 225,
      quantity: 1,
      image: "/devam-atta-5kg-pouch.png",
      weight: "5 Kg"
    });
    setAdded(true);
    toast.success("Devam Chakki Fresh Atta (5kg) added to cart!", {
      description: "Variant: 5 Kg Family Pack | ₹225",
      action: {
        label: "View Cart",
        onClick: () => document.dispatchEvent(new CustomEvent("open-cart"))
      }
    });
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <section className="py-20 lg:py-28 bg-gradient-to-b from-[#FAF7F2] via-white to-[#FDFBF7] relative overflow-hidden border-y border-amber-900/5">
      {/* Ambient background glow accents */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--color-devam-gold)]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-[var(--color-devam-red)]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* ─── Left Column: Artisanal Studio Product Showcase ─── */}
          <div className="lg:col-span-6 flex justify-center relative">
            {/* Ambient golden studio halo behind the container */}
            <div className="absolute inset-0 bg-gradient-to-tr from-amber-400/25 via-amber-200/15 to-transparent rounded-3xl blur-2xl transform scale-95 pointer-events-none" />

            {/* Warm Heritage Pedestal Showcase Container */}
            <div className="relative w-full max-w-md aspect-[3/4] sm:aspect-[4/5] rounded-3xl p-6 sm:p-8 flex items-center justify-center bg-gradient-to-b from-[#FFFDF9] via-[#FAF4E8] to-[#F2E5D0] border border-amber-200/80 shadow-[0_25px_60px_rgba(139,69,19,0.14)] overflow-hidden">
              {/* Radial Warm Sunlight Glow */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(245,197,24,0.32)_0%,rgba(217,131,36,0.12)_48%,transparent_75%)] pointer-events-none" />

              {/* Wooden Base Gradient Accent */}
              <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-[#4A260D]/20 via-[#4A260D]/5 to-transparent pointer-events-none" />

              {/* Realistic Ground Contact Shadow */}
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-52 sm:w-60 h-6 bg-[#3B1E0A]/40 blur-md rounded-full pointer-events-none" />

              {/* Product Pouch Image */}
              <div className="relative w-full h-full drop-shadow-[0_20px_35px_rgba(74,46,27,0.35)] transition-transform duration-700 hover:scale-[1.03] z-10">
                <Image
                  src="/devam-atta-5kg-pouch.png"
                  alt="Devam Chakki Fresh Atta 5kg Packaging Pouch - 100% Stone Ground Whole Wheat Flour"
                  fill
                  priority
                  sizes="(max-width: 768px) 90vw, 45vw"
                  className="object-contain"
                />
              </div>

              {/* Floating Quality Badge 1 - Top Right */}
              <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-xl border border-amber-200/80 flex items-center gap-2 z-20 animate-bounce duration-1000">
                <div className="w-7 h-7 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                  ★
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Premium Grade</p>
                  <p className="text-xs font-bold text-gray-900">100% Sharbati Wheat</p>
                </div>
              </div>

              {/* Floating Quality Badge 2 - Bottom Left */}
              <div className="absolute bottom-5 left-4 bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-xl border border-amber-200/80 flex items-center gap-2.5 z-20">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Wheat className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Cold Stone Milled</p>
                  <p className="text-xs font-bold text-emerald-800">Zero Added Maida</p>
                </div>
              </div>

              {/* Net Wt. 5 Kg Label Pill */}
              <div className="absolute bottom-6 right-4 bg-[var(--color-devam-red)] text-white text-xs font-extrabold px-3.5 py-1.5 rounded-full shadow-lg z-20 border border-white/30">
                Net Wt. 5 Kg Pack
              </div>
            </div>
          </div>

          {/* ─── Right Column: Storytelling & Conversion ─── */}
          <div className="lg:col-span-6 flex flex-col justify-center">
            
            {/* Tagline Badge */}
            <div className="inline-flex items-center gap-2 bg-amber-100/70 border border-amber-200/80 px-4 py-1.5 rounded-full self-start mb-4 shadow-sm">
              <Sparkles className="w-4 h-4 text-amber-700" />
              <span className="text-xs font-extrabold text-amber-900 tracking-wider uppercase">
                Signature Flagship Collection
              </span>
            </div>

            {/* Main Headline with Hindi Brand Motto */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-[var(--color-devam-brown)] leading-[1.15] mb-3">
              The Soul of Every Meal — <br />
              <span className="text-[var(--color-devam-red)]">Devam Chakki Fresh Atta</span>
            </h2>

            <p className="text-base sm:text-lg font-heading italic text-amber-800/90 font-semibold mb-4">
              &ldquo;Wholesome Atta, Wholesome Life — स्वाद शुद्धता का...&rdquo;
            </p>

            <p className="text-gray-600 font-body text-sm sm:text-base leading-relaxed mb-6">
              Milled from the finest single-origin Bhalia & Sharbati wheat grains of Gujarat. 
              Our traditional slow stone-grinding process prevents heating, preserving the natural 
              wheat germ, dietary fiber, and authentic sweet aroma. The result? Soft, golden rotlis 
              that puff up on the tawa every single time.
            </p>

            {/* Quality Checklist Pillars */}
            <div className="grid grid-cols-2 gap-3.5 sm:gap-4 mb-8">
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white border border-amber-100/60 shadow-sm">
                <CheckCircle className="w-5 h-5 text-[var(--color-devam-gold)] flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-gray-900">100% Whole Wheat</h4>
                  <p className="text-[11px] text-gray-500">Unbleached, full bran fiber</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white border border-amber-100/60 shadow-sm">
                <ShieldCheck className="w-5 h-5 text-[var(--color-devam-gold)] flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-gray-900">Zero Additives</h4>
                  <p className="text-[11px] text-gray-500">No preservatives or fillers</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white border border-amber-100/60 shadow-sm">
                <Flame className="w-5 h-5 text-[var(--color-devam-gold)] flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-gray-900">Cold Chakki Ground</h4>
                  <p className="text-[11px] text-gray-500">Nutrients preserved intact</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white border border-amber-100/60 shadow-sm">
                <Wheat className="w-5 h-5 text-[var(--color-devam-gold)] flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-gray-900">Soft & Puffed Rotlis</h4>
                  <p className="text-[11px] text-gray-500">Stays soft for hours</p>
                </div>
              </div>
            </div>

            {/* Price, Packaging Options & Direct Purchase */}
            <div className="p-5 rounded-2xl bg-white border border-gray-100 shadow-md">
              <div className="flex flex-wrap items-baseline justify-between gap-3 mb-4">
                <div>
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Signature Product</span>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-xl sm:text-2xl font-extrabold text-[var(--color-devam-red)]">View Rates in Shop</span>
                    <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                      Stone Ground Fresh
                    </span>
                  </div>
                </div>

                {/* Packaging Switcher with 1 Kg Coming Soon Tag */}
                <div className="flex items-center gap-2">
                  <div className="px-3 py-1 rounded-lg border-2 border-[var(--color-devam-red)] bg-red-50 text-[var(--color-devam-red)] text-xs font-bold flex items-center gap-1 shadow-sm">
                    <span>5 Kg Pack</span>
                    <span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span>
                  </div>
                  <div className="px-3 py-1 rounded-lg border border-gray-200 bg-gray-50 text-gray-600 text-xs font-medium flex items-center gap-1.5 opacity-80" title="1 Kg consumer pack launching soon">
                    <span>1 Kg Pack</span>
                    <span className="text-[9px] bg-amber-500 text-white font-extrabold px-1.5 py-0.2 rounded uppercase">
                      Coming Soon
                    </span>
                  </div>
                </div>
              </div>

              {/* Call to Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Link
                  href="/shop?category=flours"
                  className="flex-1 inline-flex items-center justify-center gap-2.5 px-6 py-3.5 bg-[var(--color-devam-red)] hover:bg-[#a62b21] text-white font-bold rounded-xl shadow-lg hover:shadow-red-200/50 transition-all duration-300 active:scale-95 text-sm sm:text-base"
                >
                  <ShoppingCart className="w-5 h-5" /> View Rates & Order in Shop
                </Link>

                <Link
                  href="/product/chakki-fresh-atta-5kg"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-gray-50 hover:bg-gray-100 text-gray-800 font-semibold rounded-xl border border-gray-200 transition-colors text-sm sm:text-base"
                >
                  <span>Product Details</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
