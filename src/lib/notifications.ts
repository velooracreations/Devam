export interface NotificationPayload {
  orderId: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  totalAmount: number | string;
  items?: Array<{
    id?: string;
    name: string;
    weight?: string;
    quantity: number;
    price: number;
    image?: string;
  }>;
  status: string;
  shippingAddress?: string;
  paymentMethod?: string;
  trackingNumber?: string;
  courierPartner?: string;
  cancellationReason?: string;
  date?: string;
  userId?: string;
}

export const ADMIN_NOTIFICATION_EMAILS = [
  "thedevam2024@gmail.com",
  "info@thedevam.com"
];

const STATUS_LABELS: Record<string, string> = {
  'Order Placed': '🛒 Order Placed',
  'Confirmed': '✅ Order Confirmed',
  'confirmed': '✅ Order Confirmed',
  'processing': '🔄 Processing',
  'Shipped': '🚚 Order Shipped',
  'shipped': '🚚 Order Shipped',
  'Out for Dispatch': '🛵 Out for Dispatch',
  'Delivered': '📦 Order Delivered',
  'delivered': '📦 Order Delivered',
  'Cancelled': '❌ Order Cancelled',
  'cancelled': '❌ Order Cancelled'
};

/**
 * Check and return email configuration status
 */
export function verifyEmailConfiguration() {
  const hasResend = Boolean(process.env.RESEND_API_KEY && process.env.RESEND_API_KEY.trim().length > 5);
  const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
  const smtpUser = process.env.SMTP_USER || 'thedevam2024@gmail.com';
  const smtpPass = (process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD || '').trim();
  const hasSmtp = Boolean(smtpPass && smtpPass !== 'your-app-password-here' && smtpPass !== 'your-16-char-app-password-here');

  return {
    configured: hasResend || hasSmtp,
    provider: hasResend ? 'resend' : hasSmtp ? 'smtp' : 'none',
    smtpHost: hasSmtp ? smtpHost : undefined,
    smtpUser: hasSmtp ? smtpUser : undefined,
    hasPass: Boolean(smtpPass),
    hasResendKey: hasResend,
    adminRecipients: ADMIN_NOTIFICATION_EMAILS,
    instructions: !hasResend && !hasSmtp
      ? "To enable automated emails, set SMTP_PASS (16-char Gmail App Password from https://myaccount.google.com/apppasswords) or RESEND_API_KEY in .env.local and Vercel environment variables."
      : "Email delivery transport is active."
  };
}

/**
 * Clean and format items list for text and HTML
 */
function formatItemsText(items?: any[]): string {
  if (!items || items.length === 0) return 'No item details recorded';
  return items.map((i: any, idx: number) => {
    const wt = i.weight ? ` (${i.weight})` : '';
    return `${idx + 1}. ${i.name}${wt} × ${i.quantity} — ₹${Number(i.price || 0) * Number(i.quantity || 1)}`;
  }).join('\n');
}

/**
 * Generate branded HTML for Admin notification
 */
