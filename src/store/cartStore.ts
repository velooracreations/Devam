import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { db, auth } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  weight: string;
  batchNo?: string;
  mfgDate?: string;
  expDate?: string;
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  setCart: (items: CartItem[], skipCloudSync?: boolean) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;
}

// Debounced Cloud Sync to Firestore for authenticated users across all devices
let cloudSyncTimer: NodeJS.Timeout | null = null;
const syncCartToCloud = (items: CartItem[]) => {
  if (typeof window === 'undefined') return;
  const user = auth?.currentUser;
  if (!user) return;

  if (cloudSyncTimer) clearTimeout(cloudSyncTimer);
  cloudSyncTimer = setTimeout(async () => {
    try {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, { cart: items, cartUpdatedAt: new Date().toISOString() }, { merge: true });
    } catch (err) {
      console.error("Failed to sync cart to Firestore cloud:", err);
    }
  }, 350);
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      
      setCart: (newItems, skipCloudSync = false) => {
        const safeItems = Array.isArray(newItems) ? newItems : [];
        set({ items: safeItems });
        if (!skipCloudSync) {
          syncCartToCloud(safeItems);
        }
      },

      addItem: (newItem) => {
        set((state) => {
          const existingItem = state.items.find((item) => item.id === newItem.id);
          const updatedItems = existingItem
            ? state.items.map((item) =>
                item.id === newItem.id
                  ? { ...item, quantity: item.quantity + newItem.quantity }
                  : item
              )
            : [...state.items, newItem];
          
          syncCartToCloud(updatedItems);
          return { items: updatedItems };
        });
      },
      
      removeItem: (id) => {
        set((state) => {
          const updatedItems = state.items.filter((item) => item.id !== id);
          syncCartToCloud(updatedItems);
          return { items: updatedItems };
        });
      },
      
      updateQuantity: (id, quantity) => {
        set((state) => {
          const updatedItems = state.items.map((item) =>
            item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item
          );
          syncCartToCloud(updatedItems);
          return { items: updatedItems };
        });
      },
      
      clearCart: () => {
        set({ items: [] });
        syncCartToCloud([]);
      },
      
      getCartTotal: () => {
        return get().items.reduce((total, item) => total + (item.price * item.quantity), 0);
      },
      
      getCartCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      }
    }),
    {
      name: 'devam-cart-storage', // saves to localStorage so cart persists across reloads
    }
  )
);

