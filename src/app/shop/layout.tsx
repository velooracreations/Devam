import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shop Premium Chakki Atta, Pure Spices & Whole Grains | Devam",
  description: "Explore our collection of 100% pure stone-ground wheat flour, multi-millet attas, single-origin turmeric, chili powder, and authentic whole spices from Devam.",
  alternates: {
    canonical: "https://thedevam.com/shop",
  },
  openGraph: {
    title: "Shop Devam Products - Pure Flour & Spices",
    description: "Stone ground Chakki Fresh Atta, single origin spices, and authentic staples from Dahod, Gujarat.",
    url: "https://thedevam.com/shop",
    siteName: "Devam",
  },
};

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
