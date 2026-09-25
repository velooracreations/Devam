import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem } from './cartStore';

export type OrderStatus = 'Order Placed' | 'Confirmed' | 'Shipped' | 'Out for Dispatch' | 'Delivered' | 'Cancelled';

export interface OrderTimeline {
  orderPlaced?: string;
  confirmed?: string;
  shipped?: string;
  outForDispatch?: string;
  delivered?: string;
  cancelled?: string;
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
  cancellationReason?: string;
  gstNumber?: string;
  updatedAt?: string;
}

interface OrderState {
  orders: Order[];
  nextOrderId: number;
  addOrder: (order: Order) => void;
  getNextOrderId: () => string;
  updateOrderStatus: (id: string, status: OrderStatus, extra?: Partial<Order>) => void;
  clearAllOrders: () => void;
}

export function normalizeOrderStatus(rawStatus?: string): OrderStatus {
  if (!rawStatus) return "Order Placed";
  const s = rawStatus.trim().toLowerCase();
  if (s.includes("deliver")) return "Delivered";
  if (s.includes("out for") || s.includes("dispatch")) return "Out for Dispatch";
  if (s.includes("ship")) return "Shipped";
  if (s.includes("confirm")) return "Confirmed";
  return "Order Placed";
}

export function computeTimeline(
  currentTimeline?: OrderTimeline,
  newStatus?: OrderStatus,
  orderDate?: string
): OrderTimeline {
  const now = new Date().toISOString();
  const base = orderDate || now;
  const normalized = normalizeOrderStatus(newStatus);
  const tl: OrderTimeline = {
    orderPlaced: currentTimeline?.orderPlaced || base,
    ...(currentTimeline || {})
  };

  if (!tl.orderPlaced) tl.orderPlaced = base;

  if (normalized === 'Confirmed') {
    if (!tl.confirmed) tl.confirmed = now;
  } else if (normalized === 'Shipped') {
    if (!tl.confirmed) tl.confirmed = tl.orderPlaced;
    if (!tl.shipped) tl.shipped = now;
  } else if (normalized === 'Out for Dispatch') {
    if (!tl.confirmed) tl.confirmed = tl.orderPlaced;
    if (!tl.shipped) tl.shipped = tl.orderPlaced;
    if (!tl.outForDispatch) tl.outForDispatch = now;
  } else if (normalized === 'Delivered') {
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
        const normalizedStatus = normalizeOrderStatus(newOrder.status);
        const orderWithTimeline: Order = {
          ...newOrder,
          status: normalizedStatus,
          timeline: {
            orderPlaced: newOrder.timeline?.orderPlaced || newOrder.date || new Date().toISOString(),
            ...(newOrder.timeline || {})
          }
        };
        set((state) => {
          const filtered = state.orders.filter(o => o.id !== newOrder.id);
          return { orders: [orderWithTimeline, ...filtered] };
        });
      },
      getNextOrderId: () => {
        const currentOrders = get().orders;
        let maxNum = Math.max(10000, (get().nextOrderId || 10001) - 1);
        currentOrders.forEach(o => {
          if (o && o.id) {
            const match = o.id.match(/ORD-(\d+)/i) || o.id.match(/(\d+)/);
            if (match) {
              const num = parseInt(match[1], 10);
              if (!isNaN(num) && num > maxNum) maxNum = num;
            }
          }
        });
        const nextId = maxNum + 1;
        set({ nextOrderId: nextId + 1 });
        return `ORD-${nextId}`;
      },
      updateOrderStatus: (id, status, extra) => set((state) => ({
        orders: state.orders.map(order => {
          if (order.id !== id) return order;
          const normalized = normalizeOrderStatus(status);
          const updatedTimeline = computeTimeline(order.timeline, normalized, order.date);
          return {
            ...order,
            status: normalized,
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
