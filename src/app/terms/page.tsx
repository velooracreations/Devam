import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/" className="inline-flex items-center text-gray-500 hover:text-[var(--color-devam-red)] mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>
        
        <div className="bg-white rounded-2xl shadow-sm p-8 md:p-12">
          <h1 className="text-3xl font-heading font-bold text-gray-900 mb-8">Terms of Service</h1>
          
          <div className="prose prose-red max-w-none text-gray-600 space-y-6">
            <p>
              Welcome to Devam (operated by Shreeji Gruh Udhyog). By accessing or using our website and services, 
              you agree to comply with and be bound by these Terms of Service.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">1. Use of the Website</h2>
            <p>
              You must be at least 18 years of age to use this website. You agree to use the website only for lawful purposes 
              and in a way that does not infringe the rights of, restrict, or inhibit anyone else's use of the website.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">2. Product Information</h2>
            <p>
              We strive to ensure that all product descriptions, images, and prices are accurate. However, errors may occur. 
              Devam reserves the right to correct any errors and to change or update information at any time without prior notice. 
              As our products are agricultural in nature, slight variations in color or texture may occur.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">3. User Accounts</h2>
            <p>
              When you create an account with us, you must provide accurate and complete information. 
              You are responsible for maintaining the confidentiality of your account password and for all activities that occur under your account.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">4. Intellectual Property</h2>
            <p>
              All content on this website, including text, graphics, logos, images, and software, is the property of Devam 
              or its content suppliers and is protected by intellectual property laws. You may not reproduce, duplicate, 
              or copy any material without express written permission.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">5. Limitation of Liability</h2>
            <p>
              Devam shall not be liable for any direct, indirect, incidental, or consequential damages resulting from 
              the use or inability to use our services or products.
            </p>

            <div className="mt-12 p-6 bg-gray-50 rounded-xl border border-gray-100">
              <p className="text-sm text-gray-500 mb-0">
                Last Updated: August 2026<br />
                For legal inquiries, please contact us at info@thedevam.com
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
