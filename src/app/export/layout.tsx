import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FMCG Spices & Flour Exports Worldwide | Devam",
  description: "Global export of authentic Indian spices, pure stone ground flours, and food grains. Premium export-grade packaging and international compliance from Gujarat, India.",
  alternates: {
    canonical: "https://thedevam.com/export",
  },
  openGraph: {
    title: "Devam Exports - Authentic Indian Spices & Flour Globally",
    description: "Exporting premium Indian FMCG products worldwide.",
    url: "https://thedevam.com/export",
    siteName: "Devam",
  },
};

export default function ExportLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
