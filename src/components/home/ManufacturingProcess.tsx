"use client";

import { motion } from "framer-motion";
import { Sprout, ShieldCheck, Cog, PackageCheck } from "lucide-react";

const steps = [
  {
    icon: Sprout,
    title: "Handpicked Sourcing",
    description: "We select the finest crops from trusted farmers across India.",
    delay: 0,
  },
  {
    icon: ShieldCheck,
    title: "Thorough Cleaning",
    description: "Multi-stage sorting and cleaning ensures zero impurities.",
    delay: 0.2,
  },
  {
    icon: Cog,
    title: "Traditional Grinding",
    description: "Cool-grinding techniques to retain natural oils and aroma.",
    delay: 0.4,
  },
  {
    icon: PackageCheck,
    title: "Hygienic Packaging",
    description: "Vacuum sealed to lock in freshness until it reaches your kitchen.",
    delay: 0.6,
  },
];

export function ManufacturingProcess() {
  return (
    <section className="py-24 bg-[var(--color-devam-cream)]/20 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-24">
          <h2 className="text-4xl md:text-5xl font-heading font-bold text-[var(--color-devam-brown)] mb-6">
            Our Promise of Purity
          </h2>
          <p className="text-lg md:text-xl text-[var(--color-devam-brown)] font-body max-w-none mx-auto md:whitespace-nowrap font-medium">
            From the farm to your plate, every step is carefully monitored to deliver the best.
          </p>
        </div>

        <div className="relative">
          {/* Connecting line */}
          <div className="absolute top-12 left-[10%] w-[80%] h-[2px] bg-gradient-to-r from-transparent via-[var(--color-devam-gold)] to-transparent hidden md:block opacity-60" />
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 relative z-10">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6, delay: step.delay }}
                  className="flex flex-col items-center text-center group"
                >
                  {/* Icon Container */}
                  <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-[0_8px_30px_rgb(0,0,0,0.06)] mb-8 border-4 border-white group-hover:border-[var(--color-devam-gold)] transition-all duration-500 relative z-10">
                    <Icon className="w-10 h-10 text-[var(--color-devam-red)] group-hover:scale-110 transition-transform duration-500" />
                    
                    {/* Step number badge */}
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-[var(--color-devam-brown)] text-[var(--color-devam-gold)] rounded-full flex items-center justify-center font-bold text-sm shadow-md border-2 border-white">
                      {index + 1}
                    </div>
                  </div>
                  
                  <h3 className="text-xl md:text-2xl font-heading font-bold text-[var(--color-devam-brown)] mb-3">
                    {step.title}
                  </h3>
                  <p className="text-[var(--color-devam-brown)] font-body text-base leading-relaxed px-4 font-medium">
                    {step.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
