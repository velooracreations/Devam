"use client";

import { useState } from "react";
import Image from "next/image";
import { Globe, Plane, PackageCheck, FileSignature } from "lucide-react";

export default function ExportPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    fullName: "",
    companyName: "",
    email: "",
    destinationCountry: "",
    requirements: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
        body: JSON.stringify({
          firstName: formData.fullName,
          lastName: "(Export Quote)",
          businessName: formData.companyName,
          email: formData.email,
          phone: "Export Inquiry",
          city: formData.destinationCountry,
          state: "International",
          productsOfInterest: "Export Products",
          message: formData.requirements
        })
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to submit export inquiry");
      
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section */}
      <div className="relative h-[60vh] flex items-center justify-center">
        <div className="absolute inset-0 z-0">
          <Image
            src="/export_hero.png"
            alt="Devam Foods Export Packaging"
            fill
            className="object-cover brightness-75"
            priority
          />
        </div>
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-heading font-bold text-white mb-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
            Global Export
          </h1>
          <p className="text-xl md:text-2xl text-white/90 font-medium max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150">
            Premium Indian spices and flours, securely packaged and shipped worldwide for B2B partners.
          </p>
        </div>
      </div>

      {/* Why Partner Section */}
      <section className="py-24 bg-white px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-heading font-bold text-[var(--color-devam-brown)] mb-4">Why Partner With Devam?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">We provide end-to-end export solutions ensuring product integrity, compliance, and timely delivery across borders.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Globe className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-bold text-xl text-[var(--color-devam-brown)] mb-3">Global Reach</h3>
              <p className="text-gray-600 text-sm">We export to multiple continents with deep understanding of regional compliance and import regulations.</p>
            </div>
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <PackageCheck className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-bold text-xl text-[var(--color-devam-brown)] mb-3">Bulk Packaging</h3>
              <p className="text-gray-600 text-sm">Industrial-grade, moisture-proof kraft paper sacks and secure palletization to ensure freshness upon arrival.</p>
            </div>
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileSignature className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-bold text-xl text-[var(--color-devam-brown)] mb-3">Certified Quality</h3>
              <p className="text-gray-600 text-sm">All shipments come with necessary phytosanitary certificates, certificates of origin, and lab testing reports.</p>
            </div>
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Plane className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="font-bold text-xl text-[var(--color-devam-brown)] mb-3">Timely Logistics</h3>
              <p className="text-gray-600 text-sm">Strong partnerships with global freight forwarders for efficient sea and air freight logistics.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Inquiry Form Section */}
      <section className="py-24 bg-[var(--color-devam-cream)] px-4">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8 md:p-12 border border-[var(--color-devam-brown)]/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-devam-red)]/5 rounded-full blur-3xl"></div>
          
          <div className="relative z-10">
            <h2 className="text-3xl font-heading font-bold text-[var(--color-devam-brown)] mb-2">Request an Export Quote</h2>
            <p className="text-gray-600 mb-8">Fill out the form below and our international sales team will contact you within 24 hours.</p>

            {submitted ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <PackageCheck className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Export Inquiry Received!</h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  Thank you for contacting Devam. Our international B2B export team will review your requirements and respond within 24 hours.
                </p>
              </div>
            ) : (
              <form className="space-y-6" onSubmit={handleSubmit}>
                {error && (
                  <div className="bg-red-50 text-red-700 p-4 rounded-lg text-sm font-medium">
                    {error}
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Full Name *</label>
                    <input 
                      required 
                      type="text" 
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-devam-red)]" 
                      placeholder="John Doe" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Company Name *</label>
                    <input 
                      required 
                      type="text" 
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-devam-red)]" 
                      placeholder="Global Spices LLC" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Email Address *</label>
                    <input 
                      required 
                      type="email" 
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-devam-red)]" 
                      placeholder="john@company.com" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Destination Country *</label>
                    <input 
                      required 
                      type="text" 
                      name="destinationCountry"
                      value={formData.destinationCountry}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-devam-red)]" 
                      placeholder="United States" 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Product Requirements & Quantities *</label>
                  <textarea 
                    required 
                    rows={4} 
                    name="requirements"
                    value={formData.requirements}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-devam-red)]" 
                    placeholder="e.g. 5 Metric Tons of Ghavu Lot, 2 Metric Tons of Dhana Jiru. Looking for FOB pricing..."
                  ></textarea>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-[var(--color-devam-brown)] text-white font-bold text-lg py-4 rounded-lg hover:bg-[var(--color-devam-red)] transition-colors disabled:opacity-50"
                >
                  {loading ? "Submitting Quote Request..." : "Submit Inquiry"}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
