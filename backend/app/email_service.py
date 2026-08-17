"""
Email notification service for Trendzy — Gmail SMTP.
Premium designed emails for seller notifications and customer receipts.
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


def _build_seller_html(order: dict) -> str:
    items_rows = ''
    for item in order.get('items', []):
        subtotal = item['price'] * item['quantity']
        items_rows += f"""
        <tr>
          <td style="padding:14px 16px;border-bottom:1px solid #f5f0e8;">
            <div style="font-weight:600;color:#1a1410;font-size:14px;">{item['productName']}</div>
          </td>
          <td style="padding:14px 16px;border-bottom:1px solid #f5f0e8;text-align:center;color:#6b6560;font-size:14px;">{item['quantity']}</td>
          <td style="padding:14px 16px;border-bottom:1px solid #f5f0e8;text-align:right;color:#6b6560;font-size:14px;">PKR {item['price']:,.0f}</td>
          <td style="padding:14px 16px;border-bottom:1px solid #f5f0e8;text-align:right;font-weight:700;color:#1a1410;font-size:14px;">PKR {subtotal:,.0f}</td>
        </tr>"""

    order_id    = order.get('id', 'N/A')
    buyer_name  = order.get('buyerName', '')
    buyer_phone = order.get('buyerPhone', '')
    buyer_email = order.get('buyerEmail', '') or '—'
    buyer_city  = order.get('buyerCity', '')
    buyer_addr  = order.get('buyerAddress', '')
    notes       = order.get('notes') or '—'
    total       = order.get('total', 0)
    placed_at   = datetime.utcnow().strftime('%d %b %Y · %I:%M %p UTC')

    return f"""<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>New Order — Trendzy</title>
