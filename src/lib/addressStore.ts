import { db } from "@/lib/firebase";

export interface Address {
  id: string;
  name: string;
  phone: string;
  pin: string;
  houseNo: string;
  buildingName?: string;
  street: string;
  area: string;
  landmark?: string;
  cityDistrict: string;
  state: string;
  type: "HOME" | "WORK" | "OTHER" | string;
  isDefault?: boolean;
}

const GUEST_KEY = "devam_guest_addresses";

/**
 * Retrieves all saved addresses for the current user or guest, merging Firestore data & localStorage cache.
 */
export function getSavedAddresses(user: any, userData: any): Address[] {
  const map = new Map<string, Address>();

  // 1. Load from userData (Firebase AuthContext)
  if (Array.isArray(userData?.addresses)) {
    userData.addresses.forEach((a: Address) => {
      if (a && (a.id || a.houseNo || a.pin)) {
        const key = a.id || `${a.pin}_${a.houseNo}_${a.street}`;
        map.set(key, { ...a, id: a.id || key });
      }
    });
  }

  // 2. Load from user-specific localStorage cache
  if (typeof window !== "undefined") {
    try {
      const uid = user?.uid || userData?.uid;
      if (uid) {
        const cachedUserStr = localStorage.getItem(`devam_user_data_${uid}`);
        if (cachedUserStr) {
          const cachedData = JSON.parse(cachedUserStr);
          if (Array.isArray(cachedData?.addresses)) {
            cachedData.addresses.forEach((a: Address) => {
              if (a && (a.id || a.houseNo || a.pin)) {
                const key = a.id || `${a.pin}_${a.houseNo}_${a.street}`;
                if (!map.has(key)) {
                  map.set(key, { ...a, id: a.id || key });
                }
              }
            });
          }
        }
      }

      // 3. Load from global/guest addresses cache in localStorage
      const guestStr = localStorage.getItem(GUEST_KEY);
      if (guestStr) {
        const guestAddrs = JSON.parse(guestStr);
        if (Array.isArray(guestAddrs)) {
          guestAddrs.forEach((a: Address) => {
            if (a && (a.id || a.houseNo || a.pin)) {
              const key = a.id || `${a.pin}_${a.houseNo}_${a.street}`;
              if (!map.has(key)) {
                map.set(key, { ...a, id: a.id || key });
              }
            }
          });
        }
      }
    } catch (e) {
      console.warn("[addressStore] Error reading local address cache:", e);
    }
  }

  return Array.from(map.values());
}

/**
 * Saves or updates an address across React state, localStorage cache, and Firestore.
 */
export async function saveUserAddress(
  address: Partial<Address> & { name: string; phone: string; pin: string; houseNo: string; street: string; area: string; cityDistrict: string; state: string },
  user: any,
  userData: any,
  setUserData?: (updater: any) => void
): Promise<Address[]> {
  const existing = getSavedAddresses(user, userData);
  const newAddr: Address = {
    ...address,
    id: address.id || `addr_${Date.now()}`,
    type: address.type || "HOME",
  };

  // Check if updating an existing address or adding new
  const updated = [newAddr, ...existing.filter((a) => a.id !== newAddr.id)];

  // 1. Immediately update React state in AuthContext if provided
  if (setUserData) {
    setUserData((prev: any) => ({
      ...(prev || {}),
      addresses: updated,
    }));
  }

  // 2. Immediately persist to localStorage cache
  if (typeof window !== "undefined") {
    try {
      const uid = user?.uid || userData?.uid;
      if (uid) {
        const cachedUserStr = localStorage.getItem(`devam_user_data_${uid}`);
        const baseData = cachedUserStr ? JSON.parse(cachedUserStr) : {};
        baseData.addresses = updated;
        localStorage.setItem(`devam_user_data_${uid}`, JSON.stringify(baseData));
      }
      localStorage.setItem(GUEST_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn("[addressStore] Could not update localStorage address cache:", e);
    }
  }

  // 3. Persist to Firestore asynchronously if user is logged in
  const uid = user?.uid || userData?.uid;
  if (uid && db) {
    try {
      const { doc, setDoc } = await import("firebase/firestore");
      await setDoc(doc(db, "users", uid), { addresses: updated }, { merge: true });
    } catch (err) {
      console.warn("[addressStore] Firestore address update skipped:", err);
    }
  }

  return updated;
}

/**
 * Deletes an address by ID across React state, localStorage cache, and Firestore.
 */
export async function deleteUserAddress(
  addressId: string,
  user: any,
  userData: any,
  setUserData?: (updater: any) => void
): Promise<Address[]> {
  const existing = getSavedAddresses(user, userData);
  const updated = existing.filter((a) => a.id !== addressId);

  // 1. Update React state immediately
  if (setUserData) {
    setUserData((prev: any) => ({
      ...(prev || {}),
      addresses: updated,
    }));
  }

  // 2. Persist to localStorage cache
  if (typeof window !== "undefined") {
    try {
      const uid = user?.uid || userData?.uid;
      if (uid) {
        const cachedUserStr = localStorage.getItem(`devam_user_data_${uid}`);
        const baseData = cachedUserStr ? JSON.parse(cachedUserStr) : {};
        baseData.addresses = updated;
        localStorage.setItem(`devam_user_data_${uid}`, JSON.stringify(baseData));
      }
      localStorage.setItem(GUEST_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn("[addressStore] Could not update localStorage delete cache:", e);
    }
  }

  // 3. Persist to Firestore
  const uid = user?.uid || userData?.uid;
  if (uid && db) {
    try {
      const { doc, setDoc } = await import("firebase/firestore");
      await setDoc(doc(db, "users", uid), { addresses: updated }, { merge: true });
    } catch (err) {
      console.warn("[addressStore] Firestore address delete skipped:", err);
    }
  }

  return updated;
}
