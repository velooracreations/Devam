import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Authentic Indian & Gujarati Recipes | Devam",
  description: "Discover authentic, delicious recipes made perfect with Devam premium stone-ground flours and handpicked spices. Gujarati Rotla, Thepla, Sheera, and everyday meals.",
  alternates: {
    canonical: "https://thedevam.com/recipes",
  },
  openGraph: {
    title: "Cook with Devam - Recipes & Cooking Inspiration",
    description: "Traditional Gujarati recipes, healthy everyday meals, and festive delicacies.",
    url: "https://thedevam.com/recipes",
    siteName: "Devam",
  },
};

export default function RecipesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
