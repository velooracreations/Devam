"use client";

import { useState } from "react";
import { Building2, Mail, Phone, MapPin, CheckCircle } from "lucide-react";

export default function DistributorsPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    businessName: "",
    email: "",
    phone: "",
    city: "",
    state: "",
    productsOfInterest: "All Products",
    message: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch('/api/distributors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to submit application");
      
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[var(--color-devam-cream)] min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-[var(--color-devam-brown)] py-20 text-center text-white overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-10 mix-blend-overlay">
          {/* Subtle background texture */}
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">Partner with Devam</h1>
          <p className="text-lg text-white/80 font-body max-w-2xl mx-auto">
            Join our fast-growing network of distributors and bring India's finest premium flour, spices, and grains to your market. We offer competitive margins, marketing support, and uncompromising quality.
          </p>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          
          {/* Left Column: Info */}
          <div>
            <h2 className="text-3xl font-heading font-bold text-[var(--color-devam-brown)] mb-6">
              Why Become a Distributor?
            </h2>
            <div className="space-y-8 mb-12">
              <div className="flex">
                <div className="flex-shrink-0 mt-1">
                  <CheckCircle className="w-6 h-6 text-[var(--color-devam-red)]" />
                </div>
                <div className="ml-4">
                  <h4 className="text-lg font-bold text-[var(--color-devam-brown)]">Premium Quality Products</h4>
                  <p className="mt-1 text-[var(--color-devam-brown)]/80 text-sm">
                    We source the finest raw materials directly from farmers, ensuring 100% purity and unmatched taste.
                  </p>
                </div>
              </div>
              <div className="flex">
                <div className="flex-shrink-0 mt-1">
                  <CheckCircle className="w-6 h-6 text-[var(--color-devam-red)]" />
                </div>
                <div className="ml-4">
                  <h4 className="text-lg font-bold text-[var(--color-devam-brown)]">Wholesale Pricing</h4>
                  <p className="mt-1 text-[var(--color-devam-brown)]/80 text-sm">
                    Enjoy competitive wholesale pricing structures designed to support your business growth.
                  </p>
                </div>
              </div>
              <div className="flex">
                <div className="flex-shrink-0 mt-1">
                  <CheckCircle className="w-6 h-6 text-[var(--color-devam-red)]" />
                </div>
                <div className="ml-4">
                  <h4 className="text-lg font-bold text-[var(--color-devam-brown)]">Marketing & Sales Support</h4>
                  <p className="mt-1 text-[var(--color-devam-brown)]/80 text-sm">
                    We provide point-of-sale materials, brand awareness campaigns, and dedicated relationship managers.
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Details */}
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold text-[var(--color-devam-brown)] mb-6">Direct Contact</h3>
              <div className="space-y-5">
                <div className="flex items-start text-[var(--color-devam-brown)]/80">
                  <Building2 className="w-5 h-5 mr-3 mt-1 text-[var(--color-devam-red)] flex-shrink-0" />
                  <span className="leading-relaxed">
                    GODOWN PLOT NO 5-6, City Survey no-3354,<br />
                    BLOCK 1/12 IN MARKET YARD, JHALOD,<br />
                    DAHOD, Gujarat-389170, India
                  </span>
                </div>
                <div className="flex items-center text-[var(--color-devam-brown)]/80">
                  <Phone className="w-5 h-5 mr-3 text-[var(--color-devam-red)] flex-shrink-0" />
                  <span>+91 99796 40900</span>
                </div>
                <div className="flex items-center text-[var(--color-devam-brown)]/80">
                  <Mail className="w-5 h-5 mr-3 text-[var(--color-devam-red)] flex-shrink-0" />
                  <span>info@thedevam.com</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Form */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="p-8 md:p-10">
              <h3 className="text-2xl font-heading font-bold text-[var(--color-devam-brown)] mb-2">
                Distributorship Application
              </h3>
              <p className="text-[var(--color-devam-brown)]/70 mb-8 text-sm">
                Fill out the form below and our B2B team will contact you within 24-48 hours.
              </p>

              {submitted ? (
                <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h4 className="text-xl font-bold text-green-800 mb-2">Application Received!</h4>
                  <p className="text-green-700">
                    Thank you for your interest in partnering with Devam. Our team will review your application and get back to you shortly.
                  </p>
                  <button 
                    onClick={() => setSubmitted(false)}
                    className="mt-6 text-sm font-medium text-green-700 hover:text-green-800 underline"
                  >
                    Submit another application
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                      {error}
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-[var(--color-devam-brown)] mb-1">First Name *</label>
                      <input required name="firstName" value={formData.firstName} onChange={handleInputChange} type="text" className="w-full px-4 py-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-[var(--color-devam-red)] focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white" placeholder="John" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--color-devam-brown)] mb-1">Last Name *</label>
                      <input required name="lastName" value={formData.lastName} onChange={handleInputChange} type="text" className="w-full px-4 py-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-[var(--color-devam-red)] focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white" placeholder="Doe" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--color-devam-brown)] mb-1">Business/Company Name *</label>
                    <input required name="businessName" value={formData.businessName} onChange={handleInputChange} type="text" className="w-full px-4 py-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-[var(--color-devam-red)] focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white" placeholder="ABC Enterprises" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-[var(--color-devam-brown)] mb-1">Email Address *</label>
                      <input required name="email" value={formData.email} onChange={handleInputChange} type="email" className="w-full px-4 py-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-[var(--color-devam-red)] focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white" placeholder="john@example.com" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--color-devam-brown)] mb-1">Phone Number *</label>
                      <input required name="phone" value={formData.phone} onChange={handleInputChange} type="tel" className="w-full px-4 py-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-[var(--color-devam-red)] focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white" placeholder="+91 98765 43210" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-[var(--color-devam-brown)] mb-1">City *</label>
                      <input required name="city" value={formData.city} onChange={handleInputChange} type="text" className="w-full px-4 py-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-[var(--color-devam-red)] focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white" placeholder="Ahmedabad" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--color-devam-brown)] mb-1">State *</label>
                      <input required name="state" value={formData.state} onChange={handleInputChange} type="text" className="w-full px-4 py-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-[var(--color-devam-red)] focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white" placeholder="Gujarat" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--color-devam-brown)] mb-1">Products of Interest</label>
                    <select name="productsOfInterest" value={formData.productsOfInterest} onChange={handleInputChange} className="w-full px-4 py-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-[var(--color-devam-red)] focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white">
                      <option>All Products</option>
                      <option>Premium Flours (Atta, Besan, etc.)</option>
                      <option>Spices & Masalas</option>
                      <option>Whole Grains & Pulses</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--color-devam-brown)] mb-1">Additional Message/Questions</label>
                    <textarea name="message" value={formData.message} onChange={handleInputChange} rows={4} className="w-full px-4 py-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-[var(--color-devam-red)] focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white" placeholder="Tell us about your current distribution network..."></textarea>
                  </div>

                  <button disabled={loading} type="submit" className={`w-full bg-[var(--color-devam-red)] text-white font-bold uppercase tracking-wider py-4 rounded shadow-lg flex items-center justify-center transition-colors mt-4 ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-red-700'}`}>
                    {loading ? "Submitting..." : "Submit Application"}
                  </button>
                </form>
              )}
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
