"use client";

import Link from "next/link";
import { Building2, TrendingUp, Handshake, Truck } from "lucide-react";
import { motion } from "framer-motion";

const benefits = [
  {
    icon: TrendingUp,
    title: "Wholesale Pricing",
    desc: "Competitive wholesale pricing structured to ensure your business thrives."
  },
  {
    icon: Truck,
    title: "Direct Supply",
    desc: "Consistent, uninterrupted supply directly from our advanced processing mills."
  },
  {
    icon: Handshake,
    title: "Dedicated Support",
    desc: "A dedicated relationship manager for all your operational and marketing needs."
  }
];

export function DistributorCTA() {
  return (
    <section className="relative py-24 lg:py-32 overflow-hidden bg-[var(--color-devam-cream)] text-[var(--color-devam-brown)]">
      {/* Background visual flair */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-devam-cream)] via-[var(--color-devam-cream)] to-white/80 opacity-95 z-10" />
        {/* Subtle background texture */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] mix-blend-overlay opacity-30 z-0" />
      </div>

      {/* Decorative large light glows */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-[var(--color-devam-red)] rounded-full mix-blend-screen filter blur-[120px] opacity-40 z-0" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[var(--color-devam-gold)] rounded-full mix-blend-screen filter blur-[120px] opacity-10 z-0" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Text Content */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-[var(--color-devam-red)]/20 border border-[var(--color-devam-red)]/50 rounded-full mb-8 backdrop-blur-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-devam-red)] animate-pulse" />
              <span className="text-[var(--color-devam-brown)] font-bold text-sm tracking-widest uppercase">Partner With Us</span>
            </div>
            
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold mb-6 leading-tight">
              Grow Your Business <br/>
              <span className="text-[var(--color-devam-gold)]">With Devam</span>
            </h2>
            
            <p className="text-lg md:text-xl text-[var(--color-devam-brown)] font-body mb-10 leading-relaxed max-w-xl font-medium">
              We are actively expanding our B2B footprint. Join our network of successful distributors and retailers to bring India&apos;s finest premium flour and spices to your customers.
            </p>

            <Link 
              href="/distributors" 
              className="group inline-flex items-center justify-center px-8 py-5 bg-gradient-to-r from-[var(--color-devam-gold)] to-yellow-400 text-[var(--color-devam-brown)] font-bold text-lg tracking-wider rounded-lg shadow-[0_0_40px_rgba(230,184,0,0.3)] hover:shadow-[0_0_60px_rgba(230,184,0,0.5)] hover:scale-105 transition-all duration-300"
            >
              <Building2 className="w-6 h-6 mr-3 group-hover:animate-bounce" /> 
              Apply For Distributorship
            </Link>
          </motion.div>

          {/* Right Benefits Cards */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-6"
          >
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div 
                  key={index} 
                  className={`bg-white border border-gray-100 p-8 rounded-2xl hover:shadow-2xl transition-all duration-300 shadow-lg ${index === 2 ? 'sm:col-span-2 sm:w-[calc(50%-0.75rem)] sm:justify-self-center' : ''}`}
                >
                  <div className="w-14 h-14 bg-[var(--color-devam-red)]/20 rounded-xl flex items-center justify-center mb-6 border border-[var(--color-devam-red)]/30">
                    <Icon className="w-7 h-7 text-[var(--color-devam-gold)]" />
                  </div>
                  <h3 className="text-xl font-heading font-bold mb-3">{benefit.title}</h3>
                  <p className="text-[var(--color-devam-brown)] font-body leading-relaxed font-medium">
                    {benefit.desc}
                  </p>
                </div>
              );
            })}
          </motion.div>

        </div>
      </div>
    </section>
  );
}
