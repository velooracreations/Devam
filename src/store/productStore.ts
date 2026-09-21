import { create } from 'zustand';
import { initialProducts, Product } from '@/lib/initialProducts';
export type { Product };
export { initialProducts };

interface ProductState {
  products: Product[];
  fetchProducts: () => Promise<void>;
  addProduct: (product: Product) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  deleteProductGroup: (name: string) => void;
  toggleStock: (id: string) => void;
  clearAllProducts: () => void;
  resetDatabase: () => void;
}

export const useProductStore = create<ProductState>()((set) => ({
  products: initialProducts,

  fetchProducts: async () => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('devam-product-storage');
      }
      const res = await fetch('/api/products', { cache: 'no-store' });
      if (res.ok && res.headers.get("content-type")?.includes("application/json")) {
        const data = await res.json();
        if (data.success && Array.isArray(data.products)) {
          set({ products: data.products });
        }
      }
    } catch (e) {
      console.error("Error fetching products from server:", e);
    }
  },
  
  addProduct: (product) => {
    set((state) => {
      const updated = [product, ...state.products];
      fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'sync', products: updated })
      }).catch(console.error);
      return { products: updated };
    });
  },
  
  updateProduct: (id, updates) => {
    set((state) => {
      const updated = state.products.map((p) => (p.id === id ? { ...p, ...updates } : p));
      fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'sync', products: updated })
      }).catch(console.error);
      return { products: updated };
    });
  },
  
  deleteProduct: (id) => {
    set((state) => {
      const updated = state.products.filter((p) => p.id !== id);
      fetch(`/api/products?id=${encodeURIComponent(id)}`, { method: 'DELETE' }).catch(console.error);
      return { products: updated };
    });
  },

  deleteProductGroup: (name) => {
    set((state) => {
      const updated = state.products.filter((p) => p.name !== name);
      fetch(`/api/products?name=${encodeURIComponent(name)}`, { method: 'DELETE' }).catch(console.error);
      return { products: updated };
    });
  },

  toggleStock: (id) => {
    set((state) => {
      const updated = state.products.map((p) => (p.id === id ? { ...p, inStock: p.inStock === false ? true : false } : p));
      fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'sync', products: updated })
      }).catch(console.error);
      return { products: updated };
    });
  },

  clearAllProducts: () => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('devam-product-storage');
      } catch (e) {
        console.error('Failed to clear product storage:', e);
      }
    }
    fetch('/api/products?clearAll=true', { method: 'DELETE' }).catch(console.error);
    set({ products: [] });
  },
  
  resetDatabase: () => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('devam-product-storage');
      } catch (e) {
        console.error('Failed to clear product storage:', e);
      }
    }
    fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'sync', products: initialProducts })
    }).catch(console.error);
    set({ products: initialProducts });
  },
}));

