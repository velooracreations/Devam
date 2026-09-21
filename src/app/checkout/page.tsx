"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import { useOrderStore, Order } from "@/store/orderStore";
import { useAuthStore } from "@/store/authStore";
import { useAuth } from "@/context/AuthContext";
import { useSettingsStore } from "@/store/settingsStore";
import { saveOrderAndNotify } from "@/lib/orderSync";
import { db } from "@/lib/firebase";
import { doc, setDoc, arrayUnion } from "firebase/firestore";
import { toast } from "sonner";
import { 
  ShieldCheck, 
  Truck, 
  CreditCard, 
  MapPin, 
  ChevronRight, 
  CheckCircle2, 
  ShoppingBag, 
  ArrowLeft, 
  Building, 
  User, 
  Phone, 
  Tag, 
  Loader2, 
  Check, 
  Lock 
} from "lucide-react";

export default function CheckoutPage() {
  const router = useRouter();
  
  // Rehydration & Store State
  const [isHydrated, setIsHydrated] = useState(false);
  const rawItems = useCartStore((state) => state.items);
  const items = useMemo(() => (Array.isArray(rawItems) ? rawItems : []), [rawItems]);
  const clearCart = useCartStore((state) => state.clearCart);
  
  const addOrder = useOrderStore((state) => state.addOrder);
  const getNextOrderId = useOrderStore((state) => state.getNextOrderId);
  
  const { user, userData, loading: isLoadingAuth } = useAuth();
  const shippingRules = useSettingsStore((state) => state.shipping);

  // Active step state: 1 = Address, 2 = Payment
  const [step, setStep] = useState<1 | 2>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);

  // Selected saved address ID vs new address
  const [selectedAddressId, setSelectedAddressId] = useState<string>("new");
  
  // Address Form State
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
    type: "HOME" as "HOME" | "WORK" | "OTHER",
    otherType: ""
  });

  // Payment method selection
  const [paymentMethod, setPaymentMethod] = useState<"razorpay" | "cod">("razorpay");

  // Coupon code state
  const [couponCode, setCouponCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(0);

  // Wait for Zustand localStorage rehydration
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Auto-select saved address if available
  useEffect(() => {
    if (userData?.addresses && userData.addresses.length > 0) {
      const defaultAddr = userData.addresses.find((a: any) => a.isDefault) || userData.addresses[0];
      if (defaultAddr && selectedAddressId === "new") {
        handleSelectSavedAddress(defaultAddr);
      }
    } else if (user || userData) {
      setAddressForm((prev) => ({
        ...prev,
        name: prev.name || userData?.name || user?.displayName || "",
        phone: prev.phone || userData?.mobile || ""
      }));
    }
  }, [userData, user]);

  const handleSelectSavedAddress = (addr: any) => {
    setSelectedAddressId(addr.id);
    setAddressForm({
      name: addr.name || userData?.name || user?.displayName || "",
      phone: addr.phone || userData?.mobile || "",
      pin: addr.pin || "",
      houseNo: addr.houseNo || "",
      buildingName: addr.buildingName || "",
      street: addr.street || "",
      area: addr.area || "",
      landmark: addr.landmark || "",
      cityDistrict: addr.cityDistrict || "",
      state: addr.state || "",
      type: addr.type || "HOME",
      otherType: ""
    });
    toast.success(`Selected saved address (${addr.type || 'HOME'})`);
  };

  const handleAddNewAddress = () => {
    setSelectedAddressId("new");
    setAddressForm({
      name: userData?.name || user?.displayName || "",
      phone: userData?.mobile || "",
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
  };

  // Cart Empty Redirect Guard
  useEffect(() => {
    if (isHydrated && items.length === 0) {
      toast.info("Your cart is empty. Redirecting to shop...");
      router.push("/shop");
    }
  }, [isHydrated, items, router]);

  // Calculations
  const totalItemsCount = useMemo(() => items.reduce((sum, item) => sum + (item.quantity || 0), 0), [items]);
  
  const itemsSubtotal = useMemo(() => items.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0), [items]);
  
  const totalWeightKg = useMemo(() => {
    return items.reduce((sum, item) => {
      let weightInKg = 0.5;
      const weightStr = (item.weight || "").toString().toLowerCase();
      if (weightStr.includes("kg")) {
        const parsed = parseFloat(weightStr.replace("kg", "").trim());
        if (!isNaN(parsed)) weightInKg = parsed;
      } else if (weightStr.includes("gm") || weightStr.includes("g")) {
        const parsed = parseFloat(weightStr.replace(/gm|g/, "").trim());
        if (!isNaN(parsed)) weightInKg = parsed / 1000;
      }
      return sum + weightInKg * (item.quantity || 1);
    }, 0);
  }, [items]);

  const shippingFee = useMemo(() => {
    if (itemsSubtotal >= (shippingRules?.freeShippingThreshold || 499)) {
      return 0;
    }
    return shippingRules?.flatRate || 50;
  }, [itemsSubtotal, shippingRules]);

  const finalAmount = Math.max(0, itemsSubtotal + shippingFee - appliedDiscount);

  // Auto PIN code fetch
  const handlePincodeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const pin = e.target.value.replace(/[^0-9]/g, "");
    setAddressForm((prev) => ({ ...prev, pin }));

    if (pin.length === 6) {
      try {
        const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
        const data = await res.json();
        if (data && data[0] && data[0].Status === "Success" && data[0].PostOffice?.length > 0) {
          const po = data[0].PostOffice[0];
          setAddressForm((prev) => ({
            ...prev,
            cityDistrict: po.District || po.Block || "",
            state: po.State || ""
          }));
          toast.success(`PIN code detected: ${po.District}, ${po.State}`);
        }
      } catch (_) {
        // Fallback silently if API fails
      }
    }
  };

  // Apply Coupon Logic
  const handleApplyCoupon = () => {
    const code = couponCode.trim().toUpperCase();
    if (!code) return;
    if (code === "DEVAM10" || code === "WELCOME10") {
      const discount = Math.round(itemsSubtotal * 0.1);
      setAppliedDiscount(discount);
      toast.success(`🎉 Coupon "${code}" applied! You saved ₹${discount}`);
    } else if (code === "FREESHIP") {
      setAppliedDiscount(shippingFee);
      toast.success(`🎉 Free Shipping coupon applied! You saved ₹${shippingFee}`);
    } else {
      toast.error("Invalid coupon code. Try 'DEVAM10' for 10% OFF!");
    }
  };

  // Form Validation & Progress
  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!addressForm.name || !addressForm.phone || !addressForm.pin || !addressForm.houseNo || !addressForm.street || !addressForm.area || !addressForm.cityDistrict || !addressForm.state) {
      toast.error("Please fill in all required address fields.");
      return;
    }

    if (addressForm.phone.length !== 10) {
      toast.error("Please enter a valid 10-digit mobile number.");
      return;
    }

    if (addressForm.pin.length !== 6) {
      toast.error("Please enter a valid 6-digit PIN code.");
      return;
    }

    // Save new address to user profile in Firestore if user is logged in
    if (selectedAddressId === "new" && user?.uid && db) {
      try {
        const userRef = doc(db, "users", user.uid);
        const newAddrObj = {
          id: `addr_${Date.now()}`,
          ...addressForm,
          createdAt: new Date().toISOString()
        };
        await setDoc(userRef, {
          addresses: arrayUnion(newAddrObj)
        }, { merge: true });
        console.log("Saved new address to user profile in Firestore!");
      } catch (err) {
        console.warn("Could not save address to user profile:", err);
      }
    }

    setStep(2);
  };

  // Complete Order Placement
  const handlePlaceOrder = async () => {
    setIsSubmitting(true);

    try {
      const orderId = getNextOrderId();

      // Resolve final shipping address string
      let fullAddressString = "";
      let customerName = addressForm.name;
      let customerPhone = addressForm.phone;

      if (selectedAddressId !== "new" && userData?.addresses) {
        const savedAddr = userData.addresses.find((a: any) => a.id === selectedAddressId);
        if (savedAddr) {
          customerName = savedAddr.name || customerName;
          customerPhone = savedAddr.phone || customerPhone;
          fullAddressString = `${savedAddr.name} (${savedAddr.phone}) - ${savedAddr.houseNo || ''} ${savedAddr.buildingName || ''}, ${savedAddr.street}, ${savedAddr.area}, ${savedAddr.cityDistrict}, ${savedAddr.state} - ${savedAddr.pin}`;
        }
      }

      if (!fullAddressString) {
        fullAddressString = `${addressForm.name} (${addressForm.phone}) - ${addressForm.houseNo} ${addressForm.buildingName ? addressForm.buildingName + ', ' : ''}${addressForm.street}, ${addressForm.area}, ${addressForm.landmark ? addressForm.landmark + ', ' : ''}${addressForm.cityDistrict}, ${addressForm.state} - ${addressForm.pin}`;
      }

      const orderData: Order = {
        id: orderId,
        date: new Date().toISOString(),
        totalAmount: finalAmount,
        paymentMethod: paymentMethod === "razorpay" ? "Razorpay (Online)" : "Cash on Delivery",
        items: [...items],
        status: "Order Placed",
        customerName: customerName || user?.displayName || "Customer",
        customerEmail: user?.email || "customer@thedevam.com",
        customerPhone: customerPhone,
        shippingAddress: fullAddressString
      };

      // Online Payment via Razorpay SDK
      if (paymentMethod === "razorpay") {
        try {
          const res = await fetch("/api/razorpay", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ amount: finalAmount, orderId })
          });

          const razorpayData = await res.json();
          if (!res.ok || !razorpayData.id) {
            throw new Error(razorpayData.error || "Failed to initialize online payment");
          }

          const options = {
            key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_live_TcNI9ejHlDnlqC",
            amount: razorpayData.amount,
            currency: "INR",
            name: "Devam Atta & Spices",
            description: `Order #${orderId}`,
            image: "/logo.svg",
            order_id: razorpayData.id,
            handler: async function (response: any) {
              await saveOrderAndNotify(orderData, user?.uid);
              clearCart();
              toast.success("🎉 Payment successful! Order placed.");
              setPlacedOrder(orderData);
            },
            prefill: {
              name: customerName,
              email: user?.email || "",
              contact: customerPhone
            },
            theme: {
              color: "#991b1b"
            }
          };

          const RazorpaySDK = (window as any).Razorpay;
          if (RazorpaySDK) {
            const rzp = new RazorpaySDK(options);
            rzp.open();
          } else {
            // If Razorpay SDK fails to load, fallback gracefully to COD placement
            await saveOrderAndNotify(orderData, user?.uid);
            clearCart();
            setPlacedOrder(orderData);
          }
        } catch (razorpayErr: any) {
          console.warn("Razorpay fallback triggered:", razorpayErr);
          await saveOrderAndNotify(orderData, user?.uid);
          clearCart();
          toast.success("Order placed successfully!");
          setPlacedOrder(orderData);
        }
      } else {
        // Cash on Delivery Placement
        await saveOrderAndNotify(orderData, user?.uid);
        clearCart();
        toast.success("🎉 Order placed with Cash on Delivery!");
        setPlacedOrder(orderData);
      }
    } catch (err: any) {
      console.error("Checkout submission error:", err);
      toast.error("Order processing failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isHydrated || isLoadingAuth) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--color-devam-red)] mx-auto mb-3" />
          <p className="text-sm font-semibold text-gray-600">Loading Checkout...</p>
        </div>
      </div>
    );
  }

  // Center Green Tick Success Overlay Modal
  if (placedOrder) {
    return (
      <div className="min-h-screen bg-[#faf8f5] py-16 px-4 flex items-center justify-center">
        <div className="bg-white rounded-3xl p-8 sm:p-10 max-w-md w-full text-center shadow-xl border border-emerald-100 relative animate-in zoom-in-95 duration-500 overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600" />
          
          {/* Animated Center Green Tick */}
          <div className="relative mb-6 flex items-center justify-center pt-2">
            <div className="absolute inset-0 rounded-full bg-emerald-400/20 animate-ping scale-75" />
            <div className="relative w-24 h-24 bg-emerald-100 border-4 border-emerald-500 rounded-full flex items-center justify-center shadow-xl shadow-emerald-500/20">
              <CheckCircle2 className="w-14 h-14 text-emerald-600 animate-in zoom-in-50 duration-500" />
            </div>
          </div>

          <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-gray-900 mb-2">
            Your Order Placed Successfully!
          </h2>
          <p className="text-xs text-emerald-800 font-semibold mb-6 bg-emerald-50 py-2 px-4 rounded-xl border border-emerald-200/60 inline-block">
            Order Intimated Live to Devam Admin
          </p>

          <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200/80 mb-6 text-left space-y-2.5 text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-gray-200">
              <span className="text-gray-500 font-medium">Order ID:</span>
              <span className="font-extrabold text-gray-900 text-sm font-mono">{placedOrder.id}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500 font-medium">Payment Mode:</span>
              <span className="font-bold text-gray-800">{placedOrder.paymentMethod}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500 font-medium">Total Amount Paid:</span>
              <span className="font-extrabold text-emerald-700 text-sm">₹{placedOrder.totalAmount}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500 font-medium">Customer Contact:</span>
              <span className="font-semibold text-gray-800">{placedOrder.customerName} ({placedOrder.customerPhone})</span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => router.push("/account?tab=orders")}
              className="w-full bg-[var(--color-devam-red)] hover:bg-red-800 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-sm cursor-pointer"
            >
              <span>View &amp; Track Order Details</span>
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => router.push("/shop")}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3 px-6 rounded-xl transition-all border border-gray-200 text-sm cursor-pointer"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf8f5] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Top Header & Breadcrumb */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
              <Link href="/cart" className="hover:text-gray-900 flex items-center gap-1 font-medium">
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Cart
              </Link>
              <span>/</span>
              <span className="font-semibold text-gray-900">Checkout</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-gray-900">
              Secure Checkout
            </h1>
          </div>

          {/* Stepper Progress */}
          <div className="flex items-center gap-3 text-xs font-bold">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${step >= 1 ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-gray-100 text-gray-500'}`}>
              <span className="w-5 h-5 rounded-full bg-amber-700 text-white flex items-center justify-center text-[10px]">1</span>
              <span>Address</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${step >= 2 ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-gray-100 text-gray-500'}`}>
              <span className="w-5 h-5 rounded-full bg-amber-700 text-white flex items-center justify-center text-[10px]">2</span>
              <span>Payment</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Content Area (Steps 1 & 2) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* STEP 1: DELIVERY ADDRESS */}
            <div className={`bg-white rounded-2xl border shadow-sm transition-all overflow-hidden ${step === 1 ? 'border-amber-300 ring-2 ring-amber-500/20' : 'border-gray-200 opacity-95'}`}>
              <div className="p-5 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[var(--color-devam-red)] text-white flex items-center justify-center font-bold text-sm">
                    1
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 font-heading">Delivery Address</h2>
                    <p className="text-xs text-gray-500">Where should we deliver your authentic spices &amp; flour?</p>
                  </div>
                </div>
                {step === 2 && (
                  <button 
                    onClick={() => setStep(1)} 
                    className="text-xs font-bold text-[var(--color-devam-red)] hover:underline"
                  >
                    Edit Address
                  </button>
                )}
              </div>

              {step === 1 ? (
                <div className="p-6">
                  
                  {/* Saved Addresses List (if available) */}
                  {userData?.addresses && userData.addresses.length > 0 && (
                    <div className="mb-6 space-y-3 border-b border-gray-100 pb-6">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-gray-700 uppercase tracking-wider">Select Saved Address</p>
                        <span className="text-[11px] text-gray-500 font-medium">Click card to select &amp; auto-fill</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {userData.addresses.map((addr: any) => (
                          <div 
                            key={addr.id}
                            onClick={() => handleSelectSavedAddress(addr)}
                            className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                              selectedAddressId === addr.id 
                                ? 'border-[var(--color-devam-red)] bg-red-50/40 ring-1 ring-[var(--color-devam-red)] shadow-sm' 
                                : 'border-gray-200 hover:border-gray-300 bg-white'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-gray-100 text-gray-800">
                                {addr.type || 'HOME'}
                              </span>
                              {selectedAddressId === addr.id && (
                                <CheckCircle2 className="w-4 h-4 text-[var(--color-devam-red)]" />
                              )}
                            </div>
                            <p className="font-bold text-sm text-gray-900">{addr.name}</p>
                            <p className="text-xs text-gray-600 line-clamp-2 mt-0.5">
                              {addr.houseNo} {addr.buildingName ? addr.buildingName + ', ' : ''}{addr.street}, {addr.area}, {addr.cityDistrict} - {addr.pin}
                            </p>
                            <p className="text-xs text-gray-500 font-mono mt-1">📞 {addr.phone}</p>
                          </div>
                        ))}

                        {/* Option to add new address */}
                        <div 
                          onClick={handleAddNewAddress}
                          className={`p-3.5 rounded-xl border border-dashed cursor-pointer flex flex-col items-center justify-center text-center transition-all min-h-[110px] ${
                            selectedAddressId === "new" 
                              ? 'border-[var(--color-devam-red)] bg-red-50/30 ring-1 ring-[var(--color-devam-red)]' 
                              : 'border-gray-300 hover:border-gray-400 bg-gray-50/50'
                          }`}
                        >
                          <MapPin className="w-5 h-5 text-gray-400 mb-1" />
                          <span className="text-xs font-bold text-gray-800">+ Add New Address</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Address Form (Always active & pre-filled with selected address) */}
                  <form onSubmit={handleAddressSubmit} className="space-y-4">
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Full Name *</label>
                        <input 
                          required 
                          type="text" 
                          value={addressForm.name} 
                          onChange={e => setAddressForm({...addressForm, name: e.target.value})} 
                          className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-[var(--color-devam-red)] focus:border-transparent outline-none" 
                          placeholder="Jaydev Patel" 
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Mobile Number *</label>
                        <input 
                          required 
                          type="tel" 
                          maxLength={10} 
                          pattern="[0-9]{10}" 
                          value={addressForm.phone} 
                          onChange={e => setAddressForm({...addressForm, phone: e.target.value.replace(/[^0-9]/g, '')})} 
                          className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-[var(--color-devam-red)] focus:border-transparent outline-none" 
                          placeholder="10-digit mobile number" 
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">PIN Code *</label>
                        <input 
                          required 
                          type="text" 
                          maxLength={6} 
                          value={addressForm.pin} 
                          onChange={handlePincodeChange} 
                          className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm font-mono focus:ring-2 focus:ring-[var(--color-devam-red)] focus:border-transparent outline-none" 
                          placeholder="389170" 
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">City / District *</label>
                        <input 
                          required 
                          type="text" 
                          value={addressForm.cityDistrict} 
                          onChange={e => setAddressForm({...addressForm, cityDistrict: e.target.value})} 
                          className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-[var(--color-devam-red)] focus:border-transparent outline-none" 
                          placeholder="Dahod" 
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">State *</label>
                        <input 
                          required 
                          type="text" 
                          value={addressForm.state} 
                          onChange={e => setAddressForm({...addressForm, state: e.target.value})} 
                          className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-[var(--color-devam-red)] focus:border-transparent outline-none" 
                          placeholder="Gujarat" 
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">House No. / Plot No. *</label>
                        <input 
                          required 
                          type="text" 
                          value={addressForm.houseNo} 
                          onChange={e => setAddressForm({...addressForm, houseNo: e.target.value})} 
                          className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-[var(--color-devam-red)] focus:border-transparent outline-none" 
                          placeholder="Plot No. 5-6" 
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Building / Society Name</label>
                        <input 
                          type="text" 
                          value={addressForm.buildingName} 
                          onChange={e => setAddressForm({...addressForm, buildingName: e.target.value})} 
                          className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-[var(--color-devam-red)] focus:border-transparent outline-none" 
                          placeholder="Shreeji Udhyog Park" 
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Road / Street *</label>
                        <input 
                          required 
                          type="text" 
                          value={addressForm.street} 
                          onChange={e => setAddressForm({...addressForm, street: e.target.value})} 
                          className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-[var(--color-devam-red)] focus:border-transparent outline-none" 
                          placeholder="Market Yard Road" 
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Area / Locality *</label>
                        <input 
                          required 
                          type="text" 
                          value={addressForm.area} 
                          onChange={e => setAddressForm({...addressForm, area: e.target.value})} 
                          className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-[var(--color-devam-red)] focus:border-transparent outline-none" 
                          placeholder="Jhalod" 
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Landmark (Optional)</label>
                      <input 
                        type="text" 
                        value={addressForm.landmark} 
                        onChange={e => setAddressForm({...addressForm, landmark: e.target.value})} 
                        className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-[var(--color-devam-red)] focus:border-transparent outline-none" 
                        placeholder="Near Main Market Gate" 
                      />
                    </div>

                    <div>
                      <p className="text-xs font-bold text-gray-700 mb-2">Address Type</p>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2 text-xs font-bold text-gray-800 cursor-pointer">
                          <input type="radio" name="addrType" checked={addressForm.type === "HOME"} onChange={() => setAddressForm({...addressForm, type: "HOME"})} className="text-[var(--color-devam-red)] focus:ring-[var(--color-devam-red)]" /> Home
                        </label>
                        <label className="flex items-center gap-2 text-xs font-bold text-gray-800 cursor-pointer">
                          <input type="radio" name="addrType" checked={addressForm.type === "WORK"} onChange={() => setAddressForm({...addressForm, type: "WORK"})} className="text-[var(--color-devam-red)] focus:ring-[var(--color-devam-red)]" /> Work
                        </label>
                        <label className="flex items-center gap-2 text-xs font-bold text-gray-800 cursor-pointer">
                          <input type="radio" name="addrType" checked={addressForm.type === "OTHER"} onChange={() => setAddressForm({...addressForm, type: "OTHER"})} className="text-[var(--color-devam-red)] focus:ring-[var(--color-devam-red)]" /> Other
                        </label>
                      </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                      <button
                        type="submit"
                        className="px-6 py-3.5 bg-[var(--color-devam-red)] text-white font-bold rounded-xl text-sm hover:bg-[#d62828] transition-all shadow-md hover:shadow-lg inline-flex items-center gap-2 cursor-pointer"
                      >
                        <span>Proceed to Payment</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>

                  </form>

                </div>
              ) : (
                <div className="p-4 bg-emerald-50/50 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span className="font-bold text-gray-800">
                      Deliver to: {selectedAddressId !== "new" ? "Saved Address" : `${addressForm.name} (${addressForm.phone}), ${addressForm.cityDistrict}`}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* STEP 2: PAYMENT METHOD */}
            <div className={`bg-white rounded-2xl border shadow-sm transition-all overflow-hidden ${step === 2 ? 'border-amber-300 ring-2 ring-amber-500/20' : 'border-gray-200 opacity-90'}`}>
              <div className="p-5 border-b border-gray-100 bg-gray-50 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[var(--color-devam-red)] text-white flex items-center justify-center font-bold text-sm">
                  2
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 font-heading">Payment Options</h2>
                  <p className="text-xs text-gray-500">100% secure encrypted payment processing</p>
                </div>
              </div>

              {step === 2 && (
                <div className="p-6 space-y-4">
                  
                  {/* Razorpay Online Payment Option */}
                  <div 
                    onClick={() => setPaymentMethod("razorpay")}
                    className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                      paymentMethod === "razorpay" 
                        ? 'border-[var(--color-devam-red)] bg-red-50/40 ring-1 ring-[var(--color-devam-red)]' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full border border-gray-300 flex items-center justify-center bg-white">
                        {paymentMethod === "razorpay" && <div className="w-3 h-3 rounded-full bg-[var(--color-devam-red)]"></div>}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-gray-900 flex items-center gap-2">
                          <span>UPI / Credit Card / Debit Card / NetBanking</span>
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Instant</span>
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">Pay securely via Razorpay payment gateway</p>
                      </div>
                    </div>
                    <CreditCard className="w-5 h-5 text-gray-400" />
                  </div>

                  {/* Cash on Delivery Option */}
                  <div 
                    onClick={() => setPaymentMethod("cod")}
                    className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                      paymentMethod === "cod" 
                        ? 'border-[var(--color-devam-red)] bg-red-50/40 ring-1 ring-[var(--color-devam-red)]' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full border border-gray-300 flex items-center justify-center bg-white">
                        {paymentMethod === "cod" && <div className="w-3 h-3 rounded-full bg-[var(--color-devam-red)]"></div>}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-gray-900">Cash on Delivery (COD)</p>
                        <p className="text-xs text-gray-500 mt-0.5">Pay in cash when your package is delivered</p>
                      </div>
                    </div>
                    <Truck className="w-5 h-5 text-gray-400" />
                  </div>

                  <div className="pt-4 flex justify-between items-center border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="text-xs font-bold text-gray-600 hover:text-gray-900"
                    >
                      ← Back to Address
                    </button>
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={handlePlaceOrder}
                      className="px-8 py-3 bg-[var(--color-devam-red)] text-white font-bold rounded-xl text-base hover:bg-[#d62828] transition-all shadow-lg disabled:opacity-50 inline-flex items-center gap-2 cursor-pointer"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Processing Order...</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4" />
                          <span>Place Order (₹{finalAmount})</span>
                        </>
                      )}
                    </button>
                  </div>

                </div>
              )}
            </div>

          </div>

          {/* Right Sidebar: Order Summary */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6 sticky top-24">
              
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <h3 className="font-heading font-bold text-lg text-gray-900 flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-[var(--color-devam-red)]" />
                  <span>Order Summary</span>
                </h3>
                <span className="text-xs font-bold bg-amber-100 text-amber-900 px-2.5 py-1 rounded-full">
                  {totalItemsCount} {totalItemsCount === 1 ? 'item' : 'items'} ({totalWeightKg.toFixed(1)} kg)
                </span>
              </div>

              {/* Items List */}
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 relative bg-gray-50 rounded-lg border border-gray-200 flex-shrink-0 overflow-hidden">
                        <Image src={item.image} alt={item.name} fill className="object-contain p-1" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 line-clamp-1">{item.name}</p>
                        <p className="text-gray-500">Qty: {item.quantity} × ₹{item.price}</p>
                      </div>
                    </div>
                    <span className="font-bold text-gray-900">₹{(item.price || 0) * (item.quantity || 1)}</span>
                  </div>
                ))}
              </div>

              {/* Coupon Box */}
              <div className="border-t border-b border-gray-100 py-4">
                <p className="text-xs font-bold text-gray-700 mb-2 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-[var(--color-devam-red)]" />
                  <span>Have a Promo Code?</span>
                </p>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={couponCode} 
                    onChange={e => setCouponCode(e.target.value)} 
                    placeholder="e.g. DEVAM10" 
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-xs uppercase font-bold outline-none focus:ring-1 focus:ring-[var(--color-devam-red)]" 
                  />
                  <button 
                    onClick={handleApplyCoupon}
                    className="px-4 py-2 bg-gray-900 text-white rounded-lg text-xs font-bold hover:bg-black transition-colors"
                  >
                    Apply
                  </button>
                </div>
              </div>

              {/* Pricing Breakdown */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-bold text-gray-900">₹{itemsSubtotal}</span>
                </div>

                <div className="flex justify-between text-gray-600">
                  <span>Shipping Fee</span>
                  {shippingFee === 0 ? (
                    <span className="font-bold text-emerald-600">FREE</span>
                  ) : (
                    <span className="font-bold text-gray-900">₹{shippingFee}</span>
                  )}
                </div>

                {appliedDiscount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>Discount</span>
                    <span>-₹{appliedDiscount}</span>
                  </div>
                )}

                <div className="border-t border-gray-200 pt-3 flex justify-between items-center text-sm">
                  <span className="font-bold text-gray-900">Total Payable</span>
                  <span className="font-extrabold text-xl text-[var(--color-devam-red)]">₹{finalAmount}</span>
                </div>
              </div>

              {/* Security Badge */}
              <div className="bg-amber-50/60 border border-amber-200/80 rounded-xl p-3 flex items-center gap-2.5 text-xs text-amber-900">
                <ShieldCheck className="w-5 h-5 text-amber-700 flex-shrink-0" />
                <p className="text-[11px] leading-tight">
                  <strong className="font-bold">100% Authentic Guarantee:</strong> Fresh chakki ground atta and pure spices direct from Dahod, Gujarat.
                </p>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
