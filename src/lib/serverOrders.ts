import fs from 'fs';
import path from 'path';
import { Order, normalizeOrderStatus } from '@/store/orderStore';
import { getServerFirestore } from '@/lib/serverFirestore';

const ordersFilePath = path.join(process.cwd(), 'scratch_data', 'orders.json');

// Global in-memory cache to guarantee sub-millisecond local consistency across serverless requests
let inMemoryOrders: Order[] = [];

/**
 * Read backup orders from disk cache
 */
function readDiskOrders(): Order[] {
  try {
    if (fs.existsSync(ordersFilePath)) {
      const content = fs.readFileSync(ordersFilePath, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        return parsed.map(o => ({ ...o, status: normalizeOrderStatus(o.status) }));
      }
    }
  } catch (err) {
    console.warn('[ServerOrders] Error reading orders.json:', err);
  }
  return [];
}

/**
 * Write backup orders to disk cache
 */
function writeDiskOrders(orders: Order[]): void {
  try {
    const dir = path.dirname(ordersFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(ordersFilePath, JSON.stringify(orders, null, 2), 'utf-8');
  } catch (err) {
    // Ephemeral in read-only environment, memory cache will serve
  }
}

/**
 * Compute the next available sequential Order ID from Cloud Firestore & local memory
 */
export async function getNextServerOrderId(): Promise<string> {
  const allOrders = await getAllServerOrders();
  let maxNum = 10000;
  for (const order of allOrders) {
    if (order && order.id) {
      const match = order.id.match(/ORD-(\d+)/i) || order.id.match(/(\d+)/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num) && num > maxNum) {
          maxNum = num;
        }
      }
    }
  }
  return `ORD-${maxNum + 1}`;
}

/**
 * Save an order to Cloud Firestore AND disk backup with anti-collision protection
 */
export async function saveServerOrder(newOrder: Order, userId?: string): Promise<Order> {
  const allOrders = await getAllServerOrders();
  let finalId = newOrder.id;

  // Collision detection: Check if an order with this ID already exists
  const existingOrder = allOrders.find(o => o.id === finalId);
  const isNewOrderCreation = !existingOrder || (
    existingOrder.customerPhone !== newOrder.customerPhone &&
    existingOrder.customerName !== newOrder.customerName &&
    existingOrder.date !== newOrder.date
  );

  if (existingOrder && isNewOrderCreation) {
    // Client generated an ID (e.g. ORD-10001) that ALREADY exists for a different customer!
    // Assign next available sequential ID automatically to prevent overwriting existing orders.
    finalId = await getNextServerOrderId();
    console.warn(`[ServerOrders] Collision prevented! Re-assigned Order ID from "${newOrder.id}" to unique "${finalId}".`);
  }

  const normalized: Order = {
    ...newOrder,
    id: finalId,
    status: normalizeOrderStatus(newOrder.status),
    timeline: newOrder.timeline || { orderPlaced: newOrder.date || new Date().toISOString() },
  };

  // 1. Update in-memory & disk backup immediately
  const existingIdx = inMemoryOrders.findIndex(o => o.id === normalized.id);
  if (existingIdx >= 0) {
    inMemoryOrders[existingIdx] = normalized;
  } else {
    inMemoryOrders.unshift(normalized);
  }
  writeDiskOrders(inMemoryOrders);

  // 2. Persist to Cloud Firestore
  try {
    const firestore = getServerFirestore();
    if (firestore) {
      const orderRef = firestore.collection('orders').doc(normalized.id);
      await orderRef.set({
        ...normalized,
        userId: userId || null,
        updatedAt: new Date().toISOString(),
      }, { merge: true });

      // If user profile is linked, also index in users collection
      if (userId) {
        try {
          const userRef = firestore.collection('users').doc(userId);
          const uDoc = await userRef.get();
          if (uDoc.exists) {
            const currentOrders = uDoc.data()?.orders || [];
            const updatedUserOrders = [normalized, ...currentOrders.filter((o: Order) => o.id !== normalized.id)];
            await userRef.set({ orders: updatedUserOrders }, { merge: true });
          }
        } catch {}
      }

      console.log(`[ServerOrders] Successfully persisted Order #${normalized.id} to Cloud Firestore.`);
    }
  } catch (cloudErr) {
    console.error('[ServerOrders] Cloud Firestore write error:', cloudErr);
  }

  return normalized;
}

