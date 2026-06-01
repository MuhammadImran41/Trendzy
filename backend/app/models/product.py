from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class Product(BaseModel):
    id:            Optional[str] = None
    name:          str
    description:   str
    originalPrice: float
    sellerPrice:   float
    images:        List[str] = []
    category:      str
    tags:          List[str] = []
    stock:         int = 0
    isActive:      bool = True
    oriflameUrl:   Optional[str] = None
    createdAt:     Optional[datetime] = None
    updatedAt:     Optional[datetime] = None
