"""
Virtual Try-On API route for Trendzy.
POST /api/try-on — accepts user photo + product ID or clothing image.
"""
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Request
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from fastapi import Depends
import httpx, os
from pathlib import Path

from app.database import get_db, ProductDB
from app.gemini_service import generate_tryon, MAX_FILE_SIZE, UPLOAD_DIR
import uuid

router = APIRouter()

ALLOWED_TYPES = {'image/jpeg', 'image/png', 'image/webp', 'image/jpg'}


async def _fetch_image_bytes(url: str) -> bytes:
    """Fetch image from URL."""
    async with httpx.AsyncClient(timeout=15) as client:
        r = await client.get(url)
        r.raise_for_status()
        return r.content


@router.post('/')
async def virtual_tryon(
    request: Request,
    user_photo: UploadFile = File(..., description='User selfie/photo'),
    product_id: str        = Form(None, description='Product ID from catalog'),
    db: Session            = Depends(get_db)
):
    """
    Virtual try-on endpoint.
    - user_photo: User's photo file
    - product_id: Product ID to try on (clothing image fetched from DB)
    """
    client_ip = request.client.host if request.client else '0.0.0.0'

    # ── Validate user photo ───────────────────────────────────────────────────
    if user_photo.content_type not in ALLOWED_TYPES:
        raise HTTPException(400, 'Invalid file type. Use JPEG, PNG, or WebP.')

    user_bytes = await user_photo.read()
    if len(user_bytes) > MAX_FILE_SIZE:
        raise HTTPException(400, f'File too large. Maximum size is 5MB.')

    if len(user_bytes) < 1000:
        raise HTTPException(400, 'Invalid image file.')

    # Save user photo temporarily
    upload_filename = f'user_{uuid.uuid4().hex[:10]}.jpg'
    upload_path = UPLOAD_DIR / upload_filename
    with open(upload_path, 'wb') as f:
        f.write(user_bytes)

    # ── Get clothing image ────────────────────────────────────────────────────
    clothing_bytes = None
    product_name   = 'the selected clothing item'

    if product_id:
        product = db.query(ProductDB).filter(ProductDB.id == product_id).first()
        if not product:
            raise HTTPException(404, 'Product not found.')

        product_name = product.name
        images = product.images or []

        if not images:
            raise HTTPException(400, 'This product has no images.')

        # Fetch first product image
        clothing_url = images[0]
        try:
            clothing_bytes = await _fetch_image_bytes(clothing_url)
        except Exception as e:
            raise HTTPException(400, f'Could not fetch product image: {e}')
    else:
        raise HTTPException(400, 'product_id is required.')

    # ── Call Gemini ───────────────────────────────────────────────────────────
    result = generate_tryon(
        user_photo_bytes     = user_bytes,
        clothing_image_bytes = clothing_bytes,
        product_name         = product_name,
        client_ip            = client_ip
    )

    if not result['success']:
        raise HTTPException(500, result['error'])

    return JSONResponse({
        'success':      True,
        'result_url':   result['result_url'],
        'filename':     result['filename'],
        'product_name': product_name,
        'analysis':     result.get('analysis', {}),
        'message':      f'Try-on generated for {product_name}'
    })


@router.get('/status')
def tryon_status():
    """Check if try-on feature is configured."""
    api_key = os.getenv('GROQ_API_KEY', '')
    return {
        'configured': bool(api_key),
        'message': 'Virtual Try-On is ready! (Groq Vision)' if api_key else 'Add GROQ_API_KEY to .env to enable'
    }
