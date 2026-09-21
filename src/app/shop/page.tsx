"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, SlidersHorizontal, ChevronDown, ArrowRight, Sparkles, Leaf, Shield, X, Search, Bell, Clock } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useProductStore } from "@/store/productStore";
import { toast } from "sonner";

const categories = [
  { id: "All", label: "All Products" },
  { id: "Flours", label: "Flours" },
  { id: "Spice Powders", label: "Spice Powders" },
  { id: "Whole Spices", label: "Whole Spices" },
];

const sortOptions = [
  { id: "featured", label: "Featured" },
  { id: "price-low", label: "Price: Low to High" },
  { id: "price-high", label: "Price: High to Low" },
  { id: "newest", label: "Newest First" },
  { id: "name-az", label: "Name: A-Z" },
];

// Coming soon category data for marketing
const comingSoonData: Record<string, { title: string; subtitle: string; description: string; features: string[]; image: string }> = {
  "Spice Powders": {
    title: "Premium Spice Powders",
    subtitle: "Launching Soon",
    description: "Hand-ground from sun-dried, single-origin spices. Our Kashmiri Chilli, Turmeric, Coriander & more — crafted to deliver rich colour, bold aroma, and zero added fillers.",
    features: ["Kashmiri Chilli Powder", "Organic Turmeric (Haldi)", "Dhaniya (Coriander) Powder", "And more..."],
    image: "/cat-spice-powder.png",
  },
  "Whole Spices": {
    title: "Whole Spices Collection",
    subtitle: "Launching Soon",
    description: "Bold, double-cleaned whole spices sourced from India's finest farms — Unjha Jeera, Tur Dal, and more. Sizzle-tested for authentic tadka and traditional cooking.",
    features: ["Premium Jeera (Cumin Seeds)", "Tur Dal (Pigeon Pea)", "Whole Red Chilli", "And more..."],
    image: "/cat-whole-spices.png",
  },
};

