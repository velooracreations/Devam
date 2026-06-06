"use client";

import React, { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';

interface BarcodeLabelPrintProps {
  product: {
    name: string;
    weight: string;
    sku: string;
    barcode: string;
    mrp: number;
  };
}

export const BarcodeLabelPrint: React.FC<BarcodeLabelPrintProps> = ({ product }) => {
  const barcodeRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (barcodeRef.current && product.barcode) {
      JsBarcode(barcodeRef.current, product.barcode, {
        format: "CODE128",
        lineColor: "#000",
        width: 2,
        height: 50,
        displayValue: true,
        fontSize: 14,
        margin: 5,
      });
    }
  }, [product.barcode]);

  return (
    <div className="w-[300px] p-4 border-2 border-dashed border-gray-300 bg-white m-2 flex flex-col items-center justify-center font-sans">
      <div className="text-xl font-bold text-[var(--color-devam-red)] mb-1 uppercase text-center">
        DEVAM
      </div>
      <div className="text-sm font-semibold text-center mb-1 leading-tight">
        {product.name}
      </div>
      <div className="flex justify-between w-full px-2 text-xs text-gray-600 mb-2">
        <span>Weight: {product.weight || 'N/A'}</span>
        <span>SKU: {product.sku}</span>
      </div>
      
      <svg ref={barcodeRef} className="w-full max-w-[250px]"></svg>
      
      <div className="mt-2 text-sm font-bold text-gray-800">
        MRP: ₹{product.mrp}
      </div>
      <div className="text-[10px] text-gray-400 mt-1">
        (Incl. of all taxes)
      </div>
    </div>
  );
};
