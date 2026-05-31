"use client";

import Image from "next/image";
import Link from "next/link";
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
    <div className="bg-[var(--color-devam-cream)] min-h-screen">
      
      {/* Hero Section */}
      <section className="relative bg-[var(--color-devam-brown)] py-20 text-center text-white overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-20">
          <Image 
            src="/hero_spices_masala.png" 
            alt="Spices background" 
            fill 
            className="object-cover"
          />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">Cook with Devam</h1>
          <p className="text-lg text-white/80 font-body max-w-2xl mx-auto">
            Discover authentic, delicious recipes made perfect with Devam's premium flours and spices. Elevate your everyday cooking.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Categories */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((cat) => (
            <button 
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2 rounded-full text-sm font-bold tracking-wide transition-all ${
                activeCategory === cat
                  ? 'bg-[var(--color-devam-red)] text-white shadow-md' 
                  : 'bg-white text-[var(--color-devam-brown)] border border-gray-200 hover:border-[var(--color-devam-red)] hover:text-[var(--color-devam-red)]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Recipe Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredRecipes.map(recipe => (
            <div key={recipe.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col group">
              <div className="relative h-64 overflow-hidden">
                <span className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur text-[var(--color-devam-brown)] text-xs font-bold uppercase tracking-wider py-1.5 px-3 rounded-full shadow-sm">
                  {recipe.category}
                </span>
                <Image
                  src={recipe.image}
                  alt={recipe.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>
              
              <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-2xl font-heading font-bold text-[var(--color-devam-brown)] mb-3 group-hover:text-[var(--color-devam-red)] transition-colors">
                  {recipe.title}
                </h3>
                
                <div className="flex items-center gap-6 mb-4 text-sm text-[var(--color-devam-brown)]/60 font-medium">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    {recipe.prepTime}
                  </div>
                  <div className="flex items-center">
                    <ChefHat className="w-4 h-4 mr-2" />
                    {recipe.difficulty}
                  </div>
                </div>
                
                <p className="text-[var(--color-devam-brown)]/80 text-sm line-clamp-2 mb-6 flex-grow">
                  {recipe.description}
                </p>
                
                <Link 
                  href={`/recipes/${recipe.id}`}
                  className="inline-flex items-center text-[var(--color-devam-red)] font-bold text-sm uppercase tracking-wider hover:text-red-800 transition-colors"
                >
                  View Recipe <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
