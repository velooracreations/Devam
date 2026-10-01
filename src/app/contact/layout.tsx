import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us - Customer Care & Support | Devam",
  description: "Get in touch with Devam (Shreeji Gruh Udhyog). Customer support, factory location in Jhalod, Gujarat, phone assistance, and email inquiry.",
  alternates: {
    canonical: "https://thedevam.com/contact",
  },
  openGraph: {
    title: "Contact Devam (Shreeji Gruh Udhyog)",
    description: "We are here to help with your orders, questions, and distributor inquiries.",
    url: "https://thedevam.com/contact",
    siteName: "Devam",
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
