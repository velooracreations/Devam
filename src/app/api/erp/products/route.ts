import { NextResponse } from 'next/server';
import Product from '@/models/Product';
import { generateBarcode, getNextSku } from '@/lib/erp/barcodeUtils';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, category, productCode, price, ...otherFields } = body;

    if (!name || !category || !productCode) {
      return NextResponse.json({ error: 'Missing required fields (name, category, productCode)' }, { status: 400 });
    }

    // Determine the next SKU
    const products = await Product.find({});
    const skus = products.map((p: any) => p.sku).filter(Boolean).sort();
    const currentMaxSku = skus.length > 0 ? skus[skus.length - 1] : null;
    const newSku = getNextSku(currentMaxSku);

    const year = new Date().getFullYear().toString().slice(-2);
    const newBarcode = generateBarcode(year, newSku, category, productCode);

    const product = await Product.create({
      name,
      category,
      sku: newSku,
      barcode: newBarcode,
      mrp: price || 0,
      sellingPrice: price || 0,
      ...otherFields
    });

    return NextResponse.json({ success: true, product }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating product:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const products = await Product.find({});
    return NextResponse.json({ success: true, products }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching products:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
