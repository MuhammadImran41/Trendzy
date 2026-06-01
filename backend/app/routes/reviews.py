from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.database import ReviewDB, OrderDB, get_db
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
import uuid

router = APIRouter()


class ReviewCreate(BaseModel):
    productId: str
    orderId:   str
    buyerName: str
    rating:    int = Field(..., ge=1, le=5)
    comment:   Optional[str] = None


class ReviewOut(BaseModel):
    id:        str
    productId: str
    orderId:   str
    buyerName: str
    rating:    int
    comment:   Optional[str]
    createdAt: datetime

    class Config:
        from_attributes = True


@router.get('/{product_id}', response_model=list[ReviewOut])
def get_reviews(product_id: str, db: Session = Depends(get_db)):
    rows = (
        db.query(ReviewDB)
        .filter(ReviewDB.productId == product_id)
        .order_by(ReviewDB.createdAt.desc())
        .all()
    )
    return rows


@router.post('/', response_model=ReviewOut)
def submit_review(data: ReviewCreate, db: Session = Depends(get_db)):
    # Only allow review if order is delivered
    order = db.query(OrderDB).filter(OrderDB.id == data.orderId).first()
    if not order:
        raise HTTPException(status_code=404, detail='Order not found')
    if order.status != 'delivered':
        raise HTTPException(
            status_code=400,
            detail='You can only review a product after it has been delivered'
        )

    # Prevent duplicate review for same order + product
    existing = db.query(ReviewDB).filter(
        ReviewDB.orderId == data.orderId,
        ReviewDB.productId == data.productId
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail='You have already reviewed this product')

    row = ReviewDB(
        id        = str(uuid.uuid4()),
        productId = data.productId,
        orderId   = data.orderId,
        buyerName = data.buyerName,
        rating    = data.rating,
        comment   = data.comment,
        createdAt = datetime.utcnow(),
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return row
