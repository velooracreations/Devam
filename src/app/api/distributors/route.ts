import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { sendQueryEmail } from '@/lib/notifications';
import { verifyAdminToken } from '@/lib/adminToken';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { 
      firstName, 
      lastName, 
      businessName, 
      email, 
      phone, 
      city, 
      state, 
      productsOfInterest, 
      message,
      botField // Invisible honeypot field
    } = data;

    // 1. Honeypot Spam Bot Trap: If filled, bot submitted the form
    if (botField) {
      console.warn("Spam bot submission trapped and dropped silently:", { ip: req.headers.get("x-forwarded-for") });
      // Return 200 to trick bot into believing submission succeeded
      return NextResponse.json({ success: true, message: "Inquiry received" });
    }

    // 2. Required Fields Check
    if (!firstName?.trim() || !lastName?.trim() || !email?.trim() || !phone?.trim()) {
      return NextResponse.json({ error: "Please fill in all mandatory fields." }, { status: 400 });
    }

    // 3. Email Format Validation
    if (!EMAIL_REGEX.test(email.trim())) {
      return NextResponse.json({ error: "Please provide a valid email address (e.g. name@domain.com)." }, { status: 400 });
    }

    // 4. Phone Format Validation (at least 10 digits for Indian & International numbers)
    const cleanPhone = phone.replace(/[\s\-\(\)\+]/g, '');
    if (cleanPhone.length < 10) {
      return NextResponse.json({ error: "Please provide a valid 10-digit mobile number." }, { status: 400 });
    }

    const now = new Date().toISOString();
    const docData = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      businessName: (businessName || "Direct Contact Form").trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      city: (city || "Website Inquiry").trim(),
      state: (state || "N/A").trim(),
      productsOfInterest: productsOfInterest || "All Products",
      message: (message || "").trim(),
      createdAt: now,
    };

    const docRef = await addDoc(collection(db, 'distributorLeads'), docData);

    // Send instant Email Intimation to info@thedevam.com and thedevam2024@gmail.com
    sendQueryEmail({
      name: `${docData.firstName} ${docData.lastName}`,
      email: docData.email,
      phone: docData.phone,
      subject: `Inquiry / Distributor Lead from ${docData.city}, ${docData.state}`,
      message: `Business Name: ${docData.businessName}\nCity/State: ${docData.city}, ${docData.state}\nProducts: ${docData.productsOfInterest}\nMessage: ${docData.message || 'N/A'}`
    }).catch((err) => console.error("Query email intimation failed", err));

    // Send to CRM/Google Sheets Webhook (if present)
    const WEBHOOK_URL = process.env.CRM_WEBHOOK_URL;
    if (WEBHOOK_URL) {
      try {
        await fetch(WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(docData)
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

export async function GET(req: Request) {
  try {
    const cookieHeader = req.headers.get("cookie") || "";
    const match = cookieHeader.match(/admin_token=([^;]+)/);
    const token = match ? decodeURIComponent(match[1]) : undefined;
    const auth = await verifyAdminToken(token);

    if (!auth.valid && process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: "Unauthorized: Distributor leads access restricted to verified administrators" }, { status: 401 });
    }

    const snapshot = await getDocs(collection(db, 'distributorLeads'));
    const leads = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
    leads.sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    return NextResponse.json({ success: true, leads });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch leads" }, { status: 500 });
  }
}
