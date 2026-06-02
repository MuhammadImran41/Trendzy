"""
Email notification service for GlowMart — powered by Resend.
- Sends order notification to the seller (meharraza371@gmail.com)
- Sends an order receipt to the customer (if they provided an email)
"""
import os
import resend
from datetime import datetime

RESEND_API_KEY = os.getenv('RESEND_API_KEY', '')
SELLER_EMAIL   = os.getenv('SELLER_EMAIL', 'meharraza371@gmail.com')

# Resend test domain — swap with your custom domain once you have one
FROM_ADDRESS = 'GlowMart <onboarding@resend.dev>'

# Log config on import
print(f'[Email] RESEND_API_KEY : {"✓ set (" + str(len(RESEND_API_KEY)) + " chars)" if RESEND_API_KEY else "✗ NOT SET — emails will not send"}')
print(f'[Email] SELLER_EMAIL  : {SELLER_EMAIL}')
print(f'[Email] FROM_ADDRESS  : {FROM_ADDRESS}')


# ── HTML builders ─────────────────────────────────────────────────────────────

def _build_seller_html(order: dict) -> str:
    """Seller notification — new order received."""
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
<html>
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0"
             style="background:#fff;border-radius:12px;overflow:hidden;
                    box-shadow:0 4px 24px rgba(0,0,0,0.08);max-width:600px;width:100%;">

        <tr>
          <td style="background:linear-gradient(135deg,#e8347a,#c4205f);padding:28px 32px;text-align:center;">
            <h1 style="margin:0;color:#fff;font-size:26px;font-weight:700;">🌸 GlowMart</h1>
            <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">New Order Received</p>
          </td>
        </tr>

        <tr>
          <td style="background:#fff8f0;border-left:4px solid #e8347a;padding:14px 32px;">
            <p style="margin:0;font-size:14px;color:#7a3a00;">
              🛍️ <strong>Order #{order_id}</strong> was placed on {placed_at}. Please process it promptly.
            </p>
          </td>
        </tr>

        <tr>
          <td style="padding:28px 32px 0;">
            <h2 style="margin:0 0 16px;font-size:16px;color:#1a1a1a;text-transform:uppercase;
                       letter-spacing:1px;border-bottom:2px solid #f0f0f0;padding-bottom:8px;">
              Customer Details
            </h2>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:6px 0;color:#666;font-size:14px;width:130px;">👤 Name</td>
                <td style="padding:6px 0;color:#1a1a1a;font-size:14px;font-weight:600;">{buyer_name}</td>
              </tr>
              <tr>
                <td style="padding:6px 0;color:#666;font-size:14px;">📞 Phone</td>
                <td style="padding:6px 0;color:#1a1a1a;font-size:14px;font-weight:600;">{buyer_phone}</td>
              </tr>
              <tr>
                <td style="padding:6px 0;color:#666;font-size:14px;">✉️ Email</td>
                <td style="padding:6px 0;color:#1a1a1a;font-size:14px;font-weight:600;">{buyer_email}</td>
              </tr>
              <tr>
                <td style="padding:6px 0;color:#666;font-size:14px;">🏙️ City</td>
                <td style="padding:6px 0;color:#1a1a1a;font-size:14px;font-weight:600;">{buyer_city}</td>
              </tr>
              <tr>
                <td style="padding:6px 0;color:#666;font-size:14px;vertical-align:top;">📍 Address</td>
                <td style="padding:6px 0;color:#1a1a1a;font-size:14px;font-weight:600;">{buyer_addr}</td>
              </tr>
              <tr>
                <td style="padding:6px 0;color:#666;font-size:14px;vertical-align:top;">💬 Notes</td>
                <td style="padding:6px 0;color:#555;font-size:14px;font-style:italic;">{notes}</td>
              </tr>
            </table>
          </td>
        </tr>

        <tr>
          <td style="padding:28px 32px 0;">
            <h2 style="margin:0 0 16px;font-size:16px;color:#1a1a1a;text-transform:uppercase;
                       letter-spacing:1px;border-bottom:2px solid #f0f0f0;padding-bottom:8px;">
              Order Items
            </h2>
            <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
              <thead>
                <tr style="background:#fafafa;">
                  <th style="padding:10px 12px;text-align:left;font-size:12px;color:#888;text-transform:uppercase;">Product</th>
                  <th style="padding:10px 12px;text-align:center;font-size:12px;color:#888;text-transform:uppercase;">Qty</th>
                  <th style="padding:10px 12px;text-align:right;font-size:12px;color:#888;text-transform:uppercase;">Unit Price</th>
                  <th style="padding:10px 12px;text-align:right;font-size:12px;color:#888;text-transform:uppercase;">Subtotal</th>
                </tr>
              </thead>
              <tbody>{items_rows}</tbody>
            </table>
          </td>
        </tr>

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
                      <td style="font-size:14px;color:#1a1a1a;font-weight:600;text-align:right;">Cash on Delivery</td>
                    </tr>
                    <tr>
                      <td style="padding-top:10px;font-size:18px;color:#e8347a;font-weight:700;">Total</td>
                      <td style="padding-top:10px;font-size:18px;color:#e8347a;font-weight:700;text-align:right;">PKR {total:,.0f}</td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <tr>
          <td style="background:#fafafa;padding:20px 32px;text-align:center;border-top:1px solid #f0f0f0;">
            <p style="margin:0;font-size:12px;color:#aaa;">© 2025 GlowMart · Automated notification</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>"""


def _build_customer_html(order: dict) -> str:
    """Customer receipt — order confirmation."""
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

    order_id    = order.get('id', 'N/A')
    buyer_name  = order.get('buyerName', 'Valued Customer')
    buyer_phone = order.get('buyerPhone', '')
    buyer_city  = order.get('buyerCity', '')
    buyer_addr  = order.get('buyerAddress', '')
    notes       = order.get('notes') or '—'
    total       = order.get('total', 0)
    placed_at   = datetime.utcnow().strftime('%d %b %Y, %I:%M %p UTC')

    return f"""<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0"
             style="background:#fff;border-radius:12px;overflow:hidden;
                    box-shadow:0 4px 24px rgba(0,0,0,0.08);max-width:600px;width:100%;">

        <tr>
          <td style="background:linear-gradient(135deg,#e8347a,#c4205f);padding:32px 32px 24px;text-align:center;">
            <h1 style="margin:0;color:#fff;font-size:28px;font-weight:700;">🌸 GlowMart</h1>
            <p style="margin:8px 0 0;color:rgba(255,255,255,0.9);font-size:15px;">Order Confirmed!</p>
          </td>
        </tr>

        <tr>
          <td style="background:#fff8f0;border-left:4px solid #e8347a;padding:16px 32px;">
            <p style="margin:0;font-size:15px;color:#7a3a00;">
              🎉 Thank you, <strong>{buyer_name}</strong>! Your order
              <strong>#{order_id}</strong> has been received and is being prepared.
            </p>
          </td>
        </tr>

        <tr>
          <td style="padding:28px 32px 0;">
            <h2 style="margin:0 0 16px;font-size:16px;color:#1a1a1a;text-transform:uppercase;
                       letter-spacing:1px;border-bottom:2px solid #f0f0f0;padding-bottom:8px;">
              Delivery Details
            </h2>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:6px 0;color:#666;font-size:14px;width:130px;">📅 Date</td>
                <td style="padding:6px 0;color:#1a1a1a;font-size:14px;font-weight:600;">{placed_at}</td>
              </tr>
              <tr>
                <td style="padding:6px 0;color:#666;font-size:14px;">📞 Phone</td>
                <td style="padding:6px 0;color:#1a1a1a;font-size:14px;font-weight:600;">{buyer_phone}</td>
              </tr>
              <tr>
                <td style="padding:6px 0;color:#666;font-size:14px;">🏙️ City</td>
                <td style="padding:6px 0;color:#1a1a1a;font-size:14px;font-weight:600;">{buyer_city}</td>
              </tr>
              <tr>
                <td style="padding:6px 0;color:#666;font-size:14px;vertical-align:top;">📍 Address</td>
                <td style="padding:6px 0;color:#1a1a1a;font-size:14px;font-weight:600;">{buyer_addr}</td>
              </tr>
              <tr>
                <td style="padding:6px 0;color:#666;font-size:14px;vertical-align:top;">💬 Notes</td>
                <td style="padding:6px 0;color:#555;font-size:14px;font-style:italic;">{notes}</td>
              </tr>
            </table>
          </td>
        </tr>

        <tr>
          <td style="padding:28px 32px 0;">
            <h2 style="margin:0 0 16px;font-size:16px;color:#1a1a1a;text-transform:uppercase;
                       letter-spacing:1px;border-bottom:2px solid #f0f0f0;padding-bottom:8px;">
              Your Items
            </h2>
            <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
              <thead>
                <tr style="background:#fafafa;">
                  <th style="padding:10px 12px;text-align:left;font-size:12px;color:#888;text-transform:uppercase;">Product</th>
                  <th style="padding:10px 12px;text-align:center;font-size:12px;color:#888;text-transform:uppercase;">Qty</th>
                  <th style="padding:10px 12px;text-align:right;font-size:12px;color:#888;text-transform:uppercase;">Unit Price</th>
                  <th style="padding:10px 12px;text-align:right;font-size:12px;color:#888;text-transform:uppercase;">Subtotal</th>
                </tr>
              </thead>
              <tbody>{items_rows}</tbody>
            </table>
          </td>
        </tr>

        <tr>
          <td style="padding:16px 32px 28px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td></td>
                <td style="width:240px;">
                  <table width="100%" cellpadding="0" cellspacing="0"
                         style="background:#fdf0f5;border-radius:8px;padding:16px;">
                    <tr>
                      <td style="font-size:14px;color:#666;">Payment Method</td>
                      <td style="font-size:14px;color:#1a1a1a;font-weight:600;text-align:right;">Cash on Delivery</td>
                    </tr>
                    <tr>
                      <td style="font-size:14px;color:#666;padding-top:8px;">Delivery Fee</td>
                      <td style="font-size:14px;color:#16a34a;font-weight:600;text-align:right;padding-top:8px;">Free</td>
                    </tr>
                    <tr>
                      <td colspan="2"><div style="border-top:1px solid #e8d0dc;margin:10px 0;"></div></td>
                    </tr>
                    <tr>
                      <td style="font-size:18px;color:#e8347a;font-weight:700;">Total</td>
                      <td style="font-size:18px;color:#e8347a;font-weight:700;text-align:right;">PKR {total:,.0f}</td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <tr>
          <td style="padding:0 32px 28px;">
            <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:14px 18px;">
              <p style="margin:0;font-size:13px;color:#166534;">
                💰 <strong>Cash on Delivery</strong> — You will pay
                <strong>PKR {total:,.0f}</strong> when your order arrives. No advance payment needed!
              </p>
            </div>
          </td>
        </tr>

        <tr>
          <td style="background:#fafafa;padding:20px 32px;text-align:center;border-top:1px solid #f0f0f0;">
            <p style="margin:0 0 6px;font-size:13px;color:#555;">
              Questions? Contact us at
              <a href="mailto:{SELLER_EMAIL}" style="color:#e8347a;text-decoration:none;">{SELLER_EMAIL}</a>
            </p>
            <p style="margin:0;font-size:12px;color:#aaa;">© 2025 GlowMart · Thank you for shopping with us!</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>"""


# ── Core send function ────────────────────────────────────────────────────────

def _send_email(to_address: str, subject: str, plain_text: str, html_body: str) -> bool:
    """Send a single email via Resend's HTTP API (no SMTP, works on Railway)."""
    if not RESEND_API_KEY:
        print('[Email] ✗ RESEND_API_KEY not set — skipping email.')
        return False

    try:
        resend.api_key = RESEND_API_KEY
        params: resend.Emails.SendParams = {
            'from':    FROM_ADDRESS,
            'to':      [to_address],
            'subject': subject,
            'html':    html_body,
            'text':    plain_text,
        }
        response = resend.Emails.send(params)
        print(f'[Email] ✓ Sent via Resend → {to_address} | id={response.get("id", "?")}')
        return True

    except Exception as e:
        print(f'[Email] ✗ Resend error: {type(e).__name__}: {e}')
        return False


