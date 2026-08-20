import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { StoreLayout } from "@/components/layout/StoreLayout";
import { AuthContextProvider } from "@/context/AuthContext";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "https://thedevam.com"),
  title: {
    default: "Devam - Premium Atta, Spices & Grains",
    template: "%s | Devam",
  },
  description: "Devam offers premium Chakki Atta, vibrant Spices, and healthy Food Grains. Manufactured and Marketed by Shreeji Gruh Udhyog.",
  keywords: ["Devam", "Chakki Atta", "Indian Spices", "Masala", "Whole Grains", "Shreeji Gruh Udhyog"],
  authors: [{ name: "Shreeji Gruh Udhyog" }],
  openGraph: {
    title: "Devam - Premium Atta, Spices & Grains",
    description: "Devam offers premium Chakki Atta, vibrant Spices, and healthy Food Grains. Manufactured and Marketed by Shreeji Gruh Udhyog.",
    url: "/",
    siteName: "Devam",
    images: [
      {
        url: "/logo.svg",
        width: 800,
        height: 600,
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Devam - Premium Atta, Spices & Grains",
    description: "Premium Chakki Atta, vibrant Spices, and healthy Food Grains from Devam.",
    images: ["/logo.svg"],
  },
};

import Script from "next/script";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-body bg-[var(--background)] text-[var(--foreground)]">
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Devam",
              "url": "https://thedevam.com",
              "logo": "https://thedevam.com/logo.svg",
              "description": "Premium FMCG ecommerce brand offering Chakki Atta, Spices, and Food Grains.",
              "address": {
                "@type": "PostalAddress",
                "addressCountry": "IN"
              }
            })
          }}
        />
        <AuthContextProvider>
          <StoreLayout>
            {children}
          </StoreLayout>
        </AuthContextProvider>
      </body>
    </html>
  );
}
