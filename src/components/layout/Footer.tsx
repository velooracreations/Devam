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
            <div className="mt-4 flex items-center bg-white/5 p-3 rounded-xl border border-white/10 w-full max-w-sm relative z-10">
              <div className="mr-4 flex items-center justify-center w-20 h-14">
                <img src="/fssai-logo.png" alt="FSSAI" className="h-full w-full object-contain brightness-0 invert opacity-90" />
              </div>
              <div>
                <p className="text-white/60 text-[10px] font-semibold uppercase tracking-wider mb-0.5">Lic. No.</p>
                <p className="text-[var(--color-devam-gold)] font-mono font-bold text-sm tracking-wider">10725008000026</p>
              </div>
            </div>

            <div className="flex space-x-4 mt-6 relative z-10">
              <a href="#" className="text-white/60 hover:text-[var(--color-devam-gold)] transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="text-white/60 hover:text-[var(--color-devam-gold)] transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="text-white/60 hover:text-[var(--color-devam-gold)] transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
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
