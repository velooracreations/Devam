"use client";

import { useState, useEffect } from "react";
import { Save, CheckCircle2, Truck } from "lucide-react";
import { useSettingsStore } from "@/store/settingsStore";

export default function AdminShippingPage() {
  const [saved, setSaved] = useState(false);
  const { shipping, updateShipping } = useSettingsStore();
  const [shippingForm, setShippingForm] = useState(shipping);

  useEffect(() => {
    setShippingForm(shipping);
  }, [shipping]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateShipping(shippingForm);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Shipping Rules</h2>
        <p className="text-gray-500 mt-1">Configure delivery charges, free shipping thresholds, and bulk order logic.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <Truck className="w-5 h-5 text-gray-500" />
              Standard Delivery
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Base Flat Rate (₹)</label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-gray-500 font-bold">₹</span>
                  <input 
                    type="number" 
                    value={shippingForm.flatRate}
                    onChange={(e) => setShippingForm({...shippingForm, flatRate: Number(e.target.value)})}
                    className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-devam-red)] focus:border-transparent font-bold"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">Standard delivery fee applied to all orders.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Free Shipping Threshold (₹)</label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-gray-500 font-bold">₹</span>
                  <input 
                    type="number" 
                    value={shippingForm.freeShippingThreshold}
                    onChange={(e) => setShippingForm({...shippingForm, freeShippingThreshold: Number(e.target.value)})}
                    className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-devam-red)] focus:border-transparent font-bold"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">Orders above this amount will get free shipping.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-orange-50 border-orange-100">
            <h3 className="font-bold text-orange-900 flex items-center gap-2">
              <Truck className="w-5 h-5 text-orange-600" />
              Bulk & Heavy Orders
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bulk/Heavy Order Threshold (Kg)</label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-gray-500 font-bold">Kg</span>
                  <input 
                    type="number" 
                    value={shippingForm.bulkWeightThreshold}
                    onChange={(e) => setShippingForm({...shippingForm, bulkWeightThreshold: Number(e.target.value)})}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-devam-red)] focus:border-transparent font-bold text-orange-600"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">Orders weighing over this amount are considered bulk/heavy.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bulk Shipping Rate (₹)</label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-gray-500 font-bold">₹</span>
                  <input 
                    type="number" 
                    value={shippingForm.bulkShippingRate}
                    onChange={(e) => setShippingForm({...shippingForm, bulkShippingRate: Number(e.target.value)})}
                    className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-devam-red)] focus:border-transparent font-bold text-orange-600"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">Delivery fee applied to bulk/heavy orders.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Save Actions */}
        <div className="flex items-center gap-4 pt-4">
          <button 
            type="submit"
            className="bg-[var(--color-devam-red)] text-white font-bold py-3 px-8 rounded-lg flex items-center gap-2 hover:bg-[#d62828] transition-colors shadow-sm"
          >
            <Save className="w-5 h-5" />
            Save Changes
          </button>
          
          {saved && (
            <span className="text-green-600 font-bold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-5 h-5" />
              Shipping Rules Updated
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
