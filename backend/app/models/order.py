from pydantic import BaseModel
from typing import Optional, List, Literal
from datetime import datetime

class OrderItem(BaseModel):
    productId:    str
    productName:  str
    productImage: Optional[str] = ''
    quantity:     int
    price:        float

class Order(BaseModel):
    id:            Optional[str] = None
    buyerName:     str
    buyerPhone:    str
    buyerEmail:    Optional[str] = None
    buyerAddress:  str
    buyerCity:     str
    items:         List[OrderItem]
    total:         float
    status:        Literal['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'] = 'pending'
    paymentMethod: Literal['cod'] = 'cod'
    notes:         Optional[str] = None
    trackingId:    Optional[str] = None
    createdAt:     Optional[datetime] = None
    updatedAt:     Optional[datetime] = None
