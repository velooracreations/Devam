import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem } from './cartStore';

export interface Order {
  id: string;
  date: string;
  totalAmount: number;
  paymentMethod: string;
  items: CartItem[];
  status: 'Order Placed' | 'Confirmed' | 'Shipped' | 'Delivered';
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  shippingAddress?: string;
  trackingNumber?: string;
  courierPartner?: string;
  gstNumber?: string;
}

interface OrderState {
  orders: Order[];
  nextOrderId: number;
  addOrder: (order: Order) => void;
  getNextOrderId: () => string;
  updateOrderStatus: (id: string, status: Order['status']) => void;
}

export const useOrderStore = create<OrderState>()(
  persist(
    (set, get) => ({
      orders: [],
      nextOrderId: 10001,
      addOrder: (newOrder) => set((state) => ({ orders: [newOrder, ...state.orders] })),
      getNextOrderId: () => {
        const id = get().nextOrderId;
        set({ nextOrderId: id + 1 });
        return `ORD-${id}`;
      },
      updateOrderStatus: (id, status) => set((state) => ({
        orders: state.orders.map(order => 
          order.id === id ? { ...order, status } : order
        )
      }))
    }),
    {
      name: 'devam-order-storage',
    }
  )
);
