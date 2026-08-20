"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { FloatingLoginPrompt } from "@/components/FloatingLoginPrompt";
import { ScrollProgressBar } from "@/components/ui/ScrollProgressBar";
import { CustomCursor } from "@/components/ui/CustomCursor";
import { Toaster } from "sonner";
import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";

export function StoreLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  useEffect(() => {
    const unsubscribe = useAuthStore.getState().initialize();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // If we are in the admin section, DO NOT render the storefront Navbar and Footer
  if (pathname?.startsWith("/admin")) {
    return (
      <main className="flex-grow">
        {children}
        <Toaster position="bottom-right" richColors />
      </main>
    );
  }

  // Otherwise, render the normal storefront layout
  return (
    <>
      <ScrollProgressBar />
      <CustomCursor />
      <Navbar />
      <main className="flex-grow pt-24">
        {children}
      </main>
      <Footer />
      <WhatsAppButton />
      <FloatingLoginPrompt />
      <Toaster position="bottom-right" richColors />
    </>
  );
}
