"""
PostgreSQL database connection and table definitions using SQLAlchemy.
"""
from sqlalchemy import (
    create_engine, Column, String, Float, Integer,
    Boolean, DateTime, Text, JSON
)
from sqlalchemy.orm import declarative_base, sessionmaker
from datetime import datetime
import os

DATABASE_URL = os.getenv(
    'DATABASE_URL',
    'postgresql://postgres:Meharraza786.@localhost:5432/glowmart'
)

engine = create_engine(DATABASE_URL, echo=False)
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)
Base = declarative_base()


# ── ORM Models ────────────────────────────────────────────────────────────────

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
    print('[DB] ✓ PostgreSQL — glowmart database ready')


def get_db():
    """FastAPI dependency — yields a database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
