import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';

const COLLECTION = 'distributorLeads';

export interface IDistributorLead {
  id?: string;
  firstName: string;
  lastName: string;
  businessName: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  productsOfInterest: string;
  message?: string;
  createdAt: string;
}

const DistributorLead = {
  async create(data: Partial<IDistributorLead>) {
    const now = new Date().toISOString();
    const docData = { ...data, createdAt: now };
    const docRef = await addDoc(collection(db, COLLECTION), docData);
    return { id: docRef.id, ...docData } as IDistributorLead;
  },

  async find() {
    const snapshot = await getDocs(collection(db, COLLECTION));
    const leads = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as IDistributorLead));
    leads.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    return leads;
  }
};

export default DistributorLead;
