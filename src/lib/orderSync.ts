import { db } from './firebase';
import { doc, setDoc, onSnapshot, collection, arrayUnion } from 'firebase/firestore';
import { useOrderStore, Order, normalizeOrderStatus } from '@/store/orderStore';

/**
 * Save an order to Firestore, sync with local store, broadcast to tabs, and trigger notifications
 */
export async function saveOrderAndNotify(newOrder: Order, userId?: string) {
  const normalizedOrder = {
    ...newOrder,
    status: normalizeOrderStatus(newOrder.status)
  };

  // 1. Sync to local Zustand store immediately
  useOrderStore.getState().addOrder(normalizedOrder);

  // 2. Broadcast via Window CustomEvent and BroadcastChannel for instant local tab sync
  if (typeof window !== 'undefined') {
    try {
      window.dispatchEvent(new CustomEvent('devam_new_order', { detail: normalizedOrder }));
      if ('BroadcastChannel' in window) {
        const channel = new BroadcastChannel('devam_orders_channel');
        channel.postMessage({ type: 'NEW_ORDER', order: normalizedOrder });
        channel.close();
      }
    } catch (err) {
      console.warn("Local broadcast error:", err);
    }
  }

  // 3. Save to Firebase Firestore for cross-device live entry in Admin Dashboard
  const saveFirestoreTask = async () => {
    try {
      if (db) {
        const nowIso = new Date().toISOString();
        const payload = { ...normalizedOrder, createdAt: nowIso };

        // A. Save to global orders collection
        const orderRef = doc(db, "orders", normalizedOrder.id);
        await setDoc(orderRef, payload, { merge: true });
        console.log(`[OrderSync] Order #${normalizedOrder.id} saved to Firestore orders collection.`);

        // B. Save to user profile by UID if logged in
        if (userId) {
          const userRef = doc(db, "users", userId);
          await setDoc(userRef, {
            orders: arrayUnion(payload)
          }, { merge: true });
        }

        // C. Save to user profile by Email for cross-device visibility
        const email = (normalizedOrder.customerEmail || "").toLowerCase();
        if (email && email !== "guest@thedevam.com") {
          const { collection, query, where, getDocs } = await import("firebase/firestore");
          const q = query(collection(db, "users"), where("email", "==", email));
          const snap = await getDocs(q);
          snap.forEach(async (dSnap) => {
            await setDoc(doc(db, "users", dSnap.id), {
              orders: arrayUnion(payload)
            }, { merge: true });
          });
        }
      }
    } catch (err) {
      console.warn("[OrderSync] Firestore save error:", err);
    }
  };

  // Run Firestore save with a 3.5-second safety race
  await Promise.race([
    saveFirestoreTask(),
    new Promise((resolve) => setTimeout(resolve, 3500))
  ]);

  // 4. Trigger Email & Notification API
  try {
    await fetch("/api/notifications/order-status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(normalizedOrder)
    });
    console.log(`[OrderSync] Email intimation sent for Order #${normalizedOrder.id}`);
  } catch (err) {
    console.warn("[OrderSync] Notification API error:", err);
  }
}

/**
 * Play a web audio chime sound alert when a new live order is received in Admin
 */
export function playOrderAlertSound() {
  if (typeof window === 'undefined') return;
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    
    // Play double chime note
    const playNote = (freq: number, startTime: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);
      gain.gain.setValueAtTime(0.3, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + duration);
    };

    const now = ctx.currentTime;
    playNote(587.33, now, 0.2); // D5
    playNote(880, now + 0.15, 0.4); // A5
  } catch (err) {
    console.warn("Audio alert error:", err);
  }
}

/**
 * Real-time Firestore & Local listener setup for Admin pages
 */
