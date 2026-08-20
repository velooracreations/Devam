import nodemailer from 'nodemailer';

interface NotificationPayload {
  orderId: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  totalAmount: number;
  items: Array<{ name: string; quantity: number; price: number; weight?: string }>;
  status: 'Order Placed' | 'Confirmed' | 'Shipped' | 'Delivered';
  shippingAddress?: string;
  trackingNumber?: string;
  courierPartner?: string;
}

// 1. Send Email Notification via Nodemailer
export async function sendOrderEmail(payload: NotificationPayload) {
  const SMTP_HOST = process.env.SMTP_HOST;
  const SMTP_PORT = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587;
  const SMTP_USER = process.env.SMTP_USER;
  const SMTP_PASS = process.env.SMTP_PASS;

  const recipientEmail = payload.customerEmail || process.env.NOTIFICATION_EMAIL || "info@thedevam.com";
  const businessEmail = process.env.NOTIFICATION_EMAIL || "info@thedevam.com";

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.warn("SMTP settings not configured. Email notification skipped for order:", payload.orderId);
    return { success: false, reason: "SMTP credentials missing in environment variables" };
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });

  const itemsHtml = payload.items
    .map(
      (item) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee; font-size: 14px; color: #333;">
        <strong>${item.name}</strong> ${item.weight ? `(${item.weight})` : ''}
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; font-size: 14px; color: #555; text-align: center;">
        ${item.quantity}
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; font-size: 14px; color: #333; text-align: right; font-weight: bold;">
        ₹${(item.price * item.quantity).toLocaleString('en-IN')}
      </td>
    </tr>`
    )
    .join('');

  let subject = '';
  let contentBodyHtml = '';

  if (payload.status === 'Order Placed' || payload.status === 'Confirmed') {
    subject = `🎉 Order Confirmed! #${payload.orderId} - Devam Foods`;
    contentBodyHtml = `
      <div style="background-color: #0A883A; color: white; padding: 15px 20px; border-radius: 8px; font-weight: bold; margin-bottom: 20px;">
        ✓ Your order has been placed successfully and is being prepared with care!
      </div>
      <p style="font-size: 15px; color: #444; line-height: 1.6;">
        Dear <strong>${payload.customerName}</strong>,<br/>
        Thank you for shopping with <strong>Devam Foods</strong>! We are slow-grinding and preparing your 100% pure Chakki Atta and fresh spices.
      </p>
    `;
  } else if (payload.status === 'Shipped') {
    subject = `🚚 Your Order #${payload.orderId} Has Been Shipped! - Devam Foods`;
    contentBodyHtml = `
      <div style="background-color: #ED1F29; color: white; padding: 15px 20px; border-radius: 8px; font-weight: bold; margin-bottom: 20px;">
        🚚 Great news! Your parcel is on its way to your doorstep.
      </div>
      <p style="font-size: 15px; color: #444; line-height: 1.6;">
        Dear <strong>${payload.customerName}</strong>,<br/>
        Your order <strong>#${payload.orderId}</strong> has been handed over to our delivery partner.
      </p>
      <div style="background-color: #FFF8E1; border: 1px solid #F6A10B; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h4 style="margin: 0 0 8px 0; color: #3E2723;">Tracking Information:</h4>
        <p style="margin: 4px 0; font-size: 14px; color: #3E2723;"><strong>Courier Partner:</strong> ${payload.courierPartner || 'SpeedPost / BlueDart'}</p>
        <p style="margin: 4px 0; font-size: 14px; color: #3E2723;"><strong>Tracking ID:</strong> <span style="font-family: monospace; background: #eee; padding: 2px 6px; rounded: 4px;">${payload.trackingNumber || 'DEVAM-TRK-' + payload.orderId}</span></p>
      </div>
    `;
  } else if (payload.status === 'Delivered') {
    subject = `✨ Order Delivered! How was your experience with Devam? #${payload.orderId}`;
    contentBodyHtml = `
      <div style="background-color: #0A883A; color: white; padding: 15px 20px; border-radius: 8px; font-weight: bold; margin-bottom: 20px;">
        ✨ Delivered! Your pure Devam products have been successfully delivered.
      </div>
      <p style="font-size: 15px; color: #444; line-height: 1.6;">
        Dear <strong>${payload.customerName}</strong>,<br/>
        Your order <strong>#${payload.orderId}</strong> was delivered today. We hope you enjoy the authentic aroma and taste of our products!
      </p>
      <div style="background-color: #FFF8E1; border: 2px solid #F6A10B; padding: 20px; text-align: center; border-radius: 12px; margin: 25px 0;">
        <h3 style="margin: 0 0 10px 0; color: #ED1F29; font-size: 18px;">⭐ Share Your Taste Feedback ⭐</h3>
        <p style="font-size: 14px; color: #3E2723; margin-bottom: 15px;">Your feedback helps us maintain our 100% purity guarantee.</p>
        <a href="https://thedevam.com/recipes" style="background-color: #ED1F29; color: white; text-decoration: none; padding: 12px 24px; font-weight: bold; border-radius: 6px; display: inline-block;">
          Leave Product Review &amp; Feedback →
        </a>
      </div>
    `;
  }

  const emailHtml = `
    <!DOCTYPE html>
    <html>
      <body style="font-family: Arial, sans-serif; background-color: #f9f9f9; margin: 0; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e5e5e5; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
          
          <!-- Header -->
          <div style="background-color: #3E2723; padding: 25px; text-align: center;">
            <h1 style="color: #F6A10B; margin: 0; font-size: 26px; font-family: Georgia, serif;">DEVAM</h1>
            <p style="color: #FFF8E1; margin: 5px 0 0 0; font-size: 12px; letter-spacing: 1px; uppercase;">Freshness You Can Taste, Quality You Can Trust</p>
          </div>

          <!-- Main Body -->
          <div style="padding: 30px;">
            ${contentBodyHtml}

            <!-- Order Summary Table -->
            <h3 style="color: #3E2723; border-bottom: 2px solid #F6A10B; padding-bottom: 8px; margin-top: 30px;">Order Summary (#${payload.orderId})</h3>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
              <thead>
                <tr style="background-color: #f5f5f5;">
                  <th style="padding: 10px; text-align: left; font-size: 13px; color: #666;">Item</th>
                  <th style="padding: 10px; text-align: center; font-size: 13px; color: #666;">Qty</th>
                  <th style="padding: 10px; text-align: right; font-size: 13px; color: #666;">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>

            <!-- Total Amount -->
            <div style="text-align: right; padding: 15px 10px; background-color: #FFF8E1; border-radius: 6px; margin-bottom: 20px;">
              <span style="font-size: 16px; color: #3E2723; font-weight: bold;">Total Amount Paid: </span>
              <span style="font-size: 20px; color: #ED1F29; font-weight: bold; margin-left: 10px;">₹${payload.totalAmount.toLocaleString('en-IN')}</span>
            </div>

            ${
              payload.shippingAddress
                ? `<p style="font-size: 14px; color: #555;"><strong>Delivery Address:</strong><br/>${payload.shippingAddress}</p>`
                : ''
            }
          </div>

          <!-- Footer -->
          <div style="background-color: #f5f5f5; padding: 20px; text-align: center; border-top: 1px solid #eee; font-size: 12px; color: #777;">
            <p style="margin: 0 0 8px 0;">Need help with your order? Reach out on WhatsApp: <a href="https://wa.me/919979640900" style="color: #0A883A; font-weight: bold;">+91 99796 40900</a></p>
            <p style="margin: 0;">© ${new Date().getFullYear()} Devam Foods (Shreeji Gruh Udhyog). All rights reserved.</p>
          </div>

        </div>
      </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: `"Devam Foods" <${SMTP_USER}>`,
      to: [recipientEmail, businessEmail],
      subject,
      html: emailHtml,
    });
    return { success: true };
  } catch (error: any) {
    console.error("Failed to send order email:", error);
    return { success: false, error: error.message };
  }
}

// 2. WhatsApp Notification Helper
export function generateWhatsAppMessage(payload: NotificationPayload): string {
  const { orderId, customerName, totalAmount, status, trackingNumber, courierPartner } = payload;
  
  if (status === 'Order Placed' || status === 'Confirmed') {
    return encodeURIComponent(
      `Hello ${customerName},\n\n` +
      `🎉 Your order *#${orderId}* of ₹${totalAmount.toLocaleString('en-IN')} is CONFIRMED at Devam Foods!\n\n` +
      `We are preparing your fresh Chakki Atta & Spices with care. Track status at: https://thedevam.com/account\n\n` +
      `Thank you for choosing Devam Foods!`
    );
  } else if (status === 'Shipped') {
    return encodeURIComponent(
      `Hello ${customerName},\n\n` +
      `🚚 Great news! Order *#${orderId}* has been SHIPPED via ${courierPartner || 'SpeedPost/Courier'}.\n` +
      `Tracking ID: ${trackingNumber || 'DEVAM-TRK-' + orderId}\n\n` +
      `Track live parcel: https://thedevam.com/account\n\n` +
      `Devam Foods Team`
    );
  } else {
    return encodeURIComponent(
      `Hello ${customerName},\n\n` +
      `✨ Your Devam Foods order *#${orderId}* has been DELIVERED!\n\n` +
      `We hope you enjoy the authentic taste & aroma. Please share your valuable feedback here:\n` +
      `https://thedevam.com/recipes\n\n` +
      `Thank you for being part of the Devam family!`
    );
  }
}
