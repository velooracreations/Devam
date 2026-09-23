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

export function getAddressSignature(a: Partial<Address>): string {
  const pin = (a.pin || "").trim();
  const houseNo = (a.houseNo || "").toLowerCase().trim();
  const street = (a.street || "").toLowerCase().trim();
  return `${pin}_${houseNo}_${street}`;
}

export function dedupeAddressesList(list: Address[]): Address[] {
  const map = new Map<string, Address>();
  (list || []).forEach((a) => {
    if (a && (a.id || a.houseNo || a.pin)) {
      const sig = getAddressSignature(a);
      if (!map.has(sig)) {
        map.set(sig, { ...a, id: a.id || `addr_${sig}` });
      }
    }
  });
  return Array.from(map.values());
}

/**
 * Retrieves all saved addresses for the current user or guest, merging Firestore data & localStorage cache.
 */
export function getSavedAddresses(user: any, userData: any): Address[] {
  const map = new Map<string, Address>();

  const processAddress = (a: Address) => {
    if (a && (a.id || a.houseNo || a.pin)) {
      const sig = getAddressSignature(a);
      if (!map.has(sig)) {
        map.set(sig, { ...a, id: a.id || `addr_${sig}` });
      }
    }
  };

  // 1. Load from userData (Firebase AuthContext)
  if (Array.isArray(userData?.addresses)) {
    userData.addresses.forEach(processAddress);
  }

  // 2. Load from user-specific & email-specific localStorage cache
  if (typeof window !== "undefined") {
    try {
      const uid = user?.uid || userData?.uid || (typeof localStorage !== "undefined" ? localStorage.getItem("devam_user_uid") : null);
      const email = user?.email || userData?.email || (typeof localStorage !== "undefined" ? localStorage.getItem("devam_user_email") : null);

      if (email) {
        const emailCachedStr = localStorage.getItem(`devam_user_data_email_${email.toLowerCase()}`);
        if (emailCachedStr) {
          const emailData = JSON.parse(emailCachedStr);
          if (Array.isArray(emailData?.addresses)) {
            emailData.addresses.forEach(processAddress);
          }
        }
      }

      if (uid) {
        const cachedUserStr = localStorage.getItem(`devam_user_data_${uid}`);
        if (cachedUserStr) {
          const cachedData = JSON.parse(cachedUserStr);
          if (Array.isArray(cachedData?.addresses)) {
            cachedData.addresses.forEach(processAddress);
          }
        }
      }

      // 3. Load from global/guest addresses cache in localStorage
      const guestStr = localStorage.getItem(GUEST_KEY);
      if (guestStr) {
        const guestAddrs = JSON.parse(guestStr);
        if (Array.isArray(guestAddrs)) {
          guestAddrs.forEach(processAddress);
        }
      }
    } catch (e) {
      console.warn("[addressStore] Error reading local address cache:", e);
    }
  }

  return Array.from(map.values());
}

/**
 * Fetch addresses from Cloud Firestore via server API for cross-device synchronization
 */
export async function fetchServerAddresses(
  user?: any,
  userData?: any,
  phoneOverride?: string
): Promise<Address[]> {
  if (typeof window === "undefined") return [];

  try {
    const uid = user?.uid || userData?.uid || localStorage.getItem("devam_user_uid") || "";
    const email = user?.email || userData?.email || localStorage.getItem("devam_user_email") || "";
    const phone = (phoneOverride || userData?.mobile || userData?.phone || "").replace(/\D/g, "");

    if (!uid && !email && !phone) {
      return getSavedAddresses(user, userData);
    }

    const params = new URLSearchParams();
    if (email) params.set("email", email);
    if (phone) params.set("phone", phone);
    if (uid) params.set("userId", uid);

    const res = await fetch(`/api/addresses?${params.toString()}`, { cache: "no-store" });
    if (!res.ok) return getSavedAddresses(user, userData);

    const data = await res.json();
    if (data.success && Array.isArray(data.addresses)) {
      const serverAddrs: Address[] = data.addresses;
      const localAddrs = getSavedAddresses(user, userData);
      const merged = dedupeAddressesList([...serverAddrs, ...localAddrs]);

      // Cache to localStorage
      try {
        if (uid) {
          const uStr = localStorage.getItem(`devam_user_data_${uid}`);
          const uBase = uStr ? JSON.parse(uStr) : {};
          uBase.addresses = merged;
          localStorage.setItem(`devam_user_data_${uid}`, JSON.stringify(uBase));
        }
        if (email) {
          const eStr = localStorage.getItem(`devam_user_data_email_${email.toLowerCase()}`);
          const eBase = eStr ? JSON.parse(eStr) : {};
          eBase.addresses = merged;
          localStorage.setItem(`devam_user_data_email_${email.toLowerCase()}`, JSON.stringify(eBase));
        }
        localStorage.setItem(GUEST_KEY, JSON.stringify(merged));
      } catch {}

      return merged;
    }
  } catch (err) {
    console.warn("[addressStore] fetchServerAddresses error:", err);
  }

  return getSavedAddresses(user, userData);
}

