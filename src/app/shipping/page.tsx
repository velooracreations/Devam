import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function ShippingPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 md:py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/" className="inline-flex items-center text-gray-500 hover:text-[var(--color-devam-red)] mb-6 transition-colors font-medium">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>
        
        <div className="bg-white rounded-2xl shadow-sm p-8 md:p-14">
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-gray-900 mb-10 text-center">Shipping Policy</h1>
          
          <div className="prose prose-lg prose-red max-w-none text-gray-600 space-y-6">
            <p>
              At Devam, we understand that prompt and reliable delivery is crucial when it comes to grocery and food items. 
              We are committed to delivering your premium wheat products fresh and on time.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">1. Delivery Coverage</h2>
            <p>
              We currently ship to major cities and zip codes across India. If your area is out of our delivery coverage, 
              you will be notified during the checkout process when entering your PIN code.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">2. Processing Time</h2>
            <p>
              All orders are processed and dispatched from our warehouse within 24 hours of successful payment confirmation 
              (excluding Sundays and public holidays).
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">3. Estimated Delivery Times</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Local & Metro Cities:</strong> 2-3 business days</li>
              <li><strong>Rest of India:</strong> 4-7 business days</li>
            </ul>
            <p className="text-sm italic">
              *Please note that delivery times are estimates and may be affected by external factors such as weather conditions or logistical delays.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">4. Shipping Charges</h2>
            <p>
              Shipping charges are calculated dynamically at checkout based on the total weight of your order and your delivery location. 
              We often run promotions for free shipping on orders above a certain threshold (e.g., Free Shipping on orders over ₹1000).
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">5. Tracking Your Order</h2>
            <p>
              Once your order has been dispatched, you will receive an SMS and email containing your tracking link. 
              You can also track your shipment directly from the "Orders" tab in your Account dashboard.
            </p>

            <div className="mt-12 p-6 bg-gray-50 rounded-xl border border-gray-100">
              <p className="text-sm text-gray-500 mb-0">
                Last Updated: August 2026<br />
                For any shipping-related queries, please contact us at info@thedevam.com
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
