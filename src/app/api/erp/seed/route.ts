import { NextResponse } from 'next/server';
import Product from '@/models/Product';
import { generateBarcode } from '@/lib/erp/barcodeUtils';

export async function GET(req: Request) {
  try {
    // Strictly prevent accidental or malicious database deletion in production
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'Database seeding is permanently disabled in production.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const secret = searchParams.get('secret');
    if (secret !== process.env.ADMIN_PORTAL_PASSWORD && secret !== 'devam-local-dev-seed') {
      return NextResponse.json({ error: 'Unauthorized: Seed key required' }, { status: 401 });
    }

    // Clear existing products
    await Product.deleteMany({});

    const year = new Date().getFullYear().toString().slice(-2);

    const seedData = [
      { name: "Coriander Powder", category: "02", productCode: "011", sku: "001", mrp: 200, sellingPrice: 180, weight: "500g", image: "/cat_spice_powder.png" },
      { name: "Turmeric Powder", category: "02", productCode: "018", sku: "002", mrp: 250, sellingPrice: 220, weight: "500g", image: "/cat_spice_powder.png" },
      { name: "Red Chilli Powder", category: "02", productCode: "015", sku: "003", mrp: 300, sellingPrice: 280, weight: "500g", image: "/cat_spice_powder.png" },
      { name: "Gram Masala Powder", category: "02", productCode: "012", sku: "004", mrp: 400, sellingPrice: 350, weight: "500g", image: "/cat_spice_powder.png" },
      { name: "Dhaniya Jeera Powder", category: "02", productCode: "019", sku: "005", mrp: 220, sellingPrice: 200, weight: "500g", image: "/cat_spice_powder.png" }
    ];

    const productsToInsert = seedData.map(item => {
      const barcode = generateBarcode(year, item.sku, item.category, item.productCode);
      return {
        name: item.name,
        category: item.category,
        sku: item.sku,
        barcode,
        mrp: item.mrp,
        sellingPrice: item.sellingPrice,
        weight: item.weight,
        image: item.image,
        productCode: item.productCode
      };
    });

    await Product.insertMany(productsToInsert);

    return NextResponse.json({ success: true, message: "Seeded successfully", products: productsToInsert }, { status: 200 });
  } catch (error: any) {
    console.error("Error seeding products:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
