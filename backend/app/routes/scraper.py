from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.database import ProductDB, get_db
from datetime import datetime
import uuid

router = APIRouter()

# Try to import playwright-based scraper; fall back gracefully if not installed
try:
    from app.scraper.oriflame_scraper import scrape_oriflame_category
    SCRAPER_AVAILABLE = True
except ImportError:
    SCRAPER_AVAILABLE = False


class ScrapeRequest(BaseModel):
    url: str


class ImportRequest(BaseModel):
    products: List[Dict[str, Any]]


@router.post('/scrape')
async def scrape(request: ScrapeRequest):
    if not SCRAPER_AVAILABLE:
        return {'error': 'Scraper not available. Run: pip install playwright && playwright install chromium'}
    products = await scrape_oriflame_category(request.url)
    return products


@router.get('/status')
def status(db: Session = Depends(get_db)):
    count = db.query(ProductDB).count()
    return {'status': 'ready', 'count': count}


@router.post('/import')
def import_products(request: ImportRequest, db: Session = Depends(get_db)):
    imported = 0
    for p in request.products:
        pid = str(uuid.uuid4())
        row = ProductDB(
            id            = pid,
            name          = p.get('name', ''),
            description   = p.get('description', ''),
            originalPrice = float(p.get('originalPrice', p.get('price', 0))),
            sellerPrice   = float(p.get('sellerPrice', p.get('price', 0))),
            images        = p.get('images', []),
            category      = p.get('category', 'Skincare'),
            tags          = p.get('tags', []),
            stock         = 20,
            isActive      = True,
            oriflameUrl   = p.get('oriflameUrl'),
            createdAt     = datetime.utcnow(),
            updatedAt     = datetime.utcnow(),
        )
        db.add(row)
        imported += 1
    db.commit()
    return {'imported': imported}
