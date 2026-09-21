export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice: number;
  image: string;
  rating: number;
  reviews: number;
  weight: string;
  isNew: boolean;
  inStock?: boolean;
  badge?: string;
  description?: string;
  images?: string[];
  ingredients?: string;
  productDetails?: string;
  nutritionalInfo?: string;
  disclaimer?: string;
  features?: string[];
  packingStyles?: string[];
  certifications?: string[];
  productCode?: string;
}

export const initialProducts: Product[] = [
  {
    id: "chakki-fresh-atta-5kg",
    name: "Devam Chakki Fresh Atta",
    category: "Flours",
    price: 225,
    originalPrice: 270,
    image: "/devam-atta-5kg-studio.jpg",
    images: ["/devam-atta-5kg-studio.jpg", "/devam-atta-5kg-pouch.png", "/whatsapp-preview.jpg"],
    rating: 5.0,
    reviews: 128,
    weight: "5 Kg",
    isNew: true,
    inStock: true,
    badge: "Bestseller",
    description: "DEVAM Chakki Fresh Atta is crafted from 100% pure, handpicked Sharbati & Bhalia golden wheat grains. Traditional slow stone-grinding ensures that the essential wheat germ, natural dietary fiber, and authentic aroma are preserved intact — guaranteeing delightfully soft, puffed rotlis every single time. Wholesome Atta, Wholesome Life. स्वाद शुद्धता का...",
    ingredients: "100% Whole Wheat Grains (Sharbati & Bhalia Selection)",
    nutritionalInfo: "Per 100g: Energy 364 kcal, Protein 12.1g, Dietary Fiber 11.2g, Carbohydrates 71.8g, Iron 4.2mg, Zero Trans Fat, Zero Cholesterol",
    disclaimer: "Store in a cool, hygienic, and dry place. Keep in an airtight container after opening.",
    features: [
      "100% Whole Wheat Grains",
      "Traditional Cold Chakki Ground",
      "Unbleached & Zero Added Maida",
      "No Chemical Additives or Preservatives",
      "Naturally Rich in Dietary Fiber & Iron"
    ],
    packingStyles: ["5 Kg", "1 Kg"],
    certifications: ["FSSAI Certified: Lic No. 10725008000026", "100% Vegetarian", "Product of India"]
  },
  {
    id: "chakki-fresh-atta-1kg",
    name: "Devam Chakki Fresh Atta",
    category: "Flours",
    price: 50,
    originalPrice: 60,
    image: "/devam-atta-5kg-studio.jpg",
    images: ["/devam-atta-5kg-studio.jpg", "/devam-atta-5kg-pouch.png", "/whatsapp-preview.jpg"],
    rating: 5.0,
    reviews: 42,
    weight: "1 Kg",
    isNew: true,
    inStock: false,
    badge: "Coming Soon",
    description: "DEVAM Chakki Fresh Atta (1 Kg Everyday Pack) — Launching soon! Made from 100% pure, handpicked Sharbati & Bhalia golden wheat grains. Traditional slow stone-grinding guarantees soft, puffed rotlis every time. स्वाद शुद्धता का...",
    ingredients: "100% Whole Wheat Grains (Sharbati & Bhalia Selection)",
    nutritionalInfo: "Per 100g: Energy 364 kcal, Protein 12.1g, Dietary Fiber 11.2g, Carbohydrates 71.8g, Iron 4.2mg",
    disclaimer: "Compact 1 Kg retail pack launching soon.",
    features: [
      "100% Whole Wheat Grains",
      "Traditional Cold Chakki Ground",
      "Unbleached & Zero Added Maida",
      "Compact 1 Kg Fresh Pack"
    ],
    packingStyles: ["5 Kg", "1 Kg"],
    certifications: ["FSSAI Certified: Lic No. 10725008000026", "100% Vegetarian", "Product of India"]
  },
  {
    id: "jowar-1kg",
    name: "Jowar",
    category: "Flours",
    price: 60,
    originalPrice: 73,
    image: "/prod-jowar.png",
    rating: 4.9,
    reviews: 34,
    weight: "1 Kg",
    isNew: true,
    inStock: true,
    description: "Made from carefully selected golden Jowar grains, DEVAM Jowar is traditionally processed to preserve its natural goodness, wholesome taste and dietary fibre.",
    ingredients: "100% Whole White Jowar Grains",
    nutritionalInfo: "Per 100g: Energy 349 kcal, Protein 10.4g, Carbohydrates 72.6g, Fat 1.9g",
    disclaimer: "Gluten-free naturally.",
    features: ["100% Natural White Jowar", "Naturally Gluten-Free", "Rich in Calcium & Iron"],
    packingStyles: ["1 Kg", "5 Kg"]
  },
  {
    id: "makkai-1kg",
    name: "Makkai",
    category: "Flours",
    price: 50,
    originalPrice: 61,
    image: "/prod-makkai.png",
    rating: 4.8,
    reviews: 28,
    weight: "1 Kg",
    isNew: true,
    inStock: true,
    description: "Made from carefully selected, naturally golden Makkai grains, DEVAM Makkai is traditionally processed to preserve its wholesome taste.",
    ingredients: "100% Makkai (Maize / Corn)",
    nutritionalInfo: "Per 100g: Energy 365 kcal, Protein 9.4g, Carbohydrates 74.3g",
    disclaimer: "Store in a cool dry place.",
    features: ["100% Pure Makkai", "Naturally Nutritious", "Wholesome Everyday Choice"],
    packingStyles: ["1 Kg"]
  },
  {
    id: "bajri-1kg",
    name: "Bajri",
    category: "Flours",
    price: 60,
    originalPrice: 73,
    image: "/prod-bajri.png",
    rating: 4.9,
    reviews: 42,
    weight: "1 Kg",
    isNew: false,
    inStock: true,
    description: "Made from carefully selected Bajri grains, DEVAM Bajri is traditionally processed for rich taste and authentic Gujarati rotla.",
    ingredients: "100% Whole Bajri (Pearl Millet)",
    nutritionalInfo: "Per 100g: Energy 361 kcal, Protein 11.6g, Fiber 11.5g",
    disclaimer: "Store in an airtight container.",
    features: ["100% Whole Bajri", "Traditional Cold Chakki Ground", "High Fiber & Iron"],
    packingStyles: ["1 Kg"]
  },
  {
    id: "ragi-1kg",
    name: "Ragi",
    category: "Flours",
    price: 100,
    originalPrice: 120,
    image: "/prod-ragi.png",
    rating: 4.9,
    reviews: 19,
    weight: "1 Kg",
    isNew: true,
    inStock: true,
    badge: "High Calcium",
    description: "DEVAM Ragi is made from 100% pure, wholesome ragi (finger millet), rich in calcium and dietary fiber.",
    ingredients: "100% Whole Ragi (Finger Millet)",
    nutritionalInfo: "Per 100g: Energy 328 kcal, Protein 7.3g, Calcium 344mg",
    disclaimer: "Store in a dry place.",
    features: ["100% Pure Ragi", "High Calcium", "Diabetic Friendly"],
    packingStyles: ["1 Kg"]
  }
];
