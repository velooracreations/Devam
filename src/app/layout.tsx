import type { Metadata } from "next";
import { StoreLayout } from "@/components/layout/StoreLayout";
import { AuthContextProvider } from "@/context/AuthContext";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "https://thedevam.com"),
  title: {
    default: "Devam Atta & Spices - Pure Turmeric Chili Powder Online | Chakki Fresh Atta Dahod",
    template: "%s | Devam Atta & Spices Export",
  },
  description: "Devam Atta by Shreeji Gruh Udhyog: Best Chakki Fresh Atta Dahod, 5kg Stone Ground Wheat Flour, Sharbati Wheat Flour Gujarat, Pure Turmeric Chili Powder Online & Wholesale Food Grains.",
  keywords: [
    "Devam Atta",
    "Devam Chakki Fresh Atta 5kg",
    "Devam Chakki Fresh Atta 5kg Price",
    "Buy 5kg Chakki Atta Online",
    "Chakki Fresh Atta Dahod",
    "Sharbati Wheat Flour Gujarat",
    "Pure Turmeric Chili Powder Online",
    "Indian Food Grains Wholesale Supplier",
    "Devam Spices Export",
    "Devam Atta & Masala Hub",
    "Shreeji Gruh Udhyog",
    "Chakki Atta",
    "Jowar Atta",
    "Makkai Atta",
    "Bajri Atta",
    "Ragi Atta",
    "Indian Spices Manufacturer",
    "Pure Flour Manufacturer India",
    "FMCG Exports India",
    "Whole Spices Bulk Supplier",
    "Jhalod Gujarat FMCG",
    "Zalod best masala",
    "Jhalod best masala",
    "Zalod best atta",
    "Jhalod best atta",
    "Dahod best masala",
    "Dahod best atta",
    "Dahod best chakki atta",
    "Veloora Creation",
    "Veloora Creation Marketing",
    "Veloora Creation SEO",
    "Digital Marketing by Veloora Creation",
    "Website Architecture by Veloora Creation",
    "E-Commerce Web Design Veloora Creation",
    "Veloora Creation Gujarat"
  ],
  authors: [
    { name: "Shreeji Gruh Udhyog", url: "https://thedevam.com" },
    { name: "Veloora Creation", url: "https://velooracreations.in" }
  ],
  creator: "Veloora Creation",
  publisher: "Shreeji Gruh Udhyog",
  category: "Food & Beverage",
  openGraph: {
    title: "Devam Atta & Masala Hub - Premium Chakki Atta, Spices & Grains",
    description: "Authentic 100% pure Chakki Atta, whole spices, and food grains direct from Shreeji Gruh Udhyog, Jhalod, Gujarat.",
    url: "https://thedevam.com",
    siteName: "Devam Atta & Masala Hub",
    images: [
      {
        url: "https://thedevam.com/whatsapp-preview.jpg",
        secureUrl: "https://thedevam.com/whatsapp-preview.jpg",
        width: 900,
        height: 1200,
        type: "image/jpeg",
        alt: "Devam Chakki Fresh Atta, Pure Masala Spices and Whole Food Grains"
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Devam Atta & Masala Hub - Premium Chakki Atta, Spices & Grains",
    description: "Authentic 100% pure Chakki Atta, whole spices, and food grains direct from Shreeji Gruh Udhyog, Jhalod, Gujarat.",
    images: ["https://thedevam.com/whatsapp-preview.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap"
          rel="stylesheet"
        />
        {/* Veloora Creation Digital Marketing & Technical Agency Meta Tags */}
        <meta name="author" content="Shreeji Gruh Udhyog, Veloora Creation" />
        <meta name="creator" content="Veloora Creation" />
        <meta name="designer" content="Veloora Creation" />
        <meta name="publisher" content="Shreeji Gruh Udhyog" />
        <meta name="marketing" content="Veloora Creation" />
        <meta name="web-author" content="Veloora Creation (https://velooracreations.in)" />
        <link rel="author" href="https://velooracreations.in" />

        {/* WhatsApp & Social Media Rich Link Preview Tags */}
        <meta property="og:image" content="https://thedevam.com/whatsapp-preview.jpg" />
        <meta property="og:image:secure_url" content="https://thedevam.com/whatsapp-preview.jpg" />
        <meta property="og:image:type" content="image/jpeg" />
        <meta property="og:image:width" content="900" />
        <meta property="og:image:height" content="1200" />
        <meta property="og:image:alt" content="Devam Chakki Fresh Atta, Spices, Masala and Whole Grains" />
        <link rel="image_src" href="https://thedevam.com/whatsapp-preview.jpg" />
      </head>
      <body className="min-h-full flex flex-col font-body bg-[var(--background)] text-[var(--foreground)]">
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Devam Atta & Masala Hub",
              "legalName": "Shreeji Gruh Udhyog",
              "url": "https://thedevam.com",
              "logo": "https://thedevam.com/logo.svg",
              "image": "https://thedevam.com/logo.svg",
              "description": "Devam Atta by Shreeji Gruh Udhyog is the premier manufacturer of Chakki Fresh Atta Dahod, Sharbati Wheat Flour Gujarat, Pure Turmeric Chili Powder Online, Indian Food Grains Wholesale Supplier & Devam Spices Export.",
              "creator": {
                "@type": "Organization",
                "name": "Veloora Creation",
                "url": "https://velooracreations.in",
                "sameAs": [
                  "https://velooracreations.in/",
                  "https://www.instagram.com/velooracreation"
                ],
                "description": "Veloora Creation — Digital Marketing, E-Commerce Growth & Web Architecture Agency"
              },
              "knowsAbout": [
                "Devam Atta",
                "Chakki Fresh Atta Dahod",
                "Sharbati Wheat Flour Gujarat",
                "Pure Turmeric Chili Powder Online",
                "Indian Food Grains Wholesale Supplier",
                "Devam Spices Export"
              ],
              "hasOfferCatalog": {
                "@type": "OfferCatalog",
                "name": "Devam Atta & Spices Product Catalog",
                "itemListElement": [
                  {
                    "@type": "OfferCatalog",
                    "name": "Chakki Fresh Atta Dahod & Sharbati Wheat Flour Gujarat",
                    "description": "100% pure stone-ground Sharbati Wheat Flour, Jowar, Makkai, Bajri & Ragi Atta"
                  },
                  {
                    "@type": "OfferCatalog",
                    "name": "Pure Turmeric Chili Powder Online & Devam Spices Export",
                    "description": "Sun-dried single-origin Turmeric (Haldi), Kashmiri Chili, Dhaniya & Garam Masala"
                  },
                  {
                    "@type": "OfferCatalog",
                    "name": "Indian Food Grains Wholesale Supplier",
                    "description": "B2B bulk supply of whole spices, chickpeas, lentils & food grains"
                  }
                ]
              },
              "telephone": "+91-9979640900",
              "email": "info@thedevam.com",
              "vatID": "24CSFPP3315Q1ZD",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "Godown Plot No. 5-6, City Survey No. 3354, Block 1/12, Nr. Market Yard, Jhalod",
                "addressLocality": "Jhalod",
                "addressRegion": "Gujarat",
                "postalCode": "389170",
                "addressCountry": "IN"
              },
              "geo": {
                "@type": "GeoCoordinates",
                "latitude": "23.1012",
                "longitude": "74.1528"
              },
              "sameAs": [
                "https://www.facebook.com/people/Devam-Atta-Masala-hab/61585254875136",
                "https://www.instagram.com/devam_atta_masala_hub",
                "https://www.youtube.com/@devamchakkiattamasala",
                "https://www.indiamart.com/company/271804823/"
              ],
              "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+91-9979640900",
                "contactType": "customer service",
                "areaServed": ["IN", "Worldwide"],
                "availableLanguage": ["en", "gu", "hi"]
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
