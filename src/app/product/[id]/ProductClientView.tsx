"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShieldCheck, Truck, RotateCcw, Minus, Plus, ShoppingCart, CheckCircle } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useProductStore } from "@/store/productStore";
import { toast } from "sonner";

const productMock = {
  certifications: ["FSSAI Approved", "100% Vegetarian", "No Preservatives"]
};

export function ProductClientView({ id: targetId }: { id: string }) {
  const [quantity, setQuantity] = useState(1);
  const [mainImage, setMainImage] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    useProductStore.getState().fetchProducts();
  }, []);
  
  const addItem = useCartStore((state) => state.addItem);
  const allProducts = useProductStore((state) => state.products);

  // Smart multi-tier product lookup
  let foundProduct = allProducts.find(p => p.id === targetId);

  // Clean slug / partial match
  if (!foundProduct) {
    const cleanTarget = targetId.toLowerCase().replace(/[^a-z0-9]/g, '');
    foundProduct = allProducts.find(p => {
      const cleanId = p.id.toLowerCase().replace(/[^a-z0-9]/g, '');
      const cleanName = p.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      return cleanId.includes(cleanTarget) || cleanTarget.includes(cleanId) || cleanTarget.includes(cleanName);
    });
  }

  // Grain/Spice Keyword match
  if (!foundProduct) {
    const keyword = targetId.split('-')[0].toLowerCase();
    if (keyword.length >= 3) {
      foundProduct = allProducts.find(p => p.id.toLowerCase().includes(keyword) || p.name.toLowerCase().includes(keyword));
    }
  }

  // Dynamic Fallback Generator
  if (!foundProduct) {
    const rawName = targetId.replace(/-\d+(kg|g|l|ml)$/i, '').replace(/-/g, ' ');
    const formattedName = rawName.charAt(0).toUpperCase() + rawName.slice(1);
    const matchWeight = targetId.match(/\d+(kg|g|l|ml)$/i)?.[0] || "1 Kg";
    const uppercaseWeight = matchWeight.toUpperCase();

    foundProduct = {
      id: targetId,
      name: `${formattedName} Flour`,
      category: "Flours",
      price: 110,
      originalPrice: 130,
      image: "",
      rating: 5.0,
      reviews: 0,
      weight: uppercaseWeight,
      isNew: true,
      inStock: true,
      badge: "Pure & Fresh",
      description: `Made from 100% naturally processed ${formattedName} grains, traditionally milled to lock in essential nutrients, fiber, and authentic taste.`,
      ingredients: `100% Whole ${formattedName}`,
      features: [`100% Pure ${formattedName}`, "Stone Ground", "Zero Preservatives"],
    };
  }

  const activeProduct = allProducts.find(p => p.id === targetId) || foundProduct;
  const [selectedVariant, setSelectedVariant] = useState(activeProduct);

  const rawVariants = allProducts
    .filter(p => p.name.toLowerCase() === activeProduct.name.toLowerCase() || p.id.split('-')[0] === activeProduct.id.split('-')[0])
    .sort((a, b) => a.price - b.price);
    
  const uniqueWeights = new Set<string>();
  const allVariants = rawVariants.filter(v => {
    if (uniqueWeights.has(v.weight)) return false;
    uniqueWeights.add(v.weight);
    return true;
  });

  if (allVariants.length === 0) {
    allVariants.push(activeProduct);
  }

  const activeVariant = (selectedVariant.id === activeProduct.id || selectedVariant.weight === activeProduct.weight)
    ? { ...activeProduct, ...selectedVariant }
    : activeProduct;

  const rawImages: string[] = [];
  if (activeVariant.images && activeVariant.images.length > 0) {
    rawImages.push(...activeVariant.images);
  } else if (activeProduct.images && activeProduct.images.length > 0) {
    rawImages.push(...activeProduct.images);
  }
  
  if (rawImages.length === 0) {
    if (activeVariant.image && activeVariant.image.trim() !== "") {
      rawImages.push(activeVariant.image);
    } else if (activeProduct.image && activeProduct.image.trim() !== "") {
      rawImages.push(activeProduct.image);
    }
  }

  const productImages = Array.from(new Set(rawImages.filter(img => img && img.trim() !== "")));

  const product = { 
    ...activeProduct,
    ...activeVariant,
    images: productImages,
    ingredients: activeVariant.ingredients || activeProduct.ingredients || "100% Natural Ingredients",
    productDetails: activeVariant.productDetails || activeProduct.productDetails || "Premium quality ingredients curated for authentic taste and health.",
  };

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: quantity,
      image: product.image,
      weight: product.weight
    });
    setAddedToCart(true);
    toast.success(`${quantity}x ${product.name} added to cart!`, {
      description: `Variant: ${product.weight} | Total: ₹${product.price * quantity}`,
      action: {
        label: 'View Cart',
        onClick: () => document.dispatchEvent(new CustomEvent('open-cart'))
      },
    });
    setTimeout(() => setAddedToCart(false), 2000);
  };

  return (
    <div className="bg-gray-50 min-h-screen pt-4 pb-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org/",
            "@type": "Product",
            "name": `Devam ${product.name} (${product.weight || '1 Kg'})`,
            "image": productImages.length > 0 ? [`https://thedevam.com${productImages[0]}`] : [],
            "description": product.description || `100% Pure traditional stone-ground ${product.name} manufactured by Devam Atta & Masala Hub (Shreeji Gruh Udhyog).`,
            "sku": product.id,
            "mpn": product.id,
            "brand": {
              "@type": "Brand",
              "name": "Devam Atta & Masala Hub",
              "logo": "https://thedevam.com/logo.svg"
            },
            "manufacturer": {
              "@type": "Organization",
              "name": "Shreeji Gruh Udhyog",
              "url": "https://thedevam.com"
            },
            "offers": {
              "@type": "Offer",
              "url": `https://thedevam.com/product/${product.id}`,
              "priceCurrency": "INR",
              "price": product.price,
              "priceValidUntil": "2027-12-31",
              "availability": product.inStock !== false ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
              "itemCondition": "https://schema.org/NewCondition",
              "seller": {
                "@type": "Organization",
                "name": "Devam Atta & Masala Hub",
                "sameAs": "https://www.indiamart.com/company/271804823/"
              },
              "shippingDetails": {
                "@type": "OfferShippingDetails",
                "shippingRate": {
                  "@type": "MonetaryAmount",
                  "value": "50",
                  "currency": "INR"
                },
                "shippingDestination": [
                  { "@type": "DefinedRegion", "addressCountry": "IN" },
                  { "@type": "DefinedRegion", "addressCountry": "US" },
                  { "@type": "DefinedRegion", "addressCountry": "AE" },
                  { "@type": "DefinedRegion", "addressCountry": "GB" }
                ]
              }
            }
          })
        }}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-4 text-xs text-gray-500 flex items-center flex-wrap gap-2">
        <Link href="/" className="hover:text-[var(--color-devam-red)] transition-colors">Home</Link> 
        <span>/</span> 
        <Link href="/shop" className="hover:text-[var(--color-devam-red)] transition-colors">Shop</Link> 
        <span>/</span> 
        <Link href="/shop" className="hover:text-[var(--color-devam-red)] transition-colors">{product.category}</Link> 
        <span>/</span> 
        <span className="text-gray-900 font-bold">{product.name}</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-xs border border-gray-100 overflow-hidden mb-8">
          <div className="flex flex-col lg:flex-row items-stretch">
            
            <div className="w-full lg:w-1/2 p-6 lg:p-8 flex flex-col items-center justify-center border-b lg:border-b-0 lg:border-r border-amber-900/10 bg-gradient-to-b from-[#FAF7F2] via-[#F6EDE1] to-[#F0E2CD] relative overflow-hidden">
              {/* Ambient Warm Golden Halo */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(245,197,24,0.32)_0%,rgba(217,131,36,0.1)_50%,transparent_75%)] pointer-events-none" />

              {productImages.length > 0 ? (
                <>
                  {/* Master Showcase Box */}
                  <div className="relative w-full h-[340px] sm:h-[390px] lg:h-[420px] rounded-2xl overflow-hidden mb-4 bg-gradient-to-b from-[#FFFDF9] via-[#FAF4E9] to-[#F2E6D2] p-6 border border-amber-200/80 shadow-[0_15px_35px_rgba(139,69,19,0.1)] flex items-center justify-center relative">
                    {/* Countertop Base Shadow Line */}
                    <div className="absolute bottom-0 inset-x-0 h-12 bg-gradient-to-t from-[#5C3214]/15 to-transparent pointer-events-none" />
                    
                    {/* Realistic Ground Contact Shadow */}
                    <div className="absolute bottom-5 left-1/2 -translate-x-1/2 w-48 sm:w-56 h-5 bg-[#3B1E0A]/35 blur-md rounded-full pointer-events-none" />

                    {/* Floating Quality Pill */}
                    <div className="absolute top-3 left-3 z-20 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-extrabold text-amber-900 border border-amber-200/80 shadow-sm flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      100% Stone Ground Sharbati
                    </div>

                    <Image 
                      src={productImages[mainImage] || productImages[0]} 
                      alt={product.name} 
                      fill
                      unoptimized={(productImages[mainImage] || productImages[0])?.startsWith('data:')}
                      className="object-contain p-3 transition-transform duration-500 ease-out hover:scale-105 z-10 drop-shadow-[0_15px_25px_rgba(74,46,27,0.25)]"
                      priority
                    />
                  </div>

                  {/* Multi-view Thumbnails Carousel */}
                  {productImages.length > 1 && (
                    <div className="flex gap-3 overflow-x-auto pb-1 max-w-full z-10">
                      {productImages.map((img, idx) => (
                        <button 
                          key={idx}
                          onClick={() => setMainImage(idx)}
                          className={`relative w-16 h-16 sm:w-18 sm:h-18 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all bg-gradient-to-b from-white to-amber-50/60 p-1 shadow-xs ${
                            mainImage === idx 
                              ? 'border-[var(--color-devam-red)] ring-2 ring-red-500/20 scale-105' 
                              : 'border-amber-200/60 hover:border-amber-400 opacity-75 hover:opacity-100'
                          }`}
                        >
                          <Image 
                            src={img} 
                            alt={`Thumbnail ${idx+1}`} 
                            fill 
                            unoptimized={img?.startsWith('data:')}
                            className="object-contain p-1" 
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="w-full h-[320px] sm:h-[360px] lg:h-[380px] rounded-xl border-2 border-dashed border-gray-200 bg-white p-6 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-3">
                    <span className="text-2xl font-bold text-[var(--color-devam-red)]">{product.name.charAt(0)}</span>
                  </div>
                  <p className="font-bold text-gray-800 text-sm">{product.name}</p>
                  <p className="text-xs text-gray-400 mt-1 max-w-xs">No image available for this product.</p>
                </div>
              )}
            </div>

            <div className="w-full lg:w-1/2 p-6 lg:p-8 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="text-[var(--color-devam-red)] font-bold text-xs tracking-widest uppercase">{product.category}</div>
                  {product.badge && product.badge !== "None" && product.badge.trim() !== "" && (
                    <span className={`font-bold text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                      product.badge === 'Coming Soon'
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : 'bg-red-100 text-[var(--color-devam-red)]'
                    }`}>
                      {product.badge}
                    </span>
                  )}
                </div>

                <h1 className="text-2xl lg:text-3xl font-heading font-bold text-gray-900 mb-3">{product.name}</h1>

                <div className="flex items-baseline gap-3 mb-4">
                  <span className="text-3xl font-bold text-gray-900">₹{product.price}</span>
                  {product.originalPrice > product.price && (
                    <>
                      <span className="text-base text-gray-400 line-through">₹{product.originalPrice}</span>
                      <span className="text-xs font-bold bg-green-100 text-green-800 px-2 py-0.5 rounded">
                        Save {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                      </span>
                    </>
                  )}
                </div>

                <p className="text-gray-600 text-xs lg:text-sm leading-relaxed mb-6">
                  {product.description}
                </p>

                {allVariants.length > 0 && (
                  <div className="mb-6 border-b border-gray-100 pb-5">
                    <div className="flex justify-between items-center mb-2.5">
                      <h3 className="font-bold text-gray-900 text-xs uppercase tracking-wider">Select Packaging</h3>
                      <span className="text-xs font-bold text-[var(--color-devam-red)]">{product.weight}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {allVariants.map((variant) => (
                        <button
                          key={variant.id}
                          onClick={() => setSelectedVariant(variant)}
                          className={`px-4 py-2 rounded-lg border-2 text-xs font-bold transition-all flex items-center gap-1.5 ${
                            selectedVariant.id === variant.id
                              ? "border-[var(--color-devam-red)] bg-red-50 text-[var(--color-devam-red)] shadow-sm"
                              : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          <span>{variant.weight}</span>
                          {variant.badge === "Coming Soon" && (
                            <span className="text-[9px] bg-amber-500 text-white font-extrabold px-1.5 py-0.2 rounded uppercase">
                              Soon
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center border border-gray-200 rounded-lg p-1 bg-gray-50">
                    <button 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={product.inStock === false}
                      className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors disabled:opacity-40"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-10 text-center font-bold text-gray-900 text-sm">{quantity}</span>
                    <button 
                      onClick={() => setQuantity(quantity + 1)}
                      disabled={product.inStock === false}
                      className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors disabled:opacity-40"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button 
                    onClick={handleAddToCart}
                    disabled={product.inStock === false}
                    className={`flex-1 h-12 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                      product.inStock === false
                        ? 'bg-amber-50 border border-amber-200 text-amber-800 cursor-not-allowed'
                        : addedToCart 
                          ? 'bg-green-600 text-white' 
                          : 'bg-[var(--color-devam-red)] text-white hover:bg-[#d62828] shadow-md hover:shadow-lg'
                    }`}
                  >
                    {product.inStock === false ? (
                      product.badge === 'Coming Soon' ? '⏳ 1 Kg Coming Soon' : 'Out of Stock'
                    ) : addedToCart ? (
                      <>
                        <CheckCircle className="w-4 h-4" /> Added to Cart
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-4 h-4" /> Add to Cart
                      </>
                    )}
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-gray-900">100% Pure</div>
                      <div className="text-[9px] text-gray-500">Quality Tested</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-green-600 shrink-0">
                      <Truck className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-gray-900">Fast Express</div>
                      <div className="text-[9px] text-gray-500">24-48 hr Dispatch</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-orange-600 shrink-0">
                      <RotateCcw className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-gray-900">Easy Return</div>
                      <div className="text-[9px] text-gray-500">Hassle-free</div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-xs border border-gray-100 p-5 sm:p-6 lg:p-8 mb-8">
          <h2 className="text-base sm:text-lg font-heading font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2.5">
            Product Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div>
              <h3 className="font-bold text-gray-900 mb-1.5 text-xs uppercase tracking-wider">Ingredients</h3>
              <p className="text-xs text-gray-600 leading-normal">{product.ingredients}</p>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-1.5 text-xs uppercase tracking-wider">Extended Details</h3>
              <p className="text-xs text-gray-600 leading-normal whitespace-pre-line">{product.productDetails}</p>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-1.5 text-xs uppercase tracking-wider">Certifications</h3>
              <ul className="list-disc pl-4 text-xs text-gray-600 space-y-1">
                {productMock.certifications.map((cert, i) => (
                  <li key={i}>{cert}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-1.5 text-xs uppercase tracking-wider">Manufacturer Details</h3>
              <p className="text-xs text-gray-600 leading-normal">
                <strong className="text-gray-700">Manufactured and Marketed by:</strong><br />
                Shreeji Gruh Udhyog
              </p>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-5 mt-2">
            <h3 className="font-bold text-gray-900 mb-3 text-xs uppercase tracking-wider">Nutritional Information (Approximate per 100g)</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="py-2 px-3 font-bold text-gray-700 text-[11px] uppercase tracking-wider">Nutrient</th>
                    <th className="py-2 px-3 font-bold text-gray-700 text-[11px] uppercase tracking-wider">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr>
                    <td className="py-2 px-3 text-gray-600 text-xs">Energy / Calories</td>
                    <td className="py-2 px-3 font-medium text-xs text-gray-900">350 kcal</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 text-gray-600 text-xs">Total Fat</td>
                    <td className="py-2 px-3 font-medium text-xs text-gray-900">1.5 g</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 text-gray-600 text-xs">Carbohydrates</td>
                    <td className="py-2 px-3 font-medium text-xs text-gray-900">70 g</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 text-gray-600 text-xs">Dietary Fiber</td>
                    <td className="py-2 px-3 font-medium text-xs text-gray-900">11 g</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 text-gray-600 text-xs">Protein</td>
                    <td className="py-2 px-3 font-medium text-xs text-gray-900">13 g</td>
                  </tr>
                </tbody>
              </table>
              <p className="text-[10px] text-gray-400 mt-2">* Percent Daily Values are based on a 2,000 calorie diet. Your daily values may be higher or lower depending on your calorie needs.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
