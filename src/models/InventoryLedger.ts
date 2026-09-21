import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';

const COLLECTION = 'inventoryLedger';

export interface IInventoryLedger {
  id?: string;
  product: string;
  barcode: string;
  transactionType: string;
  quantity: number;
  openingStock: number;
  closingStock: number;
  remarks: string;
  createdAt: string;
}

const InventoryLedger = {
  async create(data: Partial<IInventoryLedger>) {
    const now = new Date().toISOString();
    const docData = { ...data, createdAt: now };
    const docRef = await addDoc(collection(db, COLLECTION), docData);
    return { id: docRef.id, ...docData } as IInventoryLedger;
  },

  async find() {
    const snapshot = await getDocs(collection(db, COLLECTION));
    const items = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as IInventoryLedger));
    items.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    return items;
  }
};

export default InventoryLedger;
