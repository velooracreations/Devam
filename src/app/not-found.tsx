import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ShoppingBag, Utensils, HelpCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center bg-[var(--color-devam-cream)] px-4 py-16 text-center">
      <div className="max-w-xl mx-auto flex flex-col items-center">
        {/* Brand Logo */}
        <Link href="/" className="relative w-36 h-14 mb-8 block transition-transform hover:scale-105">
          <Image
            src="/logo.svg"
            alt="Devam Logo"
            fill
            className="object-contain"
            priority
          />
        </Link>

        {/* 404 Error Graphic Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--color-devam-red)]/10 text-[var(--color-devam-red)] font-bold text-xs uppercase tracking-widest mb-4">
          Error 404 • Page Not Found
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-heading font-bold text-[var(--color-devam-brown)] mb-4">
          Looking for Pure Flavor?
        </h1>

        <p className="text-gray-700 font-body text-base sm:text-lg mb-8 max-w-md mx-auto leading-relaxed">
          The page or product you are looking for might have been moved, renamed, or is temporarily out of season.
        </p>

        {/* Quick Nav Actions */}
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto mb-10">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3.5 bg-[var(--color-devam-red)] hover:bg-[#d62828] text-white font-bold text-sm uppercase tracking-wider rounded-lg shadow-md transition-all hover:scale-105"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
          </Link>
          <Link
            href="/shop"
            className="inline-flex items-center justify-center px-6 py-3.5 bg-[var(--color-devam-brown)] hover:bg-black text-[var(--color-devam-cream)] font-bold text-sm uppercase tracking-wider rounded-lg shadow-md transition-all hover:scale-105"
          >
            <ShoppingBag className="w-4 h-4 mr-2" /> Shop Flours &amp; Spices
          </Link>
        </div>

        {/* Helpful Shortcuts */}
        <div className="pt-8 border-t border-amber-900/10 w-full">
          <span className="text-xs uppercase font-bold tracking-wider text-gray-500 block mb-4">
            Popular Destinations
          </span>
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-[var(--color-devam-brown)]">
            <Link
              href="/recipes"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-amber-900/10 hover:border-[var(--color-devam-red)] hover:text-[var(--color-devam-red)] transition-colors shadow-xs"
            >
              <Utensils className="w-3.5 h-3.5 text-[var(--color-devam-red)]" />
              Gujarati Recipes
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-amber-900/10 hover:border-[var(--color-devam-red)] hover:text-[var(--color-devam-red)] transition-colors shadow-xs"
            >
              About Shreeji Gruh Udhyog
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-amber-900/10 hover:border-[var(--color-devam-red)] hover:text-[var(--color-devam-red)] transition-colors shadow-xs"
            >
              <HelpCircle className="w-3.5 h-3.5 text-gray-500" />
              Need Help?
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
