import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { sendQueryEmail } from '@/lib/notifications';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { firstName, lastName, businessName, email, phone, city, state, productsOfInterest, message } = data;

    if (!firstName || !lastName || !businessName || !email || !phone || !city || !state) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const now = new Date().toISOString();
    const docData = {
      firstName, lastName, businessName, email, phone, city, state,
      productsOfInterest: productsOfInterest || "All Products",
      message: message || "",
      createdAt: now,
    };

    const docRef = await addDoc(collection(db, 'distributorLeads'), docData);

    // Send instant Email Intimation to info@thedevam.com and thedevam2024@gmail.com
    sendQueryEmail({
      name: `${firstName} ${lastName}`,
      email,
      phone,
      subject: `Inquiry / Distributor Lead from ${city}, ${state}`,
      message: `Business Name: ${businessName}\nCity/State: ${city}, ${state}\nProducts: ${productsOfInterest}\nMessage: ${message || 'N/A'}`
    }).catch((err) => console.error("Query email intimation failed", err));

    // Send to CRM/Google Sheets Webhook (if present)
    const WEBHOOK_URL = process.env.CRM_WEBHOOK_URL;
    if (WEBHOOK_URL) {
      try {
        await fetch(WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
      } catch (webhookError) {
        console.error("Webhook failed:", webhookError);
      }
    }

    return NextResponse.json({ success: true, lead: { id: docRef.id, ...docData } });
  } catch (error: any) {
    console.error("Error creating distributor lead:", error);
    return NextResponse.json({ error: error.message || "Failed to submit lead" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const snapshot = await getDocs(collection(db, 'distributorLeads'));
    const leads = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
    leads.sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    return NextResponse.json({ success: true, leads });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch leads" }, { status: 500 });
  }
}
