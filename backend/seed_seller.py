"""Seed default seller account. Run: python seed_seller.py"""
from dotenv import load_dotenv
load_dotenv()

import uuid, bcrypt
from datetime import datetime
from app.database import SessionLocal, UserDB, init_db

init_db()
db = SessionLocal()

SELLER_EMAIL    = 'trendzyofficial.site@gmail.com'
SELLER_PASSWORD = 'seller@trendzy123'
SELLER_NAME     = 'Trendzy Admin'

existing = db.query(UserDB).filter(UserDB.email == SELLER_EMAIL).first()
if existing:
    # Update password and role
    existing.password = bcrypt.hashpw(SELLER_PASSWORD.encode(), bcrypt.gensalt()).decode()
    existing.role = 'seller'
    db.commit()
    print(f'✓ Seller account updated: {SELLER_EMAIL}')
else:
    seller = UserDB(
        id        = str(uuid.uuid4()),
        name      = SELLER_NAME,
        email     = SELLER_EMAIL,
        phone     = '+92 300 0000000',
        password  = bcrypt.hashpw(SELLER_PASSWORD.encode(), bcrypt.gensalt()).decode(),
        role      = 'seller',
        isActive  = True,
        createdAt = datetime.utcnow(),
    )
    db.add(seller)
    db.commit()
    print(f'✓ Seller account created: {SELLER_EMAIL}')

db.close()
print(f'\nSeller Login Credentials:')
print(f'  Email:    {SELLER_EMAIL}')
print(f'  Password: {SELLER_PASSWORD}')
