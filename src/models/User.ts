// User model - Users are managed via Firebase Auth + Firestore 'users' collection
// The AuthContext.tsx handles user creation in Firestore on sign-in
// This file provides types for reference

export interface IUser {
  uid: string;
  name: string;
  email: string;
  role: 'SUPER_ADMIN' | 'INVENTORY_MANAGER' | 'SALES_MANAGER' | 'CUSTOMER' | 'customer';
  createdAt: string;
}
