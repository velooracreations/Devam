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

function getAddressSignature(a: Partial<Address>): string {
  const pin = (a.pin || "").trim();
  const houseNo = (a.houseNo || "").toLowerCase().trim();
  const street = (a.street || "").toLowerCase().trim();
  return `${pin}_${houseNo}_${street}`;
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
      const uid = user?.uid || userData?.uid;
      const email = user?.email || userData?.email;

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
 * Saves or updates an address across React state, localStorage cache, and Firestore (synced by Email & UID).
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

  // 2. Immediately persist to localStorage cache (both UID and Email)
  if (typeof window !== "undefined") {
    try {
      const uid = user?.uid || userData?.uid;
      const email = user?.email || userData?.email;

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

  // 3. Persist to Firestore by UID, Email, and Phone for guaranteed cross-device sync
  const uid = user?.uid || userData?.uid;
  const email = (user?.email || userData?.email || address?.phone ? "" : "").toLowerCase().trim() || (user?.email || userData?.email || "").toLowerCase().trim();
  const phone = (address?.phone || userData?.mobile || userData?.phone || user?.phoneNumber || "").replace(/\D/g, "");

  if (db) {
    try {
      const { doc, setDoc, collection, query, where, getDocs } = await import("firebase/firestore");
      const now = new Date().toISOString();
      const payload = { addresses: updated, lastUpdated: now };

      if (uid) {
        await setDoc(doc(db, "users", uid), { ...payload, email: email || undefined, mobile: phone || undefined }, { merge: true });
      }

      if (email) {
        await setDoc(doc(db, "user_addresses", email), { ...payload, email }, { merge: true });
        const qEmail = query(collection(db, "users"), where("email", "==", email));
        const snapEmail = await getDocs(qEmail);
        snapEmail.forEach(async (dSnap) => {
          await setDoc(doc(db, "users", dSnap.id), payload, { merge: true });
        });
      }

      if (phone && phone.length === 10) {
        await setDoc(doc(db, "phone_addresses", phone), { ...payload, mobile: phone }, { merge: true });
        const qPhone = query(collection(db, "users"), where("mobile", "==", phone));
        const snapPhone = await getDocs(qPhone);
        snapPhone.forEach(async (dSnap) => {
          await setDoc(doc(db, "users", dSnap.id), payload, { merge: true });
        });
      }
    } catch (err) {
      console.warn("[addressStore] Firestore address update skipped:", err);
    }
  }

  return updated;
}

/**
 * Deletes an address by ID across React state, localStorage cache, and Firestore (synced by Email & UID).
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
      const email = user?.email || userData?.email;

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
      console.warn("[addressStore] Could not update localStorage delete cache:", e);
    }
  }

  // 3. Persist to Firestore by UID, Email & Phone
  const uid = user?.uid || userData?.uid;
  const email = (user?.email || userData?.email || "").toLowerCase().trim();
  const phone = (userData?.mobile || userData?.phone || user?.phoneNumber || "").replace(/\D/g, "");

  if (db) {
    try {
      const { doc, setDoc, collection, query, where, getDocs } = await import("firebase/firestore");
      const payload = { addresses: updated, lastUpdated: new Date().toISOString() };

      if (uid) {
        await setDoc(doc(db, "users", uid), payload, { merge: true });
      }

      if (email) {
        await setDoc(doc(db, "user_addresses", email), payload, { merge: true });
        const q = query(collection(db, "users"), where("email", "==", email));
        const snap = await getDocs(q);
        snap.forEach(async (dSnap) => {
          await setDoc(doc(db, "users", dSnap.id), payload, { merge: true });
        });
      }

      if (phone && phone.length === 10) {
        await setDoc(doc(db, "phone_addresses", phone), payload, { merge: true });
      }
    } catch (err) {
      console.warn("[addressStore] Firestore address delete skipped:", err);
    }
  }

  return updated;
}

/**
 * Updates user profile (name & mobile) across React state, localStorage cache, and Firestore (synced by Email & UID).
 */
export async function saveUserProfile(
  profileData: { name?: string; mobile?: string; phone?: string },
  user: any,
  userData: any,
  setUserData?: (updater: any) => void
) {
  const email = (user?.email || userData?.email || "").toLowerCase();
  const uid = user?.uid || userData?.uid;

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

  // 2. Immediately persist to localStorage cache (both UID and Email)
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

  // 3. Persist to Firestore by UID & Email for cross-device sync
  if (db) {
    try {
      const { doc, setDoc, collection, query, where, getDocs } = await import("firebase/firestore");
      if (uid) {
        await setDoc(doc(db, "users", uid), updatedProfile, { merge: true });
      }
      if (email) {
        const q = query(collection(db, "users"), where("email", "==", email));
        const snap = await getDocs(q);
        snap.forEach(async (dSnap) => {
          await setDoc(doc(db, "users", dSnap.id), updatedProfile, { merge: true });
        });
      }
    } catch (err) {
      console.warn("[addressStore] Firestore profile update skipped:", err);
    }
  }

  return updatedProfile;
}
