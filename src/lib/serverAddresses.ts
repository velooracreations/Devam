import fs from 'fs';
import path from 'path';
import { Address } from '@/lib/addressStore';
import { getServerFirestore } from '@/lib/serverFirestore';

const addressesFilePath = path.join(process.cwd(), 'scratch_data', 'user_addresses.json');

// In-memory cache for fast response times across serverless calls
interface AddressStorageData {
  byEmail: Record<string, Address[]>;
  byPhone: Record<string, Address[]>;
  byUserId: Record<string, Address[]>;
  profiles: Record<string, { name?: string; mobile?: string; email?: string }>;
}

let inMemoryData: AddressStorageData = {
  byEmail: {},
  byPhone: {},
  byUserId: {},
  profiles: {},
};

function getAddressSignature(a: Partial<Address>): string {
  const pin = (a.pin || '').trim();
  const houseNo = (a.houseNo || '').toLowerCase().trim();
  const street = (a.street || '').toLowerCase().trim();
  return `${pin}_${houseNo}_${street}`;
}

function dedupeAddresses(list: Address[]): Address[] {
  const map = new Map<string, Address>();
  (list || []).forEach((a) => {
    if (a && (a.id || a.houseNo || a.pin)) {
      const sig = getAddressSignature(a);
      if (!map.has(sig)) {
        map.set(sig, { ...a, id: a.id || `addr_${Date.now()}_${Math.random().toString(36).slice(2, 6)}` });
      }
    }
  });
  return Array.from(map.values());
}

/**
 * Read addresses and profiles from local disk backup
 */
function readDiskData(): AddressStorageData {
  try {
    if (fs.existsSync(addressesFilePath)) {
      const content = fs.readFileSync(addressesFilePath, 'utf-8');
      const parsed = JSON.parse(content);
      return {
        byEmail: parsed.byEmail || {},
        byPhone: parsed.byPhone || {},
        byUserId: parsed.byUserId || {},
        profiles: parsed.profiles || {},
      };
    }
  } catch (err) {
    console.warn('[ServerAddresses] Error reading user_addresses.json:', err);
  }
  return { byEmail: {}, byPhone: {}, byUserId: {}, profiles: {} };
}

/**
 * Write addresses and profiles to local disk backup
 */