function renderAdminEmailHtml(payload: NotificationPayload, isCancelled: boolean): string {
  const itemsHtml = (payload.items || []).map((i: any) => `
    <tr style="border-bottom: 1px solid #f3f4f6;">
      <td style="padding: 10px 12px; font-size: 13px; color: #111827; font-weight: 600;">
        ${i.name} ${i.weight ? `<span style="font-size: 11px; color: #6b7280; font-weight: normal;">(${i.weight})</span>` : ''}
      </td>
      <td style="padding: 10px 12px; font-size: 13px; color: #374151; text-align: center;">${i.quantity}</td>
      <td style="padding: 10px 12px; font-size: 13px; color: #374151; text-align: right;">₹${i.price}</td>
      <td style="padding: 10px 12px; font-size: 13px; color: #111827; font-weight: bold; text-align: right;">₹${Number(i.price || 0) * Number(i.quantity || 1)}</td>
    </tr>
  `).join('');

  const orderDate = payload.date
    ? new Date(payload.date).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
    : new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });

  const headerBg = isCancelled ? '#991b1b' : '#14532d';
  const headerTitle = isCancelled ? '❌ ORDER CANCELLED BY CUSTOMER' : '🛒 NEW ORDER RECEIVED';
  const headerSubtitle = isCancelled ? 'Customer has cancelled this order. Review details below.' : 'A new order has been placed on the Devam online store.';

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${headerTitle}</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 24px 12px;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e5e7eb; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
            <!-- Header -->
            <tr>
              <td style="background-color: ${headerBg}; padding: 28px 24px; text-align: center;">
                <div style="font-size: 24px; font-weight: 900; letter-spacing: 2px; color: #ffffff; text-transform: uppercase;">
                  DEVAM
                </div>
                <div style="font-size: 11px; letter-spacing: 3px; color: #fef08a; text-transform: uppercase; margin-top: 2px;">
                  Pure &amp; Authentic Chakki Atta &amp; Spices
                </div>
                <div style="display: inline-block; background-color: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.3); border-radius: 9999px; padding: 6px 16px; margin-top: 14px; color: #ffffff; font-size: 13px; font-weight: 700;">
                  ${headerTitle}
                </div>
                <p style="color: #f3f4f6; font-size: 13px; margin: 8px 0 0 0;">
                  ${headerSubtitle}
                </p>
              </td>
            </tr>

            <!-- Body Details -->
            <tr>
              <td style="padding: 24px;">
                <!-- Order Quick Glance Box -->
                <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
                  <tr>
                    <td width="50%" style="vertical-align: top; padding: 4px 8px;">
                      <span style="font-size: 11px; color: #6b7280; text-transform: uppercase; font-weight: bold; letter-spacing: 0.5px;">Order ID</span>
                      <div style="font-size: 16px; font-weight: 800; color: #111827; font-family: monospace;">#${payload.orderId}</div>
                    </td>
                    <td width="50%" style="vertical-align: top; padding: 4px 8px; text-align: right;">
                      <span style="font-size: 11px; color: #6b7280; text-transform: uppercase; font-weight: bold; letter-spacing: 0.5px;">Date &amp; Time</span>
                      <div style="font-size: 13px; font-weight: 600; color: #374151;">${orderDate}</div>
                    </td>
                  </tr>
                  <tr>
                    <td width="50%" style="vertical-align: top; padding: 8px 8px 4px 8px;">
                      <span style="font-size: 11px; color: #6b7280; text-transform: uppercase; font-weight: bold; letter-spacing: 0.5px;">Total Amount</span>
                      <div style="font-size: 20px; font-weight: 900; color: ${isCancelled ? '#b91c1c' : '#15803d'};">₹${payload.totalAmount}</div>
                    </td>
                    <td width="50%" style="vertical-align: top; padding: 8px 8px 4px 8px; text-align: right;">
                      <span style="font-size: 11px; color: #6b7280; text-transform: uppercase; font-weight: bold; letter-spacing: 0.5px;">Payment Method</span>
                      <div style="font-size: 13px; font-weight: 700; color: #1f2937;">${payload.paymentMethod || 'Online / COD'}</div>
                    </td>
                  </tr>
                </table>

                ${isCancelled ? `
                <!-- Cancellation Reason Callout -->
                <div style="background-color: #fef2f2; border: 1.5px solid #fecaca; border-radius: 10px; padding: 14px 16px; margin-bottom: 20px;">
                  <div style="font-size: 12px; font-weight: 800; color: #991b1b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">
                    ⚠️ Reason for Cancellation
                  </div>
                  <div style="font-size: 14px; font-weight: 600; color: #b91c1c;">
                    "${payload.cancellationReason || 'Cancelled by customer in My Account'}"
                  </div>
                </div>
                ` : ''}

                <!-- Customer Details -->
                <div style="margin-bottom: 20px;">
                  <h3 style="font-size: 14px; font-weight: 800; color: #111827; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 10px 0; border-bottom: 2px solid #f3f4f6; padding-bottom: 6px;">
                    👤 Customer Information
                  </h3>
                  <table width="100%" cellpadding="0" cellspacing="0" style="font-size: 13px; line-height: 1.6;">
                    <tr>
                      <td width="30%" style="color: #6b7280; font-weight: 600; padding: 4px 0;">Customer Name:</td>
                      <td style="color: #111827; font-weight: 700; padding: 4px 0;">${payload.customerName || 'Guest User'}</td>
                    </tr>
                    <tr>
                      <td style="color: #6b7280; font-weight: 600; padding: 4px 0;">Contact Phone:</td>
                      <td style="color: #111827; font-weight: 700; padding: 4px 0;">
                        <a href="tel:${payload.customerPhone}" style="color: #15803d; text-decoration: none;">${payload.customerPhone || 'N/A'}</a>
                        ${payload.customerPhone ? `&nbsp;(<a href="https://wa.me/91${(payload.customerPhone || '').replace(/\D/g, '').replace(/^91/, '')}" style="color: #25d366; text-decoration: underline; font-size: 11px;">Chat on WhatsApp</a>)` : ''}
                      </td>
                    </tr>
                    <tr>
                      <td style="color: #6b7280; font-weight: 600; padding: 4px 0;">Email Address:</td>
                      <td style="color: #111827; font-weight: 600; padding: 4px 0;">
                        ${payload.customerEmail ? `<a href="mailto:${payload.customerEmail}" style="color: #2563eb; text-decoration: none;">${payload.customerEmail}</a>` : 'Not provided'}
                      </td>
                    </tr>
                    <tr>
                      <td style="color: #6b7280; font-weight: 600; padding: 4px 0; vertical-align: top;">Shipping Address:</td>
                      <td style="color: #111827; font-weight: 600; padding: 4px 0; line-height: 1.4;">${payload.shippingAddress || 'Not specified'}</td>
                    </tr>
                  </table>
                </div>

                <!-- Items Table -->
                <div style="margin-bottom: 24px;">
                  <h3 style="font-size: 14px; font-weight: 800; color: #111827; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 10px 0; border-bottom: 2px solid #f3f4f6; padding-bottom: 6px;">
                    🛍️ Ordered Products
                  </h3>
                  <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse; background-color: #ffffff; border: 1px solid #f3f4f6; border-radius: 8px; overflow: hidden;">
                    <thead>
                      <tr style="background-color: #f9fafb; border-bottom: 1.5px solid #e5e7eb;">
                        <th style="padding: 8px 12px; font-size: 11px; font-weight: 800; color: #4b5563; text-transform: uppercase; text-align: left;">Product</th>
                        <th style="padding: 8px 12px; font-size: 11px; font-weight: 800; color: #4b5563; text-transform: uppercase; text-align: center;">Qty</th>
                        <th style="padding: 8px 12px; font-size: 11px; font-weight: 800; color: #4b5563; text-transform: uppercase; text-align: right;">Unit Price</th>
                        <th style="padding: 8px 12px; font-size: 11px; font-weight: 800; color: #4b5563; text-transform: uppercase; text-align: right;">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${itemsHtml || '<tr><td colspan="4" style="padding: 12px; text-align: center; color: #6b7280;">No item details available</td></tr>'}
                    </tbody>
                    <tfoot>
                      <tr style="background-color: #f9fafb; border-top: 1.5px solid #e5e7eb;">
                        <td colspan="3" style="padding: 10px 12px; font-size: 13px; font-weight: 800; color: #111827; text-align: right;">Grand Total:</td>
                        <td style="padding: 10px 12px; font-size: 15px; font-weight: 900; color: ${isCancelled ? '#b91c1c' : '#15803d'}; text-align: right;">₹${payload.totalAmount}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                <!-- Admin Action Button -->
                <div style="text-align: center; padding-top: 8px;">
                  <a href="https://thedevam.com/admin/orders" style="display: inline-block; background-color: #15803d; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-size: 14px; font-weight: 800; letter-spacing: 0.5px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    Open in Devam Admin Dashboard &rarr;
                  </a>
                </div>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background-color: #f9fafb; padding: 18px 24px; text-align: center; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280;">
                <div style="font-weight: 700; color: #374151;">Shreeji Foods &amp; Spices (The Devam)</div>
                <div>A-28, Sardar Patel Industrial Estate, Bileshwarpura, Chhatral, Gandhinagar - 382729</div>
                <div style="margin-top: 4px;">Phone: +91 99796 40900 | Email: info@thedevam.com | Website: thedevam.com</div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
}

