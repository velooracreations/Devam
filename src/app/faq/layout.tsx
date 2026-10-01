import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Frequently Asked Questions (FAQ) | Devam",
  description: "Find answers to common questions about Devam chakki fresh atta, purity of spices, shelf life, shipping timelines, order tracking, and returns.",
  alternates: {
    canonical: "https://thedevam.com/faq",
  },
  openGraph: {
    title: "FAQ | Devam (Shreeji Gruh Udhyog)",
    description: "Common questions regarding Devam products, order placement, payments, and delivery.",
    url: "https://thedevam.com/faq",
    siteName: "Devam",
  },
};

export default function FAQLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
