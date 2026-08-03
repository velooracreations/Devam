import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function DataPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 md:py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/" className="inline-flex items-center text-gray-500 hover:text-[var(--color-devam-red)] mb-6 transition-colors font-medium">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>
        
        <div className="bg-white rounded-2xl shadow-sm p-8 md:p-14">
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-gray-900 mb-10 text-center">Data & Privacy Policy</h1>
          
          <div className="prose prose-lg prose-red max-w-none text-gray-600 space-y-6">
            <p>
              At Devam, we are committed to protecting your privacy and ensuring the security of your personal data. 
              This Data Policy explains how we collect, use, and safeguard your information when you use our services.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">1. Information We Collect</h2>
            <p>
              We collect information that you provide directly to us, including your name, email address, phone number, 
              shipping addresses, and order history. We also automatically collect certain information about your device 
              and how you interact with our website to improve your shopping experience.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">2. How We Use Your Information</h2>
            <p>
              Your information is used primarily to process and fulfill your orders, provide customer support, and communicate 
              with you about your purchases. With your consent, we may also send you promotional offers and updates about Devam products.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">3. Data Protection & Security</h2>
            <p>
              We implement industry-standard security measures to protect your personal data from unauthorized access, 
              alteration, or disclosure. Payment information is securely processed by our authorized payment gateways 
              (such as Razorpay) and is never stored on our servers.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">4. Your Rights</h2>
            <p>
              You have the right to access, correct, or delete your personal data stored with us. 
              You can manage your information directly from your Account Dashboard or by contacting our support team.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">5. Updates to this Policy</h2>
            <p>
              We may update this policy periodically to reflect changes in our practices or regulatory requirements. 
              We encourage you to review this page regularly.
            </p>

            <div className="mt-12 p-6 bg-gray-50 rounded-xl border border-gray-100">
              <p className="text-sm text-gray-500 mb-0">
                Last Updated: August 2026<br />
                For any privacy-related questions, please contact us at support@devam.com
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