/**
 * Generate branded HTML for Customer confirmation or cancellation
 */
function renderCustomerEmailHtml(payload: NotificationPayload, isCancelled: boolean): string {
  const itemsHtml = (payload.items || []).map((i: any) => `
    <tr style="border-bottom: 1px solid #f3f4f6;">
      <td style="padding: 10px 12px; font-size: 13px; color: #111827; font-weight: 600;">
        ${i.name} ${i.weight ? `<span style="font-size: 11px; color: #6b7280; font-weight: normal;">(${i.weight})</span>` : ''}
      </td>
      <td style="padding: 10px 12px; font-size: 13px; color: #374151; text-align: center;">${i.quantity}</td>
      <td style="padding: 10px 12px; font-size: 13px; color: #111827; font-weight: bold; text-align: right;">₹${Number(i.price || 0) * Number(i.quantity || 1)}</td>
    </tr>
  `).join('');

  const title = isCancelled ? 'Your Order has been Cancelled' : 'Order Confirmed!';
  const message = isCancelled
    ? `We've processed the cancellation of your order <strong>#${payload.orderId}</strong> as requested. If you paid online via UPI, NetBanking, or Credit/Debit Card, your refund of <strong>₹${payload.totalAmount}</strong> has been initiated and will reflect in your account within 3 to 5 business days.`
    : `Thank you for your order! We are freshly preparing your freshly milled Chakki Atta and premium spices. We will notify you as soon as your shipment is dispatched.`;

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 24px 12px;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e5e7eb; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
            <!-- Header -->
            <tr>
              <td style="background-color: ${isCancelled ? '#991b1b' : '#14532d'}; padding: 28px 24px; text-align: center;">
                <div style="font-size: 24px; font-weight: 900; letter-spacing: 2px; color: #ffffff; text-transform: uppercase;">
                  DEVAM
                </div>
                <div style="font-size: 11px; letter-spacing: 3px; color: #fef08a; text-transform: uppercase; margin-top: 2px;">
                  100% Pure Traditional Chakki Atta
                </div>
                <h1 style="color: #ffffff; font-size: 20px; font-weight: 800; margin: 16px 0 0 0;">
                  ${title}
                </h1>
              </td>
            </tr>

            <!-- Body Details -->
            <tr>
              <td style="padding: 24px;">
                <p style="font-size: 15px; color: #1f2937; margin: 0 0 16px 0; line-height: 1.5;">
                  Hi <strong>${payload.customerName || 'Valued Customer'}</strong>,
                </p>
                <p style="font-size: 14px; color: #374151; margin: 0 0 20px 0; line-height: 1.6;">
                  ${message}
                </p>

                ${isCancelled && payload.cancellationReason ? `
                <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 12px 16px; margin-bottom: 20px;">
                  <span style="font-size: 11px; font-weight: bold; color: #991b1b; text-transform: uppercase;">Reason:</span>
                  <div style="font-size: 13px; font-weight: 600; color: #b91c1c; margin-top: 2px;">${payload.cancellationReason}</div>
                </div>
                ` : ''}

                <!-- Order Info Box -->
                <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
                  <tr>
                    <td width="50%" style="vertical-align: top; padding: 4px 8px;">
                      <span style="font-size: 11px; color: #6b7280; text-transform: uppercase; font-weight: bold;">Order Reference</span>
                      <div style="font-size: 15px; font-weight: 800; color: #111827; font-family: monospace;">#${payload.orderId}</div>
                    </td>
                    <td width="50%" style="vertical-align: top; padding: 4px 8px; text-align: right;">
                      <span style="font-size: 11px; color: #6b7280; text-transform: uppercase; font-weight: bold;">Amount</span>
                      <div style="font-size: 18px; font-weight: 800; color: #111827;">₹${payload.totalAmount}</div>
                    </td>
                  </tr>
                  <tr>
                    <td colspan="2" style="padding: 10px 8px 4px 8px; border-top: 1px solid #e5e7eb; margin-top: 8px;">
                      <span style="font-size: 11px; color: #6b7280; text-transform: uppercase; font-weight: bold;">Delivery Address</span>
                      <div style="font-size: 13px; color: #374151; font-weight: 600; margin-top: 2px;">${payload.shippingAddress || 'Your saved address'}</div>
                    </td>
                  </tr>
                </table>

                <!-- Items Table -->
                <div style="margin-bottom: 24px;">
                  <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse; background-color: #ffffff; border: 1px solid #f3f4f6; border-radius: 8px; overflow: hidden;">
                    <thead>
                      <tr style="background-color: #f9fafb; border-bottom: 1.5px solid #e5e7eb;">
                        <th style="padding: 8px 12px; font-size: 11px; font-weight: 800; color: #4b5563; text-transform: uppercase; text-align: left;">Item</th>
                        <th style="padding: 8px 12px; font-size: 11px; font-weight: 800; color: #4b5563; text-transform: uppercase; text-align: center;">Qty</th>
                        <th style="padding: 8px 12px; font-size: 11px; font-weight: 800; color: #4b5563; text-transform: uppercase; text-align: right;">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${itemsHtml}
                    </tbody>
                  </table>
                </div>

                <!-- Customer Account Button -->
                <div style="text-align: center; padding-top: 8px;">
                  <a href="https://thedevam.com/account" style="display: inline-block; background-color: #15803d; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-size: 14px; font-weight: 800; letter-spacing: 0.5px;">
                    View Order in My Account &rarr;
                  </a>
                </div>

                <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e5e7eb; font-size: 13px; color: #4b5563; line-height: 1.5;">
                  Have questions or need assistance? Reply directly to this email or reach us on WhatsApp at <strong>+91 99796 40900</strong>. We're here to help!
                </div>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background-color: #f9fafb; padding: 18px 24px; text-align: center; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280;">
                <div style="font-weight: 700; color: #374151;">Devam Atta &amp; Spices (Shreeji Foods)</div>
                <div>Freshness &amp; Purity Delivered to Your Kitchen</div>
                <div style="margin-top: 4px;">Website: <a href="https://thedevam.com" style="color: #15803d; text-decoration: none;">thedevam.com</a></div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
}

