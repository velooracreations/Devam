import { NextResponse } from 'next/server';
import Product from '@/models/Product';
import InventoryLedger from '@/models/InventoryLedger';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { barcode, quantity, type, remarks } = body;

    if (!barcode || !quantity || !type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const product = await Product.findOne({ barcode });
    
    if (!product) {
      return NextResponse.json({ error: 'Product not found for this barcode' }, { status: 404 });
    }

    const qtyNumber = parseInt(quantity, 10);
    const openingStock = product.stockQuantity || 0;
    
    let transactionType = "";
    let finalQuantity = 0;
    
    if (type === 'in') {
      transactionType = "STOCK_IN";
      finalQuantity = qtyNumber;
    } else if (type === 'out') {
      transactionType = "STOCK_OUT";
      finalQuantity = -Math.abs(qtyNumber);
    } else {
      return NextResponse.json({ error: 'Invalid transaction type' }, { status: 400 });
    }
    
    const closingStock = openingStock + finalQuantity;
    
    if (closingStock < 0) {
      return NextResponse.json({ error: 'Insufficient stock.' }, { status: 400 });
    }

    // Create ledger entry
    await InventoryLedger.create({
      product: product.id!,
      barcode: product.barcode,
      transactionType,
      quantity: finalQuantity,
      openingStock,
      closingStock,
      remarks: remarks || `Manual ${transactionType}`
    });

    // Update Product stock
    await Product.updateById(product.id!, { stockQuantity: closingStock });

    return NextResponse.json({ 
      success: true, 
      message: `Stock updated successfully. New Stock: ${closingStock}`,
      product: { ...product, stockQuantity: closingStock }
    }, { status: 200 });

  } catch (error: any) {
    console.error("Error updating inventory:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
