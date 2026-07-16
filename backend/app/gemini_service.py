"""
Gemini Virtual Try-On Service for Trendzy.
Uses gemini-2.0-flash-exp (image generation) to overlay clothing on user photo.
"""
import os
import base64
import uuid
import time
import threading
from pathlib import Path
from datetime import datetime, timedelta

import google.generativeai as genai
from PIL import Image
import io

GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', '')

# Temp folder for uploaded + generated images
UPLOAD_DIR   = Path('app/static/tryon_uploads')
RESULT_DIR   = Path('app/static/tryon_results')
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
RESULT_DIR.mkdir(parents=True, exist_ok=True)

MAX_FILE_SIZE  = 5 * 1024 * 1024   # 5 MB
AUTO_DELETE_MINUTES = 30            # delete user photos after 30 min

# ── Rate limiting (simple in-memory) ─────────────────────────────────────────
_rate_store: dict[str, list] = {}
RATE_LIMIT_CALLS = 5
RATE_LIMIT_WINDOW = 60  # seconds

def _check_rate_limit(client_ip: str) -> bool:
    now = time.time()
    calls = _rate_store.get(client_ip, [])
    calls = [t for t in calls if now - t < RATE_LIMIT_WINDOW]
    if len(calls) >= RATE_LIMIT_CALLS:
        return False
    calls.append(now)
    _rate_store[client_ip] = calls
    return True


# ── Auto-delete old uploads ───────────────────────────────────────────────────
def _cleanup_old_files():
    """Delete upload files older than AUTO_DELETE_MINUTES."""
    cutoff = datetime.now() - timedelta(minutes=AUTO_DELETE_MINUTES)
    for f in UPLOAD_DIR.glob('*'):
        try:
            if datetime.fromtimestamp(f.stat().st_mtime) < cutoff:
                f.unlink()
        except Exception:
            pass
    # Schedule next cleanup in 10 minutes
    threading.Timer(600, _cleanup_old_files).start()

# Start cleanup daemon
threading.Timer(600, _cleanup_old_files).start()


# ── Image helpers ─────────────────────────────────────────────────────────────
def _validate_and_resize(image_bytes: bytes, max_dim: int = 1024) -> bytes:
    """Validate image and resize if needed."""
    img = Image.open(io.BytesIO(image_bytes))
    img = img.convert('RGB')
    w, h = img.size
    if w > max_dim or h > max_dim:
        img.thumbnail((max_dim, max_dim), Image.LANCZOS)
    buf = io.BytesIO()
    img.save(buf, format='JPEG', quality=85)
    return buf.getvalue()


def _image_to_part(image_bytes: bytes, mime_type: str = 'image/jpeg'):
    """Convert image bytes to Gemini content part."""
    return {
        'inline_data': {
            'mime_type': mime_type,
            'data': base64.b64encode(image_bytes).decode('utf-8')
        }
    }


# ── Main try-on function ──────────────────────────────────────────────────────
def generate_tryon(
    user_photo_bytes: bytes,
    clothing_image_bytes: bytes,
    product_name: str = 'this clothing item',
    client_ip: str = '0.0.0.0'
) -> dict:
    """
    Generate a virtual try-on image using Gemini.
    Returns: { success, result_url, error }
    """
    # Rate limit check
    if not _check_rate_limit(client_ip):
        return {'success': False, 'error': 'Too many requests. Please wait a minute.'}

    # API key check
    if not GEMINI_API_KEY:
        return {'success': False, 'error': 'GEMINI_API_KEY not configured. Add it to .env'}

    try:
        # Validate + resize images
        user_bytes     = _validate_and_resize(user_photo_bytes)
        clothing_bytes = _validate_and_resize(clothing_image_bytes)

        # Configure Gemini
        genai.configure(api_key=GEMINI_API_KEY)
        model = genai.GenerativeModel('gemini-2.0-flash-exp')

        prompt = f"""You are a virtual fashion try-on AI.

Task: Generate a realistic image of the person wearing the clothing item shown.

STRICT RULES — follow exactly:
1. Keep the person's face IDENTICAL — same features, expression, skin tone
2. Keep the person's body shape, pose, and proportions EXACTLY the same
3. Keep the background and lighting the same
4. ONLY change the clothing — replace what they are wearing with: {product_name}
5. Make the clothing look natural and realistic on their body
6. The clothing should fit their body shape naturally
7. Do NOT add any text, watermarks, or labels

Output: A single photorealistic image of the person wearing {product_name}."""

        # Build content parts
        contents = [
            prompt,
            'Person photo (keep face, body, pose identical):',
            _image_to_part(user_bytes),
            f'Clothing item to wear ({product_name}):',
            _image_to_part(clothing_bytes),
            'Now generate the try-on image:'
        ]

        print(f'[TryOn] Calling Gemini API for product: {product_name}')
        response = model.generate_content(
            contents,
            generation_config=genai.GenerationConfig(
                temperature=0.2,
                max_output_tokens=8192,
            )
        )

        # Extract generated image from response
        result_image_bytes = None
        for part in response.candidates[0].content.parts:
            if hasattr(part, 'inline_data') and part.inline_data:
                result_image_bytes = base64.b64decode(part.inline_data.data)
                break

        if not result_image_bytes:
            # Fallback: check if text response (means model couldn't generate image)
            text = response.text if hasattr(response, 'text') else ''
            print(f'[TryOn] No image in response. Text: {text[:200]}')
            return {'success': False, 'error': 'Gemini could not generate the try-on image. Please try again.'}

        # Save result image
        result_filename = f'tryon_{uuid.uuid4().hex[:12]}.jpg'
        result_path = RESULT_DIR / result_filename
        with open(result_path, 'wb') as f:
            f.write(result_image_bytes)

        result_url = f'/static/tryon_results/{result_filename}'
        print(f'[TryOn] ✓ Generated: {result_filename}')

        return {
            'success': True,
            'result_url': result_url,
            'filename': result_filename
        }

    except Exception as e:
        print(f'[TryOn] ✗ Error: {type(e).__name__}: {e}')
        return {'success': False, 'error': f'Generation failed: {str(e)}'}