</head>
<body style="margin:0;padding:0;background:#f0ebe4;font-family:'Segoe UI',Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f0ebe4;padding:40px 0;">
<tr><td align="center">
<table width="620" cellpadding="0" cellspacing="0" style="max-width:620px;width:100%;">

  <!-- HEADER -->
  <tr><td style="background:#1a1410;padding:36px 40px;border-radius:16px 16px 0 0;text-align:center;">
    <div style="font-size:11px;letter-spacing:6px;color:#c9a96e;text-transform:uppercase;margin-bottom:10px;">Premium Fashion Store</div>
    <div style="font-size:36px;font-weight:800;color:#ffffff;letter-spacing:8px;margin-bottom:6px;">TRENDZY</div>
    <div style="width:60px;height:2px;background:linear-gradient(90deg,transparent,#c9a96e,transparent);margin:12px auto;"></div>
    <div style="font-size:13px;color:rgba(255,255,255,0.5);letter-spacing:3px;text-transform:uppercase;">New Order Alert</div>
  </td></tr>

  <!-- GOLD ALERT BANNER -->
  <tr><td style="background:linear-gradient(135deg,#c9a96e,#a0782a);padding:18px 40px;">
    <table width="100%" cellpadding="0" cellspacing="0"><tr>
      <td style="font-size:15px;font-weight:700;color:#1a1410;">🛍️ Order #{order_id}</td>
      <td style="text-align:right;font-size:13px;color:#1a1410;opacity:0.8;">{placed_at}</td>
    </tr></table>
  </td></tr>

  <!-- BODY -->
  <tr><td style="background:#ffffff;padding:0;">

    <!-- CUSTOMER INFO -->
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 40px 0;">
      <tr><td colspan="2" style="padding-bottom:16px;border-bottom:1px solid #f0ebe4;">
        <div style="font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#c9a96e;font-weight:700;">Customer Information</div>
      </td></tr>
      <tr><td height="16"></td></tr>
      <tr>
        <td width="50%" style="padding:0 16px 0 0;vertical-align:top;">
          <table cellpadding="0" cellspacing="0">
            <tr><td style="padding:7px 0;">
              <div style="font-size:10px;color:#b0a898;text-transform:uppercase;letter-spacing:1px;margin-bottom:3px;">Full Name</div>
              <div style="font-size:15px;font-weight:600;color:#1a1410;">{buyer_name}</div>
            </td></tr>
            <tr><td style="padding:7px 0;">
              <div style="font-size:10px;color:#b0a898;text-transform:uppercase;letter-spacing:1px;margin-bottom:3px;">Phone</div>
              <div style="font-size:15px;font-weight:600;color:#1a1410;">{buyer_phone}</div>
            </td></tr>
            <tr><td style="padding:7px 0;">
              <div style="font-size:10px;color:#b0a898;text-transform:uppercase;letter-spacing:1px;margin-bottom:3px;">Email</div>
              <div style="font-size:14px;color:#6b6560;">{buyer_email}</div>
            </td></tr>
          </table>
        </td>
        <td width="50%" style="vertical-align:top;">
          <table cellpadding="0" cellspacing="0">
            <tr><td style="padding:7px 0;">
              <div style="font-size:10px;color:#b0a898;text-transform:uppercase;letter-spacing:1px;margin-bottom:3px;">City</div>
              <div style="font-size:15px;font-weight:600;color:#1a1410;">{buyer_city}</div>
            </td></tr>
            <tr><td style="padding:7px 0;">
              <div style="font-size:10px;color:#b0a898;text-transform:uppercase;letter-spacing:1px;margin-bottom:3px;">Delivery Address</div>
              <div style="font-size:14px;color:#6b6560;line-height:1.5;">{buyer_addr}</div>
            </td></tr>
            <tr><td style="padding:7px 0;">
              <div style="font-size:10px;color:#b0a898;text-transform:uppercase;letter-spacing:1px;margin-bottom:3px;">Notes</div>
              <div style="font-size:14px;color:#6b6560;font-style:italic;">{notes}</div>
            </td></tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- DIVIDER -->
    <div style="margin:28px 40px;height:1px;background:#f0ebe4;"></div>

    <!-- ORDER ITEMS -->
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:0 40px;">
      <tr><td colspan="4" style="padding-bottom:16px;">
        <div style="font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#c9a96e;font-weight:700;">Order Items</div>
      </td></tr>
      <tr style="background:#faf7f4;">
        <th style="padding:10px 16px;text-align:left;font-size:10px;color:#b0a898;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Product</th>
        <th style="padding:10px 16px;text-align:center;font-size:10px;color:#b0a898;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Qty</th>
        <th style="padding:10px 16px;text-align:right;font-size:10px;color:#b0a898;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Price</th>
        <th style="padding:10px 16px;text-align:right;font-size:10px;color:#b0a898;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Total</th>
      </tr>
      {items_rows}
    </table>

    <!-- TOTAL BOX -->
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:24px 40px 36px;">
      <tr><td></td><td width="260">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#1a1410;border-radius:12px;padding:20px 24px;">
          <tr>
            <td style="font-size:12px;color:rgba(255,255,255,0.5);padding-bottom:6px;">Payment Method</td>
            <td style="text-align:right;font-size:12px;color:#c9a96e;font-weight:600;padding-bottom:6px;">Cash on Delivery</td>
          </tr>
          <tr><td colspan="2"><div style="height:1px;background:rgba(201,169,110,0.2);margin:8px 0;"></div></td></tr>
          <tr>
            <td style="font-size:20px;color:#ffffff;font-weight:700;">Order Total</td>
            <td style="text-align:right;font-size:22px;color:#c9a96e;font-weight:800;">PKR {total:,.0f}</td>
          </tr>
        </table>
      </td></tr>
    </table>

  </td></tr>

  <!-- FOOTER -->
  <tr><td style="background:#1a1410;padding:24px 40px;border-radius:0 0 16px 16px;text-align:center;">
    <div style="font-size:11px;color:rgba(255,255,255,0.35);letter-spacing:1px;">© 2025 TRENDZY · Automated Order Notification</div>
  </td></tr>

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
          <td style="padding:14px 16px;border-bottom:1px solid #f5f0e8;">
            <div style="font-weight:600;color:#1a1410;font-size:14px;">{item['productName']}</div>
          </td>
          <td style="padding:14px 16px;border-bottom:1px solid #f5f0e8;text-align:center;color:#6b6560;font-size:14px;">{item['quantity']}</td>
          <td style="padding:14px 16px;border-bottom:1px solid #f5f0e8;text-align:right;color:#6b6560;font-size:14px;">PKR {item['price']:,.0f}</td>
          <td style="padding:14px 16px;border-bottom:1px solid #f5f0e8;text-align:right;font-weight:700;color:#1a1410;font-size:14px;">PKR {subtotal:,.0f}</td>
        </tr>"""

    order_id    = order.get('id', 'N/A')
    buyer_name  = order.get('buyerName', 'Valued Customer')
    buyer_phone = order.get('buyerPhone', '')
    buyer_city  = order.get('buyerCity', '')
    buyer_addr  = order.get('buyerAddress', '')
    notes       = order.get('notes') or '—'
    total       = order.get('total', 0)
    placed_at   = datetime.utcnow().strftime('%d %b %Y · %I:%M %p UTC')

    return f"""<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Order Confirmed — Trendzy</title>
