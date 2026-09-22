"use client";

import { useEffect, useState } from "react";
import {
  ArrowUpRight, Package, TrendingUp, Users, RefreshCw,
  AlertTriangle, ShoppingBag, CheckCircle2, Bell, MapPin,
  Phone, X, ExternalLink, Clock
} from "lucide-react";
import { useOrderStore, Order } from "@/store/orderStore";
import { useProductStore } from "@/store/productStore";
import { subscribeToLiveOrders } from "@/lib/orderSync";
import { toast } from "sonner";
import Link from "next/link";

// ── Live Order Alert Banner ──────────────────────────────────────────────────
function LiveOrderAlert({ order, onDismiss }: { order: Order; onDismiss: () => void }) {
  const cleanPhone = (order.customerPhone || '').replace(/\D/g, '');
  const waPhone = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;

  const adminMsg = encodeURIComponent(
    `🚨 *NEW ORDER — DEVAM*\n\n` +
    `📦 Order: ${order.id}\n` +
    `👤 Customer: ${order.customerName || 'Guest'}\n` +
    `📞 Phone: ${order.customerPhone || 'N/A'}\n` +
    `💰 Amount: ₹${order.totalAmount}\n` +
    `💳 Payment: ${order.paymentMethod}\n\n` +
    `📍 Ship To:\n${order.shippingAddress || 'See admin panel'}\n\n` +
    `🔗 Manage: https://thedevam.com/admin/orders`
  );

  return (
    <div className="bg-amber-50 border-2 border-amber-400 rounded-2xl p-4 sm:p-5 shadow-lg animate-in slide-in-from-top-2 duration-300 relative">
      <button
        onClick={onDismiss}
        className="absolute top-3 right-3 p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex items-start gap-3">
        <div className="relative flex-shrink-0">
          <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center">
            <Bell className="w-5 h-5 text-white" />
          </div>
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-white animate-ping" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <p className="font-extrabold text-amber-900 text-sm">🚨 New Order Received!</p>
            <span className="text-[10px] font-bold bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full uppercase">{order.id}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 mt-2 text-xs">
            <div className="flex items-center gap-1.5 text-gray-700">
              <Users className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
              <span className="font-semibold">{order.customerName || 'Guest'}</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-700">
              <Phone className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
              <span className="font-semibold">{order.customerPhone || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-700">
              <Package className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
              <span className="font-bold text-emerald-700">₹{order.totalAmount}</span>
              <span className="text-gray-400">— {order.paymentMethod}</span>
            </div>
          </div>

          {order.shippingAddress && (
            <div className="mt-2 bg-white border border-amber-200 rounded-xl px-3 py-2 flex items-start gap-2">
              <MapPin className="w-3.5 h-3.5 text-[var(--color-devam-red)] flex-shrink-0 mt-0.5" />
              <p className="text-xs text-gray-700 leading-relaxed font-medium">{order.shippingAddress}</p>
            </div>
          )}

          <div className="mt-3 flex flex-wrap gap-2">
            <a
              href={`https://wa.me/919979640900?text=${adminMsg}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors shadow-sm"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Alert My WhatsApp
            </a>
            <a
              href={`https://wa.me/${waPhone}?text=${encodeURIComponent(`✅ Hi ${order.customerName || 'Customer'}, your Devam order #${order.id} (₹${order.totalAmount}) is confirmed! We'll update you when shipped. Track: https://thedevam.com/account 🙏`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 bg-teal-50 hover:bg-teal-100 border border-teal-300 text-teal-800 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Confirm to Customer
            </a>
            <Link
              href="/admin/orders"
              className="inline-flex items-center gap-1.5 bg-gray-900 hover:bg-gray-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              View Full Order
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
export default function AdminDashboard() {
  const globalOrders   = useOrderStore((s) => s.orders);
  const clearAllOrders = useOrderStore((s) => s.clearAllOrders);
  const products       = useProductStore((s) => s.products);

  // Track live alerts (newest orders popups)
  const [liveAlerts, setLiveAlerts] = useState<Order[]>([]);

  // Subscribe to real-time order stream (Firestore + BroadcastChannel)
  useEffect(() => {
    const unsub = subscribeToLiveOrders((newOrder) => {
      setLiveAlerts((prev) => {
        if (prev.some((o) => o.id === newOrder.id)) return prev;
        return [newOrder, ...prev].slice(0, 5); // keep max 5 alerts
      });
      // Browser Notification API (if permission granted)
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        new Notification(`🚨 New Order #${newOrder.id}`, {
          body: `${newOrder.customerName} — ₹${newOrder.totalAmount} — ${newOrder.shippingAddress?.slice(0, 60)}...`,
          icon: '/logo.svg',
        });
      }
      toast.success(`🚨 New Order: #${newOrder.id} — ₹${newOrder.totalAmount}`, {
        duration: 10000,
        description: `${newOrder.customerName} (${newOrder.customerPhone})`,
      });
    });
    return () => unsub();
  }, []);

  // Request browser notification permission once
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const totalRevenue  = globalOrders.reduce((s, o) => s + (o.totalAmount || 0), 0);
  const totalOrders   = globalOrders.length;
  const pendingOrders = globalOrders.filter((o) => o.status === 'Order Placed').length;
  const uniqueCustomers = new Set(
    globalOrders.map((o) => o.customerEmail || o.customerPhone || o.customerName).filter(Boolean)
  ).size;
  const outOfStockProducts = products.filter((p) => p.inStock === false);

  const recentOrders = [...globalOrders]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 8);

  return (
    <div className="space-y-6">

      {/* Live Order Alert Banners */}
      {liveAlerts.length > 0 && (
        <div className="space-y-3">
          {liveAlerts.map((order) => (
            <LiveOrderAlert
              key={order.id}
              order={order}
              onDismiss={() => setLiveAlerts((prev) => prev.filter((o) => o.id !== order.id))}
            />
          ))}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Real-time store performance • orders sync live from Firestore
          </p>
        </div>
        <button
          onClick={() => {
            if (window.confirm('Reset all order data and stats?')) {
              clearAllOrders();
              setLiveAlerts([]);
              toast.success('Dashboard reset!');
            }
          }}
          className="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold px-4 py-2.5 rounded-lg transition-colors border border-gray-200 self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className="w-4 h-4 text-gray-500" /> Reset Metrics
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { title: 'Total Revenue',    value: `₹${totalRevenue.toLocaleString('en-IN')}`, sub: `${totalOrders} orders total`,        icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { title: 'Total Orders',     value: totalOrders.toString(),                      sub: 'All time',                           icon: Package,    color: 'text-blue-600',    bg: 'bg-blue-50'    },
          { title: 'Pending Orders',   value: pendingOrders.toString(),                    sub: 'Need action',                        icon: Clock,      color: 'text-amber-600',   bg: 'bg-amber-50',  urgent: pendingOrders > 0 },
          { title: 'Customers',        value: uniqueCustomers.toString(),                  sub: 'Unique buyers',                      icon: Users,      color: 'text-purple-600',  bg: 'bg-purple-50'  },
        ].map((stat, i) => (
          <div key={i} className={`bg-white rounded-2xl border p-5 shadow-sm ${stat.urgent ? 'border-amber-400 ring-1 ring-amber-200' : 'border-gray-100'}`}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{stat.title}</p>
              <div className={`w-8 h-8 ${stat.bg} rounded-lg flex items-center justify-center`}>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
            </div>
            <p className="text-2xl font-extrabold text-gray-900">{stat.value}</p>
            <p className={`text-xs mt-1 ${stat.urgent ? 'text-amber-700 font-bold' : 'text-gray-400'}`}>{stat.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Recent Orders — full width on left */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="text-base font-bold text-gray-900">Recent Orders</h2>
            <Link href="/admin/orders" className="text-xs font-bold text-[var(--color-devam-red)] hover:underline flex items-center gap-1">
              View All <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="text-center py-16 px-6">
              <ShoppingBag className="w-10 h-10 text-gray-200 mx-auto mb-3" />
              <p className="text-sm font-bold text-gray-500">No orders yet</p>
              <p className="text-xs text-gray-400 mt-1">Orders will appear here in real-time when customers place them.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {recentOrders.map((order) => {
                const statusColor =
                  order.status === 'Delivered'   ? 'bg-emerald-100 text-emerald-800' :
                  order.status === 'Shipped'     ? 'bg-blue-100 text-blue-800' :
                  order.status === 'Confirmed'   ? 'bg-purple-100 text-purple-800' :
                  'bg-amber-100 text-amber-800';

                const cleanPh = (order.customerPhone || '').replace(/\D/g, '');
                const waPh = cleanPh.startsWith('91') ? cleanPh : `91${cleanPh}`;
                const waMsg = encodeURIComponent(`Hello ${order.customerName || 'Customer'}, your Devam order *#${order.id}* (₹${order.totalAmount}) status: *${order.status}*. Track: https://thedevam.com/account`);

                return (
                  <div key={order.id} className="px-5 py-4 hover:bg-amber-50/30 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-extrabold text-sm text-gray-900 font-mono">{order.id}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusColor}`}>{order.status}</span>
                        </div>
                        <p className="text-xs text-gray-600 font-semibold mt-0.5">
                          {order.customerName} • {order.customerPhone}
                        </p>
                        {order.shippingAddress && (
                          <p className="text-[11px] text-gray-400 mt-0.5 truncate flex items-center gap-1">
                            <MapPin className="w-3 h-3 flex-shrink-0" />
                            {order.shippingAddress}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                        <span className="text-sm font-extrabold text-gray-900">₹{order.totalAmount}</span>
                        <a
                          href={`https://wa.me/${waPh}?text=${waMsg}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] font-bold bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 px-2 py-1 rounded-md transition-colors flex items-center gap-1"
                        >
                          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                          </svg>
                          WhatsApp
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-5">

          {/* How Admin Gets Notified — info card */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-5 text-white shadow-lg">
            <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-400" /> How You Get Notified
            </h3>
            <div className="space-y-2.5 text-xs text-gray-300">
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">1</span>
                <p><span className="text-white font-semibold">Dashboard Alert Banner</span> — Pops up instantly when any order is placed (on any device with admin open)</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">2</span>
                <p><span className="text-white font-semibold">Browser Notification</span> — Pop-up on your desktop/mobile (click Allow when prompted)</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">3</span>
                <p><span className="text-white font-semibold">WhatsApp Alert</span> — Click "Alert My WhatsApp" in the banner to send full order to your phone</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">4</span>
                <p><span className="text-white font-semibold">Firestore Live Sync</span> — Orders stored in Firebase, visible across all devices</p>
              </div>
            </div>
          </div>

          {/* Inventory alerts */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="text-sm font-bold text-gray-900">Stock Alerts</h2>
              <Link href="/admin/inventory" className="text-xs font-bold text-[var(--color-devam-red)] hover:underline">Manage</Link>
            </div>

            {outOfStockProducts.length === 0 ? (
              <div className="text-center py-8 px-5">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-xs font-bold text-emerald-900">All products in stock</p>
              </div>
            ) : (
              <div className="p-4 space-y-2">
                {outOfStockProducts.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-red-50 rounded-xl border border-red-100">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-gray-900">{item.name}</p>
                        <p className="text-[10px] text-gray-500">{item.weight}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-full">Out of Stock</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
