"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import { useCartStore } from "@/store/cartStore";

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
          if (storedUser?.uid) {
            const cachedUserData = localStorage.getItem(`devam_user_data_${storedUser.uid}`);
            if (cachedUserData) {
              setUserData(JSON.parse(cachedUserData));
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
        // Load local user data cache immediately if present
        try {
          const cached = localStorage.getItem(`devam_user_data_${currentUser.uid}`);
          if (cached) {
            setUserData(JSON.parse(cached));
          }
        } catch {}

        // Listen to Firestore for real-time updates
        try {
          const userDocRef = doc(db, "users", currentUser.uid);
          
          unsubscribeSnapshot = onSnapshot(userDocRef, async (userDoc) => {
            if (userDoc.exists()) {
              const data = userDoc.data();
              setUserData(data);

              try {
                localStorage.setItem(`devam_user_data_${currentUser.uid}`, JSON.stringify(data));
              } catch {}

              // Cross-Device Real-Time Cloud Cart Sync
              if (Array.isArray(data?.cart)) {
                const localItems = useCartStore.getState().items;
                const isDifferent = JSON.stringify(data.cart) !== JSON.stringify(localItems);
                if (isDifferent) {
                  if (localItems.length > 0 && data.cart.length === 0) {
                    useCartStore.getState().setCart(localItems, false);
                  } else {
                    useCartStore.getState().setCart(data.cart, true);
                  }
                }
              } else if (useCartStore.getState().items.length > 0) {
                useCartStore.getState().setCart(useCartStore.getState().items, false);
              }
            } else {
              // If doc doesn't exist (e.g. Google Sign-In), create one
              const newUserData = {
                uid: currentUser.uid,
                email: currentUser.email,
                name: currentUser.displayName || "User",
                role: "customer",
                cart: useCartStore.getState().items || [],
                createdAt: new Date().toISOString()
              };
              await setDoc(userDocRef, newUserData, { merge: true });
              setUserData(newUserData);
              try {
                localStorage.setItem(`devam_user_data_${currentUser.uid}`, JSON.stringify(newUserData));
              } catch {}
            }
            setLoading(false);
          }, (err) => {
            console.error("Firestore user snapshot error:", err);
            setLoading(false);
          });
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
