import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Product from '@/models/Product';
import { generateBarcode, getNextSku } from '@/lib/erp/barcodeUtils';

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();

    const { name, category, productCode, price, ...otherFields } = body;

    if (!name || !category || !productCode) {
      return NextResponse.json({ error: 'Missing required fields (name, category, productCode)' }, { status: 400 });
    }

    // Determine the next SKU
    const highestProduct = await Product.findOne().sort({ sku: -1 }).select('sku');
    const currentMaxSku = highestProduct ? highestProduct.sku : null;
    const newSku = getNextSku(currentMaxSku);

    // Get current year (2 digits)
    const year = new Date().getFullYear().toString().slice(-2);

    // Generate Barcode
    const newBarcode = generateBarcode(year, newSku, category, productCode);

    const product = new Product({
      name,
      category,
      sku: newSku,
      barcode: newBarcode,
      mrp: price || 0,
      sellingPrice: price || 0,
      ...otherFields
    });

    await product.save();

    return NextResponse.json({ success: true, product }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating product:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    await connectDB();
    const products = await Product.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, products }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching products:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