/**
 * Saves or updates an address across React state, localStorage cache, and Cloud Firestore.
 */
export async function saveUserAddress(
  address: Partial<Address> & { name: string; phone: string; pin: string; houseNo: string; street: string; area: string; cityDistrict: string; state: string },
  user: any,
  userData: any,
  setUserData?: (updater: any) => void
): Promise<Address[]> {
  const existing = getSavedAddresses(user, userData);
  const newSig = getAddressSignature(address);
  const newAddr: Address = {
    ...address,
    id: address.id || `addr_${Date.now()}`,
    type: address.type || "HOME",
  };

  // Filter out any existing address with the same ID OR same content signature
  const updated = [newAddr, ...existing.filter((a) => a.id !== newAddr.id && getAddressSignature(a) !== newSig)];

  // 1. Immediately update React state in AuthContext if provided
  if (setUserData) {
    setUserData((prev: any) => ({
      ...(prev || {}),
      addresses: updated,
    }));
  }

  const uid = user?.uid || userData?.uid || (typeof localStorage !== "undefined" ? localStorage.getItem("devam_user_uid") : null) || "";
  const email = (user?.email || userData?.email || (typeof localStorage !== "undefined" ? localStorage.getItem("devam_user_email") : null) || "").toLowerCase().trim();
  const phone = (address?.phone || userData?.mobile || userData?.phone || "").replace(/\D/g, "");

  // 2. Immediately persist to localStorage cache (both UID and Email)
  if (typeof window !== "undefined") {
    try {
      if (uid) {
        const cachedUserStr = localStorage.getItem(`devam_user_data_${uid}`);
        const baseData = cachedUserStr ? JSON.parse(cachedUserStr) : {};
        baseData.addresses = updated;
        localStorage.setItem(`devam_user_data_${uid}`, JSON.stringify(baseData));
      }

      if (email) {
        const emailCachedStr = localStorage.getItem(`devam_user_data_email_${email.toLowerCase()}`);
        const emailBase = emailCachedStr ? JSON.parse(emailCachedStr) : {};
        emailBase.addresses = updated;
        localStorage.setItem(`devam_user_data_email_${email.toLowerCase()}`, JSON.stringify(emailBase));
      }

      localStorage.setItem(GUEST_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn("[addressStore] Could not update localStorage address cache:", e);
    }
  }

  // 3. Centralized Cloud Firestore Persistence via Server API (works across all browsers and devices)
  try {
    await fetch("/api/addresses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        address: newAddr,
        addresses: updated,
        userId: uid,
        email: email,
        phone: phone,
      }),
    });
    console.log(`[addressStore] Successfully saved address #${newAddr.id} to Cloud Firestore.`);
  } catch (err) {
    console.warn("[addressStore] Cloud API address update skipped:", err);
  }

  // 4. Client-side Firestore best-effort fallback
  if (db) {
    try {
      const { doc, setDoc } = await import("firebase/firestore");
      const now = new Date().toISOString();
      const payload = { addresses: updated, lastUpdated: now };

      if (uid) {
        await setDoc(doc(db, "users", uid), { ...payload, email: email || undefined, mobile: phone || undefined }, { merge: true });
      }
      if (email) {
        await setDoc(doc(db, "user_addresses", email), { ...payload, email }, { merge: true });
      }
    } catch (err) {
      // Expected if client rules block
    }
  }

  return updated;
}

