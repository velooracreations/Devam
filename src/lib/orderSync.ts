import { db } from './firebase';
import { doc, setDoc, onSnapshot, collection, arrayUnion } from 'firebase/firestore';
import { useOrderStore, Order } from '@/store/orderStore';

/**
 * Save an order to Firestore, sync with local store, broadcast to tabs, and trigger notifications
 */
export async function saveOrderAndNotify(newOrder: Order, userId?: string) {
  // 1. Sync to local Zustand store immediately
  useOrderStore.getState().addOrder(newOrder);

  // 2. Broadcast via Window CustomEvent and BroadcastChannel for instant local tab sync
  if (typeof window !== 'undefined') {
    try {
      window.dispatchEvent(new CustomEvent('devam_new_order', { detail: newOrder }));
      if ('BroadcastChannel' in window) {
        const channel = new BroadcastChannel('devam_orders_channel');
        channel.postMessage({ type: 'NEW_ORDER', order: newOrder });
        channel.close();
      }
    } catch (err) {
      console.warn("Local broadcast error:", err);
    }
  }

  // 3. Save to Firebase Firestore for cross-device live entry in Admin ID (with 3s timeout guard)
  const saveFirestoreTask = async () => {
    try {
      if (db) {
        // A. Save to global orders collection
        const orderRef = doc(db, "orders", newOrder.id);
        await setDoc(orderRef, {
          ...newOrder,
          createdAt: new Date().toISOString()
        }, { merge: true });
        console.log(`[OrderSync] Order #${newOrder.id} saved to Firestore orders collection.`);

        // B. Save to user profile if user is logged in
        if (userId) {
          const userRef = doc(db, "users", userId);
          await setDoc(userRef, {
            orders: arrayUnion({
              ...newOrder,
              createdAt: new Date().toISOString()
            })
          }, { merge: true });
          console.log(`[OrderSync] Order #${newOrder.id} linked to user profile ${userId}.`);
        }
      }
    } catch (err) {
      console.warn("[OrderSync] Firestore save error:", err);
    }
  };

  // Run Firestore save with a 3.5-second timeout safety guard so UI placement never hangs
  await Promise.race([
    saveFirestoreTask(),
    new Promise((resolve) => setTimeout(resolve, 3500))
  ]);

  // 4. Trigger Email & WhatsApp Notification API (non-blocking in background)
  fetch("/api/notifications/order-status", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newOrder)
  }).catch((err) => console.warn("[OrderSync] Notification API error:", err));
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
          const newOrder = event.data.order as Order;
          const currentOrders = useOrderStore.getState().orders;
          if (!currentOrders.some(o => o.id === newOrder.id)) {
            useOrderStore.getState().addOrder(newOrder);
            playOrderAlertSound();
            if (onNewLiveOrder) onNewLiveOrder(newOrder);
          }
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
          firestoreOrders.push(docSnap.data() as Order);
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
