import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function ReturnPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/" className="inline-flex items-center text-gray-500 hover:text-[var(--color-devam-red)] mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>
        
        <div className="bg-white rounded-2xl shadow-sm p-8 md:p-12">
          <h1 className="text-3xl font-heading font-bold text-gray-900 mb-8">Return & Refund Policy</h1>
          
          <div className="prose prose-red max-w-none text-gray-600 space-y-6">
            <p>
              Devam is committed to delivering the highest quality premium wheat and agricultural products. 
              Because our products are consumable food items, our return policy is designed to ensure safety and hygiene.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">1. Eligibility for Returns</h2>
            <p>
              Due to the perishable nature of food items, returns or replacements are only accepted under the following conditions:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>The product packaging was damaged or tampered with prior to delivery.</li>
              <li>You received a product different from what you ordered.</li>
              <li>The product was found to be spoiled or contaminated upon opening (must be reported within 24 hours).</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">2. Non-Returnable Items</h2>
            <p>
              We cannot accept returns for products that have been heavily used, improperly stored after delivery, 
              or if the claim is made after 48 hours of successful delivery.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">3. How to Request a Return</h2>
            <p>
              To initiate a return or replacement, please contact our customer support team within 48 hours of delivery. 
              Provide your Order ID, a brief description of the issue, and clear photographs of the product and its packaging. 
              Our team will review your request and guide you through the process.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">4. Refunds Process</h2>
            <p>
              If your return request is approved for a refund, the amount will be processed back to your original 
              payment method. Please allow 5-7 business days for the refunded amount to reflect in your bank account 
              or credit card statement.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">5. Order Cancellations</h2>
            <p>
              Orders can only be cancelled before they are dispatched from our warehouse. Once an order is in transit, 
              it cannot be cancelled.
            </p>

            <div className="mt-12 p-6 bg-gray-50 rounded-xl border border-gray-100">
              <p className="text-sm text-gray-500 mb-0">
                Last Updated: August 2026<br />
                For returns and support, please contact us at support@devam.com
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
