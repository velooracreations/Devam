import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const categories = [
  {
    name: "Whole Spices",
    description: "Handpicked premium whole spices for authentic aroma.",
    image: "/cat-whole-spices.png",
    href: "/shop?category=whole-spices",
    color: "bg-[var(--color-devam-cream)]",
  },
  {
    name: "Spice Powders",
    description: "Finely ground masalas for the perfect color and taste.",
    image: "/cat-spice-powder.png",
    href: "/shop?category=spice-powders",
    color: "bg-amber-50",
  },
  {
    name: "Whole Grains",
    description: "Nutrient-rich grains sorted for maximum purity.",
    image: "/cat-whole-grains.png",
    href: "/shop?category=whole-grains",
    color: "bg-[var(--color-devam-gold)]/20",
  },
  {
    name: "Premium Flours",
    description: "Traditionally stone-ground for retaining freshness.",
    image: "/cat-premium-flour.png",
    href: "/shop?category=flours",
    color: "bg-white",
  },
];

export function Categories() {
  return (
    <section className="py-10 sm:py-12 md:py-14 bg-[var(--color-devam-cream)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 sm:mb-8 gap-3">
          <div className="max-w-2xl">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold text-[var(--color-devam-brown)] mb-1 sm:mb-2">
              Explore Our Essentials
            </h2>
            <p className="text-sm sm:text-base text-[var(--color-devam-brown)]/80 font-body font-medium">
              Discover our range of premium products crafted for purity and taste.
            </p>
          </div>
          <Link 
            href="/shop" 
            className="hidden sm:inline-flex items-center text-[var(--color-devam-brown)] font-semibold text-xs sm:text-sm uppercase tracking-wider hover:text-[var(--color-devam-green)] transition-colors shrink-0"
          >
            View All Categories <ArrowRight className="ml-1.5 w-4 h-4" />
          </Link>
        </div>

        {/* 4 Cards Compact Grid - Single Screen View on Desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
          {categories.map((category) => (
            <Link key={category.name} href={category.href} className="group block focus:outline-none focus:ring-2 focus:ring-[var(--color-devam-green)] focus:ring-offset-2 rounded-2xl">
              <div className={`relative h-[250px] sm:h-[270px] lg:h-[280px] rounded-2xl overflow-hidden ${category.color} flex flex-col justify-end p-3 sm:p-4 border border-stone-200/60 shadow-sm transition-all duration-300 group-hover:-translate-y-1.5 group-hover:shadow-xl`}>
                <div className="absolute inset-0 z-0">
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    className="object-cover opacity-65 mix-blend-multiply group-hover:scale-108 transition-transform duration-700 ease-out"
                  />
                </div>

                {/* High-Contrast Frosted Panel for Perfect Text Readability */}
                <div className="relative z-10 w-full bg-white/92 backdrop-blur-md rounded-xl p-3 sm:p-3.5 shadow-sm border border-stone-200/50 transition-all duration-300 group-hover:bg-white group-hover:shadow-md group-hover:border-emerald-600/30">
                  <h3 className="text-base sm:text-lg font-heading font-bold text-[var(--color-devam-brown)] group-hover:text-[var(--color-devam-green)] transition-colors truncate">
                    {category.name}
                  </h3>
                  <p className="text-xs text-stone-600 font-body line-clamp-2 mt-0.5 mb-2 font-medium leading-relaxed">
                    {category.description}
                  </p>
                  <div className="inline-flex items-center text-xs font-bold uppercase tracking-wider text-[var(--color-devam-brown)] group-hover:text-[var(--color-devam-green)] transition-colors">
                    <span>Explore</span>
                    <ArrowRight className="ml-1 w-3.5 h-3.5 group-hover:translate-x-1.5 transition-transform" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
        
        <div className="mt-6 text-center sm:hidden">
          <Link 
            href="/shop" 
            className="inline-flex items-center text-[var(--color-devam-brown)] hover:text-[var(--color-devam-green)] font-semibold text-xs uppercase tracking-wider transition-colors"
          >
            View All Categories <ArrowRight className="ml-1.5 w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
