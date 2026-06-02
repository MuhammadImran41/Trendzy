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
from app.email_service import send_order_notification, RESEND_API_KEY, SELLER_EMAIL, FROM_ADDRESS

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
    configured = bool(RESEND_API_KEY)
    return {
        'configured':       configured,
        'from_address':     FROM_ADDRESS,
        'seller_email':     SELLER_EMAIL,
        'resend_key_set':   configured,
        'message':          'Ready to send emails via Resend' if configured else
                            'RESEND_API_KEY missing in environment variables'
    }


@app.post('/api/test-email')
def test_email():
    if not RESEND_API_KEY:
        return {'success': False, 'error': 'RESEND_API_KEY not set'}

    import smtplib, traceback
    from email.mime.text import MIMEText
    error_detail = None
    success      = False

    try:
        msg = MIMEText('GlowMart test email — Resend SMTP is working on Railway!')
        msg['Subject'] = '🌸 GlowMart — Test Email'
        msg['From']    = FROM_ADDRESS
        msg['To']      = SELLER_EMAIL

        with smtplib.SMTP_SSL('smtp.resend.com', 2465, timeout=15) as server:
            server.login('resend', RESEND_API_KEY)
            server.sendmail('onboarding@resend.dev', SELLER_EMAIL, msg.as_string())
        success = True
    except Exception:
        error_detail = traceback.format_exc()

    return {
        'success':  success,
        'sent_to':  SELLER_EMAIL,
        'from':     FROM_ADDRESS,
        'error':    error_detail,
        'message':  f'Test email sent! Check {SELLER_EMAIL}' if success else
                    'Failed — see error field for details'
    }
