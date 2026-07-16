"""
Email notification service for Trendzy — powered by Gmail SMTP.
Sends order notifications to the seller and receipts to customers.
"""
import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from datetime import datetime

SELLER_EMAIL = os.getenv('SELLER_EMAIL', 'trendzyofficial.site@gmail.com')
GMAIL_USER   = os.getenv('GMAIL_USER',   '')
GMAIL_PASS   = os.getenv('GMAIL_PASS',   '')
FROM_ADDRESS = f'Trendzy <{GMAIL_USER}>' if GMAIL_USER else 'Trendzy <noreply@trendzy.pk>'

SMTP_HOST = 'smtp.gmail.com'
SMTP_PORT = 587

print(f'[Email] GMAIL_USER   : {GMAIL_USER or "(not set)"}')
print(f'[Email] GMAIL_PASS   : {"✓ set (" + str(len(GMAIL_PASS)) + " chars)" if GMAIL_PASS else "✗ NOT SET"}')
print(f'[Email] SELLER_EMAIL : {SELLER_EMAIL}')


# ── HTML builders ─────────────────────────────────────────────────────────────

def _build_seller_html(order: dict) -> str:
    items_rows = ''
    for item in order.get('items', []):
        subtotal = item['price'] * item['quantity']
        items_rows += f"""
        <tr>
          <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;"><strong>{item['productName']}</strong></td>
          <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;text-align:center;">{item['quantity']}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;text-align:right;">PKR {item['price']:,.0f}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;text-align:right;font-weight:600;">PKR {subtotal:,.0f}</td>
        </tr>"""

    order_id    = order.get('id', 'N/A')
    buyer_name  = order.get('buyerName', '')
    buyer_phone = order.get('buyerPhone', '')
    buyer_email = order.get('buyerEmail', '') or '—'
    buyer_city  = order.get('buyerCity', '')
    buyer_addr  = order.get('buyerAddress', '')
    notes       = order.get('notes') or '—'
    total       = order.get('total', 0)
    placed_at   = datetime.utcnow().strftime('%d %b %Y, %I:%M %p UTC')

    return f"""<!DOCTYPE html>
<html><head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0"
             style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);max-width:600px;width:100%;">
        <tr>
          <td style="background:linear-gradient(135deg,#1a1410,#2d2520);padding:28px 32px;text-align:center;">
            <h1 style="margin:0;color:#c9a96e;font-size:28px;font-weight:700;letter-spacing:4px;">TRENDZY</h1>
            <p style="margin:6px 0 0;color:rgba(255,255,255,0.7);font-size:13px;letter-spacing:2px;text-transform:uppercase;">New Order Received</p>
          </td>
        </tr>
        <tr>
          <td style="background:#fdf8f0;border-left:4px solid #c9a96e;padding:14px 32px;">
            <p style="margin:0;font-size:14px;color:#7a5a00;">
              🛍️ <strong>Order #{order_id}</strong> placed on {placed_at}. Process it promptly.
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:28px 32px 0;">
            <h2 style="margin:0 0 16px;font-size:14px;color:#1a1410;text-transform:uppercase;letter-spacing:2px;border-bottom:2px solid #f0ebe4;padding-bottom:8px;">Customer Details</h2>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr><td style="padding:6px 0;color:#9e9890;font-size:14px;width:130px;">👤 Name</td><td style="padding:6px 0;color:#1a1410;font-size:14px;font-weight:600;">{buyer_name}</td></tr>
              <tr><td style="padding:6px 0;color:#9e9890;font-size:14px;">📞 Phone</td><td style="padding:6px 0;color:#1a1410;font-size:14px;font-weight:600;">{buyer_phone}</td></tr>
              <tr><td style="padding:6px 0;color:#9e9890;font-size:14px;">✉️ Email</td><td style="padding:6px 0;color:#1a1410;font-size:14px;font-weight:600;">{buyer_email}</td></tr>
              <tr><td style="padding:6px 0;color:#9e9890;font-size:14px;">🏙️ City</td><td style="padding:6px 0;color:#1a1410;font-size:14px;font-weight:600;">{buyer_city}</td></tr>
              <tr><td style="padding:6px 0;color:#9e9890;font-size:14px;vertical-align:top;">📍 Address</td><td style="padding:6px 0;color:#1a1410;font-size:14px;font-weight:600;">{buyer_addr}</td></tr>
              <tr><td style="padding:6px 0;color:#9e9890;font-size:14px;vertical-align:top;">💬 Notes</td><td style="padding:6px 0;color:#6b6560;font-size:14px;font-style:italic;">{notes}</td></tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:28px 32px 0;">
            <h2 style="margin:0 0 16px;font-size:14px;color:#1a1410;text-transform:uppercase;letter-spacing:2px;border-bottom:2px solid #f0ebe4;padding-bottom:8px;">Order Items</h2>
            <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
              <thead><tr style="background:#faf7f4;">
                <th style="padding:10px 12px;text-align:left;font-size:11px;color:#9e9890;text-transform:uppercase;letter-spacing:1px;">Product</th>
                <th style="padding:10px 12px;text-align:center;font-size:11px;color:#9e9890;text-transform:uppercase;letter-spacing:1px;">Qty</th>
                <th style="padding:10px 12px;text-align:right;font-size:11px;color:#9e9890;text-transform:uppercase;letter-spacing:1px;">Unit Price</th>
                <th style="padding:10px 12px;text-align:right;font-size:11px;color:#9e9890;text-transform:uppercase;letter-spacing:1px;">Subtotal</th>
              </tr></thead>
              <tbody>{items_rows}</tbody>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:16px 32px 28px;">
            <table width="100%" cellpadding="0" cellspacing="0"><tr><td></td>
              <td style="width:220px;">
                <table width="100%" cellpadding="0" cellspacing="0" style="background:#faf7f4;border:1px solid #e8e0d6;border-radius:8px;padding:16px;">
                  <tr><td style="font-size:14px;color:#9e9890;">Payment</td><td style="font-size:14px;color:#1a1410;font-weight:600;text-align:right;">Cash on Delivery</td></tr>
                  <tr><td colspan="2"><div style="border-top:1px solid #e8e0d6;margin:10px 0;"></div></td></tr>
                  <tr><td style="font-size:18px;color:#c9a96e;font-weight:700;">Total</td><td style="font-size:18px;color:#c9a96e;font-weight:700;text-align:right;">PKR {total:,.0f}</td></tr>
                </table>
              </td>
            </tr></table>
          </td>
        </tr>
        <tr>
          <td style="background:#faf7f4;padding:20px 32px;text-align:center;border-top:1px solid #e8e0d6;">
            <p style="margin:0;font-size:12px;color:#b0a898;">© 2025 Trendzy · Automated notification</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body></html>"""


