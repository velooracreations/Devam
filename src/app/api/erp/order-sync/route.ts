import { NextResponse } from 'next/server';
import Product from '@/models/Product';
import InventoryLedger from '@/models/InventoryLedger';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { orderId, items, customerName } = body;

    if (!items || !Array.isArray(items)) {
      return NextResponse.json({ error: 'Invalid items array' }, { status: 400 });
    }

    for (const item of items) {
      const product = await Product.findOne(
        item.sku ? { sku: item.sku } : { name: item.name }
      );
      
      if (product) {
        const openingStock = product.stockQuantity || 0;
        const finalQuantity = -Math.abs(item.quantity);
        const closingStock = openingStock + finalQuantity;

        if (closingStock >= 0) {
          await InventoryLedger.create({
            product: product.id!,
            barcode: product.barcode || 'N/A',
            transactionType: 'SALES_ORDER',
            quantity: finalQuantity,
            openingStock,
            closingStock,
            remarks: `Order #${orderId} - ${customerName}`
          });

          await Product.updateById(product.id!, { stockQuantity: closingStock });
        }
      }
    }

    return NextResponse.json({ success: true, message: 'Order synced with ERP inventory' }, { status: 200 });
  } catch (error: any) {
    console.error("Error syncing order to ERP:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
