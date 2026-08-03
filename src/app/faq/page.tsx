"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';

const faqs = [
  {
    question: "What products does Devam sell?",
    answer: "Devam offers a premium range of agricultural FMCG products, primarily focusing on high-quality wheat and related grains sourced directly from the finest fields."
  },
  {
    question: "How long does shipping take?",
    answer: "Standard delivery typically takes 3-5 business days depending on your location. We process and dispatch orders within 24 hours of successful payment."
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major Credit and Debit Cards, UPI, Net Banking, and popular Digital Wallets securely through Razorpay."
  },
  {
    question: "Can I cancel my order?",
    answer: "Orders can only be cancelled before they are dispatched from our warehouse. Please contact our support team immediately if you wish to cancel."
  },
  {
    question: "How should I store Devam wheat products?",
    answer: "We recommend storing our wheat and grain products in an airtight container in a cool, dry place away from direct sunlight to maintain optimal freshness."
  },
  {
    question: "Do you offer bulk purchasing or wholesale rates?",
    answer: "Yes, we do! If you are interested in becoming a distributor or purchasing in bulk, please visit our 'Become a Distributor' page or contact us at info@thedevam.com."
  }
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 md:py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/" className="inline-flex items-center text-gray-500 hover:text-[var(--color-devam-red)] mb-6 transition-colors font-medium">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>
        
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-gray-900 mb-4">Frequently Asked Questions</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">Have questions? We're here to help.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-200"
            >
              <button
                onClick={() => toggleAccordion(index)}
                className="w-full px-6 py-4 text-left flex justify-between items-center focus:outline-none"
              >
                <span className="font-semibold text-gray-900 pr-8">{faq.question}</span>
                {openIndex === index ? (
                  <ChevronUp className="w-5 h-5 text-[var(--color-devam-red)] flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                )}
              </button>
              
              {openIndex === index && (
                <div className="px-6 pb-6">
                  <p className="text-gray-600 text-lg leading-relaxed border-t border-gray-50 pt-4">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 text-center p-8 bg-white rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-xl font-heading font-semibold text-gray-900 mb-2">Still have questions?</h3>
          <p className="text-gray-600 mb-6">If you cannot find answer to your question in our FAQ, you can always contact us.</p>
          <a 
            href="mailto:info@thedevam.com"
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-[var(--color-devam-red)] hover:bg-red-700 transition-colors"
          >
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
}
