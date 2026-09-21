import Link from "next/link";
import { CheckCircle2, ChevronRight } from "lucide-react";

export default function OrderSuccessPage({
  searchParams,
}: {
  searchParams: { order_id?: string; orderId?: string };
}) {
  const orderId = searchParams.orderId || searchParams.order_id || "ORD-10001";

  return (
    <div className="bg-[#faf8f5] min-h-screen py-24 px-4 flex items-center justify-center">
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

        <p className="text-xs text-gray-600 mb-6">
          Thank you for shopping with Devam. Your order ID is <strong className="text-gray-900 font-mono font-extrabold">{orderId}</strong>. We have dispatched notification alerts to our logistics team.
        </p>

        <div className="flex flex-col gap-3">
          <Link
            href="/account?tab=orders"
            className="w-full bg-[var(--color-devam-red)] hover:bg-red-800 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-sm cursor-pointer"
          >
            <span>View &amp; Track Order Details</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
          <Link
            href="/shop"
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3 px-6 rounded-xl transition-all border border-gray-200 text-sm cursor-pointer"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
