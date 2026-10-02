import { NextResponse } from 'next/server';
import { getServerProducts, saveServerProducts } from '@/lib/serverProducts';
import { Product } from '@/store/productStore';
import { verifyAdminToken } from '@/lib/adminToken';

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
    const cookieHeader = request.headers.get("cookie") || "";
    const match = cookieHeader.match(/admin_token=([^;]+)/);
    const token = match ? decodeURIComponent(match[1]) : undefined;
    const auth = await verifyAdminToken(token);

    if (!auth.valid && process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: "Unauthorized: Modifying products requires administrative authorization" }, { status: 401 });
    }

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
    const cookieHeader = request.headers.get("cookie") || "";
    const match = cookieHeader.match(/admin_token=([^;]+)/);
    const token = match ? decodeURIComponent(match[1]) : undefined;
    const auth = await verifyAdminToken(token);

    if (!auth.valid && process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: "Unauthorized: Deleting products requires administrative authorization" }, { status: 401 });
    }

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
