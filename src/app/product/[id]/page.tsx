import { initialProducts } from "@/store/productStore";
import { ProductClientView } from "./ProductClientView";

export function generateStaticParams() {
  return initialProducts.map((p) => ({
    id: p.id,
  }));
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ProductClientView id={id} />;
}
