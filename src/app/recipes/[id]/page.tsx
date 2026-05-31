import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock, ChefHat, ShoppingCart, CheckCircle2, ArrowLeft } from "lucide-react";
import { recipes } from "@/lib/data/recipes";
import { products } from "@/lib/data/products";

export default async function RecipeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const recipe = recipes.find(r => r.id === id);
  
  if (!recipe) {
    notFound();
  }

  // Find the featured product
  const featuredProduct = products.find(p => p.id === recipe.featuredProductId);

  return (
    <div className="bg-[var(--color-devam-cream)] min-h-screen pb-20">
      
      {/* Hero Image Section */}
      <div className="relative h-[50vh] min-h-[400px] w-full bg-[var(--color-devam-brown)]">
        <Image
          src={recipe.image}
          alt={recipe.title}
          fill
          className="object-cover opacity-80"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        
        <div className="absolute bottom-0 left-0 right-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <Link href="/recipes" className="inline-flex items-center text-white/80 hover:text-white mb-6 transition-colors text-sm font-bold uppercase tracking-wider">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Recipes
          </Link>
          <div className="inline-block bg-[var(--color-devam-red)] text-white text-xs font-bold uppercase tracking-wider py-1.5 px-4 rounded-full mb-4">
            {recipe.category}
          </div>
          <h1 className="text-4xl md:text-6xl font-heading font-bold text-white mb-4">
            {recipe.title}
          </h1>
          <div className="flex items-center gap-8 text-white/90 font-medium">
            <div className="flex items-center">
              <Clock className="w-5 h-5 mr-2" /> {recipe.prepTime}
            </div>
            <div className="flex items-center">
              <ChefHat className="w-5 h-5 mr-2" /> {recipe.difficulty}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Main Recipe Content */}
          <div className="lg:col-span-2 space-y-12">
            
            {/* Description */}
            <section>
              <p className="text-lg text-[var(--color-devam-brown)]/80 leading-relaxed font-body">
                {recipe.description}
              </p>
            </section>

            {/* Ingredients */}
            <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-2xl font-heading font-bold text-[var(--color-devam-brown)] mb-6 flex items-center">
                Ingredients
              </h2>
              <ul className="space-y-4">
                {recipe.ingredients.map((item, idx) => (
                  <li key={idx} className="flex items-start text-[var(--color-devam-brown)]/80">
                    <CheckCircle2 className="w-5 h-5 mr-3 mt-0.5 text-[var(--color-devam-red)] flex-shrink-0" />
                    <span className={item.includes("Devam") ? "font-bold text-[var(--color-devam-brown)]" : ""}>
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Instructions */}
            <section>
              <h2 className="text-2xl font-heading font-bold text-[var(--color-devam-brown)] mb-6">
                Instructions
              </h2>
              <div className="space-y-8">
                {recipe.instructions.map((step, idx) => (
                  <div key={idx} className="flex gap-6">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[var(--color-devam-brown)] text-white flex items-center justify-center font-bold text-lg">
                      {idx + 1}
                    </div>
                    <p className="pt-1.5 text-[var(--color-devam-brown)]/80 leading-relaxed">
                      {step}
                    </p>
                  </div>
                ))}
              </div>
            </section>

          </div>

          {/* Sidebar / Upsell */}
          <div className="lg:col-span-1">
            {featuredProduct && (
              <div className="sticky top-28 bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
                <div className="text-center mb-6">
                  <span className="text-[var(--color-devam-red)] font-bold text-xs uppercase tracking-widest mb-2 block">
                    Featured Ingredient
                  </span>
                  <h3 className="text-xl font-heading font-bold text-[var(--color-devam-brown)]">
                    Made better with Devam
                  </h3>
                </div>

                <div className="relative h-48 bg-[var(--color-devam-cream)] rounded-xl mb-6 overflow-hidden p-4 group">
                  <Image 
                    src={featuredProduct.image} 
                    alt={featuredProduct.name} 
                    fill 
                    className="object-cover mix-blend-multiply group-hover:scale-110 transition-transform duration-500"
                  />
                </div>

                <div className="text-center mb-6">
                  <h4 className="font-bold text-[var(--color-devam-brown)] text-lg mb-1">{featuredProduct.name}</h4>
                  <p className="text-[var(--color-devam-brown)]/60 text-sm">{featuredProduct.category}</p>
                </div>

                <Link 
                  href={`/product/${featuredProduct.id}`}
                  className="w-full bg-[var(--color-devam-brown)] text-white font-bold uppercase tracking-wider py-4 rounded-xl shadow-lg flex items-center justify-center hover:bg-[var(--color-devam-red)] transition-colors"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" /> Buy Ingredient
                </Link>
                
                <p className="text-center text-xs text-[var(--color-devam-brown)]/50 mt-4">
                  Available in multiple packing sizes.
                </p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
