import { db } from './firebase';

/**
 * Get Firestore instance for server-side API routes & models.
 * Uses client SDK instance initialized in firebase.ts.
 */
export default function dbConnect() {
  return db;
}
