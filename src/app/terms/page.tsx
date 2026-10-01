import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Scale, ShieldCheck, ShoppingBag, Truck, AlertCircle, HelpCircle } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms and Conditions | Devam (Shreeji Gruh Udhyog)',
  description: 'Review the official terms of service, ordering policies, payments, and conditions governing the use of Devam (Shreeji Gruh Udhyog).',
  alternates: {
    canonical: 'https://thedevam.com/terms',
  },
  openGraph: {
    title: 'Terms and Conditions | Devam (Shreeji Gruh Udhyog)',
    description: 'Terms of Service, order policies, and consumer terms.',
    url: 'https://thedevam.com/terms',
    siteName: 'Devam',
  },
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-[var(--color-devam-cream)] py-12 md:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link 
          href="/" 
          className="inline-flex items-center text-[var(--color-devam-brown)] hover:text-[var(--color-devam-red)] mb-8 transition-colors font-medium text-sm"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>
        
        <div className="bg-white rounded-2xl shadow-sm border border-amber-900/10 p-6 sm:p-10 md:p-14">
          <div className="border-b border-gray-100 pb-6 mb-8 text-center sm:text-left">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-50 text-amber-900 border border-amber-200 mb-4">
              <Scale className="w-4 h-4 text-amber-700" />
              Legal &amp; User Agreement
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold text-[var(--color-devam-brown)]">
              Terms &amp; Conditions
            </h1>
            <p className="text-sm text-gray-500 mt-2">
              Last Updated: October 2026 | Governing Entity: Shreeji Gruh Udhyog
            </p>
          </div>
          
          <div className="prose prose-gray max-w-none text-gray-700 space-y-6 text-sm sm:text-base leading-relaxed">
            <p>
              These Terms and Conditions (&ldquo;Terms&rdquo;) govern your access to and use of the website 
              <Link href="https://thedevam.com" className="text-[var(--color-devam-red)] hover:underline ml-1">https://thedevam.com</Link>, 
              operated by <strong>Shreeji Gruh Udhyog</strong> (&ldquo;Devam&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;), having its registered manufacturing facility at 
              Godown Plot No. 5-6, City Survey No. 3354, Block 1/12, Nr. Market Yard, Jhalod, Dahod, Gujarat - 389170.
            </p>

            <h2 className="text-xl font-heading font-bold text-[var(--color-devam-brown)] mt-8 mb-3 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[var(--color-devam-red)]" /> 1. Acceptance &amp; Eligibility
            </h2>
            <p>
              By accessing our website, creating an account, or placing an order, you confirm that you are at least 18 years of age 
              and legally capable of entering into binding contracts under the Indian Contract Act, 1872. If you represent an organization or wholesale buyer, 
              you represent that you possess the necessary authority to bind the entity to these Terms.
            </p>

            <h2 className="text-xl font-heading font-bold text-[var(--color-devam-brown)] mt-8 mb-3">
              2. Products, Pricing &amp; Availability
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Agricultural Nature of Products:</strong> Our flours (Chakki Atta, Jowar, Bajri, Makkai, Ragi) and spices (Turmeric, Kashmiri Mirch, Dhana, Garam Masala) are 100% natural, farm-sourced agricultural produce. Minor natural variations in grain shade, aroma, or moisture may occur across seasonal harvests.
              </li>
              <li>
                <strong>Currency &amp; GST:</strong> All retail prices on the website are listed in Indian Rupees (INR) and are inclusive of applicable Goods and Services Tax (GST) unless explicitly stated otherwise.
              </li>
              <li>
                <strong>Price Revisions:</strong> We reserve the right to revise product prices without prior notice based on raw agricultural commodity market fluctuations. Orders already confirmed will not be affected by subsequent price changes.
              </li>
            </ul>

            <h2 className="text-xl font-heading font-bold text-[var(--color-devam-brown)] mt-8 mb-3 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[var(--color-devam-red)]" /> 3. Payment Terms
            </h2>
            <p>
              We accept payments via verified online channels including:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Unified Payments Interface (UPI via Google Pay, PhonePe, Paytm, BHIM, etc.).</li>
              <li>Credit and Debit Cards (Visa, MasterCard, RuPay, American Express).</li>
              <li>Net Banking across 50+ major Indian banks.</li>
              <li>Cash on Delivery (COD) for eligible pin codes and cart totals.</li>
            </ul>
            <p>
              All online card and banking transactions are processed through RBI-regulated payment aggregators (Razorpay) using secure SSL encryption.
            </p>

            <h2 className="text-xl font-heading font-bold text-[var(--color-devam-brown)] mt-8 mb-3 flex items-center gap-2">
              <Truck className="w-5 h-5 text-[var(--color-devam-red)]" /> 4. Shipping, Dispatch &amp; Delivery
            </h2>
            <p>
              We ship across all serviceable postal PIN codes in India through reputed courier partners.
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Orders are ground fresh and dispatched within 24 to 48 hours of confirmation (excluding Sundays and national holidays).</li>
              <li>Estimated delivery timelines range from 2 to 6 business days depending on destination location.</li>
              <li>You will receive an automated tracking link via SMS/Email as soon as your consignment is handed over to the courier partner.</li>
            </ul>

            <h2 className="text-xl font-heading font-bold text-[var(--color-devam-brown)] mt-8 mb-3 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-[var(--color-devam-red)]" /> 5. Cancellation, Replacement &amp; Returns
            </h2>
            <p>
              Because our products are consumable food items:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Order Cancellation:</strong> You can cancel an order free of charge before it is dispatched by contacting us at +91 99796 40900 or via your Account Dashboard.</li>
              <li><strong>Damaged or Incorrect Items:</strong> If your package arrives damaged, tampered, or with incorrect items, report it within 48 hours of delivery with photos/unboxing video. We will issue a replacement or full refund immediately.</li>
              <li>For complete details, please consult our <Link href="/return-policy" className="text-[var(--color-devam-red)] hover:underline font-bold">Returns &amp; Refund Policy</Link>.</li>
            </ul>

            <h2 className="text-xl font-heading font-bold text-[var(--color-devam-brown)] mt-8 mb-3">
              6. Intellectual Property
            </h2>
            <p>
              The &ldquo;Devam&rdquo; trademark, Shreeji Gruh Udhyog logo, product packaging designs, photography, text descriptions, 
              and website codebase are protected intellectual property under the Trade Marks Act, 1999 and Copyright Act, 1957. 
              Unauthorized copying, reproduction, or redistribution is strictly prohibited.
            </p>

            <h2 className="text-xl font-heading font-bold text-[var(--color-devam-brown)] mt-8 mb-3">
              7. Limitation of Liability &amp; Governing Law
            </h2>
            <p>
              Devam (Shreeji Gruh Udhyog) shall not be liable for any indirect, incidental, or consequential damages resulting from the use or inability to use 
              the website or products. Our total liability for any claim arising out of a purchase shall not exceed the amount paid for the product in dispute.
            </p>
            <p>
              These Terms are governed by and construed in accordance with the laws of India. Any legal dispute, arbitration, or proceeding shall be subject to the 
              exclusive jurisdiction of the competent courts located in <strong>Dahod, Gujarat, India</strong>.
            </p>

            <h2 className="text-xl font-heading font-bold text-[var(--color-devam-brown)] mt-8 mb-3 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-[var(--color-devam-red)]" /> 8. Contact &amp; Support
            </h2>
            <div className="bg-amber-50/60 p-5 rounded-xl border border-amber-200/80 text-sm space-y-1.5 text-gray-800">
              <p className="font-bold text-[var(--color-devam-brown)]">SHREEJI GRUH UDHYOG</p>
              <p>Godown Plot No. 5-6, City Survey No. 3354, Block 1/12, Nr. Market Yard, Jhalod, Dahod, Gujarat - 389170</p>
              <p>Helpline: +91 99796 40900 / +91 99795 40900 (Mon - Sat, 9:00 AM - 7:00 PM IST)</p>
              <p>Email: <a href="mailto:info@thedevam.com" className="text-[var(--color-devam-red)] hover:underline">info@thedevam.com</a></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
