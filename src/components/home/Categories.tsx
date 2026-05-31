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
    color: "bg-[var(--color-devam-red)]/10",
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
    <section className="py-24 bg-[var(--color-devam-cream)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-16">
          <div className="max-w-2xl">
            <h2 className="text-4xl md:text-5xl font-heading font-bold text-[var(--color-devam-brown)] mb-4">
              Explore Our Essentials
            </h2>
            <p className="text-lg text-[var(--color-devam-brown)] font-body font-medium">
              Discover our range of premium products crafted for purity and taste.
            </p>
          </div>
          <Link 
            href="/shop" 
            className="hidden md:inline-flex items-center text-[var(--color-devam-red)] font-semibold uppercase tracking-wider hover:text-[var(--color-devam-brown)] transition-colors"
          >
            View All Categories <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {categories.map((category) => (
            <Link key={category.name} href={category.href} className="group block">
              <div className={`relative h-96 rounded-2xl overflow-hidden ${category.color} flex items-center justify-center p-8 transition-transform duration-500 group-hover:-translate-y-2 group-hover:shadow-xl`}>
                <div className="absolute inset-0 z-0">
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    className="object-cover opacity-40 mix-blend-multiply group-hover:scale-105 transition-transform duration-700"
                  />
                </div>
                <div className="relative z-10 w-full h-full flex flex-col justify-end">
                  <h3 className="text-3xl font-heading font-bold text-[var(--color-devam-brown)] mb-2 group-hover:text-[var(--color-devam-red)] transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-[var(--color-devam-brown)] font-body text-lg mb-6 max-w-sm font-medium">
                    {category.description}
                  </p>
                  <div className="inline-flex items-center text-[var(--color-devam-brown)] font-semibold uppercase tracking-wider group-hover:text-[var(--color-devam-red)] transition-colors">
                    Explore <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-2 transition-transform" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
        
        <div className="mt-12 text-center md:hidden">
          <Link 
            href="/shop" 
            className="inline-flex items-center text-[var(--color-devam-red)] font-semibold uppercase tracking-wider"
          >
            View All Categories <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
