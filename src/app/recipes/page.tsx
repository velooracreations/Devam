"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Clock, ChefHat, ArrowRight } from "lucide-react";
import { recipes } from "@/lib/data/recipes";

export default function RecipesPage() {
  const categories = ["All", "Gujarati Specials", "Healthy Everyday", "Roti & Rotla", "Festive"];
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredRecipes = recipes.filter(
    (recipe) => activeCategory === "All" || recipe.category === activeCategory
  );

  return (
    <div className="bg-[var(--color-devam-cream)] min-h-screen pb-20">
      
      {/* Hero Section */}
      <section className="relative bg-[var(--color-devam-brown)] py-16 md:py-20 text-center text-white overflow-hidden">
        <div className="relative z-10 max-w-4xl mx-auto px-4">
          <span className="inline-block px-4 py-1 rounded-full bg-white/10 text-[var(--color-devam-gold)] text-xs font-bold uppercase tracking-widest mb-3 border border-white/15 backdrop-blur-sm">
            Traditional Recipes
          </span>
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">Cook with Devam</h1>
          <p className="text-base sm:text-lg text-white/80 font-body max-w-2xl mx-auto">
            Discover authentic, delicious recipes made perfect with Devam's premium stone-ground flours and pure spices.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Category Filter Pills */}
        <div className="flex flex-wrap justify-center gap-2.5 sm:gap-3 mb-12">
          {categories.map((cat) => (
            <button 
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 sm:px-6 py-2 rounded-full text-xs sm:text-sm font-bold tracking-wide transition-all ${
                activeCategory === cat
                  ? 'bg-[var(--color-devam-green)] text-white shadow-md shadow-emerald-950/20' 
                  : 'bg-white text-[var(--color-devam-brown)] border border-stone-200 hover:border-[var(--color-devam-green)] hover:text-[var(--color-devam-green)] shadow-2xs'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Recipe Grid with Beautiful Dish Images */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredRecipes.map((recipe) => (
            <Link 
              key={recipe.id} 
              href={`/recipes/${recipe.id}`}
              className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-stone-200/60 flex flex-col group hover:-translate-y-1"
            >
              {/* Dish Image Container */}
              <div className="relative h-52 sm:h-56 w-full overflow-hidden bg-stone-100">
                <Image
                  src={recipe.image}
                  alt={recipe.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                
                {/* Category Tag Badge */}
                <span className="absolute top-4 left-4 bg-white/95 backdrop-blur-md text-[var(--color-devam-brown)] text-[11px] font-bold uppercase tracking-wider py-1 px-3 rounded-full shadow-sm border border-stone-200/50">
                  {recipe.category}
                </span>

                {/* Meta Badges (Time & Difficulty) */}
                <div className="absolute bottom-3 right-3 flex items-center gap-2 bg-black/60 backdrop-blur-md text-white text-xs font-semibold px-2.5 py-1 rounded-lg">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[var(--color-devam-gold)]" />
                    {recipe.prepTime}
                  </span>
                  <span className="text-white/40">•</span>
                  <span className="flex items-center gap-1">
                    <ChefHat className="w-3.5 h-3.5 text-emerald-400" />
                    {recipe.difficulty}
                  </span>
                </div>
              </div>

              {/* Recipe Content */}
              <div className="p-5 sm:p-6 flex flex-col flex-grow">
                <h3 className="text-xl sm:text-2xl font-heading font-bold text-[var(--color-devam-brown)] mb-2 group-hover:text-[var(--color-devam-green)] transition-colors leading-snug line-clamp-1">
                  {recipe.title}
                </h3>
                
                <p className="text-stone-600 text-sm line-clamp-2 mb-5 leading-relaxed font-body flex-grow">
                  {recipe.description}
                </p>
                
                <div className="inline-flex items-center justify-between w-full pt-3 border-t border-stone-100 text-[var(--color-devam-brown)] font-bold text-xs uppercase tracking-wider group-hover:text-[var(--color-devam-green)] transition-colors mt-auto">
                  <span>View Full Recipe</span>
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1.5 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </div>
  );
}
