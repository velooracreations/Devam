import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Product from '@/models/Product';
import InventoryLedger from '@/models/InventoryLedger';

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const { orderId, items, customerName } = body;

    if (!items || !Array.isArray(items)) {
      return NextResponse.json({ error: 'Invalid items array' }, { status: 400 });
    }

    // Process each item in the order to deduct inventory
    for (const item of items) {
      // Find product by SKU or name (since some mock products might not have barcode yet)
      const product = await Product.findOne({ $or: [{ sku: item.sku || item.id }, { name: item.name }] });
      
      if (product) {
        const openingStock = product.stockQuantity;
        const finalQuantity = -Math.abs(item.quantity);
        const closingStock = openingStock + finalQuantity;

        if (closingStock >= 0) {
          // Log to ledger
          const ledgerEntry = new InventoryLedger({
            product: product._id,
            barcode: product.barcode || 'N/A',
            transactionType: 'SALES_ORDER',
            quantity: finalQuantity,
            openingStock,
            closingStock,
            remarks: `Order #${orderId} - ${customerName}`
          });
          
          await ledgerEntry.save();

          // Update Product
          product.stockQuantity = closingStock;
          await product.save();
        }
      }
    }

    return NextResponse.json({ success: true, message: 'Order synced with ERP inventory' }, { status: 200 });
  } catch (error: any) {
    console.error("Error syncing order to ERP:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
