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
from app.routes import products, orders, scraper, reviews, categories, tryon
from app.email_service import send_order_notification, GMAIL_USER, GMAIL_PASS, SELLER_EMAIL, FROM_ADDRESS

app = FastAPI(title='Trendzy API', version='1.0.0')

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=False,
    allow_methods=['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allow_headers=['*'],
    expose_headers=['*'],
)

@app.on_event('startup')
def startup():
    try:
        init_db()
    except Exception as e:
        print(f'[DB] Warning: Could not initialize database: {e}')

app.include_router(products.router,   prefix='/api/products',   tags=['products'])
app.include_router(orders.router,     prefix='/api/orders',     tags=['orders'])
app.include_router(scraper.router,    prefix='/api/scraper',    tags=['scraper'])
app.include_router(reviews.router,    prefix='/api/reviews',    tags=['reviews'])
app.include_router(categories.router, prefix='/api/categories', tags=['categories'])
app.include_router(tryon.router,      prefix='/api/try-on',     tags=['try-on'])

# Buyers list for seller panel
from fastapi import Depends
from app.database import get_db, BuyerProfileDB
from sqlalchemy.orm import Session

@app.get('/api/buyers', tags=['buyers'])
def get_buyers(db: Session = Depends(get_db)):
    buyers = db.query(BuyerProfileDB).order_by(BuyerProfileDB.lastOrderAt.desc()).all()
    return [{
        'id':           b.id,
        'name':         b.name,
        'phone':        b.phone,
        'email':        b.email or '—',
        'city':         b.city,
        'address':      b.address,
        'orderCount':   b.orderCount,
        'totalSpent':   b.totalSpent,
        'firstOrderAt': b.firstOrderAt,
        'lastOrderAt':  b.lastOrderAt,
    } for b in buyers]

# Serve static files (try-on results)
from fastapi.staticfiles import StaticFiles
import pathlib
pathlib.Path('app/static/tryon_results').mkdir(parents=True, exist_ok=True)
pathlib.Path('app/static/tryon_uploads').mkdir(parents=True, exist_ok=True)
app.mount('/static', StaticFiles(directory='app/static'), name='static')


@app.get('/')
def root():
    return {'status': 'Trendzy API running ✨', 'db': 'PostgreSQL'}


# ── Seller auth (simple env-based login) ─────────────────────────────────────
from pydantic import BaseModel as PB
from fastapi import HTTPException as _HTTPException

class LoginReq(PB):
    email:    str
    password: str

@app.post('/api/auth/login', tags=['auth'])
def seller_login(data: LoginReq):
    seller_email = os.getenv('SELLER_EMAIL', 'trendzyofficial.site@gmail.com')
    seller_pass  = 'seller@trendzy123'

    if data.email.lower().strip() == seller_email.lower() and data.password == seller_pass:
        return {
            'token': 'seller_token_valid',
            'user': {
                'id':    '1',
                'name':  'Trendzy Admin',
                'email': seller_email,
                'role':  'seller'
            }
        }
    raise _HTTPException(status_code=401, detail='Invalid email or password')


@app.get('/api/email-status')
def email_status():
    configured = bool(GMAIL_USER and GMAIL_PASS)
    return {
        'configured':   configured,
        'from_address': FROM_ADDRESS,
        'seller_email': SELLER_EMAIL,
        'gmail_user':   GMAIL_USER or '(not set)',
        'message':      'Ready — Gmail SMTP configured' if configured else
                        'GMAIL_USER or GMAIL_PASS missing in .env'
    }


@app.post('/api/test-email')
def test_email_endpoint():
    from app.email_service import _send_email
    success = _send_email(
        to_address = SELLER_EMAIL,
        subject    = '✅ Trendzy — Email System Test',
        plain_text = 'Email system is working correctly!',
        html_body  = f'<h2 style="color:#c9a96e;">TRENDZY</h2><p>Gmail SMTP is working! Orders will be sent to <strong>{SELLER_EMAIL}</strong></p>'
    )
    return {
        'success':  success,
        'sent_to':  SELLER_EMAIL,
        'from':     FROM_ADDRESS,
        'message':  f'Test email sent to {SELLER_EMAIL}!' if success else 'Failed — check GMAIL_USER/GMAIL_PASS in .env'
    }
