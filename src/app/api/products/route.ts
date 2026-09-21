import { NextResponse } from 'next/server';
import { getServerProducts, saveServerProducts } from '@/lib/serverProducts';
import { Product } from '@/store/productStore';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const products = getServerProducts();
    return NextResponse.json({ success: true, products });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (body.action === 'sync') {
      const { products } = body;
      if (Array.isArray(products)) {
        saveServerProducts(products);
        return NextResponse.json({ success: true, products });
      }
    } else if (body.action === 'add') {
      const { product } = body;
      const current = getServerProducts();
      const updated = [product, ...current.filter((p: Product) => p.id !== product.id)];
      saveServerProducts(updated);
      return NextResponse.json({ success: true, products: updated });
    }
    const products = getServerProducts();
    return NextResponse.json({ success: true, products });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const name = searchParams.get('name');
    const clearAll = searchParams.get('clearAll');

    let current = getServerProducts();

    if (clearAll === 'true') {
      current = [];
    } else if (id) {
      current = current.filter((p: Product) => p.id !== id);
    } else if (name) {
      current = current.filter((p: Product) => p.name !== name);
    }

    saveServerProducts(current);
    return NextResponse.json({ success: true, products: current });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
