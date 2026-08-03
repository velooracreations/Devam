import Link from "next/link";
import Image from "next/image";
import { Mail, Phone, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[var(--color-devam-brown)] text-[var(--color-devam-cream)] pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-12">
          {/* Brand Info */}
          <div className="flex flex-col">
            <div className="flex justify-start w-full relative z-10">
              <Link href="/" className="inline-block relative w-48 h-20 mb-4">
                <img
                  src="/logo.svg"
                  alt="Devam Logo"
                  className="w-full h-full object-contain object-left drop-shadow-lg"
                />
              </Link>
            </div>
            <p className="text-sm text-white/80 leading-relaxed font-body mb-6 relative z-10">
              Purity Begins From The Fields. Freshness You Can Taste, Quality You Can Trust. Experience the finest FMCG products curated for the Indian household.
            </p>

            {/* FSSAI License Block */}
            <div className="mt-4 flex items-center justify-between bg-white/5 px-4 py-3 rounded-xl border border-white/10 w-full max-w-sm relative z-10">
              <div className="flex items-center justify-start w-28 h-12 flex-shrink-0">
                <img src="/fssai.svg" alt="FSSAI" className="h-full w-full object-contain object-left brightness-0 invert" />
              </div>
              <div className="text-right flex flex-col justify-center">
                <span className="text-white/60 text-[10px] font-bold uppercase tracking-widest block leading-tight">Lic. No.</span>
                <span className="text-[var(--color-devam-gold)] font-mono font-extrabold text-xs sm:text-sm tracking-wider block mt-0.5 whitespace-nowrap">10725008000026</span>
              </div>
            </div>

            {/* Social & Marketplace Links */}
            <div className="flex flex-nowrap items-center gap-2 sm:gap-3 mt-6 relative z-10 overflow-x-auto pb-1">
              {/* Facebook */}
              <a 
                href="https://www.facebook.com/people/Devam-Atta-Masala-hab/61585254875136" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="hover:scale-110 transition-transform opacity-90 hover:opacity-100 p-0.5 flex-shrink-0"
                title="Facebook"
              >
                <img src="/facebook.svg" alt="Facebook" className="w-8 h-8 object-contain" />
              </a>

              {/* Instagram */}
              <a 
                href="https://www.instagram.com/devam_atta_masala_hub" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="hover:scale-110 transition-transform opacity-90 hover:opacity-100 p-0.5 flex-shrink-0"
                title="Instagram"
              >
                <img src="/instagram.svg" alt="Instagram" className="w-8 h-8 object-contain" />
              </a>

              {/* YouTube */}
              <a 
                href="https://www.youtube.com/@devamchakkiattamasala" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="hover:scale-110 transition-transform opacity-90 hover:opacity-100 p-0.5 flex-shrink-0"
                title="YouTube"
              >
                <img src="/youtube.svg" alt="YouTube" className="w-8 h-8 object-contain" />
              </a>

              {/* IndiaMart */}
              <a 
                href="https://www.indiamart.com/company/271804823/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="hover:scale-105 transition-transform opacity-90 hover:opacity-100 p-0.5 flex-shrink-0"
                title="IndiaMart Store"
              >
                <img src="/indiamart.svg" alt="IndiaMart" className="h-8 w-auto object-contain" />
              </a>

              {/* JioMart */}
              <div 
                className="flex items-center gap-1 opacity-75 hover:opacity-90 transition-opacity p-0.5 flex-shrink-0 cursor-not-allowed"
                title="JioMart (Coming Soon)"
              >
                <img src="/jiomart.png" alt="JioMart" className="h-8 w-auto object-contain" />
                <span className="text-[8px] bg-[var(--color-devam-gold)] text-gray-900 font-bold px-1 py-0.5 rounded uppercase tracking-wider">Soon</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-heading font-semibold text-[var(--color-devam-gold)] mb-6">Explore</h4>
            <ul className="space-y-4">
              <li>
                <Link href="/shop" className="text-white/80 hover:text-white hover:pl-2 transition-all font-body text-sm">
                  Shop Products
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-white/80 hover:text-white hover:pl-2 transition-all font-body text-sm">
                  Our Story
                </Link>
              </li>
              <li>
                <Link href="/recipes" className="text-white/80 hover:text-white hover:pl-2 transition-all font-body text-sm">
                  Recipes
                </Link>
              </li>
              <li>
                <Link href="/distributors" className="text-white/80 hover:text-white hover:pl-2 transition-all font-body text-sm">
                  Become a Distributor
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-lg font-heading font-semibold text-[var(--color-devam-gold)] mb-6">Support</h4>
            <ul className="space-y-4">
              <li>
                <Link href="/faq" className="text-white/80 hover:text-white hover:pl-2 transition-all font-body text-sm">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="text-white/80 hover:text-white hover:pl-2 transition-all font-body text-sm">
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link href="/return-policy" className="text-white/80 hover:text-white hover:pl-2 transition-all font-body text-sm">
                  Returns & Refunds
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-heading font-semibold text-[var(--color-devam-gold)] mb-6">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start">
                <MapPin className="w-5 h-5 text-[var(--color-devam-red)] mr-3 flex-shrink-0 mt-0.5" />
                <span className="text-white/80 font-body text-sm">
                  Jhalod, Gujarat, India
                </span>
              </li>
              <li className="flex items-center">
                <Phone className="w-5 h-5 text-[var(--color-devam-red)] mr-3 flex-shrink-0" />
                <a href="tel:+919979640900" className="text-white/80 hover:text-white transition-colors font-body text-sm">
                  <span className="flex flex-col">
                    <span>+91 99796 40900</span>
                    <span>+91 99795 40900</span>
                  </span>
                </a>
              </li>
              <li className="flex items-center">
                <Mail className="w-5 h-5 text-[var(--color-devam-red)] mr-3 flex-shrink-0" />
                <a href="mailto:info@thedevam.com" className="text-white/80 hover:text-white transition-colors font-body text-sm">
                  info@thedevam.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-4">
          <div className="text-white/60 text-sm font-body text-center md:text-left flex-1">
            &copy; {new Date().getFullYear()} Devam (Shreeji Gruh Udhyog). All rights reserved.
          </div>
          <div className="flex space-x-6 flex-1 justify-center">
            <Link href="/data-policy" className="text-white/60 hover:text-[var(--color-devam-gold)] text-sm font-body transition-colors">
              Data Policy
            </Link>
            <Link href="/payment-policy" className="text-white/60 hover:text-[var(--color-devam-gold)] text-sm font-body transition-colors">
              Payment Policy
            </Link>
            <Link href="/terms" className="text-white/60 hover:text-[var(--color-devam-gold)] text-sm font-body transition-colors">
              Terms of Service
            </Link>
          </div>
          <div className="text-white/60 text-sm font-body text-center md:text-right flex-1">
            Crafted by <a href="https://velooracreations.in/" target="_blank" rel="noopener noreferrer" className="text-[var(--color-devam-gold)] hover:text-white transition-colors">Veloora Creations</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
