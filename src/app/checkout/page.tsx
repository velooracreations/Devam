"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { CheckCircle2, ChevronRight, ShieldCheck, MapPin, CreditCard, Banknote, Loader2, LockKeyhole } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useOrderStore } from "@/store/orderStore";
import { useSettingsStore } from "@/store/settingsStore";
import { useAuthStore } from "@/store/authStore";
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";

export default function CheckoutPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1); // 1: Address, 2: Payment
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [lastOrderId, setLastOrderId] = useState("");
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>("upi");
  const [gstNumber, setGstNumber] = useState<string>("");

  const clearCart = useCartStore((state) => state.clearCart);
  const items = useCartStore((state) => state.items);
  const addOrder = useOrderStore((state) => state.addOrder);
  const getNextOrderId = useOrderStore((state) => state.getNextOrderId);
  
  const user = useAuthStore((state) => state.user);
  const isLoadingAuth = useAuthStore((state) => state.isLoading);
  const shippingRules = useSettingsStore((state) => state.shipping);
  
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  
  // Empty Cart Guard
  useEffect(() => {
    if (items.length === 0 && !orderPlaced) {
      router.push('/shop');
    }
  }, [items, orderPlaced, router]);

  const { userData, loading: isUserDataLoading } = useAuth();
  const addresses: any[] = userData?.addresses || [];

  useEffect(() => {
    if (addresses.length > 0 && !selectedAddress) {
      setSelectedAddress(addresses[0].id);
    }
  }, [addresses, selectedAddress]);

  if (isLoadingAuth || isUserDataLoading) {
    return (
      <div className="min-h-screen bg-[#f1f3f6] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--color-devam-red)]" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#f1f3f6] flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center border-t-4 border-[var(--color-devam-red)]">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <LockKeyhole className="w-8 h-8 text-[var(--color-devam-red)]" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign In Required</h2>
          <p className="text-gray-500 mb-8 text-sm">
            For placing an order, it is mandatory to sign in or create an account. This helps us track your shipments and provide you with a premium experience.
          </p>
          <div className="flex flex-col gap-3">
            <Link href="/login?redirect=/checkout" className="w-full bg-[var(--color-devam-red)] text-white font-bold px-6 py-3.5 rounded-xl hover:bg-[#d62828] transition-colors shadow-sm text-sm">
              Proceed to Login
            </Link>
            <Link href="/cart" className="w-full bg-white text-gray-700 font-bold px-6 py-3.5 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors text-sm">
              Go Back
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0 && !orderPlaced) {
    return null; // Prevent flicker before redirect
  }

  const currentAddress = addresses.find(a => a.id === selectedAddress);
  
  // Calculate Total Weight in Kg
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
  const totalWeightKg = items.reduce((sum, item) => sum + calculateWeightInKg(item.weight || "1 Kg", item.quantity), 0);
  
  // Calculate Shipping based on Admin Settings
  let shippingCost = shippingRules.flatRate;
  let shippingStatus = "Standard";
  
  if (totalWeightKg > shippingRules.bulkWeightThreshold) {
    shippingCost = shippingRules.bulkShippingRate;
    shippingStatus = "Bulk/Heavy";
  } else if (totalPrice >= shippingRules.freeShippingThreshold) {
    shippingCost = 0;
    shippingStatus = "Free";
  }
  
  const finalAmount = totalPrice + shippingCost;

  const handleRazorpayPayment = async () => {
    try {
      // 1. Create Order on Backend
      const res = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: finalAmount * 100 }), // Amount in paise
      });
      
      const order = await res.json();

      if (!order.id) {
        alert("Failed to initiate payment. Please try again.");
        return;
      }

      // 2. Open Razorpay Checkout Modal
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, 
        amount: order.amount,
        currency: order.currency,
        name: "Devam",
        description: "Premium Spices and Flours",
        image: "/logo.svg",
        order_id: order.id,
        handler: async function (response: any) {
          try {
            // 3. Verify Signature on Backend
            const verifyRes = await fetch("/api/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });
            const verifyData = await verifyRes.json();
            
            if (verifyData.success) {
              // Valid payment!
              const newOrderId = getNextOrderId();
          const customerName = addresses.find(a => a.id === selectedAddress)?.name || "Guest";
          
          addOrder({
            id: newOrderId,
            date: new Date().toISOString(),
            totalAmount: finalAmount,
            paymentMethod: "Razorpay (UPI/Card)",
            items: items,
            status: 'Order Placed',
            customerName,
            gstNumber: gstNumber || undefined
          });
          
          // Sync with ERP
          fetch('/api/erp/order-sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId: newOrderId, items, customerName })
          }).catch(err => console.error("ERP Sync failed", err));

              clearCart();
              // Redirect to new success page
              router.push(`/success?order_id=${newOrderId}`);
            } else {
              alert("Payment verification failed! " + verifyData.error);
            }
          } catch (err) {
            console.error("Verification error", err);
            alert("Error verifying payment.");
          }
        },
        prefill: {
          name: addresses.find(a => a.id === selectedAddress)?.name || "Customer",
          email: user?.email || "",
          contact: addresses.find(a => a.id === selectedAddress)?.phone || "",
        },
        theme: {
          color: "#fb641b",
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (response: any){
        alert("Payment Failed! " + response.error.description);
      });
      rzp.open();
    } catch (error) {
      console.error(error);
      alert("Something went wrong loading the payment gateway.");
    }
  };

  return (
    <>
    <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
    <div className="bg-[#f1f3f6] min-h-screen pt-4 pb-20 font-sans">
      <div className="max-w-[1200px] mx-auto px-4 pb-3">
        <div className="text-[13px] text-gray-500 flex items-center gap-2">
          <Link href="/" className="hover:text-[var(--color-devam-red)] transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href="/cart" className="hover:text-[var(--color-devam-red)] transition-colors">Cart</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="font-medium text-gray-900">Checkout</span>
        </div>
      </div>
      <div className="max-w-[1200px] mx-auto px-4 flex flex-col lg:flex-row gap-6">
        
        {/* LEFT COLUMN: CHECKOUT STEPS */}
        <div className="flex-1 flex flex-col gap-4">
          
          {/* STEP 1: DELIVERY ADDRESS */}
          <div className={`bg-white rounded shadow-sm overflow-hidden ${step === 1 ? 'border border-[var(--color-devam-brown)]' : ''}`}>
            <div className={`p-4 flex items-center gap-4 ${step === 1 ? 'bg-[var(--color-devam-brown)] text-white' : 'bg-white text-gray-500'}`}>
              <div className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${step === 1 ? 'bg-white text-[var(--color-devam-brown)]' : 'bg-gray-200 text-gray-500'}`}>1</div>
              <h2 className="font-bold uppercase tracking-wide">Delivery Address</h2>
              {step > 1 && <CheckCircle2 className="w-5 h-5 text-green-600 ml-auto" />}
            </div>
            
            {step === 1 && (
              <div className="p-6">
                {addresses.length === 0 ? (
                  <div className="text-center text-gray-500 py-10 border border-gray-200 rounded">
                    <MapPin className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                    <p className="mb-6">You haven't added any addresses yet.</p>
                    <Link href="/account?tab=addresses" className="bg-[var(--color-devam-red)] text-white font-bold px-6 py-3 rounded-lg uppercase tracking-wide text-sm hover:bg-[#d62828] transition-colors inline-block">
                      Add a New Address
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                  {addresses.map((addr) => (
                    <label key={addr.id} className={`flex gap-4 p-4 border rounded cursor-pointer transition-colors ${selectedAddress === addr.id ? 'border-[var(--color-devam-brown)] bg-orange-50/30' : 'border-gray-200 hover:border-gray-300'}`}>
                      <input 
                        type="radio" 
                        name="address" 
                        checked={selectedAddress === addr.id}
                        onChange={() => setSelectedAddress(addr.id)}
                        className="mt-1 w-4 h-4 text-[var(--color-devam-brown)] focus:ring-[var(--color-devam-brown)]" 
                      />
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-bold text-gray-900">{addr.name}</span>
                          <span className="bg-gray-200 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded uppercase">{addr.type}</span>
                        </div>
                        <p className="text-gray-600 text-sm">
                          {addr.houseNo}{addr.buildingName ? `, ${addr.buildingName}` : ""}, {addr.street}, {addr.area}{addr.landmark ? `, Landmark: ${addr.landmark}` : ""}, {addr.cityDistrict}, {addr.state} - <span className="font-bold">{addr.pin}</span>
                        </p>
                        {selectedAddress === addr.id && (
                          <div className="mt-4 animate-in fade-in">
                            <div className="mb-4 bg-white border border-gray-200 rounded p-4 shadow-sm">
                              <label className="block text-sm font-bold text-gray-900 mb-1">GST Number (Optional)</label>
                              <p className="text-xs text-gray-500 mb-2">Include for B2B invoices and tax credits.</p>
                              <input 
                                type="text" 
                                value={gstNumber}
                                onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
                                placeholder="e.g. 22AAAAA0000A1Z5"
                                className="w-full max-w-sm border border-gray-300 rounded px-3 py-2 text-sm focus:ring-[var(--color-devam-brown)] focus:border-[var(--color-devam-brown)] font-mono"
                              />
                            </div>
                            <button 
                              onClick={() => setStep(2)}
                              className="bg-[#fb641b] text-white font-bold px-8 py-3 rounded shadow-sm uppercase text-sm tracking-wide hover:bg-[#f35200] transition-colors"
                            >
                              Deliver Here
                            </button>
                          </div>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
                )}
              </div>
            )}
            
            {step > 1 && selectedAddress && (
              <div className="p-4 px-14 text-sm text-gray-900">
                <span className="font-bold mr-2">{addresses.find(a => a.id === selectedAddress)?.name}</span>
                {addresses.find(a => a.id === selectedAddress)?.street}, {addresses.find(a => a.id === selectedAddress)?.city}
              </div>
            )}
          </div>

          {/* STEP 2: PAYMENT OPTIONS */}
          <div className={`bg-white rounded shadow-sm overflow-hidden ${step === 2 ? 'border border-[var(--color-devam-brown)]' : ''}`}>
            <div className={`p-4 flex items-center gap-4 ${step === 2 ? 'bg-[var(--color-devam-brown)] text-white' : 'bg-white text-gray-500'}`}>
              <div className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${step === 2 ? 'bg-white text-[var(--color-devam-brown)]' : 'bg-gray-200 text-gray-500'}`}>2</div>
              <h2 className="font-bold uppercase tracking-wide">Payment Options</h2>
            </div>
            
            {step === 2 && (
              <div className="flex flex-col">
                <label className="flex items-start gap-4 p-6 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors">
                  <input type="radio" name="payment" value="upi" checked={paymentMethod === 'upi'} onChange={(e) => setPaymentMethod(e.target.value)} className="mt-1 w-4 h-4 text-[var(--color-devam-brown)] focus:ring-[var(--color-devam-brown)]" />
                  <div className="flex-1">
                    <span className="font-bold text-gray-900 block mb-2">UPI (Google Pay, PhonePe, Paytm)</span>
                    {paymentMethod === 'upi' && (
                      <div className="mt-4 animate-in fade-in">
                        <p className="text-sm text-gray-500 mb-4">You will be redirected securely via Razorpay to complete your UPI payment.</p>
                        <button onClick={handleRazorpayPayment} className="bg-[#fb641b] text-white font-bold px-8 py-3 rounded shadow-sm uppercase tracking-wide hover:bg-[#f35200] transition-colors w-full sm:w-auto">
                          Pay ₹{finalAmount} Securely
                        </button>
                      </div>
                    )}
                  </div>
                </label>

                <label className="flex items-start gap-4 p-6 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors">
                  <input type="radio" name="payment" value="card" checked={paymentMethod === 'card'} onChange={(e) => setPaymentMethod(e.target.value)} className="mt-1 w-4 h-4 text-[var(--color-devam-brown)] focus:ring-[var(--color-devam-brown)]" />
                  <div className="flex-1">
                    <span className="font-bold text-gray-900 block mb-2">Credit / Debit Card</span>
                    {paymentMethod === 'card' && (
                      <div className="mt-4 animate-in fade-in">
                        <p className="text-sm text-gray-500 mb-4">Razorpay supports all major Credit & Debit cards securely.</p>
                        <button onClick={handleRazorpayPayment} className="bg-[#fb641b] text-white font-bold px-8 py-3 rounded shadow-sm uppercase tracking-wide hover:bg-[#f35200] transition-colors w-full sm:w-auto">
                          Enter Card Details Securely
                        </button>
                      </div>
                    )}
                  </div>
                </label>

                <label className="flex items-start gap-4 p-6 cursor-pointer hover:bg-gray-50 transition-colors">
                  <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={(e) => setPaymentMethod(e.target.value)} className="mt-1 w-4 h-4 text-[var(--color-devam-brown)] focus:ring-[var(--color-devam-brown)]" />
                  <div className="flex-1">
                    <span className="font-bold text-gray-900 block mb-2">Cash on Delivery</span>
                    {paymentMethod === 'cod' && (
                      <div className="mt-4 animate-in fade-in">
                        <button onClick={() => {
                          const newOrderId = getNextOrderId();
                          addOrder({
                            id: newOrderId,
                            date: new Date().toISOString(),
                            totalAmount: finalAmount,
                            paymentMethod: "Cash on Delivery",
                            items: items,
                            status: 'Order Placed',
                            customerName: addresses.find(a => a.id === selectedAddress)?.name || "Guest",
                            gstNumber: gstNumber || undefined
                          });
                          clearCart();
                          setLastOrderId(newOrderId);
                          setOrderPlaced(true);
                        }} className="bg-[#fb641b] text-white font-bold px-8 py-3 rounded shadow-sm uppercase tracking-wide hover:bg-[#f35200] transition-colors w-full sm:w-auto">
                          Confirm Order
                        </button>
                      </div>
                    )}
                  </div>
                </label>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: ORDER SUMMARY */}
        <div className="w-full lg:w-[350px] flex-shrink-0">
          <div className="bg-white rounded shadow-sm sticky top-28">
            <div className="border-b border-gray-100 p-4">
              <h2 className="text-gray-500 font-bold uppercase text-sm tracking-wide">Order Summary</h2>
            </div>
            
            <div className="p-5 flex flex-col gap-4 border-b border-gray-100">
              <div className="flex justify-between items-center text-[15px]">
                <span className="text-gray-900">Price ({totalItems} items, {totalWeightKg.toFixed(1)} Kg)</span>
                <span className="text-gray-900">₹{totalPrice}</span>
              </div>
              <div className="flex justify-between items-center text-[15px]">
                <span className="text-gray-900">
                  Shipping {shippingStatus === "Bulk/Heavy" && <span className="text-orange-500 text-xs font-bold ml-1">(Bulk Order)</span>}
                </span>
                <span>
                  {shippingCost === 0 ? (
                    <span className="text-green-600 font-bold">Free</span>
                  ) : (
                    <span className="text-gray-900">₹{shippingCost}</span>
                  )}
                </span>
              </div>
            </div>

            <div className="p-5 flex justify-between items-center border-b border-gray-100 bg-gray-50">
              <span className="text-lg font-bold text-gray-900">Amount Payable</span>
              <span className="text-xl font-bold text-gray-900">₹{finalAmount}</span>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-center gap-2 text-gray-500 text-sm px-4">
            <ShieldCheck className="w-8 h-8 text-gray-400 flex-shrink-0" />
            <p>Safe and Secure Payments. Easy returns. 100% Authentic products.</p>
          </div>
        </div>

      </div>
    </div>
    </>
  );
}
