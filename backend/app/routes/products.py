from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.models.product import Product
from app.database import ProductDB, get_db
from datetime import datetime
import uuid

router = APIRouter()


def _row_to_dict(row: ProductDB) -> dict:
    return {
        'id':            row.id,
        'name':          row.name,
        'description':   row.description,
        'originalPrice': row.originalPrice,
        'sellerPrice':   row.sellerPrice,
        'images':        row.images or [],
        'category':      row.category,
        'tags':          row.tags or [],
        'stock':         row.stock,
        'isActive':      row.isActive,
        'oriflameUrl':   row.oriflameUrl,
        'createdAt':     row.createdAt,
        'updatedAt':     row.updatedAt,
    }


@router.get('/', response_model=list[Product])
def get_products(db: Session = Depends(get_db)):
    rows = db.query(ProductDB).filter(ProductDB.isActive == True).all()
    return [_row_to_dict(r) for r in rows]


@router.get('/{product_id}', response_model=Product)
def get_product(product_id: str, db: Session = Depends(get_db)):
    row = db.query(ProductDB).filter(ProductDB.id == product_id).first()
    if not row:
        raise HTTPException(status_code=404, detail='Product not found')
    return _row_to_dict(row)


@router.post('/', response_model=Product)
def create_product(product: Product, db: Session = Depends(get_db)):
    product_id = str(uuid.uuid4())
    row = ProductDB(
        id            = product_id,
        name          = product.name,
        description   = product.description,
        originalPrice = product.originalPrice,
        sellerPrice   = product.sellerPrice,
        images        = product.images,
        category      = product.category,
        tags          = product.tags,
        stock         = product.stock,
        isActive      = product.isActive,
        oriflameUrl   = product.oriflameUrl,
        createdAt     = datetime.utcnow(),
        updatedAt     = datetime.utcnow(),
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return _row_to_dict(row)


@router.put('/{product_id}', response_model=Product)
def update_product(product_id: str, product: Product, db: Session = Depends(get_db)):
    row = db.query(ProductDB).filter(ProductDB.id == product_id).first()
    if not row:
        raise HTTPException(status_code=404, detail='Product not found')
    row.name          = product.name
    row.description   = product.description
    row.originalPrice = product.originalPrice
    row.sellerPrice   = product.sellerPrice
    row.images        = product.images
    row.category      = product.category
    row.tags          = product.tags
    row.stock         = product.stock
    row.isActive      = product.isActive
    row.oriflameUrl   = product.oriflameUrl
    row.updatedAt     = datetime.utcnow()
    db.commit()
    db.refresh(row)
    return _row_to_dict(row)


@router.delete('/{product_id}')
def delete_product(product_id: str, db: Session = Depends(get_db)):
    row = db.query(ProductDB).filter(ProductDB.id == product_id).first()
    if not row:
        raise HTTPException(status_code=404, detail='Product not found')
    db.delete(row)
    db.commit()
    return {'deleted': True}
