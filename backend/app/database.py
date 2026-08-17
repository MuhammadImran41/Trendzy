"""
Database connection and table definitions using SQLAlchemy.
"""
from sqlalchemy import (
    create_engine, Column, String, Float, Integer,
    Boolean, DateTime, Text, JSON, UniqueConstraint
)
from sqlalchemy.orm import declarative_base, sessionmaker
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv(
    'DATABASE_URL',
    'postgresql://postgres:10220@localhost:5432/trendzy-db'
)

connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, connect_args=connect_args, echo=False)
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)
Base = declarative_base()


# ── ORM Models ────────────────────────────────────────────────────────────────

class UserDB(Base):
    __tablename__ = 'users'

    id          = Column(String, primary_key=True)
    name        = Column(String, nullable=False)
    email       = Column(String, nullable=False, unique=True, index=True)
    phone       = Column(String, nullable=True)
    password    = Column(String, nullable=False)          # bcrypt hash
    role        = Column(String, default='buyer')         # 'buyer' | 'seller'
    isActive    = Column(Boolean, default=True)
    createdAt   = Column(DateTime, default=datetime.utcnow)
    lastLoginAt = Column(DateTime, nullable=True)


class CategoryDB(Base):
    __tablename__ = 'categories'
    id            = Column(String, primary_key=True)
    name          = Column(String, nullable=False)
    icon          = Column(String, default='')
    image         = Column(String, default='')
    subcategories = Column(JSON, default=list)
    order         = Column(Integer, default=0)


class ProductDB(Base):
    __tablename__ = 'products'

    id            = Column(String, primary_key=True)
    name          = Column(String, nullable=False)
    description   = Column(Text, default='')
    originalPrice = Column(Float, default=0)
    sellerPrice   = Column(Float, default=0)
    images        = Column(JSON, default=list)
    category      = Column(String, default='')
    tags          = Column(JSON, default=list)
    stock         = Column(Integer, default=0)
    isActive      = Column(Boolean, default=True)
    oriflameUrl   = Column(String, nullable=True)
    createdAt     = Column(DateTime, default=datetime.utcnow)
    updatedAt     = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class OrderDB(Base):
    __tablename__ = 'orders'

    id            = Column(String, primary_key=True)
    buyerName     = Column(String, nullable=False)
    buyerPhone    = Column(String, nullable=False)
    buyerEmail    = Column(String, nullable=True)
    buyerAddress  = Column(Text, nullable=False)
    buyerCity     = Column(String, nullable=False)
    items         = Column(JSON, nullable=False)
    total         = Column(Float, nullable=False)
    status        = Column(String, default='pending')
    paymentMethod = Column(String, default='cod')
    notes         = Column(Text, nullable=True)
    trackingId    = Column(String, nullable=True)
    createdAt     = Column(DateTime, default=datetime.utcnow)
    updatedAt     = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class ReviewDB(Base):
    __tablename__ = 'reviews'

    id        = Column(String, primary_key=True)
    productId = Column(String, nullable=False, index=True)
    orderId   = Column(String, nullable=False)
    buyerName = Column(String, nullable=False)
    rating    = Column(Integer, nullable=False)
    comment   = Column(Text, nullable=True)
    createdAt = Column(DateTime, default=datetime.utcnow)


def init_db():
    """Create all tables if they don't exist."""
    Base.metadata.create_all(bind=engine)
    db_type = "SQLite" if DATABASE_URL.startswith("sqlite") else "PostgreSQL"
    print(f'[DB] ✓ {db_type} — database ready')


def get_db():
    """FastAPI dependency — yields a database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
