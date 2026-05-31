"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import Chatbot from "@/components/Chatbot";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { Toaster } from "sonner";

export function StoreLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
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
      <Navbar />
      <main className="flex-grow pt-24">
        {children}
      </main>
      <Footer />
      <Chatbot />
      <WhatsAppButton />
      <Toaster position="bottom-right" richColors />
    </>
  );
}
