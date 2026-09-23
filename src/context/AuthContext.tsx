"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, getDocs, setDoc, onSnapshot, collection, query, where } from "firebase/firestore";
import { useCartStore } from "@/store/cartStore";
import { syncLocalAddressesToCloud } from "@/lib/addressStore";

interface AuthContextType {
  user: User | null;
  userData: any | null;
  setUserData: React.Dispatch<React.SetStateAction<any | null>>;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  setUserData: () => {},
  loading: true,
  logout: async () => {},
});

export const AuthContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // Load cached user data from localStorage immediately on mount
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        const savedAuth = localStorage.getItem("devam-auth-storage");
        if (savedAuth) {
          const parsedAuth = JSON.parse(savedAuth);
          const storedUser = parsedAuth?.state?.user;
          if (storedUser?.email) {
            const cachedEmailData = localStorage.getItem(`devam_user_data_email_${storedUser.email.toLowerCase()}`);
            if (cachedEmailData) {
              setUserData(JSON.parse(cachedEmailData));
            }
          }
          if (storedUser?.uid) {
            const cachedUserData = localStorage.getItem(`devam_user_data_${storedUser.uid}`);
            if (cachedUserData) {
              setUserData((prev: any) => prev || JSON.parse(cachedUserData));
            }
          }
        }
      }
    } catch (e) {
      console.warn("Error reading initial user cache:", e);
    }
  }, []);

  useEffect(() => {
    let unsubscribeSnapshot: () => void;
    const safetyTimer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      clearTimeout(safetyTimer);
      setUser(currentUser);
      
      if (currentUser) {
        const email = (currentUser.email || "").toLowerCase();

        // Load local user data cache immediately if present
        try {
          if (email) {
            const cachedEmailData = localStorage.getItem(`devam_user_data_email_${email}`);
            if (cachedEmailData) setUserData(JSON.parse(cachedEmailData));
          }
          const cached = localStorage.getItem(`devam_user_data_${currentUser.uid}`);
          if (cached) setUserData((prev: any) => prev || JSON.parse(cached));
        } catch {}

        // Listen to Firestore by EMAIL and UID for cross-device sync (Laptop <-> Mobile)
        try {
          const userDocRef = doc(db, "users", currentUser.uid);
          const unsubs: (() => void)[] = [];

          const dedupeAddrs = (addrs: any[]) => {
            const map = new Map<string, any>();
            (addrs || []).forEach(a => {
              if (a && (a.id || a.houseNo || a.pin)) {
                const pin = (a.pin || "").trim();
                const houseNo = (a.houseNo || "").toLowerCase().trim();
                const street = (a.street || "").toLowerCase().trim();
                const sig = `${pin}_${houseNo}_${street}`;
                if (!map.has(sig)) map.set(sig, { ...a, id: a.id || `addr_${sig}` });
              }
            });
            return Array.from(map.values());
          };

          const handleSync = async () => {
            let mergedAddresses: any[] = [];
            let mergedOrders: any[] = [];
            let bestName = currentUser.displayName || "";
            let bestMobile = currentUser.phoneNumber || "";
            let baseData: any = {};

            // A. Check userDocRef (UID doc)
            try {
              const uDoc = await getDoc(userDocRef);
              if (uDoc.exists()) {
                const uData = uDoc.data();
                baseData = { ...baseData, ...uData };
                if (uData.name) bestName = uData.name;
                if (uData.mobile || uData.phone) bestMobile = uData.mobile || uData.phone;
                if (Array.isArray(uData.addresses)) mergedAddresses.push(...uData.addresses);
                if (Array.isArray(uData.orders)) mergedOrders.push(...uData.orders);
              }
            } catch {}

            // B. Check user_addresses/{email} doc
            if (email) {
              try {
                const addrDoc = await getDoc(doc(db, "user_addresses", email));
                if (addrDoc.exists() && Array.isArray(addrDoc.data()?.addresses)) {
                  mergedAddresses.push(...addrDoc.data().addresses);
                }
              } catch {}
            }

            // C. Query users collection by email
            if (email) {
              try {
                const q = query(collection(db, "users"), where("email", "==", email));
                const snap = await getDocs(q);
                snap.docs.forEach((d) => {
                  const dData = d.data();
                  baseData = { ...baseData, ...dData };
                  if (dData.name && !bestName) bestName = dData.name;
                  if ((dData.mobile || dData.phone) && !bestMobile) bestMobile = dData.mobile || dData.phone;
                  if (Array.isArray(dData.addresses)) mergedAddresses.push(...dData.addresses);
                  if (Array.isArray(dData.orders)) mergedOrders.push(...dData.orders);
                });
              } catch {}
            }

            // D. Fetch from Cloud Firestore via Server API for guaranteed cross-device sync
            try {
              const params = new URLSearchParams();
              if (email) params.set("email", email);
              if (bestMobile) params.set("phone", bestMobile.replace(/\D/g, ""));
              if (currentUser.uid) params.set("userId", currentUser.uid);

              const res = await fetch(`/api/addresses?${params.toString()}`, { cache: "no-store" });
              if (res.ok) {
                const cloudData = await res.json();
                if (cloudData.success && Array.isArray(cloudData.addresses)) {
                  mergedAddresses.push(...cloudData.addresses);
                  if (cloudData.profile?.name && !bestName) bestName = cloudData.profile.name;
                  if (cloudData.profile?.mobile && !bestMobile) bestMobile = cloudData.profile.mobile;
                }
              }
            } catch (cloudErr) {
              console.warn("[AuthContext] Cloud addresses fetch notice:", cloudErr);
            }

            const cleanAddrs = dedupeAddrs(mergedAddresses);

            const mergedUserData = {
              uid: currentUser.uid,
              email: currentUser.email,
              ...baseData,
              name: bestName || baseData.name || currentUser.displayName || "User",
              mobile: bestMobile || baseData.mobile || baseData.phone || "",
              phone: bestMobile || baseData.mobile || baseData.phone || "",
              addresses: cleanAddrs,
              orders: mergedOrders,
            };

            setUserData(mergedUserData);

            try {
              localStorage.setItem(`devam_user_data_${currentUser.uid}`, JSON.stringify(mergedUserData));
              if (email) localStorage.setItem(`devam_user_data_email_${email}`, JSON.stringify(mergedUserData));
            } catch {}

            syncLocalAddressesToCloud(currentUser, mergedUserData);

            // Cloud Cart Sync
            if (Array.isArray(baseData?.cart)) {
              const localItems = useCartStore.getState().items;
              if (JSON.stringify(baseData.cart) !== JSON.stringify(localItems)) {
                if (localItems.length > 0 && baseData.cart.length === 0) {
                  useCartStore.getState().setCart(localItems, false);
                } else {
                  useCartStore.getState().setCart(baseData.cart, true);
                }
              }
            }

            setLoading(false);
          };

          handleSync();

          // Real-time snapshot listeners for cross-device sync
          if (email) {
            const q = query(collection(db, "users"), where("email", "==", email));
            const unsubQ = onSnapshot(q, () => handleSync(), () => {});
            unsubs.push(unsubQ);
            const unsubAddr = onSnapshot(doc(db, "user_addresses", email), () => handleSync(), () => {});
            unsubs.push(unsubAddr);
          }
          const unsubUID = onSnapshot(userDocRef, () => handleSync(), () => {});
          unsubs.push(unsubUID);

          unsubscribeSnapshot = () => unsubs.forEach(fn => fn());
        } catch (error) {
          console.error("Error fetching user data:", error);
          setLoading(false);
        }
      } else {
        setUserData(null);
        if (unsubscribeSnapshot) unsubscribeSnapshot();
        setLoading(false);
      }
    }, (authError) => {
      clearTimeout(safetyTimer);
      console.error("Firebase onAuthStateChanged error:", authError);
      setLoading(false);
    });

    return () => {
      clearTimeout(safetyTimer);
      unsubscribe();
      if (unsubscribeSnapshot) unsubscribeSnapshot();
    };
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
      setUserData(null);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, userData, setUserData, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
