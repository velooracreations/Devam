"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Cookie, X, Check, ShieldCheck } from "lucide-react";

export function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Check if user has already accepted or customized cookies
    const consent = localStorage.getItem("devam_cookie_consent");
    if (!consent) {
      // Delay presentation slightly for optimal initial render
      const timer = setTimeout(() => {
        setVisible(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem("devam_cookie_consent", "all");
    setVisible(false);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("devam_cookie_consent_updated", { detail: { level: "all" } }));
    }
  };

  const handleEssentialOnly = () => {
    localStorage.setItem("devam_cookie_consent", "essential");
    setVisible(false);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("devam_cookie_consent_updated", { detail: { level: "essential" } }));
    }
  };

  if (!visible) return null;

  return (
    <div
      role="region"
      aria-label="Cookie Consent"
      className="fixed bottom-4 left-4 right-4 md:left-6 md:right-auto md:max-w-md z-50 animate-in fade-in slide-in-from-bottom-5 duration-500"
    >
      <div className="bg-white/95 backdrop-blur-md border border-amber-900/15 rounded-2xl p-5 shadow-2xl text-[var(--color-devam-brown)]">
        <div className="flex items-start gap-3.5 mb-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100/80 text-amber-800 flex items-center justify-center flex-shrink-0">
            <Cookie className="w-5 h-5 text-amber-700" />
          </div>
          <div className="flex-1">
            <h3 className="font-heading font-bold text-base text-[var(--color-devam-brown)]">
              We Value Your Privacy
            </h3>
            <p className="text-xs text-gray-600 mt-1 leading-relaxed">
              We use essential cookies to manage your cart, and analytical cookies to improve loading speeds. 
              Review our{" "}
              <Link
                href="/privacy-policy"
                className="text-[var(--color-devam-red)] hover:underline font-semibold"
              >
                Privacy Policy
              </Link>
              .
            </p>
          </div>
          <button
            onClick={handleEssentialOnly}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
            aria-label="Close cookie consent"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2.5 pt-2">
          <button
            onClick={handleAcceptAll}
            className="flex-1 py-2 px-3.5 bg-[var(--color-devam-red)] hover:bg-[#d62828] text-white font-bold text-xs rounded-lg transition-colors shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" /> Accept All
          </button>
          <button
            onClick={handleEssentialOnly}
            className="py-2 px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-lg transition-colors cursor-pointer"
          >
            Essential Only
          </button>
        </div>
      </div>
    </div>
  );
}
