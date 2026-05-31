"use client";

import { useState } from "react";
import { Search, Filter, Mail, Phone, ExternalLink } from "lucide-react";

export default function CustomersPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const customers = [
    { id: "CUS-001", name: "Jaydev Patidar", email: "jaydev@example.com", phone: "+91 9876543210", orders: 12, spent: 18450, type: "Retail", joined: "Jan 2026" },
    { id: "CUS-002", name: "Rahul Sharma", email: "rahul.s@example.com", phone: "+91 9123456789", orders: 3, spent: 4200, type: "Retail", joined: "Mar 2026" },
    { id: "CUS-003", name: "Ahmedabad Supermarket", email: "procurement@ahdsuper.com", phone: "+91 9988776655", orders: 24, spent: 245000, type: "B2B Wholesale", joined: "Nov 2025" },
    { id: "CUS-004", name: "Priya Patel", email: "priya1990@gmail.com", phone: "+91 9898989898", orders: 1, spent: 850, type: "Retail", joined: "Today" },
    { id: "CUS-005", name: "Sunrise Hotels Group", email: "kitchen@sunrise.com", phone: "+91 9777777777", orders: 8, spent: 86000, type: "B2B Wholesale", joined: "Feb 2026" },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
          <p className="text-sm text-gray-500 mt-1">Manage retail customers and B2B wholesale partners.</p>
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
        </div>
      </div>
    </div>
  );
}
