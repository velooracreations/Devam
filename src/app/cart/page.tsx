"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Trash2, Minus, Plus, ArrowRight, ShieldCheck } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useSettingsStore } from "@/store/settingsStore";

export default function CartPage() {
  const [mounted, setMounted] = useState(false);
  const cartItems = useCartStore((state) => state.items);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const getCartTotal = useCartStore((state) => state.getCartTotal);

  const shippingRules = useSettingsStore((state) => state.shipping);

  // Prevent hydration errors with Zustand persist
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const calculateWeightInKg = (weightStr: string, qty: number) => {
    const match = String(weightStr).match(/^([\d.]+)\s*(.*)$/i);
    if (!match) return 0;
    const val = parseFloat(match[1]);
    const unit = match[2].toLowerCase();
    
    let kg = val;
    if (unit === 'g' || unit === 'gm' || unit === 'grams') {
      kg = val / 1000;
    }
    return kg * qty;
  };
  const totalWeightKg = cartItems.reduce((sum, item) => sum + calculateWeightInKg(item.weight || "1 Kg", item.quantity), 0);

  const subtotal = getCartTotal();
  
  let shippingCost = shippingRules.flatRate;
  let shippingStatus = "Standard";
  
  if (totalWeightKg > shippingRules.bulkWeightThreshold) {
    shippingCost = shippingRules.bulkShippingRate;
    shippingStatus = "Bulk/Heavy";
  } else if (subtotal >= shippingRules.freeShippingThreshold) {
    shippingCost = 0;
    shippingStatus = "Free";
  }

  const total = subtotal + shippingCost;

  return (
    <div className="bg-gray-50 min-h-screen py-12 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-heading font-bold text-gray-900 mb-8">Shopping Cart</h1>
        
        {cartItems.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center border border-gray-100">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">Looks like you haven't added any premium Devam products to your cart yet.</p>
            <Link href="/shop" className="inline-flex items-center justify-center px-8 py-4 bg-[var(--color-devam-red)] text-white rounded-lg font-bold hover:bg-[#d62828] transition-colors shadow-lg shadow-red-500/20">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Cart Items List */}
            <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="hidden md:grid grid-cols-12 gap-4 p-6 bg-gray-50 border-b border-gray-100 text-sm font-bold text-gray-500 uppercase tracking-wider">
                <div className="col-span-5">Product</div>
                <div className="col-span-2 text-center">Price</div>
                <div className="col-span-3 text-center">Quantity</div>
                <div className="col-span-2 text-right">Total</div>
              </div>
              
              <div className="divide-y divide-gray-100">
                {cartItems.map((item) => (
                  <div key={item.id} className="p-6 flex flex-col md:grid md:grid-cols-12 gap-4 items-center">
                    {/* Mobile: Product Info */}
                    <div className="col-span-5 flex items-center w-full">
                      <div className="w-20 h-20 bg-gray-100 rounded-lg flex-shrink-0 relative overflow-hidden">
                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                      </div>
                      <div className="ml-4 flex-1">
                        <Link href={`/product/${item.id}`} className="font-bold text-gray-900 hover:text-[var(--color-devam-red)] transition-colors line-clamp-2">
                          {item.name}
                        </Link>
                        <p className="text-sm text-gray-500 mt-1">{item.weight}</p>
                        {/* Mobile Price */}
                        <div className="md:hidden mt-2 font-bold text-gray-900">₹{item.price}</div>
                      </div>
                    </div>
                    
                    {/* Desktop Price */}
                    <div className="hidden md:block col-span-2 text-center font-bold text-gray-900">
                      ₹{item.price}
                    </div>
                    
                    {/* Quantity Controls */}
                    <div className="col-span-3 flex items-center justify-center w-full md:w-auto mt-4 md:mt-0">
                      <div className="flex items-center border border-gray-200 rounded-lg bg-gray-50 p-1">
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-200 rounded transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-10 text-center font-bold text-sm text-gray-900">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-200 rounded transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Total & Remove */}
                    <div className="col-span-2 flex items-center justify-between md:justify-end w-full md:w-auto mt-4 md:mt-0">
                      <div className="font-bold text-lg text-[var(--color-devam-red)]">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </div>
                      <button 
                        onClick={() => removeItem(item.id)}
                        className="ml-4 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="w-full lg:w-96 flex-shrink-0">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 sticky top-32">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
                
                <div className="space-y-4 text-sm mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span className="font-bold text-gray-900">₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>
                      Shipping {shippingStatus === "Bulk/Heavy" && <span className="text-orange-500 text-xs font-bold ml-1">(Bulk Order)</span>}
                    </span>
                    {shippingCost === 0 ? (
                      <span className="font-bold text-green-600">Free</span>
                    ) : (
                      <span className="font-bold text-gray-900">₹{shippingCost.toFixed(2)}</span>
                    )}
                  </div>
                </div>
                
                <div className="border-t border-gray-100 pt-4 mb-8">
                  <div className="flex justify-between items-end">
                    <span className="font-bold text-gray-900">Total</span>
                    <span className="text-3xl font-bold text-[var(--color-devam-red)]">₹{total.toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 text-right">Includes all taxes</p>
                </div>
                
                <Link href="/checkout" className="w-full flex items-center justify-center gap-2 bg-[var(--color-devam-red)] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#d62828] transition-colors shadow-lg shadow-red-500/20 group">
                  Proceed to Checkout
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                
                <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-500">
                  <ShieldCheck className="w-4 h-4 text-green-600" />
                  Secure 256-bit SSL Encryption
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
