"use client";

import { useState, useEffect } from "react";
import { useRef } from "react";
import Link from "next/link";
import { User, Package, MapPin, LogOut, CreditCard, Gift, Heart, Star, Bell, ChevronRight, Edit2, Plus, Settings, Camera, Loader2 } from "lucide-react";
import { useOrderStore } from "@/store/orderStore";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";

type Tab = "profile" | "addresses" | "pan" | "orders" | "gift-cards" | "upi" | "cards" | "coupons" | "wishlist";

export default function AccountPage() {
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const user = useAuthStore((state) => state.user);
  const isLoading = useAuthStore((state) => state.isLoading);
  const logout = useAuthStore((state) => state.logout);
  const orders = useOrderStore((state) => state.orders);
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab") as Tab;
    if (tab) setActiveTab(tab);
  }, []);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setProfileImage(imageUrl);
      // Here we would typically upload to Firebase Storage and update profile
    }
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--color-devam-red)]" />
      </div>
    );
  }

  // Sidebar Group Component
  const SidebarGroup = ({ title, icon: Icon, children }: any) => (
    <div className="border-b border-gray-100 last:border-0 py-4">
      <div className="flex items-center px-6 mb-2 text-gray-500 font-bold text-sm tracking-wide">
        <Icon className="w-5 h-5 mr-4 text-[var(--color-devam-brown)]" /> {title}
      </div>
      <div className="flex flex-col">{children}</div>
    </div>
  );

  const SidebarItem = ({ tab, label }: { tab: Tab, label: string }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`text-left px-6 pl-[3.25rem] py-3 text-sm transition-colors ${
        activeTab === tab
          ? "bg-blue-50 text-[var(--color-devam-red)] font-bold"
          : "text-gray-600 hover:text-[var(--color-devam-red)] hover:bg-gray-50"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="bg-gray-100 min-h-screen pt-8 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row gap-4">
          
          {/* SIDEBAR */}
          <div className="w-full md:w-[300px] flex-shrink-0 flex flex-col gap-4">
            
            {/* Profile Header Box */}
            <div className="bg-white rounded shadow-sm p-4 flex items-center gap-4">
              <div 
                className="relative w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden cursor-pointer group"
                onClick={() => fileInputRef.current?.click()}
              >
                {profileImage ? (
                  <Image src={profileImage} alt="Avatar" width={48} height={48} className="object-cover w-full h-full" />
                ) : (
                  <User className="w-6 h-6 text-gray-400 group-hover:opacity-0 transition-opacity" />
                )}
                
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-4 h-4 text-white" />
                </div>

                {/* Hidden File Input */}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageUpload} 
                  accept="image/*" 
                  className="hidden" 
                />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Hello,</p>
                <p className="font-bold text-[var(--color-devam-brown)]">{user.displayName || user.email?.split('@')[0]}</p>
              </div>
            </div>

            {/* Navigation Box */}
            <div className="bg-white rounded shadow-sm overflow-hidden flex flex-col">
              
              <button 
                onClick={() => setActiveTab("orders")}
                className={`flex items-center justify-between px-6 py-4 border-b border-gray-100 transition-colors ${
                  activeTab === "orders" ? "bg-blue-50 text-[var(--color-devam-red)]" : "text-gray-500 hover:text-[var(--color-devam-red)]"
                }`}
              >
                <div className="flex items-center font-bold text-sm tracking-wide">
                  <Package className="w-5 h-5 mr-4 text-[var(--color-devam-brown)]" /> MY ORDERS
                </div>
                <ChevronRight className="w-4 h-4" />
              </button>

              <SidebarGroup title="ACCOUNT SETTINGS" icon={User}>
                <SidebarItem tab="profile" label="Profile Information" />
                <SidebarItem tab="addresses" label="Manage Addresses" />
                <SidebarItem tab="pan" label="PAN Card Information" />
              </SidebarGroup>

              <SidebarGroup title="PAYMENTS" icon={CreditCard}>
                <button
                  onClick={() => setActiveTab("gift-cards")}
                  className={`flex items-center justify-between px-6 pl-[3.25rem] py-3 text-sm transition-colors ${
                    activeTab === "gift-cards" ? "bg-blue-50 text-[var(--color-devam-red)] font-bold" : "text-gray-600 hover:text-[var(--color-devam-red)] hover:bg-gray-50"
                  }`}
                >
                  Gift Cards <span className="text-green-600 font-bold">₹0</span>
                </button>
                <SidebarItem tab="upi" label="Saved UPI" />
                <SidebarItem tab="cards" label="Saved Cards" />
                <button onClick={() => logout()} className="w-full text-left px-6 pl-[3.25rem] py-3 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium">
                    Logout
                </button>
              </SidebarGroup>

              <SidebarGroup title="MY STUFF" icon={Settings}>
                <SidebarItem tab="coupons" label="My Coupons" />
                <SidebarItem tab="wishlist" label="My Wishlist" />
              </SidebarGroup>
            </div>
          </div>

          {/* MAIN CONTENT AREA */}
          <div className="flex-1 bg-white rounded shadow-sm p-8 min-h-[600px]">
            
            {/* PROFILE INFO */}
            {activeTab === "profile" && (
              <div className="animate-in fade-in">
                <div className="flex items-center gap-4 mb-6">
                  <h2 className="text-lg font-bold text-gray-900">Personal Information</h2>
                  <button className="text-sm font-medium text-[var(--color-devam-red)]">Edit</button>
                </div>
                <div className="flex gap-4 mb-10">
                  <input type="text" value={user.displayName?.split(" ")[0] || ""} readOnly className="bg-gray-50 border border-gray-200 rounded px-4 py-3 w-64 focus:outline-none text-gray-700" />
                  <input type="text" value={user.displayName?.split(" ")[1] || ""} readOnly className="bg-gray-50 border border-gray-200 rounded px-4 py-3 w-64 focus:outline-none text-gray-700" />
                </div>
                
                <div className="flex gap-4 mb-8">
                  <div className="flex-1 border border-gray-200 rounded p-4 bg-gray-50 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500 font-bold tracking-wider mb-1">EMAIL ADDRESS</p>
                      <p className="text-gray-900">{user.email}</p>
                    </div>
                    <button className="text-[var(--color-devam-red)] text-sm font-bold hover:underline">Edit</button>
                  </div>
                  <div className="flex-1 border border-gray-200 rounded p-4 bg-gray-50 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500 font-bold tracking-wider mb-1">PHONE NUMBER</p>
                      <p className="text-gray-900">{user.phoneNumber || "+91 - Add Phone"}</p>
                    </div>
                    <button className="text-[var(--color-devam-red)] text-sm font-bold hover:underline">Edit</button>
                  </div>
                </div>
              </div>
            )}

            {/* ADDRESSES */}
            {activeTab === "addresses" && (
              <div className="animate-in fade-in">
                <h2 className="text-lg font-bold text-gray-900 mb-6">Manage Addresses</h2>
                <button className="w-full border border-gray-300 rounded p-4 text-[var(--color-devam-red)] font-bold flex items-center mb-6 hover:bg-gray-50 transition-colors">
                  <Plus className="w-5 h-5 mr-2" /> ADD A NEW ADDRESS
                </button>
                
                <div className="border border-gray-200 rounded relative">
                  <div className="absolute top-4 right-4 flex gap-4">
                    <button className="text-[var(--color-devam-brown)] font-medium text-sm">Edit</button>
                    <button className="text-[var(--color-devam-brown)] font-medium text-sm">Delete</button>
                  </div>
                  <div className="p-6">
                    <div className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded inline-block mb-4 uppercase tracking-wider">HOME</div>
                    <div className="flex items-center gap-4 mb-2">
                      <span className="font-bold text-gray-900">{user.displayName}</span>
                      <span className="font-bold text-gray-900">{user.phoneNumber}</span>
                    </div>
                    <p className="text-gray-600">Devam Foods HQ, Godown Plot No 5-6, City Survey no-3354,</p>
                    <p className="text-gray-600 mb-1">Block 1/12 In Market Yard, Jhalod</p>
                    <p className="font-bold text-gray-900">Dahod, Gujarat - 389170</p>
                  </div>
                </div>
              </div>
            )}

            {/* ORDERS */}
            {activeTab === "orders" && (
              <div className="animate-in fade-in">
                <h2 className="text-lg font-bold text-gray-900 mb-6">My Orders</h2>
                
                {orders.length === 0 ? (
                  <div className="text-center text-gray-500 py-10 border border-gray-200 rounded">
                    <Package className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                    <p>You haven't placed any orders yet.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {orders.map((order) => (
                      <div key={order.id} className="border border-gray-200 rounded p-6 shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                          <div>
                            <span className="font-bold text-gray-900">Order ID: {order.id}</span>
                            <span className={`ml-4 text-xs font-bold px-2 py-1 rounded uppercase tracking-wide ${
                              order.status === 'Order Placed' ? 'bg-yellow-100 text-yellow-700' :
                              order.status === 'Confirmed' ? 'bg-blue-100 text-blue-700' :
                              'bg-green-100 text-green-700'
                            }`}>
                              {order.status}
                            </span>
                          </div>
                          <span className="text-sm font-medium text-gray-600">Arriving Tomorrow</span>
                        </div>
                        
                        <div className="divide-y divide-gray-100 border-t border-gray-100 pt-4">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex gap-4 items-center py-4 first:pt-0 last:pb-0">
                              <div className="w-16 h-16 bg-gray-50 border border-gray-100 rounded flex-shrink-0 flex items-center justify-center overflow-hidden relative">
                                {item.image ? (
                                  <Image src={item.image} alt={item.name} fill className="object-cover" />
                                ) : (
                                  <Package className="w-8 h-8 text-gray-400" />
                                )}
                              </div>
                              <div className="flex-1">
                                <p className="font-bold text-gray-900">{item.name}</p>
                                <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-gray-900">₹{(item.price * item.quantity).toFixed(2)}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        <div className="flex justify-between items-center border-t border-gray-100 pt-4 mt-2">
                          <p className="text-sm text-gray-500">Paid via {order.paymentMethod}</p>
                          <div className="text-right flex items-center gap-4">
                            <span className="font-bold text-gray-900">Total: <span className="text-[var(--color-devam-red)]">₹{order.totalAmount.toFixed(2)}</span></span>
                            <button className="text-[var(--color-devam-brown)] font-bold text-sm hover:underline border border-[var(--color-devam-brown)] px-4 py-2 rounded">Track Order</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* FALLBACK FOR OTHER TABS */}
            {["pan", "gift-cards", "upi", "cards", "coupons", "wishlist"].includes(activeTab) && (
              <div className="animate-in fade-in h-full flex flex-col items-center justify-center text-center text-gray-500 pt-20">
                <Image src="/logo.svg" alt="Devam Logo" width={100} height={100} className="opacity-20 mb-6 grayscale" />
                <h2 className="text-xl font-bold text-gray-900 mb-2 capitalize">{activeTab.replace('-', ' ')}</h2>
                <p>There is no data to show here right now.</p>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

// Next.js doesn't natively have Image fallback in the simplest way without state, so we import Image
import Image from "next/image";
