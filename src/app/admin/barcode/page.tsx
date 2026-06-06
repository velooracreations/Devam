"use client";

import { useState, useEffect } from 'react';
import { BarcodeLabelPrint } from '@/components/admin/BarcodeLabelPrint';
import { Search, Printer } from 'lucide-react';

export default function BarcodeManagementPage() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

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

  const filteredProducts = products.filter((p: any) => 
    p.barcode?.includes(searchTerm) || 
    p.sku?.includes(searchTerm) || 
    p.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold font-heading text-gray-900">Barcode Management</h1>
        <div className="flex gap-4">
          <button 
            onClick={async () => {
              setLoading(true);
              try {
                await fetch('/api/erp/seed', { method: 'GET' });
                await fetchProducts();
              } catch (e) {
                console.error(e);
              }
            }}
            className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-black print:hidden"
          >
            + Run Bulk Seed (5 Items)
          </button>
          <button 
            onClick={handlePrint}
            className="bg-[var(--color-devam-red)] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-red-700 print:hidden"
          >
            <Printer size={20} />
            Print Labels
          </button>
        </div>
      </div>

      <div className="mb-8 relative print:hidden">
        <Search className="absolute left-3 top-3 text-gray-400" size={20} />
        <input 
          type="text"
          placeholder="Search by Barcode, SKU, or Product Name..."
          className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="text-center py-10">Loading barcodes...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filteredProducts.map((product: any) => (
            <div key={product._id} className="flex justify-center bg-gray-50 p-4 rounded-xl border">
              <BarcodeLabelPrint product={product} />
            </div>
          ))}
          {filteredProducts.length === 0 && (
            <div className="col-span-full text-center py-10 text-gray-500">
              No products found matching your search.
            </div>
          )}
        </div>
      )}
      
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * {
            visibility: hidden;
          }
          .grid, .grid * {
            visibility: visible;
          }
          .grid {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
          }
          .border {
            border: none;
            background: transparent;
          }
        }
      `}} />
    </div>
  );
}
