from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
import sys
import asyncio

# Fix for Playwright on Windows — must use SelectorEventLoop
if sys.platform == 'win32':
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

load_dotenv()

from app.database import init_db
from app.routes import products, orders, scraper, reviews
from app.email_service import send_order_notification, BREVO_USER, BREVO_PASS, SELLER_EMAIL, FROM_ADDRESS

app = FastAPI(title='GlowMart API', version='1.0.0')

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=False,
    allow_methods=['*'],
    allow_headers=['*'],
)

# Create tables on startup
@app.on_event('startup')
def startup():
    try:
        init_db()
    except Exception as e:
        print(f'[DB] Warning: Could not initialize database: {e}')
        print('[DB] App will start anyway — check DATABASE_URL variable')

app.include_router(products.router, prefix='/api/products', tags=['products'])
app.include_router(orders.router,   prefix='/api/orders',   tags=['orders'])
app.include_router(scraper.router,  prefix='/api/scraper',  tags=['scraper'])
app.include_router(reviews.router,  prefix='/api/reviews',  tags=['reviews'])


@app.get('/')
def root():
    return {'status': 'GlowMart API running 🌸', 'db': 'PostgreSQL'}


@app.get('/api/email-status')
def email_status():
    configured = bool(BREVO_USER and BREVO_PASS)
    return {
        'configured':   configured,
        'from_address': FROM_ADDRESS,
        'seller_email': SELLER_EMAIL,
        'brevo_user':   BREVO_USER or '(not set)',
        'message':      'Ready — Brevo SMTP, sends to any email' if configured else
                        'BREVO_USER or BREVO_PASS missing in Railway variables'
    }


@app.post('/api/test-email')
def test_email():
    if not BREVO_USER or not BREVO_PASS:
        return {'success': False, 'error': 'BREVO_USER or BREVO_PASS not set'}

    import smtplib, traceback
    from email.mime.text import MIMEText
    success      = False
    error_detail = None

    try:
        msg = MIMEText('GlowMart test — Brevo SMTP works on Railway!')
        msg['Subject'] = '🌸 GlowMart Test Email'
        msg['From']    = FROM_ADDRESS
        msg['To']      = SELLER_EMAIL

        with smtplib.SMTP('smtp-relay.brevo.com', 587, timeout=15) as server:
            server.ehlo()
            server.starttls()
            server.login(BREVO_USER, BREVO_PASS)
            server.sendmail(BREVO_USER, SELLER_EMAIL, msg.as_string())
        success = True
    except Exception:
        error_detail = traceback.format_exc()

    return {
        'success':  success,
        'sent_to':  SELLER_EMAIL,
        'from':     FROM_ADDRESS,
        'error':    error_detail,
        'message':  f'Test email sent! Check {SELLER_EMAIL}' if success else 'Failed — see error'
    }