export function subscribeToLiveOrders(onNewLiveOrder?: (order: Order) => void) {
  if (typeof window === 'undefined') return () => {};

  const unsubscribes: (() => void)[] = [];

  // A. Listen to Window CustomEvent for instant same-browser updates
  const handleLocalEvent = (e: Event) => {
    const customEvent = e as CustomEvent;
    if (customEvent.detail) {
      const newOrder = customEvent.detail as Order;
      playOrderAlertSound();
      if (onNewLiveOrder) onNewLiveOrder(newOrder);
    }
  };
  window.addEventListener('devam_new_order', handleLocalEvent);
  unsubscribes.push(() => window.removeEventListener('devam_new_order', handleLocalEvent));

  // B. Listen to BroadcastChannel across browser tabs
  try {
    if ('BroadcastChannel' in window) {
      const channel = new BroadcastChannel('devam_orders_channel');
      channel.onmessage = (event) => {
        if (event.data?.type === 'NEW_ORDER' && event.data.order) {
          const rawOrder = event.data.order as Order;
          const newOrder = { ...rawOrder, status: normalizeOrderStatus(rawOrder.status) };
          const currentOrders = useOrderStore.getState().orders;
          if (!currentOrders.some(o => o.id === newOrder.id)) {
            useOrderStore.getState().addOrder(newOrder);
            playOrderAlertSound();
            if (onNewLiveOrder) onNewLiveOrder(newOrder);
          }
        } else if (event.data?.type === 'UPDATE_ORDER' && event.data.orderId) {
          const { orderId, updates } = event.data;
          useOrderStore.getState().updateOrderStatus(orderId, normalizeOrderStatus(updates.status), updates);
        }
      };
      unsubscribes.push(() => channel.close());
    }
  } catch (e) {}

  // C. Listen to Firestore real-time collection (Works cross-device)
  try {
    if (db) {
      const ordersColRef = collection(db, "orders");
      const unsubscribeFirestore = onSnapshot(ordersColRef, (snapshot) => {
        const firestoreOrders: Order[] = [];
        snapshot.forEach((docSnap) => {
          const raw = docSnap.data() as Order;
          if (raw && raw.id) {
            firestoreOrders.push({
              ...raw,
              status: normalizeOrderStatus(raw.status)
            });
          }
        });

        // Sort descending by date
        firestoreOrders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        const prevOrders = useOrderStore.getState().orders;

        // Check for newly added documents in real-time
        snapshot.docChanges().forEach((change) => {
          if (change.type === "added") {
            const addedOrder = change.doc.data() as Order;
            if (prevOrders.length > 0 && !prevOrders.some(o => o.id === addedOrder.id)) {
              playOrderAlertSound();
              if (onNewLiveOrder) onNewLiveOrder(addedOrder);
            }
          }
        });

        if (firestoreOrders.length > 0) {
          useOrderStore.setState({ orders: firestoreOrders });
        }
      }, (err) => {
        console.warn("[OrderSync] Firestore subscription warning:", err);
      });

      unsubscribes.push(unsubscribeFirestore);
    }
  } catch (err) {
    console.warn("[OrderSync] Realtime setup error:", err);
  }

  return () => {
    unsubscribes.forEach(fn => fn());
  };
}

/**
 * Update an existing order in Firestore and broadcast to all tabs
 */
export async function updateOrderInFirestore(orderId: string, updates: Partial<Order>) {
  if (!db) return;
  try {
    const orderRef = doc(db, "orders", orderId);
    await setDoc(orderRef, updates, { merge: true });

    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        const channel = new BroadcastChannel('devam_orders_channel');
        channel.postMessage({ type: 'UPDATE_ORDER', orderId, updates });
        channel.close();
      } catch (e) {}
    }
  } catch (err) {
    console.warn("[OrderSync] Failed to update order in Firestore:", err);
  }
}

/**
 * Cancel an order, update Firestore, sync with local store, broadcast to tabs, and trigger email notification
 */
export async function cancelOrderAndNotify(targetOrder: Order, reason?: string, userId?: string) {
  const nowIso = new Date().toISOString();
  const updates: Partial<Order> = {
    status: 'Cancelled',
    timeline: {
      ...(targetOrder.timeline || {}),
      cancelled: nowIso
    }
  };

  // 1. Update local Zustand store
  useOrderStore.getState().updateOrderStatus(targetOrder.id, 'Cancelled', updates);

  // 2. Broadcast local CustomEvent & BroadcastChannel
  if (typeof window !== 'undefined') {
    try {
      window.dispatchEvent(new CustomEvent('devam_order_cancelled', { detail: { orderId: targetOrder.id, reason } }));
      if ('BroadcastChannel' in window) {
        const channel = new BroadcastChannel('devam_orders_channel');
        channel.postMessage({ type: 'UPDATE_ORDER', orderId: targetOrder.id, updates });
        channel.close();
      }
    } catch (e) {}
  }

  // 3. Update Firestore
  if (db) {
    try {
      const orderRef = doc(db, "orders", targetOrder.id);
      await setDoc(orderRef, updates, { merge: true });

      if (userId) {
        const userRef = doc(db, "users", userId);
        await setDoc(userRef, {
          orders: arrayUnion({ ...targetOrder, ...updates })
        }, { merge: true });
      }

      const email = (targetOrder.customerEmail || "").toLowerCase();
      if (email && email !== "guest@thedevam.com") {
        const { collection, query, where, getDocs } = await import("firebase/firestore");
        const q = query(collection(db, "users"), where("email", "==", email));
        const snap = await getDocs(q);
        snap.forEach(async (dSnap) => {
          await setDoc(doc(db, "users", dSnap.id), {
            orders: arrayUnion({ ...targetOrder, ...updates })
          }, { merge: true });
        });
      }
    } catch (err) {
      console.warn("[OrderSync] Cancel order Firestore error:", err);
    }
  }

  // 4. Trigger Email & Notification API
  try {
    await fetch("/api/notifications/order-status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...targetOrder,
        ...updates,
        status: 'Cancelled',
        cancellationReason: reason || 'Cancelled by Customer'
      })
    });
    console.log(`[OrderSync] Cancellation notification sent for Order #${targetOrder.id}`);
  } catch (err) {
    console.warn("[OrderSync] Cancel notification error:", err);
  }
}
