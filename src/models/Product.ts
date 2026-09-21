import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, doc, updateDoc, writeBatch } from 'firebase/firestore';

const COLLECTION = 'products';

export interface IProduct {
  id?: string;
  name: string;
  category: string;
  sku: string;
  barcode: string;
  mrp: number;
  sellingPrice: number;
  weight?: string;
  image?: string;
  productCode?: string;
  stockQuantity: number;
  createdAt: string;
  updatedAt: string;
}

const Product = {
  async find(filter?: Record<string, any>) {
    const snapshot = await getDocs(collection(db, COLLECTION));
    let items = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as IProduct));
    if (filter && Object.keys(filter).length > 0) {
      items = items.filter((item: any) => {
        return Object.entries(filter).every(([k, v]) => item[k] === v);
      });
    }
    items.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    return items;
  },

  async findOne(filter: Record<string, any>) {
    const items = await this.find(filter);
    return items[0] || null;
  },

  async create(data: Partial<IProduct>) {
    const now = new Date().toISOString();
    const docData = {
      ...data,
      stockQuantity: data.stockQuantity ?? 100,
      createdAt: now,
      updatedAt: now,
    };
    const docRef = await addDoc(collection(db, COLLECTION), docData);
    return { id: docRef.id, ...docData } as IProduct;
  },

  async insertMany(items: Partial<IProduct>[]) {
    const batch = writeBatch(db);
    const now = new Date().toISOString();
    const results: IProduct[] = [];

    for (const item of items) {
      const docRef = doc(collection(db, COLLECTION));
      const docData = {
        ...item,
        stockQuantity: item.stockQuantity ?? 100,
        createdAt: now,
        updatedAt: now,
      };
      batch.set(docRef, docData);
      results.push({ id: docRef.id, ...docData } as IProduct);
    }

    await batch.commit();
    return results;
  },

  async deleteMany(filter?: Record<string, any>) {
    const snapshot = await getDocs(collection(db, COLLECTION));
    const batch = writeBatch(db);
    snapshot.docs.forEach((docSnap) => batch.delete(docSnap.ref));
    await batch.commit();
    return { deletedCount: snapshot.size };
  },

  async updateById(id: string, data: Partial<IProduct>) {
    const docRef = doc(db, COLLECTION, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: new Date().toISOString(),
    });
  }
};

export default Product;
