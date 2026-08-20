import Image from "next/image";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

const reasons = [
  "Directly sourced from trusted Indian farmers",
  "No artificial colors or preservatives",
  "Traditional chakki grinding process",
  "Export-quality packaging",
  "Rigorous laboratory testing",
];

export function WhyDevam() {
  return (
    <section className="py-24 bg-[var(--color-devam-brown)] text-[var(--color-devam-cream)] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className="lg:w-1/2 relative">
            <div className="relative w-full aspect-square md:aspect-[4/3] lg:aspect-square rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src="https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=1000&auto=format&fit=crop"
                alt="Assorted Indian spices and grains"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-devam-brown)]/80 to-transparent" />
            </div>
            
            {/* Floating badge */}
            <div className="absolute -bottom-8 -right-8 bg-[var(--color-devam-red)] text-white p-8 rounded-full w-48 h-48 flex flex-col items-center justify-center shadow-xl hidden md:flex border-8 border-[var(--color-devam-brown)]">
              <span className="text-4xl font-bold font-heading">100%</span>
              <span className="text-sm font-semibold uppercase tracking-widest text-center mt-1">Natural &<br/>Pure</span>
            </div>
          </div>
          
          <div className="lg:w-1/2">
            <h2 className="text-4xl md:text-5xl font-heading font-bold mb-6 text-[var(--color-devam-gold)]">
              Why Choose Devam?
            </h2>
            <p className="text-lg text-white/80 font-body mb-8 leading-relaxed">
              We believe that the best meals start with the finest ingredients. For generations, we have been committed to bringing the authentic taste of India to your kitchen, without any compromise on quality.
            </p>
            
            <ul className="space-y-4 mb-10">
              {reasons.map((reason, index) => (
                <li key={index} className="flex items-start">
                  <CheckCircle2 className="w-6 h-6 text-[var(--color-devam-gold)] mr-4 flex-shrink-0 mt-0.5" />
                  <span className="text-white/90 font-body text-lg">{reason}</span>
                </li>
              ))}
            </ul>
            
            <Link 
              href="/about" 
              className="inline-block px-8 py-4 bg-[var(--color-devam-red)] text-white font-semibold uppercase tracking-wider hover:bg-white hover:text-[var(--color-devam-red)] transition-colors rounded-sm shadow-lg text-xl"
            >
              About Us
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
