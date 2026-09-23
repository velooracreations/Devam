"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import { useOrderStore, Order } from "@/store/orderStore";
import { useAuth } from "@/context/AuthContext";
import { useSettingsStore } from "@/store/settingsStore";
import { Address, getSavedAddresses, saveUserAddress, fetchServerAddresses, dedupeAddressesList } from "@/lib/addressStore";
import { saveOrderAndNotify } from "@/lib/orderSync";
import { toast } from "sonner";
import {
  ShieldCheck,
  Truck,
  CreditCard,
  MapPin,
  ChevronRight,
  CheckCircle2,
  ArrowLeft,
  Loader2,
  Lock,
} from "lucide-react";

// ── Address shape ────────────────────────────────────────────────────────────
const EMPTY_ADDR = {
  name: "",
  email: "",
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
};

const LS_ADDR = "devam_addr_draft";
const LS_SEL  = "devam_addr_sel";
const LS_STEP = "devam_checkout_step";

// ── Helper: safe localStorage ────────────────────────────────────────────────
function lsGet(key: string): string | null {
  try { return localStorage.getItem(key); } catch { return null; }
}
function lsSet(key: string, val: string) {
  try { localStorage.setItem(key, val); } catch {}
}
function lsRemove(...keys: string[]) {
  try { keys.forEach(k => localStorage.removeItem(k)); } catch {}
}


// ════════════════════════════════════════════════════════════════════════════

