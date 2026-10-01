import type { Metadata } from "next";
import { initialProducts } from "@/store/productStore";
import { ProductClientView } from "./ProductClientView";

export function generateStaticParams() {
  return initialProducts.map((p) => ({
    id: p.id,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = initialProducts.find((p) => p.id === id);

  if (!product) {
    return {
      title: "Product Not Found | Devam",
      description: "Discover authentic flours and spices from Devam.",
    };
  }

  const title = `${product.name} - Buy Pure Online | Devam`;
  const description = `${product.description} Sourced from Dahod, Gujarat by Shreeji Gruh Udhyog. 100% pure, natural, and stone-ground. Price: ₹${product.price}.`;
  const imageUrl = product.image.startsWith("http")
    ? product.image
    : `https://thedevam.com${product.image}`;

  return {
    title,
    description,
    keywords: [
      product.name,
      `Buy ${product.name} Online`,
      `${product.name} Gujarat`,
      product.category,
      "Devam",
      "Shreeji Gruh Udhyog",
    ],
    openGraph: {
      title,
      description,
      url: `https://thedevam.com/product/${id}`,
      siteName: "Devam",
      images: [
        {
          url: imageUrl,
          alt: product.name,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ProductClientView id={id} />;
}
