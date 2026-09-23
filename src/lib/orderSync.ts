import { useOrderStore, Order, normalizeOrderStatus } from '@/store/orderStore';

/**
 * Save an order to Cloud Firestore via Server API, sync with local store, broadcast to tabs, and trigger notifications
 */
export async function saveOrderAndNotify(newOrder: Order, userId?: string) {
  const normalizedOrder: Order = {
    ...newOrder,
    status: normalizeOrderStatus(newOrder.status)
  };

  // 1. Sync to local Zustand store immediately for instant 0ms latency UI response
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

  // 3. Persist to Server & Cloud Firestore via /api/orders (Works seamlessly on Mobile and Laptop)
  try {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order: normalizedOrder, userId }),
    });
    if (res.ok) {
      const data = await res.json();
      console.log(`[OrderSync] Order #${normalizedOrder.id} successfully saved to server & Cloud Firestore.`);
      if (data?.order) {
        useOrderStore.getState().addOrder(data.order);
      }
    } else {
      console.warn('[OrderSync] Server responded with error status:', res.status);
    }
  } catch (err) {
    console.warn('[OrderSync] Failed to post order to /api/orders:', err);
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
    
    // Play double chime note (D5 -> A5)
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
 * Real-time Server & Local listener setup for Admin pages
 * Polls the centralized Server/Cloud Firestore API so orders placed from Mobile, Laptop,
 * or ANY device are instantly synced into Admin and trigger audio/visual alerts.
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

  // C. Centralized Server Sync (Works cross-device: Mobile <-> Laptop <-> Admin)
  let isPolling = true;

  const fetchLatestServerOrders = async () => {
    try {
      const res = await fetch('/api/orders?admin=true', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data?.orders) && data.orders.length > 0) {
          const serverOrders: Order[] = data.orders.map((o: Order) => ({
            ...o,
            status: normalizeOrderStatus(o.status)
          }));

          const prevOrders = useOrderStore.getState().orders;

          // Check if any brand new orders arrived from other devices (e.g. Mobile browser)
          if (prevOrders.length > 0) {
            serverOrders.forEach(serverOrder => {
              if (!prevOrders.some(p => p.id === serverOrder.id)) {
                // New order discovered from cloud!
                playOrderAlertSound();
                if (onNewLiveOrder) onNewLiveOrder(serverOrder);
              }
            });
          }

          // Merge server orders with local orders (preferring newest updates)
          const mergedMap = new Map<string, Order>();
          serverOrders.forEach(o => mergedMap.set(o.id, o));
          prevOrders.forEach(o => {
            if (!mergedMap.has(o.id)) mergedMap.set(o.id, o);
          });

          // Auto-backfill: if there are any local orders that are NOT yet on the server, upload them
          prevOrders.forEach(localOrder => {
            if (localOrder && localOrder.id && !serverOrders.some(s => s.id === localOrder.id)) {
              fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ order: localOrder }),
              }).catch(() => {});
            }
          });

          const finalList = Array.from(mergedMap.values()).sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          );

          useOrderStore.setState({ orders: finalList });
        }
      }
    } catch (err) {
      console.warn('[OrderSync] Server polling error:', err);
    }
  };

  // Immediate initial sync
  fetchLatestServerOrders();

  // Periodic polling every 4 seconds for real-time cross-device sync
  const intervalId = setInterval(() => {
    if (isPolling) {
      fetchLatestServerOrders();
    }
  }, 4000);

  unsubscribes.push(() => {
    isPolling = false;
    clearInterval(intervalId);
  });

  return () => {
    unsubscribes.forEach(fn => fn());
  };
}

/**
 * Automatically backfill any old orders sitting in the user's browser localStorage to Cloud Firestore
 */
export async function syncExistingLocalOrdersToCloud() {
  if (typeof window === 'undefined') return;

  try {
    const rawLocal = localStorage.getItem('devam-orders-storage');
    if (!rawLocal) return;

    const parsed = JSON.parse(rawLocal);
    const localOrders: Order[] = parsed?.state?.orders || [];
    if (!Array.isArray(localOrders) || localOrders.length === 0) return;

    for (const order of localOrders) {
      if (order && order.id) {
        await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order }),
        }).catch(() => {});
      }
    }
    console.log(`[OrderSync] Checked and backfilled ${localOrders.length} local orders to Cloud Firestore.`);
  } catch (err) {
    console.warn('[OrderSync] Auto-backfill notice:', err);
  }
}

/**
 * Update an existing order via Server API and broadcast to all tabs
 */
export async function updateOrderInFirestore(orderId: string, updates: Partial<Order>) {
  // 1. Update local Zustand state immediately
  if (updates.status) {
    useOrderStore.getState().updateOrderStatus(orderId, normalizeOrderStatus(updates.status), updates);
  }

  // 2. Broadcast across tabs
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    try {
      const channel = new BroadcastChannel('devam_orders_channel');
      channel.postMessage({ type: 'UPDATE_ORDER', orderId, updates });
      channel.close();
    } catch (e) {}
  }

  // 3. Update via Server API
  try {
    await fetch('/api/orders', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, updates }),
    });
    console.log(`[OrderSync] Order #${orderId} updated on server.`);
  } catch (err) {
    console.warn('[OrderSync] Failed to update order on server:', err);
  }
}

/**
 * Cancel an order, update Server, sync with local store, broadcast to tabs, and trigger email notification
 */
export async function cancelOrderAndNotify(targetOrder: Order, reason?: string, userId?: string) {
  const nowIso = new Date().toISOString();
  const updates: Partial<Order> = {
    status: 'Cancelled',
    cancellationReason: reason || 'Cancelled by Customer',
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

  // 3. Update Server & Cloud Firestore
  try {
    await fetch('/api/orders', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId: targetOrder.id, updates }),
    });
  } catch (err) {
    console.warn('[OrderSync] Server cancel order error:', err);
  }

  // 4. Trigger Email Notification API
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
