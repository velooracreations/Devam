"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";

interface AuthContextType {
  user: User | null;
  userData: any | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  loading: true,
  logout: async () => {},
});

export const AuthContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeSnapshot: () => void;
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        // Listen to Firestore for real-time updates
        try {
          const userDocRef = doc(db, "users", currentUser.uid);
          
          unsubscribeSnapshot = onSnapshot(userDocRef, async (userDoc) => {
            if (userDoc.exists()) {
              setUserData(userDoc.data());
            } else {
              // If doc doesn't exist (e.g. Google Sign-In), create one
              const newUserData = {
                uid: currentUser.uid,
                email: currentUser.email,
                name: currentUser.displayName || "User",
                role: "customer",
                createdAt: new Date().toISOString()
              };
              await setDoc(userDocRef, newUserData, { merge: true });
              setUserData(newUserData);
            }
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
    });

    return () => {
      unsubscribe();
      if (unsubscribeSnapshot) unsubscribeSnapshot();
    };
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, userData, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
