"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, ShoppingCart, Search, User, ChevronDown, Bell, Gift, HelpCircle, Package, Heart, Wallet, LogOut, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { usePathname } from "next/navigation";

const navLinks = [
  { name: "Shop", href: "/shop" },
  { name: "About Us", href: "/about" },
  { name: "Distributors", href: "/distributors" },
  { name: "Export", href: "/export" },
  { name: "Recipes", href: "/recipes" },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  
  // Hydration-safe state for Zustand persist
  const [cartCount, setCartCount] = useState(0);
  const storeCartCount = useCartStore((state) => state.getCartCount());
  
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    setCartCount(storeCartCount);
  }, [storeCartCount]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 w-full z-50 transition-all duration-300 border-b border-transparent",
        isScrolled
          ? "bg-white/80 backdrop-blur-md shadow-sm py-4 border-gray-100"
          : "bg-transparent py-6"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0 flex items-center h-12 md:h-16 w-32 md:w-48 justify-start overflow-hidden">
            <Image
              src="/logo.svg"
              alt="Devam Logo"
              width={240}
              height={240}
              className="w-full h-full object-contain scale-[1.5] md:scale-[2.0] origin-left"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-4 lg:space-x-8 items-center">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-sm font-medium transition-colors uppercase tracking-widest text-[var(--color-devam-brown)] hover:text-[var(--color-devam-red)] whitespace-nowrap"
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="hidden md:flex items-center space-x-6">
            
            {/* User Dropdown */}
            {user ? (
              <div className="relative group">
                <button className="flex items-center gap-1 transition-colors text-[var(--color-devam-brown)] hover:text-[var(--color-devam-red)] font-medium">
                  <User className="w-5 h-5" />
                  <span className="max-w-[100px] truncate">{user.displayName || user.email?.split('@')[0]}</span>
                  <ChevronDown className="w-4 h-4 transition-transform group-hover:rotate-180" />
                </button>
                
                {/* Dropdown Menu */}
                <div className="absolute top-full right-0 mt-4 w-64 bg-white rounded-lg shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  {/* Connector triangle */}
                  <div className="absolute -top-2 right-6 w-4 h-4 bg-white transform rotate-45 border-l border-t border-gray-100"></div>
                  
                  <div className="py-2 flex flex-col relative z-10">
                    <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                      <span className="font-bold text-sm text-[var(--color-devam-brown)]">Your Account</span>
                    </div>
                    
                    <Link href="/account?tab=profile" className="flex items-center px-4 py-3 hover:bg-gray-50 transition-colors text-sm text-[var(--color-devam-brown)]">
                      <User className="w-4 h-4 mr-4 text-gray-500" /> My Profile
                    </Link>
                    <Link href="/account?tab=orders" className="flex items-center px-4 py-3 hover:bg-gray-50 transition-colors text-sm text-[var(--color-devam-brown)]">
                      <Package className="w-4 h-4 mr-4 text-gray-500" /> Orders
                    </Link>
                    <Link href="/account?tab=wishlist" className="flex items-center px-4 py-3 hover:bg-gray-50 transition-colors text-sm text-[var(--color-devam-brown)] border-b border-gray-50">
                      <Heart className="w-4 h-4 mr-4 text-gray-500" /> Wishlist
                    </Link>
                    <Link href="/account?tab=addresses" className="flex items-center px-4 py-3 hover:bg-gray-50 transition-colors text-sm text-[var(--color-devam-brown)]">
                      <MapPin className="w-4 h-4 mr-4 text-gray-500" /> Saved Addresses
                    </Link>
                    <Link href="/account?tab=payments" className="flex items-center px-4 py-3 hover:bg-gray-50 transition-colors text-sm text-[var(--color-devam-brown)] border-b border-gray-50">
                      <Wallet className="w-4 h-4 mr-4 text-gray-500" /> Saved Cards & Wallet
                    </Link>
                    <Link href="/account?tab=notifications" className="flex items-center px-4 py-3 hover:bg-gray-50 transition-colors text-sm text-[var(--color-devam-brown)] border-b border-gray-50">
                      <Bell className="w-4 h-4 mr-4 text-gray-500" /> Notifications
                    </Link>
                    <button onClick={logout} className="flex items-center px-4 py-3 hover:bg-red-50 transition-colors text-sm text-red-600 w-full text-left">
                      <LogOut className="w-4 h-4 mr-4 text-red-500" /> Logout
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <Link href={`/login?redirect=${encodeURIComponent(pathname)}`} className="flex items-center gap-1 transition-colors text-[var(--color-devam-brown)] hover:text-[var(--color-devam-red)] font-medium">
                <User className="w-5 h-5" />
                <span>Login</span>
              </Link>
            )}

            {/* More Dropdown */}
            <div className="relative group">
              <button className="flex items-center gap-1 transition-colors text-[var(--color-devam-brown)] hover:text-[var(--color-devam-red)] font-medium">
                <span>More</span>
                <ChevronDown className="w-4 h-4 transition-transform group-hover:rotate-180" />
              </button>
              
              {/* Dropdown Menu */}
              <div className="absolute top-full right-0 mt-4 w-56 bg-white rounded-lg shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="absolute -top-2 right-6 w-4 h-4 bg-white transform rotate-45 border-l border-t border-gray-100"></div>
                
                <div className="py-2 flex flex-col relative z-10">
                  <Link href="/contact" className="flex items-center px-4 py-3 hover:bg-gray-50 transition-colors text-sm text-[var(--color-devam-brown)] border-b border-gray-50">
                    <HelpCircle className="w-4 h-4 mr-4 text-gray-500" /> 24x7 Customer Care
                  </Link>
                  <Link href="/account?tab=notifications" className="flex items-center px-4 py-3 hover:bg-gray-50 transition-colors text-sm text-[var(--color-devam-brown)]">
                    <Bell className="w-4 h-4 mr-4 text-gray-500" /> Notification Settings
                  </Link>
                </div>
              </div>
            </div>

            <Link href="/cart" className="transition-colors relative text-[var(--color-devam-brown)] hover:text-[var(--color-devam-red)] flex items-center font-bold">
              <ShoppingCart className="w-5 h-5 mr-1" />
              <span>Cart</span>
              {cartCount > 0 && (
                <span className="absolute -top-2 left-3 bg-[var(--color-devam-red)] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-4">
            <Link href="/cart" className="relative transition-colors text-[var(--color-devam-brown)] hover:text-[var(--color-devam-red)]">
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-[var(--color-devam-red)] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="transition-colors text-[var(--color-devam-brown)] hover:text-[var(--color-devam-red)]"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white border-t border-gray-100 shadow-lg pb-6">
          <div className="flex flex-col px-4 pt-2 space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-medium text-[var(--color-devam-brown)] hover:text-[var(--color-devam-red)] block border-b border-gray-50 pb-2 uppercase tracking-wide"
              >
                {link.name}
              </Link>
            ))}
            <div className="flex items-center space-x-6 pt-4">
              <button className="flex items-center text-[var(--color-devam-brown)]">
                <Search className="w-5 h-5 mr-2" />
                <span className="text-sm font-medium uppercase">Search</span>
              </button>
              <Link href="/account" className="flex items-center text-[var(--color-devam-brown)]">
                <User className="w-5 h-5 mr-2" />
                <span className="text-sm font-medium uppercase">Account</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
