import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Lock, Eye, FileText, Phone, Mail, MapPin } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | Devam (Shreeji Gruh Udhyog)',
  description: 'Learn how Devam (Shreeji Gruh Udhyog) collects, protects, and manages your personal information in compliance with Indian data protection laws and DPDP Act 2023.',
  alternates: {
    canonical: 'https://thedevam.com/privacy-policy',
  },
  openGraph: {
    title: 'Privacy Policy | Devam (Shreeji Gruh Udhyog)',
    description: 'Our commitment to protecting your privacy, data security, and consumer rights.',
    url: 'https://thedevam.com/privacy-policy',
    siteName: 'Devam',
  },
};

export default function PrivacyPolicyPage() {
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
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200 mb-4">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              DPDP Act 2023 &amp; IT Act Compliant
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold text-[var(--color-devam-brown)]">
              Privacy Policy
            </h1>
            <p className="text-sm text-gray-500 mt-2">
              Last Updated: October 2026 | Effective Date: October 1, 2026
            </p>
          </div>
          
          <div className="prose prose-gray max-w-none text-gray-700 space-y-6 text-sm sm:text-base leading-relaxed">
            <p>
              Welcome to <strong>Devam</strong>, operated by <strong>Shreeji Gruh Udhyog</strong> (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;). 
              We respect your privacy and are committed to protecting the personal data of our customers, website visitors, and distributors. 
              This Privacy Policy details how we collect, handle, store, and safeguard your personal information when you visit or purchase from 
              <Link href="https://thedevam.com" className="text-[var(--color-devam-red)] hover:underline ml-1">https://thedevam.com</Link>.
            </p>

            <h2 className="text-xl font-heading font-bold text-[var(--color-devam-brown)] mt-8 mb-3 flex items-center gap-2">
              <Eye className="w-5 h-5 text-[var(--color-devam-red)]" /> 1. Information We Collect
            </h2>
            <p>
              We collect information necessary to provide you with seamless ordering, fresh product delivery, and customer support:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Personal Identifiers:</strong> Name, phone number, email address, delivery addresses, and billing details provided during checkout or account registration.
              </li>
              <li>
                <strong>Order Details:</strong> Products purchased, quantities, transaction records, invoice history, and delivery instructions.
              </li>
              <li>
                <strong>Payment Information:</strong> All online payments are handled securely by RBI-authorized payment gateways (e.g. Razorpay). We do <em>not</em> store your full credit/debit card numbers, UPI PINs, or bank passwords on our servers.
              </li>
              <li>
                <strong>Technical &amp; Usage Data:</strong> IP address, device type, browser information, pages visited, and cookies to improve browsing speed and remember your cart items.
              </li>
            </ul>

            <h2 className="text-xl font-heading font-bold text-[var(--color-devam-brown)] mt-8 mb-3 flex items-center gap-2">
              <FileText className="w-5 h-5 text-[var(--color-devam-red)]" /> 2. How We Use Your Information
            </h2>
            <p>
              Your data is utilized strictly for legitimate business and fulfillment purposes:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Processing, packing, dispatching, and tracking your flour and spices orders.</li>
              <li>Sending automated order confirmations, dispatch updates, and delivery intimations via SMS, WhatsApp, or Email.</li>
              <li>Providing customer support, resolving queries, and processing return or refund requests.</li>
              <li>Preventing fraud, bot traffic, and unauthorized transactions.</li>
              <li>Complying with statutory tax laws, GST invoicing, and regulatory obligations under Indian law.</li>
            </ul>

            <h2 className="text-xl font-heading font-bold text-[var(--color-devam-brown)] mt-8 mb-3 flex items-center gap-2">
              <Lock className="w-5 h-5 text-[var(--color-devam-red)]" /> 3. Data Protection &amp; Security Measures
            </h2>
            <p>
              We implement industry-grade technical and organizational safeguards:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Encryption in Transit:</strong> End-to-end 256-bit SSL/TLS HTTPS encryption across all web pages and API communications.</li>
              <li><strong>Access Control:</strong> Administrative access to order records is restricted to verified personnel and protected with multi-factor authentication.</li>
              <li><strong>Zero Sale of Data:</strong> We <strong>never sell, rent, or trade</strong> your personal information to third-party data brokers or advertisers.</li>
            </ul>

            <h2 className="text-xl font-heading font-bold text-[var(--color-devam-brown)] mt-8 mb-3">
              4. Cookies and Tracking Technologies
            </h2>
            <p>
              Our website uses essential and functional cookies to ensure your cart persists during your visit, authenticate user sessions, 
              and analyze anonymous aggregate traffic to improve site speed. You can manage or decline non-essential cookies via our Cookie Consent banner 
              or through your browser settings.
            </p>

            <h2 className="text-xl font-heading font-bold text-[var(--color-devam-brown)] mt-8 mb-3">
              5. Third-Party Service Providers
            </h2>
            <p>
              To complete fulfillment and communicate with you, we partner with trusted, industry-leading service providers who adhere to strict data security standards:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Payment Processing:</strong> Razorpay (PCI-DSS Level 1 compliant).</li>
              <li><strong>Logistics &amp; Courier Partners:</strong> Authorized national and regional courier networks for doorstep parcel dispatch.</li>
              <li><strong>Transactional Notifications:</strong> MSG91 &amp; Nodemailer / Google Cloud Infrastructure for order alert delivery.</li>
            </ul>

            <h2 className="text-xl font-heading font-bold text-[var(--color-devam-brown)] mt-8 mb-3">
              6. Your Rights Under DPDP Act 2023
            </h2>
            <p>
              As a user residing in India, you are entitled to:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Access a summary of the personal data we hold about you.</li>
              <li>Request correction of inaccurate or outdated information in your profile.</li>
              <li>Request erasure or deletion of your account and personal data, subject to statutory GST and accounting retention requirements.</li>
              <li>Withdraw consent for promotional communications at any time.</li>
            </ul>

            <h2 className="text-xl font-heading font-bold text-[var(--color-devam-brown)] mt-8 mb-3">
              7. Grievance Officer &amp; Contact Information
            </h2>
            <p>
              In accordance with the Information Technology Act 2000 and Digital Personal Data Protection Act 2023, the details of our Grievance Officer are provided below:
            </p>
            <div className="bg-amber-50/60 p-5 rounded-xl border border-amber-200/80 text-sm space-y-2 text-gray-800">
              <p className="font-bold text-[var(--color-devam-brown)]">
                SHREEJI GRUH UDHYOG (Devam Brand)
              </p>
              <p className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[var(--color-devam-red)] flex-shrink-0" />
                Godown Plot No. 5-6, City Survey No. 3354, Block 1/12, Nr. Market Yard, Jhalod, Dahod, Gujarat - 389170, India
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[var(--color-devam-red)] flex-shrink-0" />
                +91 99796 40900 / +91 99795 40900
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[var(--color-devam-red)] flex-shrink-0" />
                info@thedevam.com / thedevam2024@gmail.com
              </p>
              <p className="text-xs text-gray-500 pt-2 border-t border-amber-200">
                Grievance response timeline: All privacy complaints are acknowledged within 24 hours and addressed within 15 business days.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