</head>
<body style="margin:0;padding:0;background:#f0ebe4;font-family:'Segoe UI',Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f0ebe4;padding:40px 0;">
<tr><td align="center">
<table width="620" cellpadding="0" cellspacing="0" style="max-width:620px;width:100%;">

  <!-- HEADER -->
  <tr><td style="background:#1a1410;padding:40px 40px 32px;border-radius:16px 16px 0 0;text-align:center;">
    <div style="font-size:11px;letter-spacing:6px;color:#c9a96e;text-transform:uppercase;margin-bottom:12px;">Premium Fashion Store</div>
    <div style="font-size:38px;font-weight:800;color:#ffffff;letter-spacing:8px;margin-bottom:8px;">TRENDZY</div>
    <div style="width:60px;height:2px;background:linear-gradient(90deg,transparent,#c9a96e,transparent);margin:14px auto;"></div>
    <div style="font-size:22px;font-weight:300;color:rgba(255,255,255,0.85);letter-spacing:2px;">Order Confirmed ✓</div>
  </td></tr>

  <!-- THANK YOU BANNER -->
  <tr><td style="background:linear-gradient(135deg,#c9a96e,#a0782a);padding:22px 40px;text-align:center;">
    <div style="font-size:16px;font-weight:700;color:#1a1410;">Thank you, {buyer_name}! 🎉</div>
    <div style="font-size:13px;color:rgba(26,20,16,0.7);margin-top:4px;">Your order has been received and is being prepared.</div>
  </td></tr>

  <!-- BODY -->
  <tr><td style="background:#ffffff;">

    <!-- ORDER ID BADGE -->
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 40px 0;">
      <tr><td style="text-align:center;padding-bottom:28px;">
        <div style="display:inline-block;background:#faf7f4;border:1px solid #e8e0d6;border-radius:10px;padding:16px 32px;display:table;margin:0 auto;">
          <div style="font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#b0a898;margin-bottom:6px;">Order Reference</div>
          <div style="font-size:20px;font-weight:800;color:#c9a96e;letter-spacing:2px;">#{order_id}</div>
          <div style="font-size:11px;color:#b0a898;margin-top:4px;">{placed_at}</div>
        </div>
      </td></tr>
    </table>

    <!-- COD NOTICE -->
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:0 40px 28px;">
      <tr><td style="background:#f0fdf4;border:1px solid #86efac;border-radius:10px;padding:16px 20px;">
        <table width="100%" cellpadding="0" cellspacing="0"><tr>
          <td width="36" style="vertical-align:top;">
            <div style="width:32px;height:32px;background:#16a34a;border-radius:50%;text-align:center;line-height:32px;font-size:16px;">💰</div>
          </td>
          <td style="padding-left:12px;">
            <div style="font-size:14px;font-weight:700;color:#166534;">Cash on Delivery</div>
            <div style="font-size:13px;color:#16a34a;margin-top:2px;">Pay <strong>PKR {total:,.0f}</strong> when your order arrives. No advance payment!</div>
          </td>
        </tr></table>
      </td></tr>
    </table>

    <!-- DELIVERY INFO -->
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:0 40px 28px;">
      <tr><td style="padding-bottom:14px;border-bottom:1px solid #f0ebe4;">
        <div style="font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#c9a96e;font-weight:700;">Delivery Details</div>
      </td></tr>
      <tr><td height="16"></td></tr>
      <tr>
        <td width="50%" style="padding-right:16px;vertical-align:top;">
          <div style="padding:8px 0;">
            <div style="font-size:10px;color:#b0a898;text-transform:uppercase;letter-spacing:1px;margin-bottom:3px;">Phone</div>
            <div style="font-size:15px;font-weight:600;color:#1a1410;">{buyer_phone}</div>
          </div>
          <div style="padding:8px 0;">
            <div style="font-size:10px;color:#b0a898;text-transform:uppercase;letter-spacing:1px;margin-bottom:3px;">City</div>
            <div style="font-size:15px;font-weight:600;color:#1a1410;">{buyer_city}</div>
          </div>
        </td>
        <td width="50%" style="vertical-align:top;">
          <div style="padding:8px 0;">
            <div style="font-size:10px;color:#b0a898;text-transform:uppercase;letter-spacing:1px;margin-bottom:3px;">Delivery Address</div>
            <div style="font-size:14px;color:#6b6560;line-height:1.5;">{buyer_addr}</div>
          </div>
          <div style="padding:8px 0;">
            <div style="font-size:10px;color:#b0a898;text-transform:uppercase;letter-spacing:1px;margin-bottom:3px;">Notes</div>
            <div style="font-size:13px;color:#9e9890;font-style:italic;">{notes}</div>
          </div>
        </td>
      </tr>
    </table>

    <!-- DIVIDER -->
    <div style="margin:0 40px 28px;height:1px;background:#f0ebe4;"></div>

    <!-- ORDER ITEMS -->
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:0 40px;">
      <tr><td colspan="4" style="padding-bottom:14px;">
        <div style="font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#c9a96e;font-weight:700;">Your Items</div>
      </td></tr>
      <tr style="background:#faf7f4;">
        <th style="padding:10px 16px;text-align:left;font-size:10px;color:#b0a898;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Product</th>
        <th style="padding:10px 16px;text-align:center;font-size:10px;color:#b0a898;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Qty</th>
        <th style="padding:10px 16px;text-align:right;font-size:10px;color:#b0a898;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Price</th>
        <th style="padding:10px 16px;text-align:right;font-size:10px;color:#b0a898;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Total</th>
      </tr>
      {items_rows}
    </table>

    <!-- TOTAL -->
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:24px 40px 36px;">
      <tr><td></td><td width="260">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#1a1410;border-radius:12px;padding:20px 24px;">
          <tr>
            <td style="font-size:12px;color:rgba(255,255,255,0.5);padding-bottom:6px;">Payment</td>
            <td style="text-align:right;font-size:12px;color:#c9a96e;font-weight:600;padding-bottom:6px;">Cash on Delivery</td>
          </tr>
          <tr>
            <td style="font-size:12px;color:rgba(255,255,255,0.5);padding-bottom:6px;">Delivery</td>
            <td style="text-align:right;font-size:12px;color:#4ade80;font-weight:600;padding-bottom:6px;">Free</td>
          </tr>
          <tr><td colspan="2"><div style="height:1px;background:rgba(201,169,110,0.25);margin:8px 0;"></div></td></tr>
          <tr>
            <td style="font-size:18px;color:#ffffff;font-weight:700;">You Pay</td>
            <td style="text-align:right;font-size:22px;color:#c9a96e;font-weight:800;">PKR {total:,.0f}</td>
          </tr>
        </table>
      </td></tr>
    </table>

    <!-- DELIVERY TIMELINE -->
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:0 40px 36px;">
      <tr><td style="background:#faf7f4;border:1px solid #e8e0d6;border-radius:12px;padding:20px 24px;">
        <div style="font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#c9a96e;font-weight:700;margin-bottom:16px;">Delivery Timeline</div>
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="text-align:center;padding:0 8px;">
              <div style="width:36px;height:36px;background:#1a1410;border-radius:50%;margin:0 auto 8px;line-height:36px;text-align:center;font-size:14px;">📞</div>
              <div style="font-size:11px;font-weight:700;color:#1a1410;">Confirmed</div>
              <div style="font-size:10px;color:#b0a898;margin-top:2px;">Today</div>
            </td>
            <td style="color:#e8e0d6;font-size:20px;text-align:center;">›</td>
            <td style="text-align:center;padding:0 8px;">
              <div style="width:36px;height:36px;background:#c9a96e;border-radius:50%;margin:0 auto 8px;line-height:36px;text-align:center;font-size:14px;">📦</div>
              <div style="font-size:11px;font-weight:700;color:#1a1410;">Dispatched</div>
              <div style="font-size:10px;color:#b0a898;margin-top:2px;">1-2 Days</div>
            </td>
            <td style="color:#e8e0d6;font-size:20px;text-align:center;">›</td>
            <td style="text-align:center;padding:0 8px;">
              <div style="width:36px;height:36px;background:#e8e0d6;border-radius:50%;margin:0 auto 8px;line-height:36px;text-align:center;font-size:14px;">🚚</div>
              <div style="font-size:11px;font-weight:700;color:#1a1410;">On the Way</div>
              <div style="font-size:10px;color:#b0a898;margin-top:2px;">2-4 Days</div>
            </td>
            <td style="color:#e8e0d6;font-size:20px;text-align:center;">›</td>
            <td style="text-align:center;padding:0 8px;">
              <div style="width:36px;height:36px;background:#e8e0d6;border-radius:50%;margin:0 auto 8px;line-height:36px;text-align:center;font-size:14px;">✅</div>
              <div style="font-size:11px;font-weight:700;color:#1a1410;">Delivered</div>
              <div style="font-size:10px;color:#b0a898;margin-top:2px;">Pay COD</div>
            </td>
          </tr>
        </table>
      </td></tr>
    </table>

  </td></tr>

  <!-- FOOTER -->
  <tr><td style="background:#1a1410;padding:28px 40px;border-radius:0 0 16px 16px;">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="font-size:13px;color:rgba(255,255,255,0.6);">Questions? We're here to help.</td>
        <td style="text-align:right;">
          <a href="mailto:{SELLER_EMAIL}" style="color:#c9a96e;text-decoration:none;font-size:13px;">{SELLER_EMAIL}</a>
        </td>
      </tr>
      <tr><td colspan="2" height="12"></td></tr>
      <tr><td colspan="2" style="text-align:center;font-size:11px;color:rgba(255,255,255,0.25);letter-spacing:1px;">
        © 2025 TRENDZY · Premium Fashion Delivered Across Pakistan
      </td></tr>
    </table>
  </td></tr>

