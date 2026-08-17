from fastapi import APIRouter, HTTPException, BackgroundTasks, Depends
from sqlalchemy.orm import Session
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


@router.get('/count')
def get_order_count(db: Session = Depends(get_db)):
    total   = db.query(OrderDB).count()
    pending = db.query(OrderDB).filter(OrderDB.status == 'pending').count()
    return {'total': total, 'pending': pending}


@router.get('/')
def get_orders(db: Session = Depends(get_db)):
    rows = db.query(OrderDB).order_by(OrderDB.createdAt.desc()).all()
    return [_row_to_dict(r) for r in rows]


@router.post('/')
def place_order(order: Order, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    import json
    order_id   = f'TZ-{str(uuid.uuid4())[:6].upper()}'
    items_json = json.dumps([i.model_dump() for i in order.items])

    new_order = OrderDB(
        id           = order_id,
        buyerName    = order.buyerName,
        buyerPhone   = order.buyerPhone,
        buyerEmail   = order.buyerEmail,
        buyerAddress = order.buyerAddress,
        buyerCity    = order.buyerCity,
        items        = [i.model_dump() for i in order.items],
        total        = order.total,
        status       = 'pending',
        paymentMethod= 'cod',
        notes        = order.notes,
        createdAt    = datetime.utcnow(),
        updatedAt    = datetime.utcnow(),
    )
    db.add(new_order)
    db.commit()
    db.refresh(new_order)

    result_dict = _row_to_dict(new_order)
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
