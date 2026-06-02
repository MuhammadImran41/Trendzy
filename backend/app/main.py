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
from app.email_service import send_order_notification, SMTP_USER, SMTP_PASS, SELLER_EMAIL

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
    configured = bool(SMTP_USER and SMTP_PASS)
    return {
        'configured':    configured,
        'smtp_user':     SMTP_USER or '(not set)',
        'seller_email':  SELLER_EMAIL,
        'smtp_pass_set': bool(SMTP_PASS),
        'message':       'Ready to send emails' if configured else
                         'SMTP_PASS missing in .env'
    }


@app.post('/api/test-email')
def test_email():
    import smtplib, traceback
    if not SMTP_PASS:
        return {'success': False, 'error': 'SMTP_PASS not set in .env'}

    # Direct SMTP test — bypasses send_order_notification to capture raw error
    error_detail = None
    success = False
    try:
        import smtplib
        with smtplib.SMTP_SSL('smtp.gmail.com', 465, timeout=15) as server:
            server.ehlo()
            server.login(SMTP_USER, SMTP_PASS)
            from email.mime.text import MIMEText
            msg = MIMEText('GlowMart test email — SMTP is working!')
            msg['Subject'] = 'GlowMart Test Email'
            msg['From'] = f'GlowMart <{SMTP_USER}>'
            msg['To'] = SELLER_EMAIL
            server.sendmail(SMTP_USER, SELLER_EMAIL, msg.as_string())
        success = True
    except Exception as e:
        error_detail = traceback.format_exc()

    return {
        'success': success,
        'sent_to': SELLER_EMAIL,
        'smtp_user': SMTP_USER,
        'smtp_host': 'smtp.gmail.com',
        'smtp_port': 465,
        'error': error_detail,
        'message': 'Test email sent! Check your inbox.' if success else
                   'Failed — see error field for details'
    }