/**
 * Dispatch an email via either Resend REST API or Nodemailer SMTP
 */
async function sendRawEmail({
  to,
  subject,
  html,
  text
}: {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
}): Promise<{ success: boolean; provider: string; messageId?: string; error?: string }> {
  const toList = Array.isArray(to) ? to.filter(Boolean) : [to].filter(Boolean);
  if (toList.length === 0) {
    return { success: false, provider: 'none', error: 'No recipients provided' };
  }

  // ── 1. If Resend API key is present, use HTTP REST API ───────────────────────
  const resendApiKey = process.env.RESEND_API_KEY?.trim();
  if (resendApiKey && resendApiKey.length > 5) {
    try {
      const fromAddr = process.env.RESEND_FROM || 'Devam Orders <orders@thedevam.com>';
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: fromAddr,
          to: toList,
          subject,
          html,
          text
        })
      });

      const resData = await res.json();
      if (res.ok && resData?.id) {
        return { success: true, provider: 'resend', messageId: resData.id };
      }
      console.warn('[Notifications] Resend API returned error:', resData);
      // Fall through to SMTP if configured
    } catch (resendErr: any) {
      console.warn('[Notifications] Resend API request failed:', resendErr.message);
    }
  }

  // ── 2. Fall back to Nodemailer SMTP ──────────────────────────────────────────
  const smtpPass = (process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD || '').trim();
  const smtpUser = process.env.SMTP_USER || 'thedevam2024@gmail.com';
  const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '465');
  const isSecure = port === 465 || process.env.SMTP_SECURE === 'true';

  if (smtpPass && smtpPass !== 'your-app-password-here' && smtpPass !== 'your-16-char-app-password-here') {
    try {
      const getReq = eval('require');
      const nodemailer = getReq('nodemailer');

      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: port,
        secure: isSecure,
        auth: {
          user: smtpUser,
          pass: smtpPass.replace(/\s+/g, '') // remove spaces from Gmail app passwords
        },
        tls: {
          rejectUnauthorized: false
        },
        connectionTimeout: 10000,
        greetingTimeout: 10000,
      });

      const fromAddr = process.env.SMTP_FROM || `"Devam Store" <${smtpUser}>`;

      const info = await transporter.sendMail({
        from: fromAddr,
        to: toList.join(', '),
        subject,
        text,
        html
      });

      return { success: true, provider: 'smtp', messageId: info.messageId };
    } catch (smtpErr: any) {
      console.error('[Notifications] SMTP send failed:', smtpErr.message);
      return { success: false, provider: 'smtp', error: smtpErr.message };
    }
  }

  return {
    success: false,
    provider: 'none',
    error: 'No active email provider configured (SMTP_PASS or RESEND_API_KEY required in environment).'
  };
}

