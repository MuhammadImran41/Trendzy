"""
Email notification service for GlowMart.
Sends order confirmation emails to the seller using Gmail SMTP.
"""
import smtplib
import os
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from datetime import datetime


SELLER_EMAIL = os.getenv('SELLER_EMAIL', 'meharraza371@gmail.com')
SMTP_USER    = os.getenv('SMTP_USER', '')
SMTP_PASS    = os.getenv('SMTP_PASS', '')
SMTP_HOST    = 'smtp.gmail.com'
SMTP_PORT    = 587

# Log config on import so you can see it in the terminal
print(f'[Email] SMTP_USER  : {SMTP_USER or "(not set)"}')
print(f'[Email] SMTP_PASS  : {"✓ set (" + str(len(SMTP_PASS)) + " chars)" if SMTP_PASS else "✗ NOT SET — emails will not send"}')
print(f'[Email] SELLER_EMAIL: {SELLER_EMAIL}')


def _build_html(order: dict) -> str:
    """Build a clean HTML email body for a new order."""
    items_rows = ''
    for item in order.get('items', []):
        subtotal = item['price'] * item['quantity']
        items_rows += f"""
        <tr>
          <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;">
            <strong>{item['productName']}</strong>
          </td>
          <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;text-align:center;">
            {item['quantity']}
          </td>
          <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;text-align:right;">
            PKR {item['price']:,.0f}
          </td>
          <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;text-align:right;font-weight:600;">
            PKR {subtotal:,.0f}
          </td>
        </tr>"""

    order_id   = order.get('id', 'N/A')
    buyer_name = order.get('buyerName', '')
    buyer_phone= order.get('buyerPhone', '')
    buyer_city = order.get('buyerCity', '')
    buyer_addr = order.get('buyerAddress', '')
    notes      = order.get('notes') or '—'
    total      = order.get('total', 0)
    placed_at  = datetime.utcnow().strftime('%d %b %Y, %I:%M %p UTC')

    return f"""
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0"
             style="background:#ffffff;border-radius:12px;overflow:hidden;
                    box-shadow:0 4px 24px rgba(0,0,0,0.08);max-width:600px;width:100%;">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#e8347a,#c4205f);
                     padding:28px 32px;text-align:center;">
            <h1 style="margin:0;color:#fff;font-size:26px;font-weight:700;
                       letter-spacing:-0.5px;">🌸 GlowMart</h1>
            <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">
              New Order Received
            </p>
          </td>
        </tr>

        <!-- Alert banner -->
        <tr>
          <td style="background:#fff8f0;border-left:4px solid #e8347a;
                     padding:14px 32px;">
            <p style="margin:0;font-size:14px;color:#7a3a00;">
              🛍️ <strong>Order #{order_id}</strong> was placed on {placed_at}.
              Please process it promptly.
            </p>
          </td>
        </tr>

        <!-- Customer details -->
        <tr>
          <td style="padding:28px 32px 0;">
            <h2 style="margin:0 0 16px;font-size:16px;color:#1a1a1a;
                       text-transform:uppercase;letter-spacing:1px;
                       border-bottom:2px solid #f0f0f0;padding-bottom:8px;">
              Customer Details
            </h2>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:6px 0;color:#666;font-size:14px;width:130px;">👤 Name</td>
                <td style="padding:6px 0;color:#1a1a1a;font-size:14px;font-weight:600;">
                  {buyer_name}
                </td>
              </tr>
              <tr>
                <td style="padding:6px 0;color:#666;font-size:14px;">📞 Phone</td>
                <td style="padding:6px 0;color:#1a1a1a;font-size:14px;font-weight:600;">
                  {buyer_phone}
                </td>
              </tr>
              <tr>
                <td style="padding:6px 0;color:#666;font-size:14px;">🏙️ City</td>
                <td style="padding:6px 0;color:#1a1a1a;font-size:14px;font-weight:600;">
                  {buyer_city}
                </td>
              </tr>
              <tr>
                <td style="padding:6px 0;color:#666;font-size:14px;vertical-align:top;">
                  📍 Address
                </td>
                <td style="padding:6px 0;color:#1a1a1a;font-size:14px;font-weight:600;">
                  {buyer_addr}
                </td>
              </tr>
              <tr>
                <td style="padding:6px 0;color:#666;font-size:14px;vertical-align:top;">
                  💬 Notes
                </td>
                <td style="padding:6px 0;color:#555;font-size:14px;font-style:italic;">
                  {notes}
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Order items -->
        <tr>
          <td style="padding:28px 32px 0;">
            <h2 style="margin:0 0 16px;font-size:16px;color:#1a1a1a;
                       text-transform:uppercase;letter-spacing:1px;
                       border-bottom:2px solid #f0f0f0;padding-bottom:8px;">
              Order Items
            </h2>
            <table width="100%" cellpadding="0" cellspacing="0"
                   style="border-collapse:collapse;">
              <thead>
                <tr style="background:#fafafa;">
                  <th style="padding:10px 12px;text-align:left;font-size:12px;
                             color:#888;text-transform:uppercase;letter-spacing:0.5px;">
                    Product
                  </th>
                  <th style="padding:10px 12px;text-align:center;font-size:12px;
                             color:#888;text-transform:uppercase;letter-spacing:0.5px;">
                    Qty
                  </th>
                  <th style="padding:10px 12px;text-align:right;font-size:12px;
                             color:#888;text-transform:uppercase;letter-spacing:0.5px;">
                    Unit Price
                  </th>
                  <th style="padding:10px 12px;text-align:right;font-size:12px;
                             color:#888;text-transform:uppercase;letter-spacing:0.5px;">
                    Subtotal
                  </th>
                </tr>
              </thead>
              <tbody>
                {items_rows}
              </tbody>
            </table>
          </td>
        </tr>

        <!-- Total -->
        <tr>
          <td style="padding:16px 32px 28px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td></td>
                <td style="width:220px;">
                  <table width="100%" cellpadding="0" cellspacing="0"
                         style="background:#fdf0f5;border-radius:8px;padding:16px;">
                    <tr>
                      <td style="font-size:14px;color:#666;">Payment Method</td>
                      <td style="font-size:14px;color:#1a1a1a;font-weight:600;
                                 text-align:right;">Cash on Delivery</td>
                    </tr>
                    <tr>
                      <td style="padding-top:10px;font-size:18px;color:#e8347a;
                                 font-weight:700;">Total</td>
                      <td style="padding-top:10px;font-size:18px;color:#e8347a;
                                 font-weight:700;text-align:right;">
                        PKR {total:,.0f}
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- CTA -->
        <tr>
          <td style="padding:0 32px 32px;text-align:center;">
            <a href="http://localhost:4201/seller/orders"
               style="display:inline-block;background:linear-gradient(135deg,#e8347a,#c4205f);
                      color:#fff;text-decoration:none;padding:14px 32px;
                      border-radius:8px;font-size:15px;font-weight:600;">
              View in Seller Portal →
            </a>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#fafafa;padding:20px 32px;text-align:center;
                     border-top:1px solid #f0f0f0;">
            <p style="margin:0;font-size:12px;color:#aaa;">
              © 2025 GlowMart · This is an automated notification
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>"""


