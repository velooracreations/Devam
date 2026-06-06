import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Product from '@/models/Product';
import InventoryLedger from '@/models/InventoryLedger';

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    
    // Check for authorization/role later in middleware, or via headers here
    
    const { barcode, quantity, type, remarks } = body; // type = 'in' or 'out'

    if (!barcode || !quantity || !type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const product = await Product.findOne({ barcode });
    
    if (!product) {
      return NextResponse.json({ error: 'Product not found for this barcode' }, { status: 404 });
    }

    const qtyNumber = parseInt(quantity, 10);
    const openingStock = product.stockQuantity;
    
    let transactionType = "";
    let finalQuantity = 0;
    
    if (type === 'in') {
      transactionType = "STOCK_IN";
      finalQuantity = qtyNumber;
    } else if (type === 'out') {
      transactionType = "STOCK_OUT";
      finalQuantity = -Math.abs(qtyNumber); // ensure negative for out
    } else {
      return NextResponse.json({ error: 'Invalid transaction type' }, { status: 400 });
    }
    
    const closingStock = openingStock + finalQuantity;
    
    if (closingStock < 0) {
      return NextResponse.json({ error: 'Insufficient stock. Transaction would result in negative inventory.' }, { status: 400 });
    }

    // Create ledger entry
    const ledgerEntry = new InventoryLedger({
      product: product._id,
      barcode: product.barcode,
      transactionType,
      quantity: finalQuantity,
      openingStock,
      closingStock,
      remarks: remarks || `Manual ${transactionType}`
    });

    await ledgerEntry.save();

    // Update Product stock
    product.stockQuantity = closingStock;
    await product.save();

    return NextResponse.json({ 
      success: true, 
      message: `Stock updated successfully. New Stock: ${closingStock}`,
      product 
    }, { status: 200 });

  } catch (error: any) {
    console.error("Error updating inventory:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
