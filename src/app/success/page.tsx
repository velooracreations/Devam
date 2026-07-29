import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

export default function OrderSuccessPage({
  searchParams,
}: {
  searchParams: { order_id?: string };
}) {
  const orderId = searchParams.order_id || "Unknown";

  return (
    <div className="bg-[#f1f3f6] min-h-screen pt-32 pb-20 font-sans flex items-center justify-center">
      <div className="bg-white p-10 rounded-lg shadow-sm text-center max-w-md animate-in zoom-in-95 duration-500 border border-green-100">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h2>
        <p className="text-gray-500 mb-8">
          Thank you for shopping with Devam. Your order ID is <strong>{orderId}</strong> and will arrive by tomorrow.
        </p>
        <div className="flex flex-col gap-3">
          <Link
            href="/account?tab=orders"
            className="bg-[var(--color-devam-brown)] text-white font-bold px-6 py-3 rounded hover:bg-[var(--color-devam-red)] transition-colors"
          >
            View Order Details
          </Link>
          <Link
            href="/"
            className="text-[var(--color-devam-brown)] font-bold px-6 py-3 rounded hover:bg-gray-50 transition-colors border border-[var(--color-devam-brown)]"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
