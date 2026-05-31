"use client";

import { useState } from "react";
import { useOrderStore, Order } from "@/store/orderStore";
import { Search, ChevronDown, Clock, CheckCircle, Truck, PackageCheck, Eye, X, Printer } from "lucide-react";

export default function AdminOrdersPage() {
  const orders = useOrderStore(state => state.orders);
  const updateOrderStatus = useOrderStore(state => state.updateOrderStatus);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (order.customerName && order.customerName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = filterStatus === "All" || order.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Order Placed': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Confirmed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Shipped': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'Delivered': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Order Placed': return <Clock className="w-3.5 h-3.5 mr-1" />;
      case 'Confirmed': return <CheckCircle className="w-3.5 h-3.5 mr-1" />;
      case 'Shipped': return <Truck className="w-3.5 h-3.5 mr-1" />;
      case 'Delivered': return <PackageCheck className="w-3.5 h-3.5 mr-1" />;
      default: return null;
    }
  };

  const handleStatusChange = (id: string, newStatus: Order['status']) => {
    updateOrderStatus(id, newStatus);
  };

  return (
    <>
    <div className="max-w-7xl mx-auto print:hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Orders Manager</h2>
          <p className="text-gray-500 mt-1">View, track, and update customer orders.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:w-96">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
            <input 
              type="text" 
              placeholder="Search by Order ID or Customer Name..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-devam-red)] focus:border-transparent"
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            {['All', 'Order Placed', 'Confirmed', 'Shipped', 'Delivered'].map(status => (
              <button 
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  filterStatus === status 
                    ? 'bg-gray-900 text-white' 
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
              <tr>
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Date & Time</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Total Amount</th>
                <th className="px-6 py-4">Items</th>
                <th className="px-6 py-4">Payment</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    No orders found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map(order => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-900">{order.id}</td>
                    <td className="px-6 py-4 text-gray-500">{new Date(order.date).toLocaleString()}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">{order.customerName || 'Online Customer'}</td>
                    <td className="px-6 py-4 font-bold text-gray-900">₹{order.totalAmount}</td>
                    <td className="px-6 py-4 text-gray-500">{order.items.reduce((acc, item) => acc + item.quantity, 0)} items</td>
                    <td className="px-6 py-4 text-gray-500">
                      <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-md text-xs font-medium border border-gray-200">
                        {order.paymentMethod.includes('Razorpay') ? 'Prepaid (Razorpay)' : 'COD'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="relative inline-block text-left w-full">
                        <select 
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value as Order['status'])}
                          className={`appearance-none outline-none cursor-pointer pr-8 pl-3 py-1.5 rounded-full text-xs font-bold border flex items-center shadow-sm w-full transition-colors ${getStatusColor(order.status)}`}
                        >
                          <option value="Order Placed">Order Placed</option>
                          <option value="Confirmed">Confirmed</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
                          <ChevronDown className="w-3 h-3 opacity-50" />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => setSelectedOrder(order)}
                        className="text-indigo-600 hover:text-indigo-900 p-2 hover:bg-indigo-50 rounded-lg transition-colors inline-flex items-center gap-1 text-xs font-bold"
                      >
                        <Eye className="w-4 h-4" /> Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>

      {/* Order Details Modal — OUTSIDE the print:hidden wrapper */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200 print:static print:bg-white print:p-0 print:backdrop-blur-none">
          
          {/* VISIBLE UI MODAL (Hidden during print) */}
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200 print:hidden">
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 print:bg-white">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Order: {selectedOrder.id}</h3>
                <p className="text-sm text-gray-500 mt-1">Placed on {new Date(selectedOrder.date).toLocaleString()}</p>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="p-2 text-gray-400 hover:bg-gray-200 hover:text-gray-900 rounded-full transition-colors print:hidden"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                {/* Customer Details */}
                <div>
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 border-b pb-2">Customer Info</h4>
                  <div className="space-y-1">
                    <p className="font-bold text-gray-900">{selectedOrder.customerName || 'Online Customer'}</p>
                    <p className="text-sm text-gray-600">customer@devamfoods.com</p>
                    <p className="text-sm text-gray-600">+91 99999 99999</p>
                  </div>
                </div>

                {/* Shipping Address */}
                <div>
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 border-b pb-2">Shipping Address</h4>
                  <div className="space-y-1">
                    <p className="font-bold text-gray-900">Home</p>
                    <p className="text-sm text-gray-600">123 Main Street, Apt 4B</p>
                    <p className="text-sm text-gray-600">Ahmedabad, Gujarat 380001</p>
                  </div>
                </div>
              </div>

              {/* Items List */}
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 border-b pb-2">Order Items</h4>
              <div className="space-y-4 mb-8">
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-lg border border-gray-200 flex items-center justify-center p-1">
                        <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-sm">{item.name}</p>
                        <p className="text-xs text-gray-500">Qty: {item.quantity} × ₹{item.price}</p>
                      </div>
                    </div>
                    <div className="font-bold text-gray-900">
                      ₹{item.price * item.quantity}
                    </div>
                  </div>
                ))}
              </div>

              {/* Payment Summary */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Subtotal</span>
                  <span className="text-sm font-medium text-gray-900">₹{selectedOrder.totalAmount - 50}</span>
                </div>
                <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200">
                  <span className="text-sm text-gray-600">Shipping</span>
                  <span className="text-sm font-medium text-gray-900">₹50</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-900">Total Paid</span>
                  <span className="font-bold text-[var(--color-devam-red)] text-lg">₹{selectedOrder.totalAmount}</span>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200 flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-500 uppercase">Payment Method:</span>
                  <span className="text-sm font-medium text-gray-900 bg-white px-2 py-1 rounded border border-gray-200">{selectedOrder.paymentMethod}</span>
                </div>
              </div>
            </div>
            
            {/* Footer Action */}
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 print:hidden">
              <button 
                onClick={() => window.print()}
                className="px-6 py-2.5 bg-[var(--color-devam-red)] text-white font-bold rounded-lg hover:bg-red-700 transition-colors inline-flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                Print Shipping Label
              </button>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="px-6 py-2.5 bg-gray-200 text-gray-800 font-bold rounded-lg hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
          {/* PRINT-ONLY: Professional A5 Courier Shipping Label */}
          <div className="print:!block" style={{ display: 'none', fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '11px', color: '#000', lineHeight: '1.4', width: '100%' }}>
            <div style={{ border: '2px solid #000', padding: '0', width: '100%', margin: '0' }}>

              {/* ===== ROW 1: Company Header + Payment Badge ===== */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #000', padding: '8px 12px' }}>
                <div>
                  <div style={{ fontSize: '20px', fontWeight: '900', letterSpacing: '1px', textTransform: 'uppercase' }}>DEVAM</div>
                  <div style={{ fontSize: '9px', color: '#555' }}>Premium Spices &amp; Flours | www.thedevam.com</div>
                </div>
                <div style={{ border: '3px solid #000', padding: '6px 16px', fontSize: '18px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '2px' }}>
                  {selectedOrder.paymentMethod.includes('Cash') ? 'C.O.D' : 'PREPAID'}
                </div>
              </div>

              {/* ===== ROW 2: Order Info Bar ===== */}
              <div style={{ display: 'flex', borderBottom: '2px solid #000', backgroundColor: '#f5f5f5' }}>
                <div style={{ flex: 1, padding: '8px 14px', borderRight: '1px solid #ccc' }}>
                  <div style={{ fontSize: '9px', fontWeight: '700', color: '#777', textTransform: 'uppercase', letterSpacing: '1px' }}>Order ID</div>
                  <div style={{ fontSize: '15px', fontWeight: '900', marginTop: '2px' }}>{selectedOrder.id}</div>
                </div>
                <div style={{ flex: 1, padding: '8px 14px', borderRight: '1px solid #ccc' }}>
                  <div style={{ fontSize: '9px', fontWeight: '700', color: '#777', textTransform: 'uppercase', letterSpacing: '1px' }}>Order Date</div>
                  <div style={{ fontSize: '13px', fontWeight: '700', marginTop: '2px' }}>{new Date(selectedOrder.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                </div>
                <div style={{ flex: 1, padding: '8px 14px' }}>
                  <div style={{ fontSize: '9px', fontWeight: '700', color: '#777', textTransform: 'uppercase', letterSpacing: '1px' }}>Invoice Amount</div>
                  <div style={{ fontSize: '15px', fontWeight: '900', marginTop: '2px' }}>₹{selectedOrder.totalAmount}</div>
                </div>
              </div>

              {/* ===== ROW 3: Ship To / Ship From ===== */}
              <div style={{ display: 'flex', borderBottom: '2px solid #000' }}>
                {/* SHIP TO */}
                <div style={{ flex: 1, padding: '12px 14px', borderRight: '2px solid #000' }}>
                  <div style={{ fontSize: '9px', fontWeight: '700', color: '#777', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '6px', borderBottom: '1px solid #ddd', paddingBottom: '4px' }}>
                    SHIP TO (CUSTOMER)
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: '900', marginBottom: '4px' }}>{selectedOrder.customerName || 'Customer'}</div>
                  <div>123 Main Street, Apt 4B</div>
                  <div>Ahmedabad, Gujarat - 380001</div>
                  <div style={{ marginTop: '6px', fontWeight: '700' }}>📞 +91 99999 99999</div>
                  <div style={{ fontSize: '10px', color: '#555' }}>📧 customer@devamfoods.com</div>
                </div>
                {/* SHIP FROM */}
                <div style={{ flex: 1, padding: '12px 14px' }}>
                  <div style={{ fontSize: '9px', fontWeight: '700', color: '#777', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '6px', borderBottom: '1px solid #ddd', paddingBottom: '4px' }}>
                    SHIP FROM (SELLER)
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: '900', marginBottom: '4px' }}>SHREEJI GRUH UDHYOG</div>
                  <div>Godown Plot No. 5,6, City survey no. 3354,</div>
                  <div>Block no. 1/12, Nr. Market Yard,</div>
                  <div>Jhalod, Dahod, Gujarat - 389 170, IN</div>
                  <div style={{ marginTop: '6px', fontWeight: '700' }}>📞 +91 99796 40900</div>
                  <div style={{ fontSize: '10px', color: '#555' }}>GSTIN: 24CSFPP3315Q1ZD</div>
                </div>
              </div>

              {/* ===== ROW 4: Product Details Table ===== */}
              <div style={{ borderBottom: '2px solid #000', padding: '8px 12px', minHeight: '180px' }}>
                <div style={{ fontSize: '9px', fontWeight: '700', color: '#777', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '8px' }}>
                  PRODUCT DETAILS
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #999' }}>
                      <th style={{ textAlign: 'left', padding: '4px 0', fontWeight: '700', fontSize: '9px', textTransform: 'uppercase', color: '#555', width: '50%' }}>Product</th>
                      <th style={{ textAlign: 'center', padding: '4px 0', fontWeight: '700', fontSize: '9px', textTransform: 'uppercase', color: '#555', width: '10%' }}>Qty</th>
                      <th style={{ textAlign: 'right', padding: '4px 0', fontWeight: '700', fontSize: '9px', textTransform: 'uppercase', color: '#555', width: '20%' }}>Price</th>
                      <th style={{ textAlign: 'right', padding: '4px 0', fontWeight: '700', fontSize: '9px', textTransform: 'uppercase', color: '#555', width: '20%' }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.items.map((item, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '5px 0', fontWeight: '600' }}>{item.name}</td>
                        <td style={{ padding: '5px 0', textAlign: 'center' }}>{item.quantity}</td>
                        <td style={{ padding: '5px 0', textAlign: 'right' }}>₹{item.price}</td>
                        <td style={{ padding: '5px 0', textAlign: 'right', fontWeight: '700' }}>₹{item.price * item.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* ===== ROW 5: Payment Summary ===== */}
              <div style={{ display: 'flex', borderBottom: '2px solid #000' }}>
                <div style={{ flex: 1, padding: '10px 14px', borderRight: '1px solid #ccc' }}>
                  <div style={{ fontSize: '9px', fontWeight: '700', color: '#777', textTransform: 'uppercase', letterSpacing: '1px' }}>Payment Method</div>
                  <div style={{ fontSize: '13px', fontWeight: '700', marginTop: '2px' }}>{selectedOrder.paymentMethod}</div>
                </div>
                <div style={{ flex: 1, padding: '10px 14px', borderRight: '1px solid #ccc' }}>
                  <div style={{ fontSize: '9px', fontWeight: '700', color: '#777', textTransform: 'uppercase', letterSpacing: '1px' }}>Total Items</div>
                  <div style={{ fontSize: '13px', fontWeight: '700', marginTop: '2px' }}>{selectedOrder.items.reduce((s, i) => s + i.quantity, 0)}</div>
                </div>
                <div style={{ flex: 1, padding: '10px 14px' }}>
                  <div style={{ fontSize: '9px', fontWeight: '700', color: '#777', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    {selectedOrder.paymentMethod.includes('Cash') ? 'Amount to Collect' : 'Amount Paid'}
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: '900', marginTop: '2px' }}>₹{selectedOrder.totalAmount}</div>
                </div>
              </div>

              {/* ===== ROW 6: Barcode-style Order ID + Footer ===== */}
              <div style={{ padding: '10px 14px', textAlign: 'center' }}>
                <div style={{ fontSize: '28px', fontWeight: '900', letterSpacing: '6px', fontFamily: 'monospace', marginBottom: '4px' }}>
                  {selectedOrder.id}
                </div>
                <div style={{ fontSize: '8px', color: '#999', marginTop: '6px' }}>
                  This is a system-generated shipping label. No signature required. | Devam © {new Date().getFullYear()}
                </div>
              </div>

            </div>
          </div>
          
        </div>
      )}

    </>
  );
}
