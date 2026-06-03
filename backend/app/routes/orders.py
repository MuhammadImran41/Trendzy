from fastapi import APIRouter, HTTPException, BackgroundTasks, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.models.order import Order
from app.database import OrderDB, get_db
from app.email_service import send_order_notification
from pydantic import BaseModel
from typing import Literal, Optional
from datetime import datetime
import uuid

router = APIRouter()


class StatusUpdate(BaseModel):
    status: Literal['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']
    trackingId: Optional[str] = None


def _row_to_dict(row: OrderDB) -> dict:
    return {
        'id':            row.id,
        'buyerName':     row.buyerName,
        'buyerPhone':    row.buyerPhone,
        'buyerEmail':    row.buyerEmail,
        'buyerAddress':  row.buyerAddress,
        'buyerCity':     row.buyerCity,
        'items':         row.items,
        'total':         row.total,
        'status':        row.status,
        'paymentMethod': row.paymentMethod,
        'notes':         row.notes,
        'trackingId':    row.trackingId,
        'createdAt':     row.createdAt,
        'updatedAt':     row.updatedAt,
    }


@router.get('/')
def get_orders(db: Session = Depends(get_db)):
    result = db.execute(text("""
        SELECT id, "buyerName", "buyerPhone", "buyerEmail",
               "buyerAddress", "buyerCity", items, total,
               status, "paymentMethod", notes, "trackingId",
               "createdAt", "updatedAt"
        FROM orders
        ORDER BY "createdAt" DESC
    """))
    rows = result.mappings().all()
    return [dict(r) for r in rows]


@router.get('/count')
def get_order_count(db: Session = Depends(get_db)):
    total   = db.query(OrderDB).count()
    pending = db.query(OrderDB).filter(OrderDB.status == 'pending').count()
    return {'total': total, 'pending': pending}


@router.post('/')
def place_order(order: Order, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    order_id = f'GM-{str(uuid.uuid4())[:6].upper()}'

    # Use raw SQL INSERT to guarantee buyerEmail is written correctly
    db.execute(text("""
        INSERT INTO orders
            (id, "buyerName", "buyerPhone", "buyerEmail",
             "buyerAddress", "buyerCity", items, total,
             status, "paymentMethod", notes, "trackingId",
             "createdAt", "updatedAt")
        VALUES
            (:id, :buyerName, :buyerPhone, :buyerEmail,
             :buyerAddress, :buyerCity, :items::jsonb, :total,
             'pending', 'cod', :notes, NULL,
             NOW(), NOW())
    """), {
        'id':           order_id,
        'buyerName':    order.buyerName,
        'buyerPhone':   order.buyerPhone,
        'buyerEmail':   order.buyerEmail,
        'buyerAddress': order.buyerAddress,
        'buyerCity':    order.buyerCity,
        'items':        __import__('json').dumps([i.model_dump() for i in order.items]),
        'total':        order.total,
        'notes':        order.notes,
    })
    db.commit()

    # Fetch the saved row to return + send email
    result = db.execute(text("""
        SELECT id, "buyerName", "buyerPhone", "buyerEmail",
               "buyerAddress", "buyerCity", items, total,
               status, "paymentMethod", notes, "trackingId",
               "createdAt", "updatedAt"
        FROM orders WHERE id = :id
    """), {'id': order_id}).mappings().one()

    result_dict = dict(result)
    background_tasks.add_task(send_order_notification, result_dict)
    return result_dict


@router.patch('/{order_id}', response_model=Order)
def update_order_status(order_id: str, payload: StatusUpdate, db: Session = Depends(get_db)):
    row = db.query(OrderDB).filter(OrderDB.id == order_id).first()
    if not row:
        raise HTTPException(status_code=404, detail='Order not found')
    row.status    = payload.status
    row.updatedAt = datetime.utcnow()
    if payload.trackingId is not None:
        row.trackingId = payload.trackingId
    db.commit()
    db.refresh(row)
    return _row_to_dict(row)