</table>
</td></tr>
</table>
</body></html>"""


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


def send_order_notification(order: dict) -> bool:
    order_id = order.get('id', 'N/A')
    buyer    = order.get('buyerName', 'Customer')
    total    = order.get('total', 0)

    # Seller notification
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

    # Customer receipt
    customer_email = (order.get('buyerEmail') or '').strip()
    if customer_email:
        customer_plain = (
            f"Hi {buyer},\n\nThank you for your order at Trendzy!\n\n"
            f"Order ID: {order_id}\nTotal: PKR {total:,.0f}\nPayment: Cash on Delivery\n"
            f"Deliver to: {order.get('buyerAddress','')}, {order.get('buyerCity','')}\n\nItems:\n"
        )
        for item in order.get('items', []):
            customer_plain += f"  - {item['productName']} x{item['quantity']} @ PKR {item['price']:,.0f}\n"
        customer_plain += f"\nQuestions? Email: {SELLER_EMAIL}\n\nThank you for shopping with Trendzy!"

        _send_email(
            to_address = customer_email,
            subject    = f'✅ Your Trendzy Order #{order_id} is Confirmed!',
            plain_text = customer_plain,
            html_body  = _build_customer_html(order),
        )
    else:
        print(f'[Email] No customer email — skipping receipt for Order #{order_id}')

    return seller_ok
