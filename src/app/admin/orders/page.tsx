"use client";

import { useState, useEffect } from "react";
import { useOrderStore, Order, computeTimeline } from "@/store/orderStore";
import { subscribeToLiveOrders, updateOrderInFirestore } from "@/lib/orderSync";
import { 
  Search, 
  ChevronDown, 
  Clock, 
  CheckCircle, 
  Truck, 
  PackageCheck, 
  Eye, 
  X, 
  Printer, 
  RefreshCw, 
  MapPin, 
  Phone, 
  Mail, 
  ExternalLink,
  MessageSquare,
  Radio
} from "lucide-react";
import { toast } from "sonner";

export default function AdminOrdersPage() {
  const orders = useOrderStore(state => state.orders);
  const updateOrderStatus = useOrderStore(state => state.updateOrderStatus);
  const clearAllOrders = useOrderStore(state => state.clearAllOrders);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [latestLiveAlert, setLatestLiveAlert] = useState<Order | null>(null);

  // Tracking modal state
  const [shippingModalOrder, setShippingModalOrder] = useState<Order | null>(null);
  const [trackingInput, setTrackingInput] = useState({ number: "", courier: "SpeedPost" });

  // Subscribe to live order stream (Firestore + Tab Broadcast)
  useEffect(() => {
    const unsub = subscribeToLiveOrders((newOrder) => {
      setLatestLiveAlert(newOrder);
      toast.success(`🚨 NEW LIVE ORDER RECEIVED: #${newOrder.id} (${newOrder.customerName} - ₹${newOrder.totalAmount})`, {
        duration: 8000,
        description: `Items: ${newOrder.items?.length || 0} • Phone: ${newOrder.customerPhone || 'N/A'}`
      });
    });
    return () => unsub();
  }, []);

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (order.customerName && order.customerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (order.customerPhone && order.customerPhone.includes(searchTerm));
    const matchesStatus = filterStatus === "All" || order.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Order Placed': return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Confirmed': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Shipped': return 'bg-indigo-100 text-indigo-800 border-indigo-300';
      case 'Out for Dispatch': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'Delivered': return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusStepIndex = (status: string) => {
    switch (status) {
      case 'Order Placed': return 1;
      case 'Confirmed': return 2;
      case 'Shipped': return 3;
      case 'Out for Dispatch': return 4;
      case 'Delivered': return 5;
      default: return 1;
    }
  };

  const triggerNotification = async (targetOrder: Order, newStatus: Order['status'], extraTracking?: { trackingNumber: string; courierPartner: string }) => {
    try {
      await fetch('/api/notifications/order-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: targetOrder.id,
          customerName: targetOrder.customerName || "Customer",
          customerEmail: targetOrder.customerEmail,
          customerPhone: targetOrder.customerPhone,
          totalAmount: targetOrder.totalAmount,
          items: targetOrder.items,
          status: newStatus,
          shippingAddress: targetOrder.shippingAddress,
          trackingNumber: extraTracking?.trackingNumber || targetOrder.trackingNumber,
          courierPartner: extraTracking?.courierPartner || targetOrder.courierPartner
        })
      });
      toast.success(`Notification sent for order #${targetOrder.id}`);
    } catch (err) {
      console.error("Failed to dispatch notification", err);
    }
  };

  const handleStatusChange = (id: string, newStatus: Order['status']) => {
    const targetOrder = orders.find(o => o.id === id);
    if (!targetOrder) return;

    if (newStatus === 'Shipped') {
      setShippingModalOrder(targetOrder);
      setTrackingInput({
        number: targetOrder.trackingNumber || `SP${Math.floor(10000000 + Math.random() * 90000000)}IN`,
        courier: targetOrder.courierPartner || "SpeedPost"
      });
    } else {
      updateOrderStatus(id, newStatus);
      const updatedTimeline = computeTimeline(targetOrder.timeline, newStatus, targetOrder.date);
      updateOrderInFirestore(id, { status: newStatus, timeline: updatedTimeline });
      triggerNotification(targetOrder, newStatus);
    }
  };

  const confirmShippingUpdate = () => {
    if (!shippingModalOrder) return;
    
    const updatedTimeline = computeTimeline(shippingModalOrder.timeline, 'Shipped', shippingModalOrder.date);
    updateOrderStatus(shippingModalOrder.id, 'Shipped', {
      trackingNumber: trackingInput.number,
      courierPartner: trackingInput.courier
    });

    updateOrderInFirestore(shippingModalOrder.id, {
      status: 'Shipped',
      trackingNumber: trackingInput.number,
      courierPartner: trackingInput.courier,
      timeline: updatedTimeline
    });

    triggerNotification(shippingModalOrder, 'Shipped', {
      trackingNumber: trackingInput.number,
      courierPartner: trackingInput.courier
    });

    toast.success(`Order #${shippingModalOrder.id} marked as Shipped!`);
    setShippingModalOrder(null);
  };

  return (
    <>
      <div className="max-w-7xl mx-auto print:hidden space-y-6">
        
        {/* Page Header & Quick Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-gray-900 font-heading">Order Tracking &amp; Management</h1>
              <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full text-[11px] font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                Live Stream Active
              </span>
            </div>
            <p className="text-xs text-gray-500">Real-time customer order monitoring, live intimation alerts, and shipment label generation.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                if (window.confirm("Are you sure you want to reset all order data and history?")) {
                  clearAllOrders();
                  toast.success("Order history reset!");
                }
              }}
              className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold px-3.5 py-2 rounded-xl text-xs transition-colors inline-flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-red-600" />
              Reset All
            </button>
            <button
              onClick={() => {
                if (orders.length === 0) {
                  toast.error("No orders available to export.");
                  return;
                }
                const headers = ["Order ID", "Customer Name", "Mobile Number", "Email", "Shipping Address", "Total Amount", "Payment Method", "Date", "Status", "Tracking Number"];
                const rows = orders.map(o => [
                  `"${o.id}"`,
                  `"${(o.customerName || 'Customer').replace(/"/g, '""')}"`,
                  `"${(o.customerPhone || '').replace(/"/g, '""')}"`,
                  `"${(o.customerEmail || '').replace(/"/g, '""')}"`,
                  `"${(o.shippingAddress || '').replace(/"/g, '""')}"`,
                  `"${o.totalAmount}"`,
                  `"${(o.paymentMethod || '').replace(/"/g, '""')}"`,
                  `"${new Date(o.date).toLocaleDateString('en-IN')}"`,
                  `"${o.status}"`,
                  `"${(o.trackingNumber || '').replace(/"/g, '""')}"`
                ]);
                const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
                const encodedUri = encodeURI(csvContent);
                const link = document.createElement("a");
                link.setAttribute("href", encodedUri);
                link.setAttribute("download", `Devam_Orders_Report_${new Date().toISOString().slice(0, 10)}.csv`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition-colors shadow-sm inline-flex items-center gap-2 cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Export Orders (CSV)
            </button>
          </div>
        </div>

        {/* Toolbar & Filter Bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50 flex flex-col sm:flex-row gap-4 justify-between items-center">
            <div className="relative w-full sm:w-96">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input 
                type="text" 
                placeholder="Search Order ID, Customer Name, or Mobile..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-gray-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[var(--color-devam-red)]"
              />
            </div>
            <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 custom-scrollbar">
              {['All', 'Order Placed', 'Confirmed', 'Shipped', 'Out for Dispatch', 'Delivered'].map(status => (
                <button 
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                    filterStatus === status 
                      ? 'bg-gray-900 text-white shadow-xs' 
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Orders Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-gray-100 text-gray-600 font-bold border-b border-gray-200 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Order ID</th>
                  <th className="px-5 py-3.5">Date</th>
                  <th className="px-5 py-3.5">Customer Details</th>
                  <th className="px-5 py-3.5">Total Amount</th>
                  <th className="px-5 py-3.5">Payment</th>
                  <th className="px-5 py-3.5">Order Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      No customer orders found matching your search.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map(order => {
                    const stepIdx = getStatusStepIndex(order.status);
                    return (
                      <tr key={order.id} className="hover:bg-amber-50/30 transition-colors">
                        <td className="px-5 py-4 font-extrabold text-gray-900 font-mono">{order.id}</td>
                        <td className="px-5 py-4 text-gray-500">
                          {new Date(order.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="px-5 py-4">
                          <p className="font-bold text-gray-900">{order.customerName || 'Online Customer'}</p>
                          <p className="text-[11px] text-gray-500">{order.customerPhone}</p>
                        </td>
                        <td className="px-5 py-4 font-bold text-gray-900 text-sm">₹{order.totalAmount}</td>
                        <td className="px-5 py-4">
                          <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-md text-[11px] font-bold border border-gray-200">
                            {order.paymentMethod}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="relative inline-block text-left min-w-[140px]">
                            <select 
                              value={order.status}
                              onChange={(e) => handleStatusChange(order.id, e.target.value as Order['status'])}
                              className={`appearance-none outline-none cursor-pointer pr-7 pl-3 py-1.5 rounded-full text-xs font-bold border flex items-center shadow-xs w-full transition-colors ${getStatusColor(order.status)}`}
                            >
                              <option value="Order Placed">Order Placed</option>
                              <option value="Confirmed">Confirmed</option>
                              <option value="Shipped">Shipped</option>
                              <option value="Out for Dispatch">Out for Dispatch</option>
                              <option value="Delivered">Delivered</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
                              <ChevronDown className="w-3 h-3 opacity-60" />
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-right flex items-center justify-end gap-2">
                          <a
                            href={`https://wa.me/${order.customerPhone ? order.customerPhone.replace(/\D/g, '') : '919979640900'}?text=${encodeURIComponent(
                              `Hello ${order.customerName || 'Valued Customer'},\n\n` +
                              `Status update for your Devam order *#${order.id}*: *${order.status.toUpperCase()}*.\n` +
                              (order.trackingNumber ? `Tracking ID: ${order.trackingNumber} (${order.courierPartner || 'SpeedPost'})\n` : '') +
                              `\nTrack status: https://thedevam.com/account\n\nThank you for choosing Devam Atta & Spices!`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 p-2 rounded-lg transition-colors inline-flex items-center gap-1 text-xs font-bold"
                            title="Send WhatsApp Alert"
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                          </a>

                          <button 
                            onClick={() => setSelectedOrder(order)}
                            className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-3 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1 text-xs font-bold"
                          >
                            <Eye className="w-3.5 h-3.5" /> Details
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Shipped Tracking Details Modal */}
      {shippingModalOrder && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-lg font-bold text-gray-900 font-heading">Ship Order #{shippingModalOrder.id}</h3>
            <p className="text-xs text-gray-500">Enter courier tracking details to send automated notifications to the customer.</p>
            
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Courier Partner</label>
                <input 
                  type="text" 
                  value={trackingInput.courier}
                  onChange={(e) => setTrackingInput({ ...trackingInput, courier: e.target.value })}
                  placeholder="e.g. SpeedPost, BlueDart, Delhivery, DTDC"
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Tracking / AWB Number</label>
                <input 
                  type="text" 
                  value={trackingInput.number}
                  onChange={(e) => setTrackingInput({ ...trackingInput, number: e.target.value })}
                  placeholder="e.g. SP102938475IN"
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-xs font-mono outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button 
                onClick={() => setShippingModalOrder(null)}
                className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-800"
              >
                Cancel
              </button>
              <button 
                onClick={confirmShippingUpdate}
                className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-colors shadow-sm"
              >
                Save &amp; Notify Customer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Details & Shipping Label Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200 print:static print:bg-white print:p-0 print:backdrop-blur-none">
          
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] print:hidden">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div>
                <h3 className="text-lg font-bold text-gray-900 font-heading">Order #{selectedOrder.id}</h3>
                <p className="text-xs text-gray-500 mt-0.5">Placed on {new Date(selectedOrder.date).toLocaleString()}</p>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 text-gray-400 hover:bg-gray-200 hover:text-gray-900 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              
              {/* Order Status Timeline Bar */}
              <div className="bg-amber-50/60 border border-amber-200/80 rounded-xl p-4">
                <p className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">Order Status Progress</p>
                <div className="flex items-center justify-between text-xs font-bold gap-2 overflow-x-auto pb-1">
                  {[
                    { key: 'orderPlaced', label: 'Order Placed' },
                    { key: 'confirmed', label: 'Confirmed' },
                    { key: 'shipped', label: 'Shipped' },
                    { key: 'outForDispatch', label: 'Out for Dispatch' },
                    { key: 'delivered', label: 'Delivered' }
                  ].map((step, i) => {
                    const currentIdx = getStatusStepIndex(selectedOrder.status);
                    const isPassed = (i + 1) <= currentIdx;
                    const timestamp = (selectedOrder.timeline as any)?.[step.key];
                    return (
                      <div key={step.key} className="flex flex-col items-center gap-1 text-center min-w-[76px]">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${isPassed ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                          {isPassed ? '✓' : i + 1}
                        </div>
                        <span className={`text-[11px] leading-tight ${isPassed ? 'text-emerald-900 font-bold' : 'text-gray-400'}`}>{step.label}</span>
                        {timestamp ? (
                          <span className="text-[10px] text-gray-500 font-normal leading-tight">
                            {new Date(timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}<br/>
                            {new Date(timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        ) : (
                          <span className="text-[9px] text-gray-400 italic">Pending</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 border-b pb-1">Customer Information</h4>
                  <p className="font-bold text-sm text-gray-900">{selectedOrder.customerName || 'Online Customer'}</p>
                  <p className="text-xs text-gray-600 mt-0.5">📧 {selectedOrder.customerEmail || 'customer@thedevam.com'}</p>
                  <p className="text-xs text-gray-600">📞 {selectedOrder.customerPhone || 'N/A'}</p>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 border-b pb-1">Shipping Address</h4>
                  <p className="text-xs text-gray-800 leading-relaxed font-medium">
                    {selectedOrder.shippingAddress || 'Address on file'}
                  </p>
                </div>
              </div>

              {/* Items List */}
              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 border-b pb-1">Purchased Products</h4>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-100 text-xs">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-lg border border-gray-200 flex items-center justify-center p-1">
                          <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{item.name}</p>
                          <p className="text-gray-500">Qty: {item.quantity} × ₹{item.price}</p>
                        </div>
                      </div>
                      <span className="font-bold text-gray-900">₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Summary */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-xs space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Payment Method</span>
                  <span className="font-bold text-gray-900">{selectedOrder.paymentMethod}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Courier Partner</span>
                  <span className="font-bold text-gray-900">{selectedOrder.courierPartner || 'SpeedPost'}</span>
                </div>
                {selectedOrder.trackingNumber && (
                  <div className="flex justify-between text-gray-600">
                    <span>Tracking Number</span>
                    <span className="font-bold font-mono text-gray-900">{selectedOrder.trackingNumber}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-2 border-t border-gray-200 text-sm">
                  <span className="font-bold text-gray-900">Total Paid</span>
                  <span className="font-bold text-[var(--color-devam-red)] text-base">₹{selectedOrder.totalAmount}</span>
                </div>
              </div>

            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-2">
              <button 
                onClick={() => window.print()}
                className="px-4 py-2 bg-[var(--color-devam-red)] text-white font-bold rounded-xl text-xs hover:bg-red-700 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                Print Shipping Label
              </button>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 bg-gray-200 text-gray-800 font-bold rounded-xl text-xs hover:bg-gray-300 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>

          {/* Printable Shipping Label View */}
          <div className="print:!block" style={{ display: 'none', fontFamily: 'Arial, sans-serif', fontSize: '11px', color: '#000', width: '100%' }}>
            <div style={{ border: '2px solid #000', padding: '0', width: '100%' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #000', padding: '8px 12px' }}>
                <div>
                  <div style={{ fontSize: '18px', fontWeight: '900', textTransform: 'uppercase' }}>DEVAM ATTA &amp; SPICES</div>
                  <div style={{ fontSize: '9px', color: '#555' }}>Shreeji Gruh Udhyog, Jhalod, Gujarat | www.thedevam.com</div>
                </div>
                <div style={{ border: '2px solid #000', padding: '4px 12px', fontSize: '16px', fontWeight: '900', textTransform: 'uppercase' }}>
                  {selectedOrder.paymentMethod.includes('Cash') ? 'C.O.D' : 'PREPAID'}
                </div>
              </div>

              <div style={{ display: 'flex', borderBottom: '2px solid #000', background: '#f9f9f9', padding: '8px 12px' }}>
                <div style={{ flex: 1 }}><strong>Order ID:</strong> {selectedOrder.id}</div>
                <div style={{ flex: 1 }}><strong>Date:</strong> {new Date(selectedOrder.date).toLocaleDateString('en-IN')}</div>
                <div style={{ flex: 1 }}><strong>Amount:</strong> ₹{selectedOrder.totalAmount}</div>
              </div>

              <div style={{ display: 'flex', borderBottom: '2px solid #000', padding: '12px' }}>
                <div style={{ flex: 1, borderRight: '2px solid #000', paddingRight: '12px' }}>
                  <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#666', textTransform: 'uppercase', marginBottom: '4px' }}>SHIP TO:</div>
                  <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{selectedOrder.customerName || 'Customer'}</div>
                  <div style={{ marginTop: '4px' }}>{selectedOrder.shippingAddress}</div>
                  <div style={{ marginTop: '4px', fontWeight: 'bold' }}>📞 {selectedOrder.customerPhone}</div>
                </div>
                <div style={{ flex: 1, paddingLeft: '12px' }}>
                  <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#666', textTransform: 'uppercase', marginBottom: '4px' }}>SHIP FROM:</div>
                  <div style={{ fontSize: '12px', fontWeight: 'bold' }}>SHREEJI GRUH UDHYOG</div>
                  <div>Godown Plot No. 5-6, City Survey No. 3354,</div>
                  <div>Block 1/12, Nr. Market Yard, Jhalod,</div>
                  <div>Dahod, Gujarat-389170, India</div>
                  <div style={{ marginTop: '4px' }}>📞 +91 99796 40900</div>
                </div>
              </div>

              <div style={{ padding: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', fontFamily: 'monospace', letterSpacing: '4px' }}>{selectedOrder.id}</div>
                <div style={{ fontSize: '8px', color: '#777', marginTop: '4px' }}>System Generated Shipping Label | Devam © {new Date().getFullYear()}</div>
              </div>

            </div>
          </div>

        </div>
      )}

    </>
  );
}