/**
 * Main Order Notification Dispatcher (Handles both Order Placed & Cancelled)
 */
export async function sendOrderNotificationEmail(payload: NotificationPayload): Promise<{
  success: boolean;
  provider: string;
  adminSent: boolean;
  customerSent: boolean;
  errors?: string[];
  diagnostic?: string;
}> {
  const isCancelled = payload.status === 'Cancelled' || payload.status?.toLowerCase().includes('cancel');
  const orderId = payload.orderId;
  const totalAmount = payload.totalAmount;
  const customerName = payload.customerName || 'Customer';

  console.log(`[OrderNotification] Processing ${isCancelled ? 'CANCELLATION' : 'NEW ORDER'} for #${orderId} (₹${totalAmount})`);

  // Build Subjects
  const adminSubject = isCancelled
    ? `❌ [ORDER CANCELLED] #${orderId} — ₹${totalAmount} | ${customerName}`
    : `🚨 [NEW ORDER RECEIVED] #${orderId} — ₹${totalAmount} | ${customerName}`;

  const customerSubject = isCancelled
    ? `❌ Devam Order #${orderId} Cancellation Intimation`
    : `✅ Your Devam Order #${orderId} is Confirmed! (₹${totalAmount})`;

  // Build Content
  const adminHtml = renderAdminEmailHtml(payload, isCancelled);
  const adminText = [
    isCancelled ? `ORDER CANCELLED — DEVAM` : `NEW ORDER RECEIVED — DEVAM`,
    `Order ID: #${orderId}`,
    `Customer: ${customerName}`,
    `Phone: ${payload.customerPhone || 'N/A'}`,
    `Email: ${payload.customerEmail || 'N/A'}`,
    `Total: ₹${totalAmount}`,
    `Status: ${payload.status}`,
    ...(isCancelled ? [`Cancellation Reason: ${payload.cancellationReason || 'Cancelled by customer'}`] : []),
    `Items:\n${formatItemsText(payload.items)}`,
    `Address: ${payload.shippingAddress || 'N/A'}`,
    `Admin link: https://thedevam.com/admin/orders`
  ].join('\n');

  const customerHtml = renderCustomerEmailHtml(payload, isCancelled);
  const customerText = [
    `Devam Atta & Spices - ${isCancelled ? 'Order Cancelled' : 'Order Confirmed'}`,
    `Hi ${customerName},`,
    isCancelled
      ? `Your order #${orderId} has been cancelled. If paid online, your refund of ₹${totalAmount} will be processed in 3-5 business days.`
      : `Thank you for your order #${orderId}! Total: ₹${totalAmount}. We are preparing your order fresh.`,
    `Items:\n${formatItemsText(payload.items)}`,
    `Delivering to: ${payload.shippingAddress || 'Your address'}`,
    `Track order: https://thedevam.com/account`,
    `Support WhatsApp: +91 99796 40900`
  ].join('\n');

  const errors: string[] = [];

  // ── Dispatch Admin Email ───────────────────────────────────────────────────
  const adminResult = await sendRawEmail({
    to: ADMIN_NOTIFICATION_EMAILS,
    subject: adminSubject,
    html: adminHtml,
    text: adminText
  });

  if (!adminResult.success) {
    errors.push(`Admin email: ${adminResult.error || 'Failed'}`);
  }

  // ── Dispatch Customer Email (if valid) ─────────────────────────────────────
  let customerSent = false;
  const custEmail = payload.customerEmail?.trim();
  const isValidCustomerEmail = Boolean(
    custEmail && 
    custEmail.includes('@') && 
    !custEmail.includes('guest@') && 
    !custEmail.endsWith('@thedevam.com')
  );

  if (isValidCustomerEmail && custEmail) {
    const custResult = await sendRawEmail({
      to: custEmail,
      subject: customerSubject,
      html: customerHtml,
      text: customerText
    });
    customerSent = custResult.success;
    if (!custResult.success) {
      errors.push(`Customer email (${custEmail}): ${custResult.error || 'Failed'}`);
    }
  } else {
    console.log(`[OrderNotification] Skipping customer email: "${custEmail || 'none'}" is not a direct personal customer email.`);
  }

  const success = adminResult.success || customerSent;
  const provider = adminResult.provider || 'none';

  return {
    success,
    provider,
    adminSent: adminResult.success,
    customerSent,
    errors: errors.length > 0 ? errors : undefined,
    diagnostic: success
      ? `Emails delivered via ${provider.toUpperCase()}`
      : `Delivery pending configuration: ${errors.join(', ')}`
  };
}

