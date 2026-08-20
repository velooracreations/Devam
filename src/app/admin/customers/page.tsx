"use client";

import { useState, useEffect } from "react";
import { Search, Filter, Mail, Phone, ExternalLink, Globe, FileText, RefreshCw } from "lucide-react";

export default function CustomersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"customers" | "inquiries">("inquiries");
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchInquiries = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/distributors');
      const data = await res.json();
      if (data.success && data.leads) {
        setInquiries(data.leads);
      }
    } catch (err) {
      console.error("Failed to fetch inquiries", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  const customers = [
    { id: "CUS-001", name: "Jaydev Patidar", email: "jaydev@example.com", phone: "+91 9876543210", orders: 12, spent: 18450, type: "Retail", joined: "Jan 2026" },
    { id: "CUS-002", name: "Rahul Sharma", email: "rahul.s@example.com", phone: "+91 9123456789", orders: 3, spent: 4200, type: "Retail", joined: "Mar 2026" },
    { id: "CUS-003", name: "Ahmedabad Supermarket", email: "procurement@ahdsuper.com", phone: "+91 9988776655", orders: 24, spent: 245000, type: "B2B Wholesale", joined: "Nov 2025" },
    { id: "CUS-004", name: "Priya Patel", email: "priya1990@gmail.com", phone: "+91 9898989898", orders: 1, spent: 850, type: "Retail", joined: "Today" },
    { id: "CUS-005", name: "Sunrise Hotels Group", email: "kitchen@sunrise.com", phone: "+91 9777777777", orders: 8, spent: 86000, type: "B2B Wholesale", joined: "Feb 2026" },
  ];

  const filteredInquiries = inquiries.filter(i => 
    i.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.city?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Customers &amp; Form Inquiries</h1>
          <p className="text-sm text-gray-500 mt-1">View retail customers, B2B quotes, and Export form inquiries.</p>
        </div>
        
        {/* Navigation Tabs */}
        <div className="flex bg-gray-100 p-1.5 rounded-xl gap-1">
          <button
            onClick={() => setActiveTab("inquiries")}
            className={`px-4 py-2 text-sm font-bold rounded-lg transition-all flex items-center gap-2 ${
              activeTab === "inquiries"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            <Globe className="w-4 h-4 text-emerald-600" />
            Export &amp; Form Inquiries ({inquiries.length})
          </button>
          <button
            onClick={() => setActiveTab("customers")}
            className={`px-4 py-2 text-sm font-bold rounded-lg transition-all flex items-center gap-2 ${
              activeTab === "customers"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            Customers ({customers.length})
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 flex gap-4 justify-between items-center bg-gray-50/50">
          <div className="relative w-96">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by name, email or phone..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-devam-brown)]/20 focus:border-[var(--color-devam-brown)] text-sm"
            />
          </div>
          <button className="flex items-center gap-2 text-sm font-medium text-gray-600 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">
            <Filter className="w-4 h-4" /> Filter by Type
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {activeTab === "inquiries" ? (
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50 text-gray-500">
                <tr>
                  <th className="px-6 py-4 font-medium">Business / Name</th>
                  <th className="px-6 py-4 font-medium">Contact Details</th>
                  <th className="px-6 py-4 font-medium">Location</th>
                  <th className="px-6 py-4 font-medium">Requirements &amp; Message</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredInquiries.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      {loading ? "Loading inquiries..." : "No form inquiries submitted yet."}
                    </td>
                  </tr>
                ) : (
                  filteredInquiries.map((inquiry) => (
                    <tr key={inquiry._id || inquiry.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900">{inquiry.businessName || `${inquiry.firstName} ${inquiry.lastName}`}</div>
                        <div className="text-xs text-emerald-700 font-medium">{inquiry.firstName} {inquiry.lastName}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-gray-600 mb-1">
                          <Mail className="w-3 h-3 text-indigo-500" /> <a href={`mailto:${inquiry.email}`} className="hover:underline">{inquiry.email}</a>
                        </div>
                        {inquiry.phone && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <Phone className="w-3 h-3 text-emerald-500" /> <a href={`tel:${inquiry.phone}`} className="hover:underline">{inquiry.phone}</a>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                          <Globe className="w-3 h-3 text-emerald-600" />
                          {inquiry.city}, {inquiry.state}
                        </span>
                      </td>
                      <td className="px-6 py-4 max-w-xs truncate">
                        <div className="font-semibold text-gray-900">{inquiry.productsOfInterest || 'Export Quote Inquiry'}</div>
                        {inquiry.message && (
                          <div className="text-xs text-gray-500 truncate">{inquiry.message}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-500">
                        {inquiry.createdAt ? new Date(inquiry.createdAt).toLocaleDateString() : 'Recent'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50 text-gray-500">
                <tr>
                  <th className="px-6 py-4 font-medium">Customer Details</th>
                  <th className="px-6 py-4 font-medium">Contact</th>
                  <th className="px-6 py-4 font-medium">Type</th>
                  <th className="px-6 py-4 font-medium">Total Orders</th>
                  <th className="px-6 py-4 font-medium">Total Spent</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900">{customer.name}</div>
                      <div className="text-xs text-gray-500">Joined {customer.joined}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-600 mb-1">
                        <Mail className="w-3 h-3" /> {customer.email}
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Phone className="w-3 h-3" /> {customer.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        customer.type === "B2B Wholesale" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"
                      }`}>
                        {customer.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">{customer.orders}</td>
                    <td className="px-6 py-4 font-bold text-[var(--color-devam-brown)]">₹{customer.spent.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-gray-400 hover:text-[var(--color-devam-brown)] p-1 transition-colors ml-auto flex items-center">
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