def send_order_notification(order: dict) -> bool:
    """
    Send a new-order notification email to the seller.
    Returns True on success, False on failure (non-blocking).
    """
    if not SMTP_USER or not SMTP_PASS:
        print('[Email] ✗ SMTP_USER or SMTP_PASS not set in .env — skipping email.')
        return False

    try:
        order_id = order.get('id', 'N/A')
        buyer    = order.get('buyerName', 'Customer')
        total    = order.get('total', 0)

        msg = MIMEMultipart('alternative')
        msg['Subject'] = f'🛍️ New Order #{order_id} — PKR {total:,.0f} from {buyer}'
        msg['From']    = f'GlowMart Orders <{SMTP_USER}>'
        msg['To']      = SELLER_EMAIL

        plain = (
            f"New Order Received!\n\n"
            f"Order ID : {order_id}\n"
            f"Customer : {buyer}\n"
            f"Phone    : {order.get('buyerPhone', '')}\n"
            f"City     : {order.get('buyerCity', '')}\n"
            f"Address  : {order.get('buyerAddress', '')}\n"
            f"Total    : PKR {total:,.0f}\n"
            f"Payment  : Cash on Delivery\n\nItems:\n"
        )
        for item in order.get('items', []):
            plain += f"  - {item['productName']} x{item['quantity']} @ PKR {item['price']:,.0f}\n"

        msg.attach(MIMEText(plain, 'plain'))
        msg.attach(MIMEText(_build_html(order), 'html'))

        print(f'[Email] Connecting to {SMTP_HOST}:{SMTP_PORT} as {SMTP_USER}...')
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=15) as server:
            server.ehlo()
            server.starttls()
            server.login(SMTP_USER, SMTP_PASS)
            server.sendmail(SMTP_USER, SELLER_EMAIL, msg.as_string())

        print(f'[Email] ✓ Order notification sent → {SELLER_EMAIL} (Order #{order_id})')
        return True

    except smtplib.SMTPAuthenticationError:
        print('[Email] ✗ AUTH FAILED — Wrong Gmail App Password.')
        print('[Email]   Fix: Go to https://myaccount.google.com/apppasswords')
        print('[Email]   Create an App Password and paste it as SMTP_PASS in .env')
        return False
    except smtplib.SMTPException as e:
        print(f'[Email] ✗ SMTP error: {e}')
        return False
    except Exception as e:
        print(f'[Email] ✗ Unexpected error: {type(e).__name__}: {e}')
        return False