# ── Public API ────────────────────────────────────────────────────────────────

def send_order_notification(order: dict) -> bool:
    """
    Called after every new order:
      1. Sends a notification email to the seller.
      2. Sends a receipt email to the customer (if they gave an email).
    Returns True if the seller email succeeded.
    """
    order_id = order.get('id', 'N/A')
    buyer    = order.get('buyerName', 'Customer')
    total    = order.get('total', 0)

    # ── 1. Seller notification ─────────────────────────────────────────────
    seller_plain = (
        f"New Order Received!\n\n"
        f"Order ID : {order_id}\n"
        f"Customer : {buyer}\n"
        f"Phone    : {order.get('buyerPhone', '')}\n"
        f"Email    : {order.get('buyerEmail', '') or '—'}\n"
        f"City     : {order.get('buyerCity', '')}\n"
        f"Address  : {order.get('buyerAddress', '')}\n"
        f"Total    : PKR {total:,.0f}\n"
        f"Payment  : Cash on Delivery\n\nItems:\n"
    )
    for item in order.get('items', []):
        seller_plain += f"  - {item['productName']} x{item['quantity']} @ PKR {item['price']:,.0f}\n"

    seller_ok = _send_email(
        to_address = SELLER_EMAIL,
        subject    = f'🛍️ New Order #{order_id} — PKR {total:,.0f} from {buyer}',
        plain_text = seller_plain,
        html_body  = _build_seller_html(order),
    )

    # ── 2. Customer receipt ────────────────────────────────────────────────
    customer_email = (order.get('buyerEmail') or '').strip()
    if customer_email:
        customer_plain = (
            f"Hi {buyer},\n\n"
            f"Thank you for your order at GlowMart!\n\n"
            f"Order ID : {order_id}\n"
            f"Total    : PKR {total:,.0f}\n"
            f"Payment  : Cash on Delivery\n\n"
            f"Deliver to: {order.get('buyerAddress', '')}, {order.get('buyerCity', '')}\n\n"
            f"Items:\n"
        )
        for item in order.get('items', []):
            customer_plain += f"  - {item['productName']} x{item['quantity']} @ PKR {item['price']:,.0f}\n"
        customer_plain += f"\nQuestions? Email us at {SELLER_EMAIL}\n\nThank you for shopping with GlowMart!"

        _send_email(
            to_address = customer_email,
            subject    = f'🌸 Your GlowMart Order #{order_id} is Confirmed!',
            plain_text = customer_plain,
            html_body  = _build_customer_html(order),
        )
    else:
        print(f'[Email] No customer email — skipping receipt for Order #{order_id}')

    return seller_ok
