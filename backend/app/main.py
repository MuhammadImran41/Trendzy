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

    import resend, traceback
    error_detail = None
    success      = False
    email_id     = None

    try:
        resend.api_key = RESEND_API_KEY
        params: resend.Emails.SendParams = {
            'from':    FROM_ADDRESS,
            'to':      [SELLER_EMAIL],
            'subject': '🌸 GlowMart — Test Email',
            'html':    '<h2>GlowMart test email</h2><p>Resend is working correctly on Railway!</p>',
            'text':    'GlowMart test email — Resend is working correctly on Railway!',
        }
        response = resend.Emails.send(params)
        email_id = response.get('id')
        success  = True
    except Exception:
        error_detail = traceback.format_exc()

    return {
        'success':    success,
        'sent_to':    SELLER_EMAIL,
        'from':       FROM_ADDRESS,
        'email_id':   email_id,
        'error':      error_detail,
        'message':    f'Test email sent! Check {SELLER_EMAIL}' if success else
                      'Failed — see error field for details'
    }