/**
 * Deletes an address by ID across React state, localStorage cache, and Cloud Firestore.
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

  const uid = user?.uid || userData?.uid || (typeof localStorage !== "undefined" ? localStorage.getItem("devam_user_uid") : null) || "";
  const email = (user?.email || userData?.email || (typeof localStorage !== "undefined" ? localStorage.getItem("devam_user_email") : null) || "").toLowerCase().trim();
  const phone = (userData?.mobile || userData?.phone || "").replace(/\D/g, "");

  // 2. Persist to localStorage cache
  if (typeof window !== "undefined") {
    try {
      if (uid) {
        const cachedUserStr = localStorage.getItem(`devam_user_data_${uid}`);
        const baseData = cachedUserStr ? JSON.parse(cachedUserStr) : {};
        baseData.addresses = updated;
        localStorage.setItem(`devam_user_data_${uid}`, JSON.stringify(baseData));
      }

      if (email) {
        const emailCachedStr = localStorage.getItem(`devam_user_data_email_${email.toLowerCase()}`);
        const emailBase = emailCachedStr ? JSON.parse(emailCachedStr) : {};
        emailBase.addresses = updated;
        localStorage.setItem(`devam_user_data_email_${email.toLowerCase()}`, JSON.stringify(emailBase));
      }

      localStorage.setItem(GUEST_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn("[addressStore] Could not update local cache on delete:", e);
    }
  }

  // 3. Centralized Cloud Firestore Delete via Server API
  try {
    await fetch("/api/addresses", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        addressId,
        userId: uid,
        email: email,
        phone: phone,
      }),
    });
    console.log(`[addressStore] Deleted address #${addressId} from Cloud Firestore.`);
  } catch (err) {
    console.warn("[addressStore] Cloud API address delete error:", err);
  }

  return updated;
}

/**
 * Updates user profile (name & mobile) across React state, localStorage cache, and Cloud Firestore.
 */
export async function saveUserProfile(
  profileData: { name?: string; mobile?: string; phone?: string },
  user: any,
  userData: any,
  setUserData?: (updater: any) => void
) {
  const email = (user?.email || userData?.email || (typeof localStorage !== "undefined" ? localStorage.getItem("devam_user_email") : null) || "").toLowerCase().trim();
  const uid = user?.uid || userData?.uid || (typeof localStorage !== "undefined" ? localStorage.getItem("devam_user_uid") : null) || "";

  const nameVal = profileData.name || userData?.name || user?.displayName || "";
  const phoneVal = profileData.mobile || profileData.phone || userData?.mobile || userData?.phone || "";

  const updatedProfile = {
    ...(userData || {}),
    name: nameVal,
    mobile: phoneVal,
    phone: phoneVal,
    email: email || userData?.email || user?.email || "",
  };

  // 1. Immediately update React state in AuthContext if provided
  if (setUserData) {
    setUserData(updatedProfile);
  }

  // 2. Immediately persist to localStorage cache
  if (typeof window !== "undefined") {
    try {
      if (uid) {
        localStorage.setItem(`devam_user_data_${uid}`, JSON.stringify(updatedProfile));
      }
      if (email) {
        localStorage.setItem(`devam_user_data_email_${email}`, JSON.stringify(updatedProfile));
      }
    } catch (e) {
      console.warn("[addressStore] Could not update local profile cache:", e);
    }
  }

  // 3. Persist to Cloud Firestore via Server API
  try {
    await fetch("/api/addresses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        profile: { name: nameVal, mobile: phoneVal, email },
        userId: uid,
        email: email,
        phone: phoneVal,
      }),
    });
    console.log(`[addressStore] Synced profile to Cloud Firestore for ${email || uid}`);
  } catch (err) {
    console.warn("[addressStore] Cloud API profile update skipped:", err);
  }

  return updatedProfile;
}

/**
 * Automatically backfill any addresses sitting in this device's browser localStorage to Cloud Firestore
 * so they become available immediately on all other devices (Laptop <-> Mobile)
 */
export async function syncLocalAddressesToCloud(user?: any, userData?: any) {
  if (typeof window === "undefined") return;

  try {
    const localAddrs = getSavedAddresses(user, userData);
    if (!localAddrs || localAddrs.length === 0) return;

    const uid = user?.uid || userData?.uid || localStorage.getItem("devam_user_uid") || "";
    const email = user?.email || userData?.email || localStorage.getItem("devam_user_email") || "";
    const phone = (userData?.mobile || userData?.phone || (localAddrs[0]?.phone || "")).replace(/\D/g, "");

    if (!uid && !email && !phone) return;

    await fetch("/api/addresses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        addresses: localAddrs,
        userId: uid,
        email: email,
        phone: phone,
      }),
    });
    console.log(`[addressStore] Auto-backfilled ${localAddrs.length} addresses to Cloud Firestore.`);
  } catch (err) {
    console.warn("[addressStore] Auto-backfill notice:", err);
  }
}
