"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { User, Package, MapPin, LogOut, CreditCard, Gift, Heart, Star, Bell, ChevronRight, Edit2, Plus, Settings, Camera, Loader2, ChevronDown, ChevronUp, Clock } from "lucide-react";
import { useOrderStore, Order } from "@/store/orderStore";
import { useAuthStore } from "@/store/authStore";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { doc, updateDoc, setDoc, arrayUnion, collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";
import OrderTimeline from "@/components/OrderTimeline";
import { getSavedAddresses, saveUserAddress, deleteUserAddress } from "@/lib/addressStore";

type Tab = "profile" | "addresses" | "orders" | "gift-cards" | "upi" | "cards" | "coupons" | "wishlist";

export default function AccountPage() {
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [expandedTimelines, setExpandedTimelines] = useState<Record<string, boolean>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Address State
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [addressForm, setAddressForm] = useState({
    name: "",
    phone: "",
    pin: "",
    houseNo: "",
    buildingName: "",
    street: "",
    area: "",
    landmark: "",
    cityDistrict: "",
    state: "",
    type: "HOME",
    otherType: ""
  });

  const user = useAuthStore((state) => state.user);
  const { userData, setUserData, loading: isUserDataLoading } = useAuth();
  const isLoading = useAuthStore((state) => state.isLoading);
  const logout = useAuthStore((state) => state.logout);
  const localOrders = useOrderStore((state) => state.orders);
  const router = useRouter();

  // Unified persistent saved addresses
  const savedAddresses = useMemo(() => getSavedAddresses(user, userData), [user, userData]);

  // Cross-device Firestore order listener for the current user
  useEffect(() => {
    if (!db || !user?.email) return;
    try {
      const q = query(
        collection(db, "orders"),
        where("customerEmail", "==", user.email)
      );
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const liveOrders: Order[] = [];
        snapshot.forEach((docSnap) => {
          liveOrders.push(docSnap.data() as Order);
        });
        if (liveOrders.length > 0) {
          const current = useOrderStore.getState().orders;
          const mergedMap = new Map<string, Order>();
          current.forEach((o) => mergedMap.set(o.id, o));
          liveOrders.forEach((lo) => {
            const existing = mergedMap.get(lo.id);
            if (existing) {
              mergedMap.set(lo.id, {
                ...existing,
                ...lo,
                timeline: { ...(existing.timeline || {}), ...(lo.timeline || {}) }
              });
            } else {
              mergedMap.set(lo.id, lo);
            }
          });
          const mergedList = Array.from(mergedMap.values()).sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          );
          useOrderStore.setState({ orders: mergedList });
        }
      }, (err) => {
        console.warn("[Account] Order subscription notice:", err);
      });
      return () => unsubscribe();
    } catch (e) {
      console.warn("[Account] Firestore listener error:", e);
    }
  }, [user?.email]);

  // Combined orders ensuring cross-device visibility
  const orders = useMemo(() => {
    const map = new Map<string, Order>();
    if (Array.isArray(userData?.orders)) {
      userData.orders.forEach((o: any) => {
        if (o?.id) map.set(o.id, o);
      });
    }
    localOrders.forEach((o) => {
      if (o?.id) {
        const existing = map.get(o.id);
        if (existing) {
          map.set(o.id, {
            ...existing,
            ...o,
            timeline: { ...(existing.timeline || {}), ...(o.timeline || {}) }
          });
        } else {
          map.set(o.id, o);
        }
      }
    });
    return Array.from(map.values()).sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [userData?.orders, localOrders]);

  const toggleTimeline = (orderId: string) => {
    setExpandedTimelines((prev) => ({
      ...prev,
      [orderId]: prev[orderId] === false ? true : false,
    }));
  };

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

  const handlePincodeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const pin = e.target.value.replace(/[^0-9]/g, '');
    setAddressForm({ ...addressForm, pin });
    
    if (pin.length === 6) {
      try {
        const apiKey = "579b464db66ec23bdd00000175d0d80528c44d856d103d5ba6157c00";
        const url = `https://api.data.gov.in/resource/6176ee09-3d56-4a3b-8115-21841576b2f6?api-key=${apiKey}&format=json&filters[pincode]=${pin}`;
        
        const res = await fetch(url);
        const data = await res.json();
        
        if (data && data.records && data.records.length > 0) {
          const record = data.records[0];
          setAddressForm(prev => ({
            ...prev,
            area: record.officename ? record.officename.replace(/ (B\.O|S\.O|H\.O)$/i, '') : prev.area,
            cityDistrict: record.districtname || record.taluk || prev.cityDistrict,
            state: record.statename || prev.state
          }));
        } else {
          toast.error("Invalid PIN Code or not found.");
        }
      } catch (err) {
        console.error("Error fetching pincode details:", err);
      }
    }
  };

  const resetAddressForm = () => {
    setAddressForm({
      name: "", phone: "", pin: "", houseNo: "", buildingName: "", street: "", area: "", landmark: "", cityDistrict: "", state: "", type: "HOME", otherType: ""
    });
  };

  const handleDeleteAddress = async (addressId: string) => {
    try {
      await deleteUserAddress(addressId, user, userData, setUserData);
      toast.success("Address deleted successfully!");
    } catch (error) {
      console.error("Error deleting address:", error);
      toast.error("Failed to delete address.");
    }
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check for duplicates
    const isDuplicate = savedAddresses.some((addr: any) => 
      addr.pin === addressForm.pin &&
      (addr.houseNo || "").toLowerCase().trim() === addressForm.houseNo.toLowerCase().trim() &&
      (addr.street || "").toLowerCase().trim() === addressForm.street.toLowerCase().trim()
    );

    if (isDuplicate) {
      toast.error("This address already exists in your account.");
      return;
    }

    try {
      const finalType = addressForm.type === "OTHER" && addressForm.otherType.trim() !== "" 
        ? addressForm.otherType.trim().toUpperCase() 
        : (addressForm.type === "OTHER" ? "OTHER" : addressForm.type);
        
      const newAddress = { 
        ...addressForm, 
        type: finalType,
      };
      delete (newAddress as any).otherType;
      
      await saveUserAddress(newAddress, user, userData, setUserData);
      
      toast.success("Address saved successfully!");
      resetAddressForm();
      setIsAddingAddress(false);
    } catch (error) {
      console.error("Error saving address:", error);
      toast.error("Failed to save address. Please try again.");
    }
  };

  // Show a fast skeleton while auth/data loads — never block the entire page
  const isPageLoading = isLoading || (!user && isUserDataLoading);

  if (isPageLoading) {
    return (
      <div className="bg-gray-100 min-h-screen pt-8 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-4 animate-pulse">
            {/* Sidebar skeleton */}
            <div className="w-full md:w-[300px] flex-shrink-0 space-y-4">
              <div className="bg-white rounded shadow-sm p-4 flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                </div>
              </div>
              <div className="bg-white rounded shadow-sm overflow-hidden">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-10 bg-gray-50 border-b border-gray-100 flex items-center px-6">
                    <div className="h-3 bg-gray-200 rounded w-2/3" />
                  </div>
                ))}
              </div>
            </div>
            {/* Main skeleton */}
            <div className="flex-1 bg-white rounded shadow-sm p-6 space-y-4">
              <div className="h-5 bg-gray-200 rounded w-1/4" />
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-10 bg-gray-100 rounded" />
              ))}
              <div className="h-24 bg-gray-100 rounded mt-4" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Auth resolved but no user → redirect handled by useEffect above
  if (!user) return null;

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
                <p className="font-bold text-[var(--color-devam-brown)]">{userData?.name || user.displayName || user.email?.split('@')[0]}</p>
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
                  <input type="text" value={(userData?.name || user.displayName || "").split(" ")[0] || ""} readOnly className="bg-gray-50 border border-gray-200 rounded px-4 py-3 w-64 focus:outline-none text-gray-700" />
                  <input type="text" value={(userData?.name || user.displayName || "").split(" ")[1] || ""} readOnly className="bg-gray-50 border border-gray-200 rounded px-4 py-3 w-64 focus:outline-none text-gray-700" />
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
                
                {!isAddingAddress && (
                  <button onClick={() => {
                    resetAddressForm();
                    setIsAddingAddress(true);
                  }} className="w-full border border-gray-300 rounded p-4 text-[var(--color-devam-red)] font-bold flex items-center mb-6 hover:bg-gray-50 transition-colors">
                    <Plus className="w-5 h-5 mr-2" /> ADD A NEW ADDRESS
                  </button>
                )}

                {isAddingAddress && (
                  <div className="border border-[var(--color-devam-brown)] rounded bg-orange-50/20 p-6 mb-8">
                    <h3 className="font-bold text-gray-900 mb-4">Add a new address</h3>
                    <form onSubmit={handleSaveAddress} className="space-y-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">PIN Code</label>
                        <input required type="text" maxLength={6} value={addressForm.pin} onChange={handlePincodeChange} className="w-full max-w-[200px] border border-gray-300 rounded px-3 py-2 text-sm focus:border-[var(--color-devam-brown)] focus:outline-none" placeholder="6 digits [0-9] PIN code" />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Name</label>
                          <input required type="text" value={addressForm.name} onChange={e => setAddressForm({...addressForm, name: e.target.value})} className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-[var(--color-devam-brown)] focus:outline-none" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Phone Number</label>
                          <input required type="text" maxLength={10} pattern="[0-9]{10}" value={addressForm.phone} onChange={e => setAddressForm({...addressForm, phone: e.target.value.replace(/[^0-9]/g, '')})} className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-[var(--color-devam-brown)] focus:outline-none" placeholder="10-digit mobile number" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">House no</label>
                          <input required type="text" value={addressForm.houseNo} onChange={e => setAddressForm({...addressForm, houseNo: e.target.value})} className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-[var(--color-devam-brown)] focus:outline-none" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Flat/House/Building Name</label>
                          <input type="text" value={addressForm.buildingName} onChange={e => setAddressForm({...addressForm, buildingName: e.target.value})} className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-[var(--color-devam-brown)] focus:outline-none" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Road/Street</label>
                          <input required type="text" value={addressForm.street} onChange={e => setAddressForm({...addressForm, street: e.target.value})} className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-[var(--color-devam-brown)] focus:outline-none" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Area/Sector/Locality</label>
                          <input required type="text" value={addressForm.area} onChange={e => setAddressForm({...addressForm, area: e.target.value})} className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-[var(--color-devam-brown)] focus:outline-none" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Landmark (Optional)</label>
                        <input type="text" value={addressForm.landmark} onChange={e => setAddressForm({...addressForm, landmark: e.target.value})} className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-[var(--color-devam-brown)] focus:outline-none" />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">City/District</label>
                          <input required type="text" value={addressForm.cityDistrict} onChange={e => setAddressForm({...addressForm, cityDistrict: e.target.value})} className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-[var(--color-devam-brown)] focus:outline-none" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">State</label>
                          <input required type="text" value={addressForm.state} onChange={e => setAddressForm({...addressForm, state: e.target.value})} className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-[var(--color-devam-brown)] focus:outline-none" />
                        </div>
                      </div>

                      <div>
                        <p className="text-xs font-medium text-gray-700 mb-2">Address Type</p>
                        <div className="flex gap-4 mb-3">
                          <label className="flex items-center gap-2 text-sm cursor-pointer">
                            <input type="radio" name="type" checked={addressForm.type === "HOME"} onChange={() => setAddressForm({...addressForm, type: "HOME"})} className="text-[var(--color-devam-brown)] focus:ring-[var(--color-devam-brown)]" /> Home
                          </label>
                          <label className="flex items-center gap-2 text-sm cursor-pointer">
                            <input type="radio" name="type" checked={addressForm.type === "WORK"} onChange={() => setAddressForm({...addressForm, type: "WORK"})} className="text-[var(--color-devam-brown)] focus:ring-[var(--color-devam-brown)]" /> Work
                          </label>
                          <label className="flex items-center gap-2 text-sm cursor-pointer">
                            <input type="radio" name="type" checked={addressForm.type === "OTHER"} onChange={() => setAddressForm({...addressForm, type: "OTHER"})} className="text-[var(--color-devam-brown)] focus:ring-[var(--color-devam-brown)]" /> Other
                          </label>
                        </div>
                        {addressForm.type === "OTHER" && (
                          <input 
                            type="text" 
                            placeholder="e.g. Grandma's House" 
                            required 
                            value={addressForm.otherType} 
                            onChange={e => setAddressForm({...addressForm, otherType: e.target.value})} 
                            className="w-full max-w-[250px] border border-gray-300 rounded px-3 py-2 text-sm focus:border-[var(--color-devam-brown)] focus:outline-none" 
                          />
                        )}
                      </div>

                      <div className="flex gap-4 pt-4">
                        <button type="submit" className="bg-[#fb641b] text-white font-bold px-8 py-3 rounded shadow-sm hover:bg-[#f35200] transition-colors">SAVE</button>
                        <button type="button" onClick={() => {
                          resetAddressForm();
                          setIsAddingAddress(false);
                        }} className="text-[var(--color-devam-brown)] font-bold px-8 py-3 hover:bg-gray-100 transition-colors rounded">CANCEL</button>
                      </div>
                    </form>
                  </div>
                )}
                
                {savedAddresses.length > 0 ? (
                  <div className="space-y-4">
                    {savedAddresses.map((addr: any) => (
                      <div key={addr.id} className="border border-gray-200 rounded relative hover:border-gray-300 transition-colors bg-white">
                        <div className="absolute top-4 right-4 flex gap-4">
                          <button 
                            onClick={() => handleDeleteAddress(addr.id)} 
                            className="text-[var(--color-devam-red)] font-medium text-sm hover:underline cursor-pointer"
                          >
                            Delete
                          </button>
                        </div>
                        <div className="p-6">
                          <div className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded inline-block mb-4 uppercase tracking-wider">{addr.type || "HOME"}</div>
                          <div className="flex items-center gap-4 mb-2">
                            <span className="font-bold text-gray-900">{addr.name}</span>
                            <span className="font-bold text-gray-900">{addr.phone}</span>
                          </div>
                          <p className="text-gray-600 text-sm">
                            {addr.houseNo}{addr.buildingName ? `, ${addr.buildingName}` : ""}, {addr.street}, {addr.area}{addr.landmark ? `, Landmark: ${addr.landmark}` : ""}
                          </p>
                          <p className="font-bold text-gray-900 mt-1">{addr.cityDistrict}, {addr.state} - {addr.pin}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : !isAddingAddress && (
                  <div className="text-center text-gray-500 py-10 border border-gray-200 rounded">
                    <MapPin className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                    <p>You haven't added any addresses yet.</p>
                  </div>
                )}
              </div>
            )}

            {/* ORDERS */}
            {activeTab === "orders" && (
              <div className="animate-in fade-in">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">My Orders</h2>
                    <p className="text-xs text-gray-500 mt-0.5">Track your order status and dispatch timeline in real-time</p>
                  </div>
                  <span className="text-xs font-semibold bg-stone-100 text-stone-700 px-3 py-1 rounded-full border border-stone-200">
                    {orders.length} {orders.length === 1 ? "Order" : "Orders"}
                  </span>
                </div>
                
                {orders.length === 0 ? (
                  <div className="text-center text-gray-500 py-16 border border-gray-200 rounded-xl bg-white shadow-2xs">
                    <Package className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                    <p className="font-semibold text-gray-800 text-sm">You haven't placed any orders yet.</p>
                    <p className="text-xs text-gray-400 mt-1 mb-5">Explore our stone-ground fresh flours, spices & cold-pressed oils.</p>
                    <Link href="/products" className="inline-block bg-[var(--color-devam-red)] text-white text-xs font-bold px-6 py-2.5 rounded-lg shadow-sm hover:opacity-90 transition-opacity">
                      Start Shopping
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {orders.map((order) => {
                      const isTimelineOpen = expandedTimelines[order.id] !== false; // Open by default
                      return (
                        <div key={order.id} className="border border-gray-200 rounded-xl p-4 sm:p-6 shadow-sm bg-white hover:border-stone-300 transition-all">
                          {/* Header: ID, Date, Status & Total */}
                          <div className="flex flex-wrap justify-between items-start gap-3 pb-4 border-b border-gray-100">
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-extrabold text-sm sm:text-base text-gray-900 font-mono">
                                  #{order.id}
                                </span>
                                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider border ${
                                  order.status === "Delivered"
                                    ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                                    : order.status === "Out for Dispatch"
                                    ? "bg-purple-50 text-purple-800 border-purple-300"
                                    : order.status === "Shipped"
                                    ? "bg-indigo-50 text-indigo-800 border-indigo-300"
                                    : order.status === "Confirmed"
                                    ? "bg-blue-50 text-blue-800 border-blue-300"
                                    : "bg-amber-50 text-amber-800 border-amber-300"
                                }`}>
                                  {order.status}
                                </span>
                              </div>
                              <p className="text-xs text-gray-500 mt-1">
                                Placed on {new Date(order.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })} at {new Date(order.date).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })}
                              </p>
                              {order.shippingAddress && (
                                <p className="text-[11px] text-gray-600 mt-1 line-clamp-1">
                                  <span className="font-semibold text-gray-700">Ship to:</span> {order.shippingAddress}
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              <span className="text-[11px] text-gray-500 block">Total Amount</span>
                              <span className="font-extrabold text-base sm:text-lg text-[var(--color-devam-red)]">
                                ₹{order.totalAmount.toFixed(2)}
                              </span>
                              <span className="text-[10px] text-gray-400 block mt-0.5">
                                {order.paymentMethod}
                              </span>
                            </div>
                          </div>
                          
                          {/* Items List */}
                          <div className="divide-y divide-gray-100 py-2 sm:py-3">
                            {order.items.map((item, idx) => (
                              <div key={idx} className="flex gap-3 sm:gap-4 items-center py-3 first:pt-1 last:pb-1">
                                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gray-50 border border-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden relative">
                                  {item.image ? (
                                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                                  ) : (
                                    <Package className="w-6 h-6 text-gray-400" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-bold text-gray-900 text-xs sm:text-sm truncate">{item.name}</p>
                                  <p className="text-[11px] sm:text-xs text-gray-500">Qty: {item.quantity} × ₹{item.price}</p>
                                </div>
                                <div className="text-right flex-shrink-0">
                                  <p className="font-bold text-gray-900 text-xs sm:text-sm">₹{(item.price * item.quantity).toFixed(2)}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                          
                          {/* Order Timeline Section with Toggle */}
                          <div className="border-t border-gray-100 pt-3">
                            <button
                              type="button"
                              onClick={() => toggleTimeline(order.id)}
                              className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-stone-50 hover:bg-stone-100 border border-stone-200 transition-colors cursor-pointer group"
                            >
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-[var(--color-devam-brown)] group-hover:text-[var(--color-devam-red)] transition-colors flex-shrink-0" />
                                <span className="text-xs sm:text-sm font-bold text-stone-900 group-hover:text-[var(--color-devam-red)] transition-colors">
                                  Order Timeline & Dispatch Tracking
                                </span>
                                <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full hidden sm:inline">
                                  5 Milestones
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--color-devam-brown)] flex-shrink-0">
                                <span>{isTimelineOpen ? "Hide Details" : "View Details"}</span>
                                {isTimelineOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                              </div>
                            </button>

                            {/* Live 5-Step Order Timeline */}
                            {isTimelineOpen && (
                              <OrderTimeline order={order} />
                            )}
                          </div>
                        </div>
                      );
                    })}
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
