import Image from "next/image";
import { CheckCircle2, Heart, ShieldCheck, Leaf } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section */}
      <div className="relative h-[60vh] flex items-center justify-center">
        <div className="absolute inset-0 z-0">
          <Image
            src="/about_hero.png"
            alt="Devam Foods Facility"
            fill
            className="object-cover brightness-50"
            priority
          />
        </div>
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-heading font-bold text-white mb-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
            Our Story
          </h1>
          <p className="text-xl md:text-2xl text-white/90 font-medium max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150">
            Bringing the authentic taste of Gujarat to kitchens worldwide.
          </p>
        </div>
      </div>

      {/* Legacy Section */}
      <section className="py-24 bg-[var(--color-devam-cream)] px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-heading font-bold text-[var(--color-devam-brown)] mb-6">
                The Devam Legacy
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed mb-6">
                Rooted in the heart of Dahod, Gujarat, Devam began with a simple mission: to preserve the authentic, unadulterated flavors of traditional Indian cooking. We believe that the secret to a great meal lies in the purity of its ingredients.
              </p>
              <p className="text-lg text-[var(--color-devam-brown)]/80 leading-relaxed mb-8">
                For years, we have worked closely with local farmers, sourcing the finest grains and spices. Our state-of-the-art milling processes ensure that every pack of Devam flour and spice retains its natural oils, aroma, and nutritional value. 
              </p>
              <div className="flex gap-4">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex-1 text-center">
                  <h3 className="text-3xl font-bold text-[var(--color-devam-red)] mb-2">10+</h3>
                  <p className="font-bold text-[var(--color-devam-brown)]">Years Experience</p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex-1 text-center">
                  <h3 className="text-3xl font-bold text-[var(--color-devam-red)] mb-2">50+</h3>
                  <p className="font-bold text-[var(--color-devam-brown)]">Premium Products</p>
                </div>
              </div>
            </div>
            <div className="relative h-[500px] rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src="/about_hero.png"
                alt="Devam Spices"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-24 bg-white px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-heading font-bold text-[var(--color-devam-brown)] mb-4">Our Core Values</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">The principles that guide everything we do, from sourcing to packaging.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-8 rounded-2xl border border-gray-100 text-center hover:border-[var(--color-devam-red)]/30 transition-colors">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShieldCheck className="w-8 h-8 text-[var(--color-devam-red)]" />
              </div>
              <h3 className="text-xl font-bold text-[var(--color-devam-brown)] mb-4">100% Authentic</h3>
              <p className="text-gray-600">No artificial colors, preservatives, or additives. Just pure, natural ingredients exactly as nature intended.</p>
            </div>
            <div className="bg-gray-50 p-8 rounded-2xl border border-gray-100 text-center hover:border-[var(--color-devam-brown)]/30 transition-colors">
              <div className="w-16 h-16 bg-[var(--color-devam-brown)]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Leaf className="w-8 h-8 text-[var(--color-devam-brown)]" />
              </div>
              <h3 className="text-xl font-bold text-[var(--color-devam-brown)] mb-4">Ethically Sourced</h3>
              <p className="text-gray-600">We partner directly with trusted farmers to ensure fair trade practices and the highest quality raw materials.</p>
            </div>
            <div className="bg-gray-50 p-8 rounded-2xl border border-gray-100 text-center hover:border-[var(--color-devam-red)]/30 transition-colors">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="w-8 h-8 text-[var(--color-devam-red)]" />
              </div>
              <h3 className="text-xl font-bold text-[var(--color-devam-brown)] mb-4">Crafted with Care</h3>
              <p className="text-gray-600">From our traditional stone-milling techniques to our hygienic packaging, every step is done with love and precision.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
