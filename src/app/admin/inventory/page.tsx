"use client";

import { useState } from "react";
import { Plus, Search, Filter, Edit2, Trash2 } from "lucide-react";

export default function InventoryPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const products = [
    { id: "SKU-1001", name: "Premium Sharbati Atta", category: "Flours", price: 350, stock: 125, status: "In Stock" },
    { id: "SKU-1002", name: "Kashmiri Chilli Powder", category: "Spices", price: 180, stock: 45, status: "Low Stock" },
    { id: "SKU-1003", name: "Unpolished Tur Dal", category: "Grains", price: 220, stock: 8, status: "Critical" },
    { id: "SKU-1004", name: "Organic Basmati Rice", category: "Grains", price: 850, stock: 200, status: "In Stock" },
    { id: "SKU-1005", name: "Turmeric Powder", category: "Spices", price: 120, stock: 0, status: "Out of Stock" },
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your products, pricing, and stock levels.</p>
        </div>
        <button className="bg-[var(--color-devam-brown)] text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-[#6b1e11] transition-colors">
          <Plus className="w-4 h-4" /> Add New Product
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-50/50">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search products by name or SKU..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-devam-brown)]/20 focus:border-[var(--color-devam-brown)] text-sm"
            />
          </div>
          <button className="flex items-center gap-2 text-sm font-medium text-gray-600 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 w-full sm:w-auto justify-center">
            <Filter className="w-4 h-4" /> Filter
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="px-6 py-4 font-medium">Product / SKU</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium">Price (₹)</th>
                <th className="px-6 py-4 font-medium">Stock Level</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-900">{product.name}</div>
                    <div className="text-xs text-gray-500">{product.id}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{product.category}</td>
                  <td className="px-6 py-4 font-medium text-gray-900">₹{product.price}</td>
                  <td className="px-6 py-4 text-gray-600">{product.stock} units</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                      product.status === "In Stock" ? "bg-green-50 text-green-700 border-green-200" :
                      product.status === "Low Stock" ? "bg-yellow-50 text-yellow-700 border-yellow-200" :
                      product.status === "Critical" ? "bg-orange-50 text-orange-700 border-orange-200" :
                      "bg-red-50 text-red-700 border-red-200"
                    }`}>
                      {product.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-gray-400 hover:text-[var(--color-devam-brown)] p-1 transition-colors mr-2">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button className="text-gray-400 hover:text-red-600 p-1 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Mock */}
        <div className="p-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
          <div>Showing 1 to 5 of 45 products</div>
          <div className="flex gap-1">
            <button className="px-3 py-1 border border-gray-200 rounded text-gray-400 cursor-not-allowed">Previous</button>
            <button className="px-3 py-1 bg-[var(--color-devam-brown)] text-white rounded">1</button>
            <button className="px-3 py-1 border border-gray-200 rounded hover:bg-gray-50">2</button>
            <button className="px-3 py-1 border border-gray-200 rounded hover:bg-gray-50">3</button>
            <button className="px-3 py-1 border border-gray-200 rounded hover:bg-gray-50">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
