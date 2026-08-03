import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function PaymentPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 md:py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/" className="inline-flex items-center text-gray-500 hover:text-[var(--color-devam-red)] mb-6 transition-colors font-medium">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>
        
        <div className="bg-white rounded-2xl shadow-sm p-8 md:p-14">
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-gray-900 mb-10 text-center">Payment Policy</h1>
          
          <div className="prose prose-lg prose-red max-w-none text-gray-600 space-y-6">
            <p>
              At Devam, we strive to make your shopping experience as seamless and secure as possible. 
              Our Payment Policy outlines the accepted payment methods and how we handle transactions on our platform.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">1. Accepted Payment Methods</h2>
            <p>
              We offer a wide variety of secure payment options through our Razorpay integration, including:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Credit and Debit Cards (Visa, MasterCard, RuPay, etc.)</li>
              <li>UPI (Unified Payments Interface)</li>
              <li>Net Banking across all major Indian banks</li>
              <li>Popular Digital Wallets</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">2. Payment Security</h2>
            <p>
              All transactions are securely processed through Razorpay, a leading and trusted payment gateway. 
              We do not store your credit card or banking details on our servers. All sensitive data is 
              encrypted and transmitted securely in compliance with PCI-DSS standards.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">3. Payment Failures</h2>
            <p>
              If a payment is unsuccessful or interrupted, no charges will be levied. 
              In the rare event that your account is debited but the order is not placed, the amount will be 
              automatically refunded to your original payment method within 5-7 business days by your bank.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">4. Order Confirmation</h2>
            <p>
              Your order is confirmed only after successful payment authorization. 
              You will receive an email and SMS confirmation containing your order details and payment receipt 
              once the transaction is successfully completed.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">5. Pricing & Taxes</h2>
            <p>
              All product prices listed on Devam are inclusive of applicable taxes unless stated otherwise. 
              The total amount displayed at checkout is the final amount you will be charged.
            </p>

            <div className="mt-12 p-6 bg-gray-50 rounded-xl border border-gray-100">
              <p className="text-sm text-gray-500 mb-0">
                Last Updated: August 2026<br />
                For payment-related assistance, please contact us at support@devam.com
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
