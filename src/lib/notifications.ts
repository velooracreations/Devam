interface NotificationPayload {
  orderId: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  totalAmount: number;
  items: any[];
  status: string;
  shippingAddress?: string;
  trackingNumber?: string;
  courierPartner?: string;
}

const STATUS_LABELS: Record<string, string> = {
  'confirmed': '✅ Order Confirmed',
  'processing': '🔄 Processing',
  'shipped': '🚚 Shipped',
  'delivered': '📦 Delivered',
  'cancelled': '❌ Cancelled'
};

export const ADMIN_NOTIFICATION_EMAILS = [
  "info@thedevam.com",
  "thedevam2024@gmail.com"
];

export async function sendOrderEmail(payload: NotificationPayload): Promise<{ success: boolean; message: string }> {
  console.log(`[Email Intimation] New Order Notification for Order #${payload.orderId}`);
  console.log(`[Email Intimation] Customer Email: ${payload.customerEmail || 'N/A'}`);
  console.log(`[Email Intimation] Admin Alert Recipients: ${ADMIN_NOTIFICATION_EMAILS.join(', ')}`);

  try {
    // If Nodemailer / Resend SMTP credentials are setup in environment
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      const getReq = eval('require');
      const nodemailer = getReq('nodemailer');
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      const orderItemsText = (payload.items || []).map((i: any) => `- ${i.name} (${i.weight || ''}) x${i.quantity} @ ₹${i.price}`).join('\n');

      const mailOptions = {
        from: '"Devam System Alerts" <info@thedevam.com>',
        to: [payload.customerEmail, ...ADMIN_NOTIFICATION_EMAILS].filter(Boolean).join(', '),
        subject: `🚨 New Order Received #${payload.orderId} - ₹${payload.totalAmount}`,
        text: `New Order Received on Devam!\n\nOrder ID: #${payload.orderId}\nCustomer: ${payload.customerName}\nPhone: ${payload.customerPhone || 'N/A'}\nEmail: ${payload.customerEmail || 'N/A'}\nTotal Amount: ₹${payload.totalAmount}\nStatus: ${payload.status}\n\nItems:\n${orderItemsText}\n\nShipping Address:\n${payload.shippingAddress || 'N/A'}`,
      };

      await transporter.sendMail(mailOptions);
      return { success: true, message: `Email sent to customer and admins (${ADMIN_NOTIFICATION_EMAILS.join(', ')})` };
    }
  } catch (err: any) {
    console.error("Failed to send SMTP email:", err);
  }

  return { 
    success: true, 
    message: `Order intimation logged for ${ADMIN_NOTIFICATION_EMAILS.join(', ')}.` 
  };
}

export async function sendQueryEmail(payload: { name: string; email: string; phone?: string; subject?: string; message: string }): Promise<{ success: boolean }> {
  console.log(`[Email Intimation] New Customer Query Received from ${payload.name} (${payload.email})`);
  console.log(`[Email Intimation] Dispatching Alert to Admins: ${ADMIN_NOTIFICATION_EMAILS.join(', ')}`);

  try {
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      const getReq = eval('require');
      const nodemailer = getReq('nodemailer');
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      await transporter.sendMail({
        from: '"Devam Website Query" <info@thedevam.com>',
        to: ADMIN_NOTIFICATION_EMAILS.join(', '),
        subject: `📩 New Customer Query from ${payload.name}`,
        text: `New Inquiry Received on Devam Website:\n\nName: ${payload.name}\nEmail: ${payload.email}\nPhone: ${payload.phone || 'N/A'}\nSubject: ${payload.subject || 'General Inquiry'}\n\nMessage:\n${payload.message}`,
      });
    }
  } catch (err) {
    console.error("Failed to send query email alert:", err);
  }

  return { success: true };
}

export function generateWhatsAppMessage(payload: NotificationPayload): string {
  const statusLabel = STATUS_LABELS[payload.status] || payload.status;
  
  let message = `🛍️ *Devam Atta & Masala Hub - Order Update*\n\n`;
  message += `Order: #${payload.orderId}\n`;
  message += `Status: ${statusLabel}\n`;
  message += `Customer: ${payload.customerName}\n`;
  message += `Amount: ₹${payload.totalAmount}\n`;
  
  if (payload.items && payload.items.length > 0) {
    message += `\nItems:\n`;
    payload.items.forEach((item: any) => {
      message += `  • ${item.name} x${item.quantity}\n`;
    });
  }

  if (payload.trackingNumber) {
    message += `\nTracking: ${payload.trackingNumber}`;
    if (payload.courierPartner) {
      message += ` (${payload.courierPartner})`;
    }
    message += '\n';
  }

  if (payload.shippingAddress) {
    message += `\nShipping: ${payload.shippingAddress}\n`;
  }

  message += `\nThank you for choosing Devam! 🙏`;

  return encodeURIComponent(message);
}
