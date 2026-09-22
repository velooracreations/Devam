import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem } from './cartStore';

export type OrderStatus = 'Order Placed' | 'Confirmed' | 'Shipped' | 'Out for Dispatch' | 'Delivered';

export interface OrderTimeline {
  orderPlaced?: string;
  confirmed?: string;
  shipped?: string;
  outForDispatch?: string;
  delivered?: string;
}

export interface Order {
  id: string;
  date: string;
  totalAmount: number;
  paymentMethod: string;
  items: CartItem[];
  status: OrderStatus;
  timeline?: OrderTimeline;
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
  updateOrderStatus: (id: string, status: OrderStatus, extra?: Partial<Order>) => void;
  clearAllOrders: () => void;
}

export function computeTimeline(
  currentTimeline?: OrderTimeline,
  newStatus?: OrderStatus,
  orderDate?: string
): OrderTimeline {
  const now = new Date().toISOString();
  const base = orderDate || now;
  const tl: OrderTimeline = {
    orderPlaced: currentTimeline?.orderPlaced || base,
    ...(currentTimeline || {})
  };

  if (!tl.orderPlaced) tl.orderPlaced = base;

  if (newStatus === 'Confirmed') {
    if (!tl.confirmed) tl.confirmed = now;
  } else if (newStatus === 'Shipped') {
    if (!tl.confirmed) tl.confirmed = tl.orderPlaced;
    if (!tl.shipped) tl.shipped = now;
  } else if (newStatus === 'Out for Dispatch') {
    if (!tl.confirmed) tl.confirmed = tl.orderPlaced;
    if (!tl.shipped) tl.shipped = tl.orderPlaced;
    if (!tl.outForDispatch) tl.outForDispatch = now;
  } else if (newStatus === 'Delivered') {
    if (!tl.confirmed) tl.confirmed = tl.orderPlaced;
    if (!tl.shipped) tl.shipped = tl.orderPlaced;
    if (!tl.outForDispatch) tl.outForDispatch = tl.orderPlaced;
    if (!tl.delivered) tl.delivered = now;
  }

  return tl;
}

export const useOrderStore = create<OrderState>()(
  persist(
    (set, get) => ({
      orders: [],
      nextOrderId: 10001,
      addOrder: (newOrder) => {
        const orderWithTimeline: Order = {
          ...newOrder,
          timeline: {
            orderPlaced: newOrder.timeline?.orderPlaced || newOrder.date || new Date().toISOString(),
            ...(newOrder.timeline || {})
          }
        };
        set((state) => ({ orders: [orderWithTimeline, ...state.orders] }));
      },
      getNextOrderId: () => {
        const id = get().nextOrderId;
        set({ nextOrderId: id + 1 });
        return `ORD-${id}`;
      },
      updateOrderStatus: (id, status, extra) => set((state) => ({
        orders: state.orders.map(order => {
          if (order.id !== id) return order;
          const updatedTimeline = computeTimeline(order.timeline, status, order.date);
          return {
            ...order,
            status,
            ...(extra || {}),
            timeline: updatedTimeline
          };
        })
      })),
      clearAllOrders: () => set({ orders: [], nextOrderId: 10001 })
    }),
    {
      name: 'devam-order-storage',
    }
  )
);
