import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Become a Distributor - Wholesale Flour & Spices | Devam",
  description: "Partner with Devam (Shreeji Gruh Udhyog). Wholesale pricing, high margins, marketing support, and reliable FMCG supply across Gujarat and India.",
  alternates: {
    canonical: "https://thedevam.com/distributors",
  },
  openGraph: {
    title: "Partner with Devam - B2B & FMCG Distribution Network",
    description: "Join our expanding distributor network for premium stone ground flour and authentic Indian spices.",
    url: "https://thedevam.com/distributors",
    siteName: "Devam",
  },
};

export default function DistributorsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
