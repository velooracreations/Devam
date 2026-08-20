"use client";

import { useState, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, ShieldCheck, Truck, RotateCcw, Minus, Plus, ShoppingCart, CheckCircle, Heart, Check, UserCircle } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useProductStore } from "@/store/productStore";
import { toast } from "sonner";

// Mock Database
const productMock = {
  id: "sharbati-atta-5kg",
  name: "Premium Sharbati Atta",
  category: "Flours",
  price: 350,
  originalPrice: 400,
  image: "/pkg_flours.png",
  isNew: false,
  reviews: 124,
  description: "Made from 100% MP Sharbati wheat, our Chakki Atta absorbs more water, keeping your rotis softer for longer. Stone-ground to preserve natural nutrients and dietary fibers.",
  images: ["/pkg_flours.png", "/hero-chakki.png", "/hero-wheat.png"],
  rating: 4.8,
  reviewsCount: 124,
  weight: "5 Kg",
  inStock: true,
  ingredients: "100% Whole Wheat (Sharbati Variant)",
  productDetails: "Detailed information goes here.",
  certifications: ["FSSAI Approved", "100% Vegetarian", "No Preservatives"]
};

const initialReviews = [
  { id: 1, author: "Rahul M.", rating: 5, date: "May 15, 2026", verified: true, content: "The quality of this atta is unmatched. My rotis stay soft even after hours. Highly recommended!" },
  { id: 2, author: "Sneha P.", rating: 4, date: "May 10, 2026", verified: true, content: "Very good packaging and the taste is distinctly premium. Delivery took one day extra, but worth the wait." },
  { id: 3, author: "Amit S.", rating: 5, date: "April 28, 2026", verified: true, content: "I've switched completely to Devam Sharbati. You can literally smell the freshness when you open the packet." }
];

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [quantity, setQuantity] = useState(1);
  const [mainImage, setMainImage] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);
  
  // Reviews State
  const [reviews, setReviews] = useState(initialReviews);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newReviewText, setNewReviewText] = useState("");
  const [hasPurchased] = useState(true); // MOCK: Assume logged in user has purchased

  const addItem = useCartStore((state) => state.addItem);
  const getProduct = useProductStore((state) => state.products.find(p => p.id === resolvedParams.id));
  const allProducts = useProductStore((state) => state.products);
  
  const initialProduct = getProduct || productMock;
  const [selectedVariant, setSelectedVariant] = useState(initialProduct);

  // Find all variants (different weights) of this same product based on the resolved name
  const allVariants = allProducts
    .filter(p => p.name === initialProduct.name)
    .sort((a, b) => a.price - b.price);
    
  // Fallback to ensure UI always renders at least the initial product if database is empty
  if (allVariants.length === 0) {
    allVariants.push(initialProduct);
  }

  // Merge dynamic product data with static rich data for now, prioritizing the selected variant
  const product = { 
    ...productMock, 
    ...initialProduct,
    ...selectedVariant,
    // Ensure the product's actual image is used as the primary image
    images: selectedVariant.image ? [selectedVariant.image] : productMock.images,
    // Dynamic ingredients and details
    ingredients: selectedVariant.ingredients || initialProduct.ingredients || (initialProduct.category === "Spice Powders" ? "100% Pure Spices" : "100% Natural Ingredients"),
    productDetails: selectedVariant.productDetails || initialProduct.productDetails || "Premium quality ingredients curated for the perfect taste and health.",
  };

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1)
    : "0.0";

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

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newReview = {
      id: Date.now(),
      author: "Jaydev (You)", // Mocking current user
      rating: newRating,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      verified: true,
      content: newReviewText.trim()
    };
    
    setReviews([newReview, ...reviews]);
    setNewReviewText("");
    setShowReviewForm(false);
  };

  return (
    <div className="bg-gray-50 min-h-screen pt-8 pb-24">
      {/* Google Rich Snippets Product Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org/",
            "@type": "Product",
            "name": product.name,
            "image": [`https://thedevam.com${product.image}`],
            "description": product.description,
            "sku": product.id,
            "brand": {
              "@type": "Brand",
              "name": "Devam"
            },
            "offers": {
              "@type": "Offer",
              "url": `https://thedevam.com/product/${product.id}`,
              "priceCurrency": "INR",
              "price": product.price,
              "availability": product.inStock !== false ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
              "itemCondition": "https://schema.org/NewCondition"
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": averageRating,
              "reviewCount": reviews.length
            }
          })
        }}
      />
      {/* Functional Breadcrumbs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 text-sm text-gray-500 flex items-center flex-wrap gap-2">
        <Link href="/" className="hover:text-[var(--color-devam-red)] transition-colors">Home</Link> 
        <span>/</span> 
        <Link href="/shop" className="hover:text-[var(--color-devam-red)] transition-colors">Shop</Link> 
        <span>/</span> 
        <Link href="/shop" className="hover:text-[var(--color-devam-red)] transition-colors">{product.category}</Link> 
        <span>/</span> 
        <span className="text-gray-900 font-bold">{product.name}</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Product Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-12">
          <div className="flex flex-col lg:flex-row">
            
            {/* Image Gallery */}
            <div className="w-full lg:w-1/2 p-8 border-b lg:border-b-0 lg:border-r border-gray-100">
              <div className="relative aspect-square rounded-xl overflow-hidden mb-4 bg-[#f9f9f9] group cursor-zoom-in">
                <Image 
                  src={productMock.images[mainImage]} 
                  alt={productMock.name} 
                  fill
                  className="object-cover transition-transform duration-500 ease-out group-hover:scale-150"
                  priority
                />
              </div>
              <div className="flex gap-4 overflow-x-auto pb-2">
                {productMock.images.map((img, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setMainImage(idx)}
                    className={`relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-colors ${mainImage === idx ? 'border-[var(--color-devam-red)]' : 'border-transparent hover:border-gray-300'}`}
                  >
                    <Image src={img} alt={`Thumbnail ${idx+1}`} fill className="object-cover bg-[#f9f9f9]" />
                  </button>
                ))}
              </div>
            </div>

            {/* Product Info */}
            <div className="w-full lg:w-1/2 p-8 lg:p-12 flex flex-col">
              <div className="mb-2 text-[var(--color-devam-red)] font-bold text-sm tracking-widest uppercase">{product.category}</div>
              <h1 className="text-3xl lg:text-4xl font-heading font-bold text-gray-900 mb-4">{product.name}</h1>
              
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center bg-green-50 px-3 py-1 rounded-full text-green-700">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="ml-1 text-sm font-bold">{averageRating}</span>
                </div>
                <a href="#reviews" className="text-sm text-gray-500 underline cursor-pointer hover:text-gray-900 transition-colors">
                  {reviews.length} Verified Reviews
                </a>
              </div>

              <div className="flex items-end gap-3 mb-8">
                <span className="text-4xl font-bold text-gray-900">₹{product.price}</span>
                <span className="text-lg text-gray-400 line-through mb-1">₹{product.originalPrice}</span>
                <span className="text-sm font-bold text-green-600 mb-1 ml-2">Save {((product.originalPrice - product.price) / product.originalPrice * 100).toFixed(1)}%</span>
              </div>

              <p className="text-gray-600 leading-relaxed mb-8">{product.description}</p>

              {/* Weight/Packaging Selection */}
            {allVariants.length > 0 && (
              <div className="mb-8 border-b border-gray-100 pb-8">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-gray-900">Select Packaging</h3>
                  <span className="text-sm font-medium text-[var(--color-devam-red)]">{product.weight}</span>
                </div>
                <div className="flex flex-wrap gap-3">
                  {allVariants.map((variant) => (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedVariant(variant)}
                      className={`px-6 py-3 rounded-lg border-2 font-bold transition-all ${
                        selectedVariant.id === variant.id
                          ? "border-[var(--color-devam-red)] bg-red-50 text-[var(--color-devam-red)]"
                          : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {variant.weight}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity and Add to Cart Section */}
              <div className="flex items-center gap-6 mb-10">
                <div className="flex items-center border border-gray-200 rounded-lg p-1 bg-gray-50">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center font-bold text-gray-900">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <button 
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
                  className={`flex-1 h-14 rounded-lg font-bold text-lg flex items-center justify-center gap-3 transition-all ${
                    addedToCart 
                      ? 'bg-green-600 text-white' 
                      : 'bg-[var(--color-devam-red)] text-white hover:bg-[#d62828] shadow-lg hover:shadow-xl'
                  }`}
                >
                  {addedToCart ? (
                    <>
                      <CheckCircle className="w-6 h-6" /> Added to Cart
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-6 h-6" /> Add to Cart
                    </>
                  )}
                </button>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-8 border-t border-gray-100 mt-auto">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-gray-900">Secure Payment</div>
                    <div className="text-[10px] text-gray-500">100% Safe</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600 flex-shrink-0">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-gray-900">Fast Delivery</div>
                    <div className="text-[10px] text-gray-500">2-3 Business Days</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-600 flex-shrink-0">
                    <RotateCcw className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-gray-900">Easy Returns</div>
                    <div className="text-[10px] text-gray-500">7 Day Policy</div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 lg:p-12 mb-12">
          <h2 className="text-2xl font-heading font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">Product Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
            <div>
              <h3 className="font-bold text-gray-900 mb-3 text-lg">Ingredients</h3>
              <p className="text-gray-600 leading-relaxed">{product.ingredients}</p>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-3 text-lg">Extended Details</h3>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">{product.productDetails}</p>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-3 text-lg">Certifications</h3>
              <ul className="list-disc pl-5 text-gray-600 space-y-2">
                {productMock.certifications.map((cert, i) => (
                  <li key={i}>{cert}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-3 text-lg">Manufacturer Details</h3>
              <p className="text-gray-600 leading-relaxed">
                <strong>Manufactured and Marketed by:</strong><br />
                Shreeji Gruh Udhyog
              </p>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-8 mt-4">
            <h3 className="font-bold text-gray-900 mb-4 text-xl">Nutritional Information (Approximate per 100g)</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="py-3 px-4 font-bold text-gray-700">Nutrient</th>
                    <th className="py-3 px-4 font-bold text-gray-700">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 px-4 text-gray-600">Energy / Calories</td>
                    <td className="py-3 px-4 font-medium">350 kcal</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 px-4 text-gray-600">Total Fat</td>
                    <td className="py-3 px-4 font-medium">1.5 g</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 px-4 text-gray-600">Carbohydrates</td>
                    <td className="py-3 px-4 font-medium">70 g</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 px-4 text-gray-600">Dietary Fiber</td>
                    <td className="py-3 px-4 font-medium">11 g</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 text-gray-600">Protein</td>
                    <td className="py-3 px-4 font-medium">13 g</td>
                  </tr>
                </tbody>
              </table>
              <p className="text-xs text-gray-400 mt-3">* Percent Daily Values are based on a 2,000 calorie diet. Your daily values may be higher or lower depending on your calorie needs.</p>
            </div>
          </div>
        </div>

        {/* Customer Reviews Section */}
        <div id="reviews" className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-8 lg:p-12 border-b border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl font-heading font-bold text-gray-900 mb-2">Customer Reviews</h2>
              <div className="flex items-center gap-4">
                <div className="flex items-center text-yellow-400">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className={`w-5 h-5 ${star <= Math.round(Number(averageRating)) ? 'fill-current' : 'text-gray-200'}`} />
                  ))}
                </div>
                <span className="font-bold text-gray-900">{averageRating} out of 5</span>
                <span className="text-gray-500">({reviews.length} reviews)</span>
              </div>
            </div>
            
            <button 
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="px-6 py-3 border-2 border-gray-900 text-gray-900 font-bold rounded-lg hover:bg-gray-900 hover:text-white transition-colors"
            >
              Write a Review
            </button>
          </div>

          {/* Write Review Form */}
          {showReviewForm && (
            <div className="p-8 lg:px-12 bg-gray-50 border-b border-gray-100">
              {hasPurchased ? (
                <form onSubmit={handleReviewSubmit} className="max-w-2xl">
                  <h3 className="font-bold text-gray-900 mb-4">Rate and Review</h3>
                  
                  <div className="flex items-center gap-2 mb-6">
                    <span className="text-sm font-medium text-gray-700 mr-2">Your Rating:</span>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button 
                        key={star}
                        type="button"
                        onClick={() => setNewRating(star)}
                        className={`transition-colors ${star <= newRating ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-200'}`}
                      >
                        <Star className="w-8 h-8 fill-current" />
                      </button>
                    ))}
                  </div>
                  
                  <div className="mb-6">
                    <label htmlFor="reviewText" className="block text-sm font-medium text-gray-700 mb-2">Your Review (Optional)</label>
                    <textarea 
                      id="reviewText"
                      rows={4}
                      value={newReviewText}
                      onChange={(e) => setNewReviewText(e.target.value)}
                      className="w-full rounded-lg border-gray-300 shadow-sm focus:border-[var(--color-devam-red)] focus:ring-[var(--color-devam-red)] p-4 border"
                      placeholder="What did you like or dislike? How was the quality?"
                    ></textarea>
                  </div>
                  
                  <div className="flex gap-4">
                    <button 
                      type="submit"
                      className="px-6 py-3 bg-[var(--color-devam-red)] text-white font-bold rounded-lg hover:bg-[#d62828] transition-colors"
                    >
                      Submit Review
                    </button>
                    <button 
                      type="button"
                      onClick={() => setShowReviewForm(false)}
                      className="px-6 py-3 text-gray-500 font-bold hover:text-gray-900 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="bg-orange-50 border-l-4 border-orange-500 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-orange-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-orange-700 font-bold">
                        Only customers who have purchased this product can leave a review.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Render Reviews List */}
          <div className="divide-y divide-gray-100">
            {reviews.map((review) => (
              <div key={review.id} className="p-8 lg:px-12">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <UserCircle className="w-10 h-10 text-gray-300" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900">{review.author}</span>
                        {review.verified && (
                          <span className="flex items-center text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded">
                            <Check className="w-3 h-3 mr-1" /> Verified Buyer
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">{review.date}</div>
                    </div>
                  </div>
                  
                  <div className="flex text-yellow-400">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                </div>
                
                {review.content && (
                  <p className="text-gray-700 ml-14 leading-relaxed">"{review.content}"</p>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
