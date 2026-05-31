"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useProductStore } from "@/store/productStore";
import { useCartStore } from "@/store/cartStore";
import { toast } from "sonner";

export function FeaturedProducts() {
  const allProducts = useProductStore((state) => state.products);
  const addItem = useCartStore((state) => state.addItem);
  
  // Group by product name and take the first 4 unique products
  const uniqueProducts = Array.from(
    new Map(allProducts.map(product => [product.name, product])).values()
  ).slice(0, 4);

  const handleQuickAdd = (product: any) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.image,
      weight: product.weight
    });
    toast.success(`${product.name} added to cart!`, {
      description: `Variant: ${product.weight} | Price: ₹${product.price}`,
      action: {
        label: 'View Cart',
        onClick: () => document.dispatchEvent(new CustomEvent('open-cart'))
      },
    });
  };

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-heading font-bold text-[var(--color-devam-brown)] mb-4">
            Curated For Your Kitchen
          </h2>
          <p className="text-lg text-[var(--color-devam-brown)] font-body max-w-2xl mx-auto font-medium">
            Our most loved products, bringing authentic taste and uncompromised quality to every meal.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {uniqueProducts.map((product) => (
            <div key={product.id} className="group flex flex-col bg-white border border-gray-100 rounded-xl overflow-hidden hover:shadow-2xl transition-all duration-300">
              <div className="relative h-64 bg-[var(--color-devam-cream)] p-6 overflow-hidden">
                {product.isNew && (
                  <span className="absolute top-4 left-4 z-10 bg-[var(--color-devam-red)] text-white text-xs font-bold uppercase tracking-wider py-1 px-3 rounded-full">
                    New Arrival
                  </span>
                )}
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover mix-blend-multiply group-hover:scale-110 transition-transform duration-500"
                />
                
                {/* Quick Add Button Overlay */}
                <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                  <button 
                    onClick={() => handleQuickAdd(product)}
                    className="w-full bg-[var(--color-devam-gold)] text-[var(--color-devam-brown)] font-bold uppercase tracking-wider py-3 rounded shadow-lg flex items-center justify-center hover:bg-[var(--color-devam-brown)] hover:text-[var(--color-devam-gold)] transition-colors"
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" /> Quick Add
                  </button>
                </div>
              </div>

              <div className="p-6 flex flex-col flex-grow">
                <p className="text-xs text-[var(--color-devam-brown)] font-semibold uppercase tracking-wider mb-2">
                  {product.category}
                </p>
                <Link href={`/product/${product.id}`} className="block mb-2 flex-grow">
                  <h3 className="text-xl font-heading font-bold text-[var(--color-devam-brown)] group-hover:text-[var(--color-devam-red)] transition-colors line-clamp-2">
                    {product.name}
                  </h3>
                </Link>

                <div className="flex flex-col mt-auto">
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-[var(--color-devam-red)]">
                      ₹{product.price}
                    </span>
                    {product.originalPrice > product.price && (
                      <span className="text-sm text-gray-400 line-through">
                        ₹{product.originalPrice}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-16 text-center">
          <Link 
            href="/shop" 
            className="inline-flex items-center justify-center px-8 py-4 bg-[var(--color-devam-red)] text-white font-semibold uppercase tracking-wider rounded-sm hover:bg-[var(--color-devam-brown)] transition-colors shadow-lg"
          >
            Explore Full Catalog
          </Link>
        </div>
      </div>
    </section>
  );
}