/**
 * Diagnostic test email trigger
 */
export async function sendTestEmail(targetEmail?: string): Promise<{ success: boolean; message: string; provider: string; details?: any }> {
  const recipient = targetEmail || ADMIN_NOTIFICATION_EMAILS[0];
  const samplePayload: NotificationPayload = {
    orderId: 'TEST-' + Math.floor(1000 + Math.random() * 9000),
    customerName: 'Test Administrator',
    customerEmail: recipient,
    customerPhone: '+91 99796 40900',
    totalAmount: 999,
    status: 'Order Placed',
    items: [
      { name: 'Devam MP Sharbati Fresh Atta', weight: '5kg', quantity: 1, price: 349 },
      { name: 'Devam Pure Cold Pressed Mustard Oil', weight: '1L', quantity: 2, price: 325 }
    ],
    shippingAddress: 'A-28, Sardar Patel Industrial Estate, Bileshwarpura, Chhatral, Gandhinagar - 382729',
    paymentMethod: 'Test Verification / Prepaid',
    date: new Date().toISOString()
  };

  const result = await sendOrderNotificationEmail(samplePayload);
  return {
    success: result.success,
    message: result.success 
      ? `Test intimation sent successfully to ${recipient} via ${result.provider.toUpperCase()}!`
      : `Test email failed: ${result.errors?.join(', ') || 'No mail provider active'}`,
    provider: result.provider,
    details: result
  };
}