export default function ShopPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [sortBy, setSortBy] = useState("featured");
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
  const addItem = useCartStore((state) => state.addItem);
  const products = useProductStore((state) => state.products);
  const fetchProducts = useProductStore((state) => state.fetchProducts);
  const sortDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 200);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(e.target as Node)) {
        setShowSortDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Memoized Product Filtering & Sorting (Sub-5ms Execution)
  const sortedProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const filtered = products.filter(
      (product) =>
        (activeCategory === "All" || product.category === activeCategory) &&
        (query === "" || product.name.toLowerCase().includes(query) || product.category.toLowerCase().includes(query))
    );

    const uniqueMap = new Map();
    for (const p of filtered) {
      if (!uniqueMap.has(p.name)) {
        uniqueMap.set(p.name, p);
      }
    }
    const uniqueList = Array.from(uniqueMap.values());

    return uniqueList.sort((a, b) => {
      switch (sortBy) {
        case "price-low": return a.price - b.price;
        case "price-high": return b.price - a.price;
        case "newest": return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
        case "name-az": return a.name.localeCompare(b.name);
        default: return 0;
      }
    });
  }, [products, activeCategory, searchQuery, sortBy]);

  const handleQuickAdd = (product: typeof products[0]) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.image,
      weight: product.weight,
    });
    toast.success(`${product.name} added to cart!`, {
      description: `${product.weight} — ₹${product.price}`,
    });
  };

  // Check if active category is a "coming soon" category with 0 products
  const isComingSoon = sortedProducts.length === 0 && activeCategory !== "All" && !searchQuery && comingSoonData[activeCategory];
  const comingSoon = comingSoonData[activeCategory];

  return (
    <div className="bg-[#FAFAF7] min-h-screen pb-16">

      {/* ======= IMMERSIVE HERO BANNER ======= */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#1a0a00] via-[#2d1408] to-[#0d0503]">
        {/* Decorative grain texture overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }} />

        {/* Animated gradient orbs */}
        <div className="absolute top-[-80px] right-[-40px] w-[400px] h-[400px] rounded-full bg-[var(--color-devam-red)] opacity-10 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-60px] left-[-50px] w-[300px] h-[300px] rounded-full bg-[var(--color-devam-gold)] opacity-10 blur-[100px]" style={{ animationDelay: "1s" }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-32">
          <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
            
            {/* Text Content */}
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 mb-6">
                <Sparkles className="w-3.5 h-3.5 text-[var(--color-devam-gold)]" />
                <span className="text-[11px] font-bold text-white/70 uppercase tracking-[0.2em]">Premium Collection</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold text-white leading-[1.1] mb-5">
                Pure Ingredients,{" "}
                <span className="bg-gradient-to-r from-[var(--color-devam-gold)] via-amber-400 to-orange-400 bg-clip-text text-transparent">
                  Authentic Taste
                </span>
              </h1>

              <p className="text-base sm:text-lg text-white/50 max-w-lg leading-relaxed mb-8 mx-auto lg:mx-0">
                Farm-fresh flours, hand-picked whole spices, and aromatic masala powders — stone-ground with tradition, delivered with trust.
              </p>

              {/* Hero Trust Pills */}
              <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2">
                  <Shield className="w-4 h-4 text-green-400" />
                  <span className="text-xs font-semibold text-white/70">FSSAI Certified</span>
                </div>
                <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2">
                  <Leaf className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-semibold text-white/70">100% Natural</span>
                </div>
                <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-semibold text-white/70">Zero Preservatives</span>
                </div>
              </div>
            </div>

            {/* Hero Image Mosaic */}
            <div className="flex-shrink-0 hidden lg:grid grid-cols-2 gap-3 w-[340px]">
              <div className="relative aspect-square rounded-2xl overflow-hidden shadow-2xl shadow-black/40 border border-white/5">
                <Image src="/cat-premium-flour.png" alt="Premium Flours" fill className="object-cover hover:scale-110 transition-transform duration-700" />
              </div>
              <div className="relative aspect-square rounded-2xl overflow-hidden shadow-2xl shadow-black/40 border border-white/5 translate-y-6">
                <Image src="/cat-whole-spices.png" alt="Whole Spices" fill className="object-cover hover:scale-110 transition-transform duration-700" />
              </div>
              <div className="relative aspect-square rounded-2xl overflow-hidden shadow-2xl shadow-black/40 border border-white/5 -translate-y-6">
                <Image src="/cat-spice-powder.png" alt="Spice Powders" fill className="object-cover hover:scale-110 transition-transform duration-700" />
              </div>
              <div className="relative aspect-square rounded-2xl overflow-hidden shadow-2xl shadow-black/40 border border-white/5">
                <Image src="/cat-whole-grains.png" alt="Whole Grains" fill className="object-cover hover:scale-110 transition-transform duration-700" />
              </div>
            </div>
          </div>
        </div>

        {/* Curved bottom separator */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none">
          <svg viewBox="0 0 1440 60" className="w-full h-auto" preserveAspectRatio="none">
            <path d="M0,60 C480,0 960,0 1440,60 L1440,60 L0,60 Z" fill="#FAFAF7" />
          </svg>
        </div>
      </div>

      {/* ======= STICKY FILTER BAR ======= */}
      <div className={`sticky top-0 z-40 transition-all duration-300 ${isScrolled ? "bg-white/95 backdrop-blur-xl shadow-md border-b border-gray-200/50" : "bg-transparent"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">

            {/* Category Pills — clean text only, no emoji */}
            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-hide">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-300 ${
                    activeCategory === cat.id
                      ? "bg-[var(--color-devam-red)] text-white shadow-lg shadow-red-200/50"
                      : "bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-gray-200 hover:border-gray-300 hover:shadow-sm"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Search + Sort + Count */}
            <div className="flex items-center gap-3">
              {/* Inline Search */}
              <div className="relative hidden sm:block">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-8 py-2.5 text-sm rounded-full border border-gray-200 bg-white focus:border-[var(--color-devam-red)] focus:ring-2 focus:ring-red-100 outline-none w-48 transition-all focus:w-56"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Sort Dropdown */}
              <div ref={sortDropdownRef} className="relative">
                <button
                  onClick={() => setShowSortDropdown(!showSortDropdown)}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium bg-white border border-gray-200 rounded-full hover:border-gray-300 hover:shadow-sm transition-all"
                >
                  <SlidersHorizontal className="w-4 h-4 text-gray-500" />
                  <span className="hidden sm:inline text-gray-700">{sortOptions.find(s => s.id === sortBy)?.label}</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${showSortDropdown ? "rotate-180" : ""}`} />
                </button>
                {showSortDropdown && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
                    {sortOptions.map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => { setSortBy(opt.id); setShowSortDropdown(false); }}
                        className={`w-full text-left px-4 py-3 text-sm transition-colors ${
                          sortBy === opt.id
                            ? "bg-red-50 text-[var(--color-devam-red)] font-semibold"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Count Badge */}
              <div className="bg-white border border-gray-200 rounded-full px-4 py-2.5 text-sm font-semibold text-gray-600 hidden md:block">
                {sortedProducts.length} Products
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ======= PRODUCT GRID / COMING SOON ======= */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">

        {/* ===== COMING SOON — Beautiful Marketing Section ===== */}
        {isComingSoon && comingSoon ? (
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1a0a00] via-[#2d1408] to-[#0d0503] my-4">
            {/* Decorative elements */}
            <div className="absolute top-[-60px] right-[-40px] w-[300px] h-[300px] rounded-full bg-[var(--color-devam-gold)] opacity-[0.07] blur-[100px]" />
            <div className="absolute bottom-[-40px] left-[-30px] w-[250px] h-[250px] rounded-full bg-[var(--color-devam-red)] opacity-[0.08] blur-[80px]" />

            <div className="relative flex flex-col lg:flex-row items-center gap-8 lg:gap-14 p-8 sm:p-12 lg:p-16">
              
              {/* Image Side */}
              <div className="w-full lg:w-2/5 flex-shrink-0">
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-black/50">
                  <Image src={comingSoon.image} alt={comingSoon.title} fill className="object-cover" />
                  {/* Coming Soon ribbon */}
                  <div className="absolute top-5 left-5">
                    <div className="flex items-center gap-2 bg-[var(--color-devam-gold)] px-4 py-2 rounded-full shadow-lg">
                      <Clock className="w-4 h-4 text-[var(--color-devam-brown)]" />
                      <span className="text-xs font-extrabold text-[var(--color-devam-brown)] uppercase tracking-wider">Coming Soon</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content Side */}
              <div className="flex-1 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 bg-[var(--color-devam-gold)]/10 border border-[var(--color-devam-gold)]/20 rounded-full px-4 py-1.5 mb-4">
                  <Sparkles className="w-3.5 h-3.5 text-[var(--color-devam-gold)]" />
                  <span className="text-[11px] font-bold text-[var(--color-devam-gold)] uppercase tracking-[0.15em]">{comingSoon.subtitle}</span>
                </div>

                <h2 className="text-3xl sm:text-4xl font-heading font-bold text-white mb-4 leading-tight">
                  {comingSoon.title}
                </h2>

                <p className="text-white/60 text-sm sm:text-base leading-relaxed mb-8 max-w-lg mx-auto lg:mx-0">
                  {comingSoon.description}
                </p>

                {/* Product preview list */}
                <div className="mb-8">
                  <h4 className="text-[11px] font-bold text-white/40 uppercase tracking-[0.2em] mb-3">What&apos;s Coming</h4>
                  <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
                    {comingSoon.features.map((feat, i) => (
                      <span key={i} className="bg-white/5 border border-white/10 text-white/80 text-xs font-medium px-3 py-1.5 rounded-full">
                        {feat}
                      </span>
                    ))}
                  </div>
                </div>

                {/* CTA Row */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                  <Link
                    href="/contact"
                    className="inline-flex items-center justify-center gap-2 bg-[var(--color-devam-gold)] text-[var(--color-devam-brown)] font-bold px-6 py-3 rounded-full text-sm hover:bg-amber-400 transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
                  >
                    <Bell className="w-4 h-4" />
                    Notify Me When Available
                  </Link>
                  <button
                    onClick={() => setActiveCategory("All")}
                    className="inline-flex items-center justify-center gap-2 bg-white/10 border border-white/20 text-white font-semibold px-6 py-3 rounded-full text-sm hover:bg-white/20 transition-all"
                  >
                    Browse All Products
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : sortedProducts.length === 0 && searchQuery ? (
          /* ===== Search Empty State ===== */
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <Search className="w-7 h-7 text-gray-300" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">No results for &ldquo;{searchQuery}&rdquo;</h3>
            <p className="text-gray-500 text-sm max-w-sm mb-5">Try a different search term or browse all categories.</p>
            <button onClick={() => { setSearchQuery(""); setActiveCategory("All"); }} className="px-5 py-2.5 bg-[var(--color-devam-red)] text-white rounded-full font-semibold text-sm hover:bg-[#d62828] transition-colors">
              View All Products
            </button>
          </div>
        ) : (
          /* ===== Product Grid ===== */
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {sortedProducts.map((product) => (
              <Link
                key={product.id}
                href={`/product/${product.id}`}
                className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-gray-200 transition-all duration-500 hover:shadow-xl hover:shadow-gray-200/50 hover:-translate-y-1 flex flex-col"
              >
                {/* Product Image */}
                <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-[#FFFDF9] via-[#FAF4E8] to-[#F2E6D2] border-b border-amber-200/50">
                  {/* Subtle Warm Spotlight */}
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(245,197,24,0.22)_0%,transparent_65%)] pointer-events-none" />

                  {/* Badge */}
                  {product.badge && product.badge !== "None" && product.badge.trim() !== "" && (
                    <div className="absolute top-2 left-2 z-[5] max-w-[50%]">
                      <span className={`text-white text-[8px] sm:text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider rounded-full shadow-md truncate block ${
                        product.badge === "Coming Soon"
                          ? "bg-gradient-to-r from-amber-600 to-amber-500"
                          : "bg-gradient-to-r from-[var(--color-devam-red)] to-[#d62828]"
                      }`}>
                        {product.badge}
                      </span>
                    </div>
                  )}

                  {/* Discount Badge */}
                  {product.originalPrice > product.price && (
                    <div className="absolute top-2 right-2 z-[5]">
                      <span className="bg-emerald-600 text-white text-[8px] sm:text-[10px] font-extrabold px-1.5 sm:px-2 py-0.5 rounded-full shadow-sm">
                        {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                      </span>
                    </div>
                  )}

                  {/* Out of Stock Overlay */}
                  {product.inStock === false && (
                    <div className="absolute inset-0 z-20 bg-white/70 backdrop-blur-[2px] flex items-center justify-center">
                      <span className="bg-gray-900 text-white text-xs font-bold px-4 py-2 rounded-full uppercase tracking-wider">
                        Out of Stock
                      </span>
                    </div>
                  )}

                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    unoptimized={product.image?.startsWith("data:")}
                    className="object-contain p-4 group-hover:scale-105 transition-transform duration-500 drop-shadow-[0_10px_20px_rgba(74,46,27,0.18)]"
                  />
                </div>

                {/* Content */}
                <div className="p-3 sm:p-4 flex flex-col flex-1">
                  {/* Category tag */}
                  <div className="text-[9px] sm:text-[10px] font-bold text-[var(--color-devam-red)] uppercase tracking-[0.15em] mb-1.5">{product.category}</div>

                  {/* Name */}
                  <h3 className="font-heading text-sm sm:text-base font-bold text-gray-900 mb-1 leading-snug group-hover:text-[var(--color-devam-red)] transition-colors line-clamp-2">
                    {product.name}
                  </h3>

                  {/* Weight */}
                  <p className="text-[10px] sm:text-xs text-gray-400 font-medium mb-3">{product.weight}</p>

                  {/* Price Row + Quick Add — pushed to bottom */}
                  <div className="flex items-center justify-between gap-2 mt-auto">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-lg sm:text-xl font-bold text-gray-900">₹{product.price}</span>
                      {product.originalPrice > product.price && (
                        <span className="text-xs text-gray-400 line-through">₹{product.originalPrice}</span>
                      )}
                    </div>

                    {product.inStock !== false ? (
                      <button
                        onClick={(e) => { e.preventDefault(); handleQuickAdd(product); }}
                        className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-[var(--color-devam-red)] text-white hover:bg-[#d62828] transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-red-200/50 active:scale-95"
                        title="Quick Add to Cart"
                      >
                        <ShoppingCart className="w-4 h-4" />
                      </button>
                    ) : (
                      <span className="text-[9px] sm:text-[10px] font-extrabold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 uppercase tracking-wider">
                        Coming Soon
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* ======= COMPACT BOTTOM CTA STRIP ======= */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 mb-4">
        <div className="relative overflow-hidden bg-gradient-to-r from-[var(--color-devam-red)] via-[#d62828] to-[#b91c1c] rounded-2xl px-6 py-6 sm:px-10 sm:py-7 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="absolute top-[-30px] right-[-30px] w-[150px] h-[150px] rounded-full bg-white opacity-5 blur-[40px]" />
          <div className="text-center sm:text-left">
            <h3 className="text-lg sm:text-xl font-heading font-bold text-white">Need Bulk Orders?</h3>
            <p className="text-white/60 text-xs sm:text-sm mt-0.5">Special wholesale pricing for distributors, hotels & retail stores.</p>
          </div>
          <Link
            href="/distributors"
            className="inline-flex items-center gap-2 bg-white text-[var(--color-devam-red)] font-bold px-5 py-2.5 rounded-full text-sm hover:bg-white/90 transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 flex-shrink-0"
          >
            Become a Distributor
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