function writeDiskData(data: AddressStorageData): void {
  try {
    const dir = path.dirname(addressesFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(addressesFilePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    // In read-only serverless environment, in-memory cache will serve
  }
}

/**
 * Retrieve saved addresses for a user by email, phone, or userId from Cloud Firestore and disk backup
 */
export async function getServerAddresses(query: {
  email?: string;
  phone?: string;
  userId?: string;
}): Promise<{ addresses: Address[]; profile: { name?: string; mobile?: string; email?: string } }> {
  const email = (query.email || '').toLowerCase().trim();
  const phone = (query.phone || '').replace(/\D/g, '');
  const userId = (query.userId || '').trim();

  const collected: Address[] = [];
  let profile = { name: '', mobile: '', email: '' };

  // 1. Check in-memory & disk cache
  const disk = readDiskData();
  if (email) {
    if (inMemoryData.byEmail[email]) collected.push(...inMemoryData.byEmail[email]);
    if (disk.byEmail[email]) collected.push(...disk.byEmail[email]);
    if (inMemoryData.profiles[email]) profile = { ...profile, ...inMemoryData.profiles[email] };
    if (disk.profiles[email]) profile = { ...profile, ...disk.profiles[email] };
  }
  if (phone) {
    if (inMemoryData.byPhone[phone]) collected.push(...inMemoryData.byPhone[phone]);
    if (disk.byPhone[phone]) collected.push(...disk.byPhone[phone]);
  }
  if (userId) {
    if (inMemoryData.byUserId[userId]) collected.push(...inMemoryData.byUserId[userId]);
    if (disk.byUserId[userId]) collected.push(...disk.byUserId[userId]);
    if (inMemoryData.profiles[userId]) profile = { ...profile, ...inMemoryData.profiles[userId] };
    if (disk.profiles[userId]) profile = { ...profile, ...disk.profiles[userId] };
  }

  // 2. Query Google Cloud Firestore
  try {
    const firestore = getServerFirestore();
    if (firestore) {
      // A. Check user_addresses/{email}
      if (email) {
        try {
          const docSnap = await firestore.collection('user_addresses').doc(email).get();
          if (docSnap.exists) {
            const data = docSnap.data();
            if (Array.isArray(data?.addresses)) collected.push(...data.addresses);
            if (data?.name && !profile.name) profile.name = data.name;
            if (data?.mobile && !profile.mobile) profile.mobile = data.mobile;
          }
        } catch (e) {
          console.warn('[ServerAddresses] Firestore error on user_addresses:', e);
        }
      }

      // B. Check users/{userId}
      if (userId) {
        try {
          const uSnap = await firestore.collection('users').doc(userId).get();
          if (uSnap.exists) {
            const data = uSnap.data();
            if (Array.isArray(data?.addresses)) collected.push(...data.addresses);
            if (data?.name && !profile.name) profile.name = data.name;
            if (data?.mobile && !profile.mobile) profile.mobile = data.mobile;
            if (data?.email && !profile.email) profile.email = data.email;
          }
        } catch (e) {
          console.warn('[ServerAddresses] Firestore error on users UID:', e);
        }
      }

      // C. Check phone_addresses/{phone}
      if (phone && phone.length >= 10) {
        try {
          const pSnap = await firestore.collection('phone_addresses').doc(phone.slice(-10)).get();
          if (pSnap.exists) {
            const data = pSnap.data();
            if (Array.isArray(data?.addresses)) collected.push(...data.addresses);
            if (data?.name && !profile.name) profile.name = data.name;
          }
        } catch (e) {
          console.warn('[ServerAddresses] Firestore error on phone_addresses:', e);
        }
      }

      // D. Query users collection by email if not found
      if (email && collected.length === 0) {
        try {
          const userQuery = await firestore.collection('users').where('email', '==', email).limit(5).get();
          userQuery.forEach((doc) => {
            const dData = doc.data();
            if (Array.isArray(dData?.addresses)) collected.push(...dData.addresses);
            if (dData?.name && !profile.name) profile.name = dData.name;
            if (dData?.mobile && !profile.mobile) profile.mobile = dData.mobile;
          });
        } catch (e) {
          console.warn('[ServerAddresses] Firestore query error by email:', e);
        }
      }

      // E. Query users collection by phone
      if (phone && phone.length >= 10 && collected.length === 0) {
        try {
          const phoneQuery = await firestore.collection('users').where('mobile', '==', phone.slice(-10)).limit(5).get();
          phoneQuery.forEach((doc) => {
            const dData = doc.data();
            if (Array.isArray(dData?.addresses)) collected.push(...dData.addresses);
            if (dData?.name && !profile.name) profile.name = dData.name;
          });
        } catch (e) {
          console.warn('[ServerAddresses] Firestore query error by phone:', e);
        }
      }
    }
  } catch (err) {
    console.warn('[ServerAddresses] Cloud Firestore fetch error:', err);
  }

  const finalAddresses = dedupeAddresses(collected);

  return {
    addresses: finalAddresses,
    profile,
  };
}

/**
 * Save or update user addresses in Cloud Firestore and disk backup
 */
export async function saveServerAddress(params: {
  address?: Address;
  addresses?: Address[];
  profile?: { name?: string; mobile?: string; email?: string };
  userId?: string;
  email?: string;
  phone?: string;
}): Promise<{ success: boolean; addresses: Address[]; profile: any }> {
  const email = (params.email || '').toLowerCase().trim();
  const phone = (params.phone || params.profile?.mobile || '').replace(/\D/g, '');
  const userId = (params.userId || '').trim();

  // Load existing addresses for this user
  const existingResult = await getServerAddresses({ email, phone, userId });
  let addressList = [...existingResult.addresses];

  if (Array.isArray(params.addresses) && params.addresses.length > 0) {
    // Merging provided full list
    addressList = dedupeAddresses([...params.addresses, ...addressList]);
  } else if (params.address) {
    // Single address add / update
    const newSig = getAddressSignature(params.address);
    addressList = [
      params.address,
      ...addressList.filter((a) => a.id !== params.address!.id && getAddressSignature(a) !== newSig),
    ];
  }

  addressList = dedupeAddresses(addressList);

  const updatedProfile = {
    ...existingResult.profile,
    ...(params.profile || {}),
    email: email || existingResult.profile.email,
    mobile: phone || existingResult.profile.mobile,
  };

  // 1. Update in-memory & disk backup
  const disk = readDiskData();
  if (email) {
    inMemoryData.byEmail[email] = addressList;
    disk.byEmail[email] = addressList;
    inMemoryData.profiles[email] = updatedProfile;
    disk.profiles[email] = updatedProfile;
  }
  if (phone) {
    inMemoryData.byPhone[phone] = addressList;
    disk.byPhone[phone] = addressList;
  }
  if (userId) {
    inMemoryData.byUserId[userId] = addressList;
    disk.byUserId[userId] = addressList;
    inMemoryData.profiles[userId] = updatedProfile;
    disk.profiles[userId] = updatedProfile;
  }
  writeDiskData(disk);

  // 2. Persist to Cloud Firestore
  try {
    const firestore = getServerFirestore();
    if (firestore) {
      const now = new Date().toISOString();
      const payload = {
        addresses: addressList,
        lastUpdated: now,
        ...updatedProfile,
      };

      if (email) {
        await firestore.collection('user_addresses').doc(email).set(
          { ...payload, email },
          { merge: true }
        );
      }

      if (phone && phone.length >= 10) {
        await firestore.collection('phone_addresses').doc(phone.slice(-10)).set(
          { ...payload, mobile: phone.slice(-10) },
          { merge: true }
        );
      }

      if (userId) {
        await firestore.collection('users').doc(userId).set(
          payload,
          { merge: true }
        );
      }

      console.log(`[ServerAddresses] Synced ${addressList.length} addresses to Cloud Firestore for user (email: ${email || 'none'}, phone: ${phone || 'none'}).`);
    }
  } catch (err) {
    console.error('[ServerAddresses] Failed to write to Cloud Firestore:', err);
  }

  return {
    success: true,
    addresses: addressList,
    profile: updatedProfile,
  };
}

/**
 * Delete a saved address by ID
 */
export async function deleteServerAddress(params: {
  addressId: string;
  userId?: string;
  email?: string;
  phone?: string;
}): Promise<{ success: boolean; addresses: Address[] }> {
  const email = (params.email || '').toLowerCase().trim();
  const phone = (params.phone || '').replace(/\D/g, '');
  const userId = (params.userId || '').trim();

  const existing = await getServerAddresses({ email, phone, userId });
  const updatedAddresses = existing.addresses.filter((a) => a.id !== params.addressId);

  await saveServerAddress({
    addresses: updatedAddresses,
    userId,
    email,
    phone,
  });

  return {
    success: true,
    addresses: updatedAddresses,
  };
}
