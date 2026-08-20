import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import DistributorLead from '@/lib/models/DistributorLead';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { firstName, lastName, businessName, email, phone, city, state, productsOfInterest, message } = data;

    // Validate required fields
    if (!firstName || !lastName || !businessName || !email || !phone || !city || !state) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1. Connect and save to MongoDB
    await dbConnect();
    const newLead = await DistributorLead.create({
      firstName,
      lastName,
      businessName,
      email,
      phone,
      city,
      state,
      productsOfInterest: productsOfInterest || "All Products",
      message
    });

    // 2. Send Email via Nodemailer (if SMTP vars are present)
    const SMTP_HOST = process.env.SMTP_HOST;
    const SMTP_PORT = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587;
    const SMTP_USER = process.env.SMTP_USER;
    const SMTP_PASS = process.env.SMTP_PASS;

    if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
      const transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: SMTP_PORT,
        secure: SMTP_PORT === 465,
        auth: {
          user: SMTP_USER,
          pass: SMTP_PASS,
        },
      });

      const mailOptions = {
        from: `"Devam Foods B2B" <${SMTP_USER}>`,
        to: process.env.NOTIFICATION_EMAIL || "info@thedevam.com",
        subject: `New Distributor Lead: ${businessName}`,
        text: `New Distributor Application Received:
        Name: ${firstName} ${lastName}
        Business: ${businessName}
        Email: ${email}
        Phone: ${phone}
        Location: ${city}, ${state}
        Products: ${productsOfInterest}
        Message: ${message || "N/A"}
        `
      };

      try {
        await transporter.sendMail(mailOptions);
      } catch (emailError) {
        console.error("Email sending failed:", emailError);
        // Continue even if email fails
      }
    }

    // 3. Send to CRM/Google Sheets Webhook (if present)
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
        // Continue even if webhook fails
      }
    }

    return NextResponse.json({ success: true, lead: newLead });
  } catch (error: any) {
    console.error("Error creating distributor lead:", error);
    return NextResponse.json({ error: error.message || "Failed to submit lead" }, { status: 500 });
  }
}

export async function GET() {
  try {
    await dbConnect();
    const leads = await DistributorLead.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, leads });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch leads" }, { status: 500 });
  }
}