/**
 * Customer Inquiry / Website contact query alert
 */
export async function sendQueryEmail(payload: { name: string; email: string; phone?: string; subject?: string; message: string }): Promise<{ success: boolean }> {
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
      <h2 style="color: #14532d;">📩 New Inquiry Received on Devam</h2>
      <p><strong>Name:</strong> ${payload.name}</p>
      <p><strong>Email:</strong> <a href="mailto:${payload.email}">${payload.email}</a></p>
      <p><strong>Phone:</strong> ${payload.phone || 'N/A'}</p>
      <p><strong>Subject:</strong> ${payload.subject || 'General Inquiry'}</p>
      <div style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #14532d; margin-top: 15px;">
        <p style="margin: 0; white-space: pre-wrap;">${payload.message}</p>
      </div>
    </div>
  `;

  const text = `New Website Query from ${payload.name} (${payload.email})\nPhone: ${payload.phone || 'N/A'}\nSubject: ${payload.subject || 'General'}\n\nMessage:\n${payload.message}`;

  const res = await sendRawEmail({
    to: ADMIN_NOTIFICATION_EMAILS,
    subject: `📩 New Customer Query: ${payload.subject || payload.name}`,
    html,
    text
  });

  return { success: res.success };
}

/**
 * Generate click-to-chat WhatsApp message
 */
export function generateWhatsAppMessage(payload: NotificationPayload): string {
  const statusLabel = STATUS_LABELS[payload.status] || payload.status;
  
  let message = `🛍️ *Devam Atta & Masala Hub - Order Update*\n\n`;
  message += `Order: #${payload.orderId}\n`;
  message += `Status: ${statusLabel}\n`;
  message += `Customer: ${payload.customerName || 'Valued Customer'}\n`;
  message += `Amount: ₹${payload.totalAmount}\n`;
  
  if (payload.items && payload.items.length > 0) {
    message += `\nItems:\n`;
    payload.items.forEach((item: any) => {
      message += `  • ${item.name} (${item.weight || ''}) x${item.quantity}\n`;
    });
  }

  if (payload.status === 'Cancelled' && payload.cancellationReason) {
    message += `\nCancellation Reason: ${payload.cancellationReason}\n`;
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
