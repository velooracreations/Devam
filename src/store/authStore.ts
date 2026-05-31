import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  logout: () => Promise<void>;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: true,
      setUser: (user) => set({ user, isLoading: false }),
      logout: async () => {
        try {
          await firebaseSignOut(auth);
          set({ user: null });
        } catch (error) {
          console.error("Logout failed", error);
        }
      },
      initialize: () => {
        let timeoutId: NodeJS.Timeout;
        try {
          timeoutId = setTimeout(() => {
            if (get().isLoading) {
              console.warn("Firebase Auth Init Timeout");
              set({ user: null, isLoading: false });
            }
          }, 3000);

          const unsubscribe = onAuthStateChanged(auth, (user) => {
            clearTimeout(timeoutId);
            set({ user, isLoading: false });
          }, (error) => {
            clearTimeout(timeoutId);
            console.error("Firebase Auth Init Error:", error);
            set({ user: null, isLoading: false });
          });
          return () => {
            clearTimeout(timeoutId);
            unsubscribe();
          };
        } catch (error) {
          console.error("Firebase Auth Sync Error:", error);
          set({ user: null, isLoading: false });
          return () => {};
        }
      }
    }),
    {
      name: 'devam-auth-storage',
      // Only serialize non-functional/non-circular user details for localStorage
      partialize: (state) => ({
        user: state.user ? {
          uid: state.user.uid,
          email: state.user.email,
          displayName: state.user.displayName,
          photoURL: state.user.photoURL,
        } : null
      } as AuthState)
    }
  )
);
