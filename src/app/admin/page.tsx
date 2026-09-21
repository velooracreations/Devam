"use client";

import { useEffect } from "react";
import { ArrowUpRight, Package, TrendingUp, Users, RefreshCw, AlertTriangle, ShoppingBag, CheckCircle2 } from "lucide-react";
import { useOrderStore } from "@/store/orderStore";
import { useProductStore } from "@/store/productStore";
import { subscribeToLiveOrders } from "@/lib/orderSync";
import { toast } from "sonner";
import Link from "next/link";

export default function AdminDashboard() {
  const globalOrders = useOrderStore(state => state.orders);
  const clearAllOrders = useOrderStore(state => state.clearAllOrders);
  const products = useProductStore(state => state.products);

  // Subscribe to live order stream
  useEffect(() => {
    const unsub = subscribeToLiveOrders((newOrder) => {
      toast.success(`🚨 NEW LIVE ORDER: #${newOrder.id} (₹${newOrder.totalAmount})`);
    });
    return () => unsub();
  }, []);

  // Compute real metrics
  const totalRevenue = globalOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
  const totalOrders = globalOrders.length;
  
  const uniqueCustomers = new Set(
    globalOrders.map(o => o.customerEmail || o.customerPhone || o.customerName).filter(Boolean)
  ).size;

  const outOfStockProducts = products.filter(p => p.inStock === false);

  const handleResetDashboard = () => {
    if (window.confirm("Are you sure you want to reset all order data and dashboard stats to zero?")) {
      clearAllOrders();
      toast.success("Dashboard metrics and order history reset successfully!");
    }
  };

  const stats = [
    { title: "Total Revenue", value: `₹${totalRevenue.toLocaleString()}`, change: totalOrders > 0 ? "+100%" : "0%", icon: TrendingUp },
    { title: "Total Orders", value: totalOrders.toString(), change: totalOrders > 0 ? `+${totalOrders}` : "0", icon: Package },
    { title: "Active Customers", value: uniqueCustomers.toString(), change: uniqueCustomers > 0 ? `+${uniqueCustomers}` : "0", icon: Users },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-500 text-sm mt-0.5">Real-time overview of your store's performance and inventory alerts.</p>
        </div>

        <button
          onClick={handleResetDashboard}
          className="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold px-4 py-2.5 rounded-lg transition-colors border border-gray-200 self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className="w-4 h-4 text-gray-500" /> Reset Dashboard Metrics
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-500">{stat.title}</h3>
              <stat.icon className="w-5 h-5 text-[var(--color-devam-red)]" />
            </div>
            <div className="flex items-baseline">
              <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
              <p className="ml-2 flex items-baseline text-xs font-semibold text-green-600">
                <ArrowUpRight className="w-3 h-3 mr-0.5" />
                {stat.change}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">Recent Orders</h2>
            <Link href="/admin/orders" className="text-sm font-medium text-[var(--color-devam-red)] hover:underline">
              View all
            </Link>
          </div>

          {globalOrders.length === 0 ? (
            <div className="text-center py-12 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
              <ShoppingBag className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-gray-700">No orders placed yet</p>
              <p className="text-xs text-gray-500 mt-1">Dashboard will update automatically when customers place orders.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-xs text-gray-500 uppercase tracking-wider">
                    <th className="pb-3 font-medium">Order ID</th>
                    <th className="pb-3 font-medium">Customer</th>
                    <th className="pb-3 font-medium">Amount</th>
                    <th className="pb-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {globalOrders.slice(0, 5).map((order) => (
                    <tr key={order.id}>
                      <td className="py-3 text-gray-900 font-medium">{order.id}</td>
                      <td className="py-3 text-gray-600">{order.customerName || order.customerEmail || "Customer"}</td>
                      <td className="py-3 text-gray-900 font-bold">₹{order.totalAmount}</td>
                      <td className="py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                          order.status === 'Confirmed' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'Shipped' ? 'bg-purple-100 text-purple-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Low / Out of Stock Alerts */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">Inventory & Stock Alerts</h2>
            <Link href="/admin/inventory" className="text-sm font-medium text-[var(--color-devam-red)] hover:underline">
              View inventory
            </Link>
          </div>

          {outOfStockProducts.length === 0 ? (
            <div className="text-center py-12 bg-green-50/50 rounded-xl border border-green-200/60">
              <CheckCircle2 className="w-10 h-10 text-green-600 mx-auto mb-2" />
              <p className="text-sm font-bold text-green-900">All Products In Stock</p>
              <p className="text-xs text-green-700 mt-1">No low-stock or out-of-stock items detected.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {outOfStockProducts.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-red-50/60 rounded-lg border border-red-100">
                  <div className="flex items-center gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-bold text-gray-900">{item.name}</p>
                      <p className="text-xs text-gray-500">{item.weight} • {item.category}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-red-600 bg-red-100 px-2.5 py-1 rounded-full">
                    Out of Stock
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