// ════════════════════════════════════════════════════════════════════════════
export default function CheckoutPage() {
  const router = useRouter();

  // ── Store ──────────────────────────────────────────────────────────────────
  const rawItems    = useCartStore((s) => s.items);
  const clearCart   = useCartStore((s) => s.clearCart);
  const getNextId   = useOrderStore((s) => s.getNextOrderId);
  const addOrder    = useOrderStore((s) => s.addOrder);
  const { user, userData, setUserData, loading: authLoading } = useAuth();
  const shippingRules = useSettingsStore((s) => s.shipping);

  const items = useMemo(() => (Array.isArray(rawItems) ? rawItems : []), [rawItems]);

  // Unified persistent saved addresses (Cloud Firestore + Local)
  const [cloudAddrs, setCloudAddrs] = useState<Address[]>([]);

  useEffect(() => {
    fetchServerAddresses(user, userData).then((addrs) => {
      if (addrs && addrs.length > 0) {
        setCloudAddrs(addrs);
      }
    });
  }, [user, userData]);

  const savedAddresses = useMemo(() => {
    const local = getSavedAddresses(user, userData);
    return dedupeAddressesList([...cloudAddrs, ...local]);
  }, [user, userData, cloudAddrs]);

  // ── UI state ───────────────────────────────────────────────────────────────
  const [hydrated, setHydrated]        = useState(false);
  const [step, setStep]                = useState<1 | 2>(1);
  const [placing, setPlacing]          = useState(false);
  const [placedOrder, setPlacedOrder]  = useState<Order | null>(null);
  const [payMethod, setPayMethod]      = useState<"razorpay" | "cod">("cod");

  // ── Address form state ─────────────────────────────────────────────────────
  const [form, setForm]       = useState(EMPTY_ADDR);
  const [selAddrId, setSelId] = useState("new");

  // ── Calculations ───────────────────────────────────────────────────────────
  const subtotal = useMemo(() => items.reduce((s, i) => s + i.price * i.quantity, 0), [items]);
  const shipping  = useMemo(() => {
    if (subtotal >= (shippingRules?.freeShippingThreshold ?? 499)) return 0;
    return shippingRules?.flatRate ?? 50;
  }, [subtotal, shippingRules]);
  const total = subtotal + shipping;

  // ── Hydration ──────────────────────────────────────────────────────────────
  useEffect(() => { setHydrated(true); }, []);

  // ── Restore address draft or pre-fill default saved address ────────────────
  useEffect(() => {
    if (!hydrated) return;

    // Check if we have a saved form draft
    const draft = lsGet(LS_ADDR);
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        if (parsed?.name && parsed?.phone && parsed?.houseNo && parsed?.street) {
          setForm((p) => ({ ...p, ...parsed }));
          const savedSel = lsGet(LS_SEL);
          if (savedSel) setSelId(savedSel);
          const savedStep = lsGet(LS_STEP);
          if (savedStep === "2") setStep(2);
          return;
        }
      } catch {}
    }

    // Otherwise auto-select default or first saved address
    const addrs = getSavedAddresses(user, userData);
    if (addrs.length > 0) {
      const def = addrs.find((a: any) => a.isDefault) ?? addrs[0];
      fillForm(def);
    } else if (user || userData) {
      setForm((p) => ({
        ...p,
        name:  p.name  || userData?.name  || user?.displayName || "",
        email: p.email || user?.email || userData?.email || (typeof window !== 'undefined' ? (localStorage.getItem('devam_user_email') || '') : '') || "",
        phone: p.phone || userData?.mobile || "",
      }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  // ── Persist form changes to localStorage ──────────────────────────────────
  useEffect(() => {
    if (!hydrated) return;
    if (form.name || form.phone || form.houseNo || form.pin) {
      lsSet(LS_ADDR, JSON.stringify(form));
      lsSet(LS_SEL,  selAddrId);
      lsSet(LS_STEP, String(step));
    }
  }, [form, selAddrId, step, hydrated]);

  // ── Redirect if cart is empty ──────────────────────────────────────────────
  useEffect(() => {
    if (hydrated && items.length === 0 && !placedOrder) {
      toast.info("Your cart is empty.");
      router.push("/shop");
    }
  }, [hydrated, items.length, placedOrder, router]);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const fillForm = useCallback((addr: any) => {
    setSelId(addr.id ?? "new");
    setForm({
      name:         addr.name         ?? userData?.name ?? user?.displayName ?? "",
      email:        addr.email        ?? user?.email ?? userData?.email ?? (typeof window !== 'undefined' ? (localStorage.getItem('devam_user_email') || '') : '') ?? "",
      phone:        addr.phone        ?? userData?.mobile ?? "",
      pin:          addr.pin          ?? "",
      houseNo:      addr.houseNo      ?? "",
      buildingName: addr.buildingName ?? "",
      street:       addr.street       ?? "",
      area:         addr.area         ?? "",
      landmark:     addr.landmark     ?? "",
      cityDistrict: addr.cityDistrict ?? "",
      state:        addr.state        ?? "",
      type:         addr.type         ?? "HOME",
    });
  }, [user, userData]);

  const resetToNewAddr = useCallback(() => {
    setSelId("new");
    setForm({
      ...EMPTY_ADDR,
      name:  userData?.name  || user?.displayName || "",
      phone: userData?.mobile || "",
    });
  }, [user, userData]);

  // ── PIN auto-fill ──────────────────────────────────────────────────────────
  const handlePinChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const pin = e.target.value.replace(/\D/g, "");
    setForm((p) => ({ ...p, pin }));
    if (pin.length === 6) {
      try {
        const r = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
        const d = await r.json();
        if (d?.[0]?.Status === "Success" && d[0].PostOffice?.length) {
          const po = d[0].PostOffice[0];
          setForm((p) => ({ ...p, cityDistrict: po.District || po.Block || p.cityDistrict, state: po.State || p.state }));
        }
      } catch {}
    }
  };

  // ── Address submit → save to Firebase + go to step 2 ─────────────────────
  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const missing = !form.name || !form.phone || !form.pin || !form.houseNo || !form.street || !form.area || !form.cityDistrict || !form.state;
    if (missing) { toast.error("Please fill all required (*) fields."); return; }
    if (form.phone.replace(/\D/g, "").length !== 10) { toast.error("Enter a valid 10-digit mobile number."); return; }
    if (form.pin.length !== 6) { toast.error("Enter a valid 6-digit PIN code."); return; }

    // Only save to addressStore if user selected "+ Add New Address"
    if (selAddrId === "new") {
      try {
        await saveUserAddress(form, user, userData, setUserData);
      } catch (e) {
        console.warn("[Checkout] Could not save address:", e);
      }
    }

    lsSet(LS_ADDR, JSON.stringify(form));
    lsSet(LS_SEL,  selAddrId);
    lsSet(LS_STEP, "2");
    setStep(2);
  };

  // ── Place order ────────────────────────────────────────────────────────────
  const handlePlaceOrder = async () => {
    if (placing) return;
    setPlacing(true);

    try {
      const orderId = getNextId();
      const addr = form;
      const fullAddr = `${addr.houseNo}${addr.buildingName ? " " + addr.buildingName : ""}, ${addr.street}, ${addr.area}${addr.landmark ? ", " + addr.landmark : ""}, ${addr.cityDistrict}, ${addr.state} — ${addr.pin}`;

      const now = new Date().toISOString();
      const orderData: Order = {
        id:              orderId,
        date:            now,
        totalAmount:     total,
        paymentMethod:   payMethod === "razorpay" ? "Razorpay (Online)" : "Cash on Delivery",
        items:           [...items],
        status:          "Order Placed",
        timeline: {
          orderPlaced:   now,
        },
        customerName:    addr.name  || userData?.name || user?.displayName || "Customer",
        customerEmail:   form.email?.trim() || user?.email || userData?.email || (typeof window !== 'undefined' ? (localStorage.getItem('devam_user_email') || '') : '') || "guest@thedevam.com",
        customerPhone:   addr.phone,
        shippingAddress: fullAddr,
      };

      if (form.email && typeof window !== 'undefined') {
        try { localStorage.setItem('devam_user_email', form.email.trim()); } catch {}
      }

      // ── Finalize helper (saves order to Firestore, notifies Admin, sends Email) ──
      const finalize = async () => {
        clearCart();                                     // empty cart
        lsRemove(LS_ADDR, LS_SEL, LS_STEP);             // clear draft
        setPlacedOrder(orderData);
        setPlacing(false);
        // Save to Cloud Firestore + Server cache, update user profile, broadcast real-time to Admin, and trigger mail notification
        const activeUid = user?.uid || userData?.uid || (typeof window !== 'undefined' ? (localStorage.getItem('devam_user_uid') || undefined) : undefined);
        await saveOrderAndNotify(orderData, activeUid);
      };

      // ── COD path ────────────────────────────────────────────────────────
      if (payMethod === "cod") {
        await finalize();
        return;
      }

      // ── Razorpay path ────────────────────────────────────────────────────
      let rzpData: any = null;
      try {
        const res = await fetch("/api/razorpay", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: total }),
        });
        if (res.ok) rzpData = await res.json();
      } catch {}

      const RzpSDK = (window as any).Razorpay;

      if (rzpData?.id && RzpSDK) {
        const rzp = new RzpSDK({
          key:         rzpData.key_id || "rzp_live_TcNI9ejHlDnlqC",
          amount:      rzpData.amount,
          currency:    "INR",
          name:        "Devam Atta & Spices",
          description: `Order #${orderId}`,
          order_id:    rzpData.id,
          handler: async () => {
            toast.success("Payment successful! Placing order…");
            await finalize();
          },
          modal: {
            ondismiss: () => {
              setPlacing(false);
              toast.info("Payment cancelled. You can try again or choose Cash on Delivery.");
            },
          },
          prefill: { name: addr.name, email: user?.email || "", contact: addr.phone },
          theme: { color: "#991b1b" },
        });
        rzp.open();
        // do NOT setPlacing(false) here — ondismiss will do it
      } else {
        // Razorpay not available → fall through to finalize as COD-equivalent
        toast.info("Online payment unavailable. Placing order directly.");
        await finalize();
      }
    } catch (err: any) {
      console.error("[Checkout] handlePlaceOrder error:", err);
      toast.error("Something went wrong. Please try again.");
      setPlacing(false);
    }
  };

  // ────────────────────────────────────────────────────────────────────────────
  // RENDER: Loading state
  // ────────────────────────────────────────────────────────────────────────────
  if (!hydrated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--color-devam-red)]" />
      </div>
    );
  }

  // ────────────────────────────────────────────────────────────────────────────
  // RENDER: Order Success Screen — shown as a full-page overlay with manual close
  // ────────────────────────────────────────────────────────────────────────────
  if (placedOrder) {
    return (
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center px-4 py-8 overflow-y-auto">
        <div className="bg-white rounded-3xl p-8 sm:p-10 max-w-md w-full text-center shadow-2xl border border-emerald-100 relative overflow-hidden my-auto">
          {/* Top color bar */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 rounded-t-3xl" />

          {/* Manual close button — top right */}
          <button
            onClick={() => router.push("/shop")}
            title="Close and continue shopping"
            className="absolute top-4 right-4 w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-500 hover:text-gray-800 transition-colors cursor-pointer z-10"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Animated green tick */}
          <div className="relative flex items-center justify-center mb-6 mt-4">
            <div className="absolute w-28 h-28 bg-emerald-400/20 rounded-full animate-ping" />
            <div className="relative w-24 h-24 bg-emerald-50 border-4 border-emerald-500 rounded-full flex items-center justify-center shadow-lg">
              <CheckCircle2 className="w-14 h-14 text-emerald-500" />
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2">
            Your Order Placed Successfully!
          </h1>
          <p className="text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl py-2 px-4 inline-block mb-6">
            ✅ Order Intimated to Devam Admin in Real-Time
          </p>

          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200 text-left space-y-2.5 mb-6 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Order ID</span>
              <span className="font-extrabold font-mono text-gray-900">{placedOrder.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Payment</span>
              <span className="font-bold text-gray-800">{placedOrder.paymentMethod}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Amount</span>
              <span className="font-extrabold text-emerald-700">₹{placedOrder.totalAmount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Customer</span>
              <span className="font-semibold text-gray-800">{placedOrder.customerName}</span>
            </div>
            {placedOrder.shippingAddress && (
              <div className="pt-2 border-t border-gray-200">
                <p className="text-gray-500 text-xs mb-1">Shipping To</p>
                <p className="text-xs text-gray-700 font-medium leading-relaxed">{placedOrder.shippingAddress}</p>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => router.push("/account?tab=orders")}
              className="w-full bg-[var(--color-devam-red)] hover:bg-red-800 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
            >
              View &amp; Track Order <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => router.push("/shop")}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3 rounded-xl transition-all cursor-pointer"
            >
              Continue Shopping
            </button>
          </div>

          <p className="text-[11px] text-gray-400 mt-4">Click × or any button above to close this confirmation</p>
        </div>
      </div>
    );
  }

  // ────────────────────────────────────────────────────────────────────────────
  // RENDER: Main checkout UI
  // ────────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#faf8f5] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-6 pb-4 border-b border-gray-200 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
              <Link href="/cart" className="hover:text-gray-900 flex items-center gap-1 font-medium">
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Cart
              </Link>
              <span>/</span>
              <span className="font-semibold text-gray-900">Checkout</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Secure Checkout</h1>
          </div>

          {/* Step progress */}
          <div className="flex items-center gap-3 text-xs font-bold">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${step >= 1 ? "bg-amber-100 text-amber-900 border-amber-300" : "bg-gray-100 text-gray-400 border-gray-200"}`}>
              <span className="w-5 h-5 rounded-full bg-amber-700 text-white flex items-center justify-center text-[10px]">1</span>
              Address
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${step >= 2 ? "bg-amber-100 text-amber-900 border-amber-300" : "bg-gray-100 text-gray-400 border-gray-200"}`}>
              <span className="w-5 h-5 rounded-full bg-amber-700 text-white flex items-center justify-center text-[10px]">2</span>
              Payment
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* ── LEFT: Steps ────────────────────────────────────────────────── */}
          <div className="lg:col-span-7 space-y-5">

            {/* STEP 1: Address */}
            <div className={`bg-white rounded-2xl border shadow-sm transition-all overflow-hidden ${step === 1 ? "border-amber-300 ring-2 ring-amber-200" : "border-gray-200"}`}>
              <div className="p-5 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[var(--color-devam-red)] text-white flex items-center justify-center font-bold text-sm">1</div>
                  <div>
                    <h2 className="text-base font-bold text-gray-900">Delivery Address</h2>
                    <p className="text-xs text-gray-500">Where should we deliver?</p>
                  </div>
                </div>
                {step === 2 && (
                  <button onClick={() => setStep(1)} className="text-xs font-bold text-[var(--color-devam-red)] hover:underline">Edit</button>
                )}
              </div>

              {step === 1 ? (
                <div className="p-6">
                  {/* Saved addresses */}
                  {savedAddresses.length > 0 && (
                    <div className="mb-6">
                      <p className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-3">Your Saved Addresses</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {savedAddresses.map((addr: any) => (
                          <div
                            key={addr.id}
                            onClick={() => fillForm(addr)}
                            className={`p-3.5 rounded-xl border cursor-pointer transition-all ${selAddrId === addr.id ? "border-[var(--color-devam-red)] bg-red-50/40 ring-1 ring-[var(--color-devam-red)]" : "border-gray-200 hover:border-gray-300"}`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[10px] font-bold uppercase bg-gray-100 text-gray-700 px-2 py-0.5 rounded">{addr.type || "HOME"}</span>
                              {selAddrId === addr.id && <CheckCircle2 className="w-4 h-4 text-[var(--color-devam-red)]" />}
                            </div>
                            <p className="font-bold text-sm text-gray-900">{addr.name}</p>
                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{addr.houseNo} {addr.street}, {addr.area}, {addr.cityDistrict} — {addr.pin}</p>
                            <p className="text-xs text-gray-400 mt-1">📞 {addr.phone}</p>
                          </div>
                        ))}

                        {/* Add new address card */}
                        <div
                          onClick={resetToNewAddr}
                          className={`p-3.5 rounded-xl border border-dashed cursor-pointer flex flex-col items-center justify-center min-h-[110px] text-center transition-all ${selAddrId === "new" ? "border-[var(--color-devam-red)] bg-red-50/30 ring-1 ring-[var(--color-devam-red)]" : "border-gray-300 hover:border-gray-400 bg-gray-50"}`}
                        >
                          <MapPin className="w-5 h-5 text-gray-400 mb-1" />
                          <span className="text-xs font-bold text-gray-700">+ Add New Address</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Address form */}
                  <form onSubmit={handleAddressSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Full Name *</label>
                        <input required type="text" value={form.name}
                          onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                          className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-[var(--color-devam-red)] outline-none"
                          placeholder="Jaydev Patel" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Mobile Number *</label>
                        <input required type="tel" maxLength={10} value={form.phone}
                          onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value.replace(/\D/g, "") }))}
                          className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-[var(--color-devam-red)] outline-none"
                          placeholder="10-digit mobile" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Email Address <span className="text-gray-400 font-normal">(for order confirmation &amp; invoice intimation)</span>
                      </label>
                      <input 
                        type="email" 
                        value={form.email || ''} 
                        onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-[var(--color-devam-red)] outline-none"
                        placeholder="yourname@gmail.com" 
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">PIN Code *</label>
                        <input required type="text" maxLength={6} value={form.pin}
                          onChange={handlePinChange}
                          className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm font-mono focus:ring-2 focus:ring-[var(--color-devam-red)] outline-none"
                          placeholder="389170" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">City / District *</label>
                        <input required type="text" value={form.cityDistrict}
                          onChange={(e) => setForm((p) => ({ ...p, cityDistrict: e.target.value }))}
                          className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-[var(--color-devam-red)] outline-none"
                          placeholder="Dahod" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">State *</label>
                        <input required type="text" value={form.state}
                          onChange={(e) => setForm((p) => ({ ...p, state: e.target.value }))}
                          className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-[var(--color-devam-red)] outline-none"
                          placeholder="Gujarat" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">House / Plot No. *</label>
                        <input required type="text" value={form.houseNo}
                          onChange={(e) => setForm((p) => ({ ...p, houseNo: e.target.value }))}
                          className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-[var(--color-devam-red)] outline-none"
                          placeholder="Plot No. 5-6" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Building / Society</label>
                        <input type="text" value={form.buildingName}
                          onChange={(e) => setForm((p) => ({ ...p, buildingName: e.target.value }))}
                          className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-[var(--color-devam-red)] outline-none"
                          placeholder="Shreeji Udhyog Park" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Street / Road *</label>
                        <input required type="text" value={form.street}
                          onChange={(e) => setForm((p) => ({ ...p, street: e.target.value }))}
                          className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-[var(--color-devam-red)] outline-none"
                          placeholder="Market Yard Road" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Area / Locality *</label>
                        <input required type="text" value={form.area}
                          onChange={(e) => setForm((p) => ({ ...p, area: e.target.value }))}
                          className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-[var(--color-devam-red)] outline-none"
                          placeholder="Jhalod" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Landmark (Optional)</label>
                      <input type="text" value={form.landmark}
                        onChange={(e) => setForm((p) => ({ ...p, landmark: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-[var(--color-devam-red)] outline-none"
                        placeholder="Near Main Market Gate" />
                    </div>

                    {/* Address type */}
                    <div>
                      <p className="text-xs font-bold text-gray-700 mb-2">Address Type</p>
                      <div className="flex gap-5">
                        {(["HOME", "WORK", "OTHER"] as const).map((t) => (
                          <label key={t} className="flex items-center gap-2 text-xs font-bold text-gray-700 cursor-pointer">
                            <input type="radio" name="addrType" checked={form.type === t}
                              onChange={() => setForm((p) => ({ ...p, type: t }))}
                              className="accent-[var(--color-devam-red)]" />
                            {t.charAt(0) + t.slice(1).toLowerCase()}
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                      <button type="submit"
                        className="px-8 py-3 bg-[var(--color-devam-red)] text-white font-bold rounded-xl text-sm hover:bg-red-800 transition-all shadow-md flex items-center gap-2 cursor-pointer">
                        Proceed to Payment <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="p-4 bg-emerald-50/60 flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span className="font-bold text-gray-800">
                    Delivering to: {form.name} — {form.houseNo} {form.street}, {form.cityDistrict}
                  </span>
                </div>
              )}
            </div>

            {/* STEP 2: Payment */}
            <div className={`bg-white rounded-2xl border shadow-sm transition-all overflow-hidden ${step === 2 ? "border-amber-300 ring-2 ring-amber-200" : "border-gray-200 opacity-80"}`}>
              <div className="p-5 border-b border-gray-100 bg-gray-50 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[var(--color-devam-red)] text-white flex items-center justify-center font-bold text-sm">2</div>
                <div>
                  <h2 className="text-base font-bold text-gray-900">Payment Options</h2>
                  <p className="text-xs text-gray-500">100% secure encrypted processing</p>
                </div>
              </div>

              {step === 2 && (
                <div className="p-6 space-y-4">
                  {/* Razorpay option */}
                  <div
                    onClick={() => setPayMethod("razorpay")}
                    className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${payMethod === "razorpay" ? "border-[var(--color-devam-red)] bg-red-50/40 ring-1 ring-[var(--color-devam-red)]" : "border-gray-200 hover:border-gray-300"}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center bg-white border-gray-300">
                        {payMethod === "razorpay" && <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-devam-red)]" />}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-gray-900 flex items-center gap-2">
                          UPI / Card / NetBanking
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">Instant</span>
                        </p>
                        <p className="text-xs text-gray-500">Pay securely via Razorpay</p>
                      </div>
                    </div>
                    <CreditCard className="w-5 h-5 text-gray-400" />
                  </div>

                  {/* COD option */}
                  <div
                    onClick={() => setPayMethod("cod")}
                    className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${payMethod === "cod" ? "border-[var(--color-devam-red)] bg-red-50/40 ring-1 ring-[var(--color-devam-red)]" : "border-gray-200 hover:border-gray-300"}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center bg-white border-gray-300">
                        {payMethod === "cod" && <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-devam-red)]" />}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-gray-900">Cash on Delivery (COD)</p>
                        <p className="text-xs text-gray-500">Pay when your package arrives</p>
                      </div>
                    </div>
                    <Truck className="w-5 h-5 text-gray-400" />
                  </div>

                  <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="text-xs font-bold text-gray-500 hover:text-gray-800 transition-colors"
                    >
                      ← Back to Address
                    </button>
                    <button
                      type="button"
                      disabled={placing}
                      onClick={handlePlaceOrder}
                      className="px-8 py-3 bg-[var(--color-devam-red)] text-white font-bold rounded-xl text-sm hover:bg-red-800 transition-all shadow-lg disabled:opacity-60 flex items-center gap-2 cursor-pointer"
                    >
                      {placing ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Processing…</>
                      ) : (
                        <><Lock className="w-4 h-4" /> Place Order — ₹{total}</>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── RIGHT: Order Summary ──────────────────────────────────────── */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden sticky top-24">
              <div className="p-5 border-b border-gray-100 bg-gray-50">
                <h3 className="font-bold text-gray-900">Order Summary ({items.reduce((s, i) => s + i.quantity, 0)} items)</h3>
              </div>
              <div className="p-5">
                <div className="space-y-3 mb-5 max-h-64 overflow-y-auto pr-1">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        {item.image && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{item.name}</p>
                        <p className="text-xs text-gray-500">{item.weight} × {item.quantity}</p>
                      </div>
                      <p className="text-sm font-bold text-gray-900 flex-shrink-0">₹{item.price * item.quantity}</p>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 border-t border-gray-100 pt-4 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span><span>₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span className={shipping === 0 ? "text-emerald-600 font-semibold" : ""}>
                      {shipping === 0 ? "FREE" : `₹${shipping}`}
                    </span>
                  </div>
                  <div className="flex justify-between font-extrabold text-gray-900 text-base border-t border-gray-200 pt-2 mt-1">
                    <span>Total</span><span>₹{total}</span>
                  </div>
                </div>

                <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
                  <p className="text-[11px] text-amber-900 leading-tight">
                    <strong>100% Authentic Guarantee</strong> — Fresh chakki ground atta &amp; pure spices direct from Jhalod, Gujarat.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