def _build_customer_html(order: dict) -> str:
    items_rows = ''
    for item in order.get('items', []):
        subtotal = item['price'] * item['quantity']
        items_rows += f"""
        <tr>
          <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;"><strong>{item['productName']}</strong></td>
          <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;text-align:center;">{item['quantity']}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;text-align:right;">PKR {item['price']:,.0f}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;text-align:right;font-weight:600;">PKR {subtotal:,.0f}</td>
        </tr>"""

    order_id    = order.get('id', 'N/A')
    buyer_name  = order.get('buyerName', 'Valued Customer')
    buyer_phone = order.get('buyerPhone', '')
    buyer_city  = order.get('buyerCity', '')
    buyer_addr  = order.get('buyerAddress', '')
    notes       = order.get('notes') or '—'
    total       = order.get('total', 0)
    placed_at   = datetime.utcnow().strftime('%d %b %Y, %I:%M %p UTC')

    return f"""<!DOCTYPE html>
<html><head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0"
             style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);max-width:600px;width:100%;">
        <tr>
          <td style="background:linear-gradient(135deg,#1a1410,#2d2520);padding:32px 32px 24px;text-align:center;">
            <h1 style="margin:0;color:#c9a96e;font-size:28px;font-weight:700;letter-spacing:4px;">TRENDZY</h1>
            <p style="margin:8px 0 0;color:rgba(255,255,255,0.8);font-size:14px;">Order Confirmed!</p>
          </td>
        </tr>
        <tr>
          <td style="background:#fdf8f0;border-left:4px solid #c9a96e;padding:16px 32px;">
            <p style="margin:0;font-size:15px;color:#7a5a00;">
              🎉 Thank you, <strong>{buyer_name}</strong>! Your order <strong>#{order_id}</strong> has been received.
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:28px 32px 0;">
            <h2 style="margin:0 0 16px;font-size:14px;color:#1a1410;text-transform:uppercase;letter-spacing:2px;border-bottom:2px solid #f0ebe4;padding-bottom:8px;">Delivery Details</h2>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr><td style="padding:6px 0;color:#9e9890;font-size:14px;width:130px;">📅 Date</td><td style="padding:6px 0;color:#1a1410;font-size:14px;font-weight:600;">{placed_at}</td></tr>
              <tr><td style="padding:6px 0;color:#9e9890;font-size:14px;">📞 Phone</td><td style="padding:6px 0;color:#1a1410;font-size:14px;font-weight:600;">{buyer_phone}</td></tr>
              <tr><td style="padding:6px 0;color:#9e9890;font-size:14px;">🏙️ City</td><td style="padding:6px 0;color:#1a1410;font-size:14px;font-weight:600;">{buyer_city}</td></tr>
              <tr><td style="padding:6px 0;color:#9e9890;font-size:14px;vertical-align:top;">📍 Address</td><td style="padding:6px 0;color:#1a1410;font-size:14px;font-weight:600;">{buyer_addr}</td></tr>
              <tr><td style="padding:6px 0;color:#9e9890;font-size:14px;vertical-align:top;">💬 Notes</td><td style="padding:6px 0;color:#6b6560;font-size:14px;font-style:italic;">{notes}</td></tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:28px 32px 0;">
            <h2 style="margin:0 0 16px;font-size:14px;color:#1a1410;text-transform:uppercase;letter-spacing:2px;border-bottom:2px solid #f0ebe4;padding-bottom:8px;">Your Items</h2>
            <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
              <thead><tr style="background:#faf7f4;">
                <th style="padding:10px 12px;text-align:left;font-size:11px;color:#9e9890;text-transform:uppercase;letter-spacing:1px;">Product</th>
                <th style="padding:10px 12px;text-align:center;font-size:11px;color:#9e9890;text-transform:uppercase;letter-spacing:1px;">Qty</th>
                <th style="padding:10px 12px;text-align:right;font-size:11px;color:#9e9890;text-transform:uppercase;letter-spacing:1px;">Unit Price</th>
                <th style="padding:10px 12px;text-align:right;font-size:11px;color:#9e9890;text-transform:uppercase;letter-spacing:1px;">Subtotal</th>
              </tr></thead>
              <tbody>{items_rows}</tbody>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:16px 32px 28px;">
            <table width="100%" cellpadding="0" cellspacing="0"><tr><td></td>
              <td style="width:240px;">
                <table width="100%" cellpadding="0" cellspacing="0" style="background:#faf7f4;border:1px solid #e8e0d6;border-radius:8px;padding:16px;">
                  <tr><td style="font-size:14px;color:#9e9890;">Payment</td><td style="font-size:14px;color:#1a1410;font-weight:600;text-align:right;">Cash on Delivery</td></tr>
                  <tr><td style="font-size:14px;color:#9e9890;padding-top:6px;">Delivery</td><td style="font-size:14px;color:#16a34a;font-weight:600;text-align:right;padding-top:6px;">Free</td></tr>
                  <tr><td colspan="2"><div style="border-top:1px solid #e8e0d6;margin:10px 0;"></div></td></tr>
                  <tr><td style="font-size:18px;color:#c9a96e;font-weight:700;">Total</td><td style="font-size:18px;color:#c9a96e;font-weight:700;text-align:right;">PKR {total:,.0f}</td></tr>
                </table>
              </td>
            </tr></table>
          </td>
        </tr>
        <tr>
          <td style="padding:0 32px 28px;">
            <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:14px 18px;">
              <p style="margin:0;font-size:13px;color:#166534;">
                💰 <strong>Cash on Delivery</strong> — Pay <strong>PKR {total:,.0f}</strong> when your order arrives. No advance payment needed!
              </p>
            </div>
          </td>
        </tr>
        <tr>
          <td style="background:#faf7f4;padding:20px 32px;text-align:center;border-top:1px solid #e8e0d6;">
            <p style="margin:0 0 6px;font-size:13px;color:#6b6560;">
              Questions? Contact us at <a href="mailto:{SELLER_EMAIL}" style="color:#c9a96e;text-decoration:none;">{SELLER_EMAIL}</a>
            </p>
            <p style="margin:0;font-size:12px;color:#b0a898;">© 2025 Trendzy · Thank you for shopping with us!</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body></html>"""


