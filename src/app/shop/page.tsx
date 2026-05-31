"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Star, ShoppingCart, Search, SlidersHorizontal } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useProductStore } from "@/store/productStore";

const categories = ["All", "Flours", "Spice Powders", "Whole Spices", "Grains"];

export default function ShopPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const addItem = useCartStore((state) => state.addItem);
  const products = useProductStore((state) => state.products);

  const filteredProducts = products.filter(
    (product) => 
      activeCategory === "All" || 
      product.category === activeCategory ||
      (activeCategory === "Spices" && product.category.includes("Spice"))
  );

  // Group by product name so we only show one card per unique product
  const uniqueProducts = Array.from(
    new Map(filteredProducts.map(product => [product.name, product])).values()
  );

  return (
    <div className="bg-white min-h-screen pb-32">
      {/* Premium Minimal Header */}
      <div className="bg-white pt-24 pb-12 text-center relative border-b border-gray-100">
        <h1 className="text-4xl md:text-5xl font-heading font-bold text-gray-900 mb-4 tracking-tight">The Collection</h1>
        <p className="text-gray-500 max-w-xl mx-auto px-4 font-light">Farm-fresh, premium quality ingredients delivered straight from our mill to your kitchen.</p>
      </div>

      {/* Top Horizontal Filter Bar */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-gray-100 py-4 transition-all shadow-sm">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center gap-6 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 scrollbar-hide">
            {categories.map((category) => (
              <button 
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`text-sm tracking-widest uppercase transition-all whitespace-nowrap ${
                  activeCategory === category 
                    ? "text-[var(--color-devam-red)] font-bold border-b-2 border-[var(--color-devam-red)] pb-1" 
                    : "text-gray-500 hover:text-gray-900 pb-1"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="hidden sm:flex items-center gap-4 text-sm text-gray-500">
            <button className="flex items-center gap-2 hover:text-gray-900 transition-colors">
              <SlidersHorizontal className="w-4 h-4" /> Filters
            </button>
            <span className="w-px h-4 bg-gray-300"></span>
            <span>{uniqueProducts.length} Products</span>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        {/* Full Width Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-16">
          {uniqueProducts.map((product) => (
            <div key={product.id} className="group flex flex-col text-center">
              {/* Product Image Container */}
              <div className="relative aspect-[4/5] mb-6 overflow-hidden bg-[#f9f9f9] rounded-xl group-hover:shadow-xl transition-all duration-500">
                {product.isNew && (
                  <div className="absolute top-4 left-4 z-10 bg-gray-900 text-white text-[10px] font-bold px-3 py-1 uppercase tracking-widest">
                    New
                  </div>
                )}
                <Link href={`/product/${product.id}`} className="absolute inset-0 z-0">
                  <Image 
                    src={product.image} 
                    alt={product.name} 
                    fill
                    className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                </Link>
                
                {/* Hover View Details Button */}
                <div className="absolute bottom-0 left-0 w-full p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-20">
                  <Link 
                    href={`/product/${product.id}`}
                    className="w-full bg-[var(--color-devam-red)] hover:bg-[#d62828] text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 shadow-lg transition-colors"
                  >
                    View Details
                  </Link>
                </div>
              </div>
              
              {/* Product Info (Minimalist, Center Aligned) */}
              <div className="flex flex-col flex-1 items-center px-2 pb-4">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">{product.category}</div>
                <Link href={`/product/${product.id}`} className="group-hover:text-[var(--color-devam-red)] transition-colors">
                  <h3 className="font-heading text-lg font-bold text-gray-900 mb-2 leading-tight text-center">{product.name}</h3>
                </Link>
                <div className="flex items-center gap-2 mt-auto">
                  <span className="font-bold text-[var(--color-devam-red)]">₹{product.price}</span>
                  {product.originalPrice > product.price && (
                    <span className="text-sm text-gray-400 line-through">₹{product.originalPrice}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
