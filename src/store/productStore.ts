import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
  description?: string;
  images?: string[];
  ingredients?: string;
  productDetails?: string;
  certifications?: string[];
  inStock?: boolean;
}

export const initialProducts: Product[] = [
  { id: "sharbati-atta-1kg", name: "Premium Sharbati Atta", category: "Flours", price: 80, originalPrice: 95, image: "/pkg_flours.png", rating: 4.8, reviews: 124, weight: "1 Kg", isNew: false, description: "Made from 100% pure MP Sharbati wheat, stone-ground to preserve natural nutrients and dietary fibers." },
  { id: "sharbati-atta-5kg", name: "Premium Sharbati Atta", category: "Flours", price: 350, originalPrice: 400, image: "/pkg_flours.png", rating: 4.8, reviews: 124, weight: "5 Kg", isNew: false, description: "Made from 100% pure MP Sharbati wheat, stone-ground to preserve natural nutrients and dietary fibers." },
  { id: "sharbati-atta-10kg", name: "Premium Sharbati Atta", category: "Flours", price: 680, originalPrice: 750, image: "/pkg_flours.png", rating: 4.8, reviews: 124, weight: "10 Kg", isNew: false, description: "Made from 100% pure MP Sharbati wheat, stone-ground to preserve natural nutrients and dietary fibers." },
  { id: "multigrain-atta-1kg", name: "Multigrain Health Atta", category: "Flours", price: 90, originalPrice: 110, image: "/pkg_flours.png", rating: 4.8, reviews: 76, weight: "1 Kg", isNew: true, description: "A healthy blend of 9 active grains including wheat, oats, soy, chana, and bajra. High in protein and dietary fiber for a balanced diet." },
  { id: "multigrain-atta-5kg", name: "Multigrain Health Atta", category: "Flours", price: 420, originalPrice: 480, image: "/pkg_flours.png", rating: 4.8, reviews: 76, weight: "5 Kg", isNew: true, description: "A healthy blend of 9 active grains including wheat, oats, soy, chana, and bajra. High in protein and dietary fiber for a balanced diet." },
  { id: "multigrain-atta-10kg", name: "Multigrain Health Atta", category: "Flours", price: 820, originalPrice: 900, image: "/pkg_flours.png", rating: 4.8, reviews: 76, weight: "10 Kg", isNew: true, description: "A healthy blend of 9 active grains including wheat, oats, soy, chana, and bajra. High in protein and dietary fiber for a balanced diet." },
  
  { id: "besan-500g", name: "Chana Besan (Gram Flour)", category: "Flours", price: 65, originalPrice: 80, image: "/pkg_flours.png", rating: 4.7, reviews: 88, weight: "500 g", isNew: false, description: "Finely milled 100% pure chana dal besan, perfect for making crispy pakoras and sweet ladoos." },
  { id: "besan-1kg", name: "Chana Besan (Gram Flour)", category: "Flours", price: 120, originalPrice: 150, image: "/pkg_flours.png", rating: 4.7, reviews: 88, weight: "1 Kg", isNew: false, description: "Finely milled 100% pure chana dal besan, perfect for making crispy pakoras and sweet ladoos." },
  { id: "besan-5kg", name: "Chana Besan (Gram Flour)", category: "Flours", price: 580, originalPrice: 700, image: "/pkg_flours.png", rating: 4.7, reviews: 88, weight: "5 Kg", isNew: false, description: "Finely milled 100% pure chana dal besan, perfect for making crispy pakoras and sweet ladoos." },
  
  { id: "maida-500g", name: "Premium Maida", category: "Flours", price: 45, originalPrice: 55, image: "/pkg_flours.png", rating: 4.5, reviews: 45, weight: "500 g", isNew: false, description: "Refined wheat flour, highly extensible and perfect for baking cakes, pastries, and Indian breads." },
  { id: "maida-1kg", name: "Premium Maida", category: "Flours", price: 80, originalPrice: 100, image: "/pkg_flours.png", rating: 4.5, reviews: 45, weight: "1 Kg", isNew: false, description: "Refined wheat flour, highly extensible and perfect for baking cakes, pastries, and Indian breads." },
  { id: "maida-5kg", name: "Premium Maida", category: "Flours", price: 380, originalPrice: 480, image: "/pkg_flours.png", rating: 4.5, reviews: 45, weight: "5 Kg", isNew: false, description: "Refined wheat flour, highly extensible and perfect for baking cakes, pastries, and Indian breads." },
  
  { id: "sooji-500g", name: "Roasted Sooji (Rava)", category: "Flours", price: 50, originalPrice: 60, image: "/pkg_flours.png", rating: 4.6, reviews: 52, weight: "500 g", isNew: false, description: "Pre-roasted premium granulated wheat sooji (Rava), perfect for both sweet and savory dishes like upma and halwa." },
  { id: "sooji-1kg", name: "Roasted Sooji (Rava)", category: "Flours", price: 90, originalPrice: 110, image: "/pkg_flours.png", rating: 4.6, reviews: 52, weight: "1 Kg", isNew: false, description: "Pre-roasted premium granulated wheat sooji (Rava), perfect for both sweet and savory dishes like upma and halwa." },
  { id: "sooji-5kg", name: "Roasted Sooji (Rava)", category: "Flours", price: 430, originalPrice: 520, image: "/pkg_flours.png", rating: 4.6, reviews: 52, weight: "5 Kg", isNew: false, description: "Pre-roasted premium granulated wheat sooji (Rava), perfect for both sweet and savory dishes like upma and halwa." },
  
  { id: "jowar-atta-1kg", name: "Jowar Atta (Sorghum)", category: "Flours", price: 110, originalPrice: 130, image: "/pkg_flours.png", rating: 4.9, reviews: 34, weight: "1 Kg", isNew: true, description: "Gluten-free sorghum flour, rich in antioxidants, high in fiber, and easy to digest." },
  { id: "jowar-atta-5kg", name: "Jowar Atta (Sorghum)", category: "Flours", price: 530, originalPrice: 620, image: "/pkg_flours.png", rating: 4.9, reviews: 34, weight: "5 Kg", isNew: true, description: "Gluten-free sorghum flour, rich in antioxidants, high in fiber, and easy to digest." },

  // Spices
  { id: "kashmiri-chilli-100g", name: "Kashmiri Chilli Powder", category: "Spice Powders", price: 40, originalPrice: 50, image: "/prod-chilli.jpg", rating: 4.9, reviews: 89, weight: "100 g", isNew: true, description: "Vibrant red color with mild heat. Sourced directly from the fields of Kashmir." },
  { id: "kashmiri-chilli-250g", name: "Kashmiri Chilli Powder", category: "Spice Powders", price: 95, originalPrice: 115, image: "/prod-chilli.jpg", rating: 4.9, reviews: 89, weight: "250 g", isNew: true, description: "Vibrant red color with mild heat. Sourced directly from the fields of Kashmir." },
  { id: "kashmiri-chilli-500g", name: "Kashmiri Chilli Powder", category: "Spice Powders", price: 180, originalPrice: 220, image: "/prod-chilli.jpg", rating: 4.9, reviews: 89, weight: "500 g", isNew: true, description: "Vibrant red color with mild heat. Sourced directly from the fields of Kashmir." },
  
  { id: "turmeric-powder-500g", name: "Organic Turmeric Powder", category: "Spice Powders", price: 150, originalPrice: 190, image: "/pkg_spice_powder.png", rating: 4.7, reviews: 56, weight: "500 g", isNew: false, description: "High curcumin content Salem turmeric, providing robust flavor and immune-boosting properties." },
  { id: "coriander-powder-500g", name: "Dhaniya (Coriander) Powder", category: "Spice Powders", price: 140, originalPrice: 170, image: "/pkg_spice_powder.png", rating: 4.8, reviews: 112, weight: "500 g", isNew: false, description: "Freshly ground coriander seeds with a citrusy, nutty aroma." },
  
  // Whole Spices
  { id: "cumin-seeds-250g", name: "Premium Jeera (Cumin)", category: "Whole Spices", price: 210, originalPrice: 250, image: "/prod-jeera.jpg", rating: 4.9, reviews: 204, weight: "250 g", isNew: false, description: "Large, aromatic Unjha cumin seeds. Essential for Indian tempering (Tadka)." },
  { id: "garam-masala-250g", name: "Authentic Garam Masala", category: "Whole Spices", price: 280, originalPrice: 320, image: "/pkg_whole_spices.png", rating: 4.9, reviews: 145, weight: "250 g", isNew: true, description: "A highly aromatic, small-batch blend of 11 whole spices roasted and ground to perfection." },
  
  // Grains
  { id: "unpolished-tur-dal-1kg", name: "Unpolished Tur Dal", category: "Grains", price: 160, originalPrice: 180, image: "/prod-tur-dal.jpg", rating: 4.6, reviews: 210, weight: "1 Kg", isNew: false, description: "100% unpolished and sortex-cleaned Tur Dal. Retains all natural proteins and cooks faster." },
  { id: "basmati-rice-5kg", name: "Premium Basmati Rice", category: "Grains", price: 850, originalPrice: 999, image: "/pkg_whole_grains.png", rating: 4.9, reviews: 342, weight: "5 Kg", isNew: false, description: "Extra-long grain aromatic Basmati rice, aged for 2 years. Perfect for biryani and pulao." },
  { id: "moong-dal-1kg", name: "Yellow Moong Dal", category: "Grains", price: 145, originalPrice: 170, image: "/pkg_whole_grains.png", rating: 4.7, reviews: 128, weight: "1 Kg", isNew: false, description: "Easy-to-digest split yellow moong dal, high in protein and extremely light on the stomach." },
  { id: "chana-dal-1kg", name: "Premium Chana Dal", category: "Grains", price: 110, originalPrice: 135, image: "/pkg_whole_grains.png", rating: 4.5, reviews: 94, weight: "1 Kg", isNew: false, description: "Split bengal gram, sweet and nutty flavor. Essential for traditional Indian sweets and curries." },
  { id: "urad-dal-1kg", name: "Urad Dal (Split)", category: "Grains", price: 155, originalPrice: 180, image: "/pkg_whole_grains.png", rating: 4.8, reviews: 167, weight: "1 Kg", isNew: false, description: "Split black gram dal. The secret ingredient to making perfectly fermented idli and dosa batter." },
];

interface ProductState {
  products: Product[];
  addProduct: (product: Product) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  resetDatabase: () => void;
}

export const useProductStore = create<ProductState>()(
  persist(
    (set) => ({
      products: initialProducts,
      
      addProduct: (product) => set((state) => ({ products: [...state.products, product] })),
      
      updateProduct: (id, updates) => set((state) => ({
        products: state.products.map((p) => (p.id === id ? { ...p, ...updates } : p)),
      })),
      
      deleteProduct: (id) => set((state) => ({
        products: state.products.filter((p) => p.id !== id),
      })),
      
      resetDatabase: () => set({ products: initialProducts }),
    }),
    {
      name: 'devam-product-storage',
    }
  )
);
