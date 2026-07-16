"""
Virtual Try-On Service for Trendzy.
Uses Hugging Face Kolors-Virtual-Try-On model (free tier).
"""
import os
import uuid
import time
import threading
import requests
import base64
from pathlib import Path
from datetime import datetime, timedelta
from PIL import Image
import io

HF_TOKEN = os.getenv('HF_TOKEN', '')

# API endpoint
HF_API_URL = "https://api-inference.huggingface.co/models/Kwai-Kolors/Kolors-Virtual-Try-On"

# Folders
UPLOAD_DIR = Path('app/static/tryon_uploads')
RESULT_DIR = Path('app/static/tryon_results')
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
RESULT_DIR.mkdir(parents=True, exist_ok=True)

MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB
AUTO_DELETE_MINUTES = 30

# ── Rate limiting ─────────────────────────────────────────────────────────────
_rate_store: dict = {}
RATE_LIMIT_CALLS  = 5
RATE_LIMIT_WINDOW = 60

def _check_rate_limit(client_ip: str) -> bool:
    now   = time.time()
    calls = [t for t in _rate_store.get(client_ip, []) if now - t < RATE_LIMIT_WINDOW]
    if len(calls) >= RATE_LIMIT_CALLS:
        return False
    calls.append(now)
    _rate_store[client_ip] = calls
    return True

# ── Auto-delete old uploads ───────────────────────────────────────────────────
def _cleanup_old_files():
    cutoff = datetime.now() - timedelta(minutes=AUTO_DELETE_MINUTES)
    for f in UPLOAD_DIR.glob('*'):
        try:
            if datetime.fromtimestamp(f.stat().st_mtime) < cutoff:
                f.unlink()
        except Exception:
            pass
    threading.Timer(600, _cleanup_old_files).start()

threading.Timer(600, _cleanup_old_files).start()

# ── Image helpers ─────────────────────────────────────────────────────────────
def _resize_image(image_bytes: bytes, max_dim: int = 768) -> bytes:
    img = Image.open(io.BytesIO(image_bytes)).convert('RGB')
    w, h = img.size
    if w > max_dim or h > max_dim:
        img.thumbnail((max_dim, max_dim), Image.LANCZOS)
    buf = io.BytesIO()
    img.save(buf, format='JPEG', quality=88)
    return buf.getvalue()

def _to_base64(image_bytes: bytes) -> str:
    return base64.b64encode(image_bytes).decode('utf-8')

# ── Main try-on function ──────────────────────────────────────────────────────
def generate_tryon(
    user_photo_bytes: bytes,
    clothing_image_bytes: bytes,
    product_name: str = 'clothing item',
    client_ip: str = '0.0.0.0'
) -> dict:

    # Rate limit
    if not _check_rate_limit(client_ip):
        return {'success': False, 'error': 'Too many requests. Please wait a minute.'}

    # Token check
    if not HF_TOKEN:
        return {'success': False, 'error': 'HF_TOKEN not configured in .env'}

    try:
        # Resize images
        person_bytes  = _resize_image(user_photo_bytes, 768)
        garment_bytes = _resize_image(clothing_image_bytes, 768)

        print(f'[TryOn] Calling HF Kolors Try-On for: {product_name}')

        # HF Inference API payload
        payload = {
            "inputs": {
                "person_image": _to_base64(person_bytes),
                "garment_image": _to_base64(garment_bytes),
            }
        }

        headers = {
            "Authorization": f"Bearer {HF_TOKEN}",
            "Content-Type": "application/json"
        }

        # Retry if model is loading
        for attempt in range(3):
            response = requests.post(HF_API_URL, headers=headers, json=payload, timeout=120)

            if response.status_code == 200:
                break
            elif response.status_code == 503:
                # Model loading
                wait = response.json().get('estimated_time', 20)
                print(f'[TryOn] Model loading, waiting {wait}s...')
                time.sleep(min(wait, 30))
            elif response.status_code == 422:
                # Try alternative payload format
                payload = {
                    "inputs": {
                        "image": _to_base64(person_bytes),
                        "garment": _to_base64(garment_bytes),
                    }
                }
            else:
                err = response.text[:300]
                print(f'[TryOn] HF error {response.status_code}: {err}')
                return {'success': False, 'error': f'API error ({response.status_code}). Try again.'}

        if response.status_code != 200:
            return {'success': False, 'error': 'Model still loading. Please try again in 30 seconds.'}

        result_bytes = response.content

        # Validate it's an image
        try:
            Image.open(io.BytesIO(result_bytes))
        except Exception:
            return {'success': False, 'error': 'Invalid response from AI model. Please try again.'}

        # Save result
        filename   = f'tryon_{uuid.uuid4().hex[:12]}.jpg'
        out_path   = RESULT_DIR / filename
        with open(out_path, 'wb') as f:
            f.write(result_bytes)

        print(f'[TryOn] ✓ Generated: {filename}')
        return {
            'success':    True,
            'result_url': f'/static/tryon_results/{filename}',
            'filename':   filename
        }

    except requests.Timeout:
        return {'success': False, 'error': 'Request timed out. AI model is busy, please try again.'}
    except Exception as e:
        print(f'[TryOn] ✗ {type(e).__name__}: {e}')
        return {'success': False, 'error': f'Generation failed: {str(e)[:200]}'}
