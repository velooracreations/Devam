"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { ScrollProgressBar } from "@/components/ui/ScrollProgressBar";
import { Toaster } from "sonner";
import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { syncExistingLocalOrdersToCloud } from "@/lib/orderSync";
import { syncLocalAddressesToCloud } from "@/lib/addressStore";
import { CookieConsentBanner } from "@/components/CookieConsentBanner";

export function StoreLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  useEffect(() => {
    const unsubscribe = useAuthStore.getState().initialize();
    syncExistingLocalOrdersToCloud();
    syncLocalAddressesToCloud();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // If we are in the admin section, DO NOT render the storefront Navbar and Footer
  if (pathname?.startsWith("/admin")) {
    return (
      <main className="flex-grow">
        {children}
        <Toaster position="top-right" richColors />
      </main>
    );
  }

  // Otherwise, render the normal storefront layout
  return (
    <>
      <ScrollProgressBar />
      <Navbar />
      <main className="flex-grow pt-14 md:pt-16">
        {children}
      </main>
      <Footer />
      <WhatsAppButton />
      <CookieConsentBanner />
      <Toaster position="bottom-right" richColors />
    </>
  );
}

