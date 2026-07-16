"""
Virtual Try-On Service for Trendzy.
Uses Replicate cuuupid/idm-vton model.
"""
import os
import uuid
import time
import threading
import requests
from pathlib import Path
from datetime import datetime, timedelta
from PIL import Image
import io
import replicate

REPLICATE_TOKEN = os.getenv('REPLICATE_API_TOKEN', '')

UPLOAD_DIR = Path('app/static/tryon_uploads')
RESULT_DIR = Path('app/static/tryon_results')
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
RESULT_DIR.mkdir(parents=True, exist_ok=True)

MAX_FILE_SIZE       = 5 * 1024 * 1024
AUTO_DELETE_MINUTES = 30

# ── Rate limiting ─────────────────────────────────────────────────────────────
_rate_store: dict = {}

def _check_rate_limit(client_ip: str) -> bool:
    now   = time.time()
    calls = [t for t in _rate_store.get(client_ip, []) if now - t < 60]
    if len(calls) >= 5:
        return False
    calls.append(now)
    _rate_store[client_ip] = calls
    return True

# ── Auto-delete uploads ───────────────────────────────────────────────────────
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
    img.save(buf, format='JPEG', quality=90)
    return buf.getvalue()

# ── Main function ─────────────────────────────────────────────────────────────
def generate_tryon(
    user_photo_bytes:     bytes,
    clothing_image_bytes: bytes,
    product_name:         str = 'clothing item',
    client_ip:            str = '0.0.0.0'
) -> dict:

    if not _check_rate_limit(client_ip):
        return {'success': False, 'error': 'Too many requests. Wait a minute.'}

    if not REPLICATE_TOKEN:
        return {'success': False, 'error': 'REPLICATE_API_TOKEN not set in .env'}

    try:
        # Resize
        person_bytes  = _resize_image(user_photo_bytes, 768)
        garment_bytes = _resize_image(clothing_image_bytes, 768)

        # Save temp files for Replicate (needs file objects)
        tmp_person  = UPLOAD_DIR / f'person_{uuid.uuid4().hex[:8]}.jpg'
        tmp_garment = UPLOAD_DIR / f'garment_{uuid.uuid4().hex[:8]}.jpg'
        tmp_person.write_bytes(person_bytes)
        tmp_garment.write_bytes(garment_bytes)

        print(f'[TryOn] Running cuuupid/idm-vton for: {product_name}')
        os.environ['REPLICATE_API_TOKEN'] = REPLICATE_TOKEN

        with open(tmp_person, 'rb') as fp, open(tmp_garment, 'rb') as fg:
            output = replicate.run(
                "cuuupid/idm-vton:0513734a452173b8173e907e3a59d19a36266e55b48528559432bd21c7d7e985",
                input={
                    "human_img":       fp,
                    "garm_img":        fg,
                    "garment_des":     product_name,
                    "is_checked":      True,
                    "is_checked_crop": False,
                    "denoise_steps":   30,
                    "seed":            42,
                }
            )

        # Cleanup temp files
        try:
            tmp_person.unlink()
            tmp_garment.unlink()
        except Exception:
            pass

        # Download result
        result_url = str(output)
        resp = requests.get(result_url, timeout=60)
        resp.raise_for_status()
        result_bytes = resp.content

        # Validate image
        Image.open(io.BytesIO(result_bytes))

        # Save result
        filename = f'tryon_{uuid.uuid4().hex[:12]}.jpg'
        (RESULT_DIR / filename).write_bytes(result_bytes)

        print(f'[TryOn] ✓ Done: {filename}')
        return {
            'success':    True,
            'result_url': f'/static/tryon_results/{filename}',
            'filename':   filename
        }

    except Exception as e:
        print(f'[TryOn] ✗ {type(e).__name__}: {e}')
        return {'success': False, 'error': f'Generation failed: {str(e)[:200]}'}
