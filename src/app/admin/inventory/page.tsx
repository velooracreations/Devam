"use client";

import { useState, useEffect, useRef } from 'react';
import { Package, ScanLine, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function InventoryManagementPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Scanner Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [scannedBarcode, setScannedBarcode] = useState('');
  const [qty, setQty] = useState('');
  const [transactionType, setTransactionType] = useState<'in' | 'out'>('in');
  const [remarks, setRemarks] = useState('');
  
  const barcodeInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/erp/products');
      const data = await res.json();
      if (data.success) {
        setProducts(data.products);
      }
    } catch (error) {
      console.error("Failed to fetch products", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStockUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scannedBarcode || !qty) return toast.error("Please provide barcode and quantity");

    try {
      const res = await fetch('/api/erp/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          barcode: scannedBarcode,
          quantity: qty,
          type: transactionType,
          remarks
        })
      });

      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        setIsModalOpen(false);
        setScannedBarcode('');
        setQty('');
        setRemarks('');
        fetchProducts(); // Refresh stock
      } else {
        toast.error(data.error || "Failed to update inventory");
      }
    } catch (error) {
      toast.error("Network error");
    }
  };

  const openScanner = (type: 'in' | 'out') => {
    setTransactionType(type);
    setIsModalOpen(true);
    setTimeout(() => {
      barcodeInputRef.current?.focus();
    }, 100);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold font-heading text-gray-900">Inventory Ledger</h1>
          <p className="text-gray-500 mt-2">Manage Stock In / Stock Out across the warehouse</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => openScanner('in')}
            className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700"
          >
            <ArrowUpCircle size={20} />
            Stock In
          </button>
          <button 
            onClick={() => openScanner('out')}
            className="bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-red-700"
          >
            <ArrowDownCircle size={20} />
            Stock Out
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="p-4 font-semibold text-gray-900">Product</th>
                <th className="p-4 font-semibold text-gray-900">Category</th>
                <th className="p-4 font-semibold text-gray-900">SKU</th>
                <th className="p-4 font-semibold text-gray-900">Barcode</th>
                <th className="p-4 font-semibold text-gray-900">Stock Qty</th>
                <th className="p-4 font-semibold text-gray-900">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center p-8">Loading...</td></tr>
              ) : products.map((product: any) => (
                <tr key={product._id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">
                      <Package size={20} />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{product.name}</div>
                      <div className="text-sm text-gray-500">{product.weight}</div>
                    </div>
                  </td>
                  <td className="p-4 text-gray-600">{product.category}</td>
                  <td className="p-4 font-mono text-sm text-gray-600">{product.sku}</td>
                  <td className="p-4 font-mono text-sm text-gray-600">{product.barcode}</td>
                  <td className="p-4">
                    <span className={`font-bold ${product.stockQuantity <= (product.minimumStock || 10) ? 'text-red-600' : 'text-green-600'}`}>
                      {product.stockQuantity}
                    </span>
                  </td>
                  <td className="p-4">
                    {product.stockQuantity <= (product.minimumStock || 10) ? (
                      <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">Low Stock</span>
                    ) : (
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">In Stock</span>
                    )}
                  </td>
                </tr>
              ))}
              {products.length === 0 && !loading && (
                <tr><td colSpan={6} className="text-center p-8 text-gray-500">No products found in DB.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Scanner Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b">
              <div className={`p-3 rounded-full ${transactionType === 'in' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                <ScanLine size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold">Scan Barcode ({transactionType === 'in' ? 'Stock In' : 'Stock Out'})</h2>
                <p className="text-sm text-gray-500">Use scanner or enter manually</p>
              </div>
            </div>
            
            <form onSubmit={handleStockUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Barcode</label>
                <input
                  ref={barcodeInputRef}
                  type="text"
                  required
                  value={scannedBarcode}
                  onChange={(e) => setScannedBarcode(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-lg uppercase"
                  placeholder="Scan or type barcode..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={qty}
                  onChange={(e) => setQty(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter quantity"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Remarks (Optional)</label>
                <input
                  type="text"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Damaged, New Batch..."
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`flex-1 px-4 py-3 text-white rounded-lg font-medium ${transactionType === 'in' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
                >
                  Confirm {transactionType === 'in' ? 'Stock In' : 'Stock Out'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