# ── Core send function ─────────────────────────────────────────────────────────

def _send_email(to_address: str, subject: str, plain_text: str, html_body: str) -> bool:
    if not GMAIL_USER or not GMAIL_PASS:
        print('[Email] ✗ GMAIL_USER or GMAIL_PASS not set — skipping.')
        return False

    try:
        msg = MIMEMultipart('alternative')
        msg['Subject'] = subject
        msg['From']    = FROM_ADDRESS
        msg['To']      = to_address

        msg.attach(MIMEText(plain_text, 'plain'))
        msg.attach(MIMEText(html_body,  'html'))

        print(f'[Email] Connecting to {SMTP_HOST}:{SMTP_PORT}...')
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=15) as server:
            server.ehlo()
            server.starttls()
            server.login(GMAIL_USER, GMAIL_PASS)
            server.sendmail(GMAIL_USER, to_address, msg.as_string())

        print(f'[Email] ✓ Sent → {to_address} | {subject}')
        return True

    except smtplib.SMTPAuthenticationError:
        print('[Email] ✗ AUTH FAILED — Check GMAIL_USER / GMAIL_PASS in .env')
        return False
    except smtplib.SMTPException as e:
        print(f'[Email] ✗ SMTP error: {e}')
        return False
    except Exception as e:
        print(f'[Email] ✗ Unexpected: {type(e).__name__}: {e}')
        return False


