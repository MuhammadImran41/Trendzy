from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

load_dotenv()

from app.database import init_db
from app.routes import products, orders, scraper, reviews
from app.email_service import send_order_notification, SMTP_USER, SMTP_PASS, SELLER_EMAIL

app = FastAPI(title='GlowMart API', version='1.0.0')

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        os.getenv('ALLOWED_ORIGINS', 'http://localhost:4200'),
        'http://localhost:4201'
    ],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

# Create tables on startup
@app.on_event('startup')
def startup():
    init_db()

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
    if not SMTP_PASS:
        return {'success': False, 'error': 'SMTP_PASS not set in .env'}
    dummy = {
        'id': 'GM-TEST',
        'buyerName': 'Test Customer',
        'buyerPhone': '0300-0000000',
        'buyerCity': 'Karachi',
        'buyerAddress': 'Test Address, Street 1',
        'notes': 'This is a test email from GlowMart',
        'items': [{'productName': 'Test Product', 'quantity': 1, 'price': 1000}],
        'total': 1000,
    }
    success = send_order_notification(dummy)
    return {
        'success': success,
        'sent_to': SELLER_EMAIL,
        'message': 'Test email sent! Check your inbox.' if success else
                   'Failed — check backend terminal for the exact error'
    }