/**
 * Get all store orders (for Admin Dashboard and store reports)
 */
export async function getAllServerOrders(): Promise<Order[]> {
  const mergedMap = new Map<string, Order>();

  // A. Load from disk backup / memory
  const disk = readDiskOrders();
  [...inMemoryOrders, ...disk].forEach(o => {
    if (o && o.id) mergedMap.set(o.id, { ...o, status: normalizeOrderStatus(o.status) });
  });

  // B. Load from Cloud Firestore
  try {
    const firestore = getServerFirestore();
    if (firestore) {
      const snapshot = await firestore.collection('orders').get();
      snapshot.forEach(docSnap => {
        const data = docSnap.data() as Order;
        if (data && data.id) {
          mergedMap.set(data.id, { ...data, status: normalizeOrderStatus(data.status) });
        }
      });
    }
  } catch (err) {
    console.warn('[ServerOrders] Error loading from Cloud Firestore:', err);
  }

  const allOrders = Array.from(mergedMap.values()).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  inMemoryOrders = allOrders;
  return allOrders;
}

/**
 * Get customer orders filtered by email, phone, or userId
 */
export async function getCustomerServerOrders(filter: { email?: string; phone?: string; userId?: string }): Promise<Order[]> {
  const allOrders = await getAllServerOrders();
  const emailNorm = (filter.email || '').toLowerCase().trim();
  const phoneClean = (filter.phone || '').replace(/\D/g, '');

  if (!emailNorm && !phoneClean && !filter.userId) {
    return allOrders;
  }

  return allOrders.filter(order => {
    // Match by email
    if (emailNorm && emailNorm !== 'guest@thedevam.com') {
      const orderEmail = (order.customerEmail || '').toLowerCase().trim();
      if (orderEmail === emailNorm) return true;
    }

    // Match by phone number
    if (phoneClean && phoneClean.length >= 10) {
      const orderPhone = (order.customerPhone || '').replace(/\D/g, '');
      if (orderPhone.endsWith(phoneClean.slice(-10))) return true;
    }

    // Match by userId
    if (filter.userId && (order as any).userId === filter.userId) {
      return true;
    }

    return false;
  });
}

/**
 * Update an existing order status or cancellation reason
 */
export async function updateServerOrder(orderId: string, updates: Partial<Order>): Promise<Order | null> {
  const allOrders = await getAllServerOrders();
  const target = allOrders.find(o => o.id === orderId);

  if (!target) {
    console.warn(`[ServerOrders] Order #${orderId} not found for update.`);
    return null;
  }

  const updated: Order = {
    ...target,
    ...updates,
    status: updates.status ? normalizeOrderStatus(updates.status) : target.status,
    timeline: {
      ...(target.timeline || {}),
      ...(updates.timeline || {}),
      ...(updates.status === 'Cancelled' ? { cancelled: new Date().toISOString() } : {})
    },
    updatedAt: new Date().toISOString(),
  };

  // 1. Update memory & disk
  const idx = inMemoryOrders.findIndex(o => o.id === orderId);
  if (idx >= 0) inMemoryOrders[idx] = updated;
  writeDiskOrders(inMemoryOrders);

  // 2. Update Cloud Firestore
  try {
    const firestore = getServerFirestore();
    if (firestore) {
      await firestore.collection('orders').doc(orderId).set(updated, { merge: true });
      console.log(`[ServerOrders] Updated Order #${orderId} in Cloud Firestore.`);
    }
  } catch (err) {
    console.error(`[ServerOrders] Failed to update Order #${orderId} in Firestore:`, err);
  }

  return updated;
}