# ── Public API ─────────────────────────────────────────────────────────────────

def send_order_notification(order: dict) -> bool:
    order_id = order.get('id', 'N/A')
    buyer    = order.get('buyerName', 'Customer')
    total    = order.get('total', 0)

    # 1. Seller notification
    seller_plain = (
        f"New Order!\n\nOrder ID: {order_id}\n"
        f"Customer: {buyer}\nPhone: {order.get('buyerPhone','')}\n"
        f"Email: {order.get('buyerEmail','') or '—'}\n"
        f"City: {order.get('buyerCity','')}\nAddress: {order.get('buyerAddress','')}\n"
        f"Total: PKR {total:,.0f}\nPayment: Cash on Delivery\n\nItems:\n"
    )
    for item in order.get('items', []):
        seller_plain += f"  - {item['productName']} x{item['quantity']} @ PKR {item['price']:,.0f}\n"

    seller_ok = _send_email(
        to_address = SELLER_EMAIL,
        subject    = f'🛍️ New Order #{order_id} — PKR {total:,.0f} from {buyer}',
        plain_text = seller_plain,
        html_body  = _build_seller_html(order),
    )

    # 2. Customer receipt (if they provided email)
    customer_email = (order.get('buyerEmail') or '').strip()
    if customer_email:
        customer_plain = (
            f"Hi {buyer},\n\nThank you for your order at Trendzy!\n\n"
            f"Order ID: {order_id}\nTotal: PKR {total:,.0f}\nPayment: Cash on Delivery\n"
            f"Deliver to: {order.get('buyerAddress','')}, {order.get('buyerCity','')}\n\nItems:\n"
        )
        for item in order.get('items', []):
            customer_plain += f"  - {item['productName']} x{item['quantity']} @ PKR {item['price']:,.0f}\n"
        customer_plain += f"\nQuestions? Email us at {SELLER_EMAIL}\n\nThank you for shopping with Trendzy!"

        _send_email(
            to_address = customer_email,
            subject    = f'✅ Your Trendzy Order #{order_id} is Confirmed!',
            plain_text = customer_plain,
            html_body  = _build_customer_html(order),
        )
    else:
        print(f'[Email] No customer email — skipping receipt for Order #{order_id}')

    return seller_ok
