"use client";

import { ArrowUpRight, Package, TrendingUp, Users } from "lucide-react";
import { useOrderStore } from "@/store/orderStore";

export default function AdminDashboard() {
  const globalOrders = useOrderStore(state => state.orders);

  const stats = [
    { title: "Total Revenue", value: "₹4,52,310", change: "+12.5%", icon: TrendingUp },
    { title: "Total Orders", value: "854", change: "+5.2%", icon: Package },
    { title: "Active Customers", value: "3,210", change: "+18.1%", icon: Users },
  ];

  return (
    <div>
      <div className="mb-6">
        <p className="text-gray-500">Overview of your store's performance.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-500">{stat.title}</h3>
              <stat.icon className="w-5 h-5 text-gray-400" />
            </div>
            <div className="flex items-baseline">
              <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
              <p className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
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
            <button className="text-sm font-medium text-indigo-600 hover:text-indigo-500">View all</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="pb-3 font-medium text-gray-500">Order ID</th>
                  <th className="pb-3 font-medium text-gray-500">Customer</th>
                  <th className="pb-3 font-medium text-gray-500">Amount</th>
                  <th className="pb-3 font-medium text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[
                  ...globalOrders.map(o => ({
                    id: o.id.replace('ORD-', ''),
                    name: o.customerName || "Online Customer",
                    amount: o.totalAmount,
                    status: o.status
                  })),
                  { id: 9005, name: "Rahul Sharma", amount: 2450, status: "Processing" },
                  { id: 9004, name: "Priya Patel", amount: 850, status: "Pending" },
                  { id: 9003, name: "Amit Desai", amount: 1200, status: "Shipped" },
                  { id: 9002, name: "Neha Gupta", amount: 3100, status: "Delivered" },
                  { id: 9001, name: "Jaydev Patidar", amount: 1650, status: "Delivered" },
                ].slice(0, 5).map((order) => (
                  <tr key={order.id}>
                    <td className="py-3 text-gray-900 font-medium">#ORD-{order.id}</td>
                    <td className="py-3 text-gray-500">{order.name}</td>
                    <td className="py-3 text-gray-900 font-bold">₹{order.amount}</td>
                    <td className="py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                        order.status === 'Processing' || order.status === 'Order Placed' ? 'bg-yellow-100 text-yellow-800' :
                        order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">Low Stock Alerts</h2>
            <button className="text-sm font-medium text-indigo-600 hover:text-indigo-500">View inventory</button>
          </div>
          <div className="space-y-4">
            {[
              { name: "Premium Sharbati Atta - 10Kg", stock: 5 },
              { name: "Kashmiri Chilli Powder - 500g", stock: 12 },
              { name: "Unpolished Tur Dal - 5Kg", stock: 2 },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-red-500 mr-3"></div>
                  <span className="text-sm font-medium text-gray-900">{item.name}</span>
                </div>
                <span className="text-sm text-red-600 font-semibold">{item.stock} left</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
