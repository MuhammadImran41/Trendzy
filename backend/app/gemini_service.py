"""
Virtual Try-On Service for Trendzy.
Uses Groq llama-4-scout vision model to analyze person + clothing
and generates an HTML-based try-on result card.
"""
import os
import uuid
import time
import base64
import threading
import requests
from pathlib import Path
from datetime import datetime, timedelta
from PIL import Image, ImageDraw, ImageFont
import io
from groq import Groq

GROQ_API_KEY = os.getenv('GROQ_API_KEY', '')

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
    img.save(buf, format='JPEG', quality=88)
    return buf.getvalue()

def _to_b64(image_bytes: bytes) -> str:
    return base64.b64encode(image_bytes).decode('utf-8')

def _create_result_image(
    person_bytes: bytes,
    clothing_bytes: bytes,
    analysis: dict,
    product_name: str
) -> bytes:
    """
    Create a side-by-side result image:
    Left: original person photo
    Right: clothing item
    Bottom: AI analysis text
    """
    person_img  = Image.open(io.BytesIO(person_bytes)).convert('RGB')
    clothing_img = Image.open(io.BytesIO(clothing_bytes)).convert('RGB')

    # Resize both to same height
    target_h = 400
    pw = int(person_img.width * target_h / person_img.height)
    cw = int(clothing_img.width * target_h / clothing_img.height)
    person_img   = person_img.resize((pw, target_h), Image.LANCZOS)
    clothing_img = clothing_img.resize((cw, target_h), Image.LANCZOS)

    # Canvas dimensions
    padding   = 20
    text_area = 160
    total_w   = pw + cw + padding * 3
    total_h   = target_h + text_area + padding * 2

    # Create canvas with dark background
    canvas = Image.new('RGB', (total_w, total_h), '#1a1410')
    draw   = ImageDraw.Draw(canvas)

    # Paste person photo
    canvas.paste(person_img, (padding, padding))
    draw.rectangle([padding-2, padding-2, padding+pw+2, padding+target_h+2],
                   outline='#c9a96e', width=2)

    # Paste clothing image
    canvas.paste(clothing_img, (padding*2 + pw, padding))
    draw.rectangle([padding*2+pw-2, padding-2, padding*2+pw+cw+2, padding+target_h+2],
                   outline='#c9a96e', width=2)

    # Labels
    try:
        font_small = ImageFont.truetype("arial.ttf", 14)
        font_large = ImageFont.truetype("arial.ttf", 18)
        font_title = ImageFont.truetype("arial.ttf", 22)
    except Exception:
        font_small = ImageFont.load_default()
        font_large = font_small
        font_title = font_small

    # "YOU" label
    draw.text((padding + pw//2 - 15, padding + target_h + 8),
              "YOU", fill='#c9a96e', font=font_large)
    # "OUTFIT" label
    draw.text((padding*2 + pw + cw//2 - 25, padding + target_h + 8),
              "OUTFIT", fill='#c9a96e', font=font_large)

    # AI analysis text
    fit_score   = analysis.get('fit_score', 8)
    style_match = analysis.get('style_match', 'Great')
    summary     = analysis.get('summary', '')[:120]

    y_text = padding + target_h + 35
    draw.text((padding, y_text),
              f"✦ {product_name}", fill='#ffffff', font=font_title)
    draw.text((padding, y_text + 28),
              f"Fit Score: {fit_score}/10  |  Style: {style_match}",
              fill='#c9a96e', font=font_large)
    # Wrap summary text
    words = summary.split()
    line, lines = '', []
    for word in words:
        test = f"{line} {word}".strip()
        if len(test) > 70:
            lines.append(line)
            line = word
        else:
            line = test
    if line:
        lines.append(line)
    for i, l in enumerate(lines[:2]):
        draw.text((padding, y_text + 55 + i*20),
                  l, fill='#9e9890', font=font_small)

    # Trendzy watermark
    draw.text((total_w - 120, total_h - 25),
              "TRENDZY Try-On", fill='rgba(201,169,110,150)', font=font_small)

    buf = io.BytesIO()
    canvas.save(buf, format='JPEG', quality=90)
    return buf.getvalue()


# ── Main try-on function ──────────────────────────────────────────────────────
def generate_tryon(
    user_photo_bytes:     bytes,
    clothing_image_bytes: bytes,
    product_name:         str = 'clothing item',
    client_ip:            str = '0.0.0.0'
) -> dict:

    if not _check_rate_limit(client_ip):
        return {'success': False, 'error': 'Too many requests. Wait a minute.'}

    if not GROQ_API_KEY:
        return {'success': False, 'error': 'GROQ_API_KEY not configured in .env'}

    try:
        person_bytes  = _resize_image(user_photo_bytes, 768)
        clothing_bytes = _resize_image(clothing_image_bytes, 512)

        person_b64   = _to_b64(person_bytes)
        clothing_b64 = _to_b64(clothing_bytes)

        print(f'[TryOn] Calling Groq llama-4-scout for: {product_name}')

        client = Groq(api_key=GROQ_API_KEY)

        response = client.chat.completions.create(
            model="meta-llama/llama-4-scout-17b-16e-instruct",
            messages=[{
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": f"""You are a professional fashion stylist AI for Trendzy, a premium fashion store.

Analyze these two images:
1. Person photo — note their body type, height estimate, skin tone, current style
2. Clothing item: {product_name}

Provide a detailed virtual try-on analysis in this EXACT JSON format (no extra text):
{{
  "fit_score": <number 1-10>,
  "style_match": "<Excellent/Great/Good/Fair>",
  "body_analysis": "<2-3 sentences about person body type and current look>",
  "outfit_analysis": "<2-3 sentences about the clothing item style and features>",
  "how_it_looks": "<3-4 sentences describing EXACTLY how this outfit would look on this specific person — be very detailed about fit, drape, length, colors on their skin tone>",
  "styling_tips": ["<tip 1>", "<tip 2>", "<tip 3>"],
  "occasion": "<best occasions for this outfit>",
  "summary": "<one powerful sentence summarizing the look>"
}}"""
                    },
                    {
                        "type": "image_url",
                        "image_url": {"url": f"data:image/jpeg;base64,{person_b64}"}
                    },
                    {
                        "type": "image_url",
                        "image_url": {"url": f"data:image/jpeg;base64,{clothing_b64}"}
                    }
                ]
            }],
            temperature=0.3,
            max_tokens=1024,
        )

        raw_text = response.choices[0].message.content.strip()
        print(f'[TryOn] Groq response received: {len(raw_text)} chars')

        # Parse JSON from response
        import json, re
        json_match = re.search(r'\{.*\}', raw_text, re.DOTALL)
        if json_match:
            analysis = json.loads(json_match.group())
        else:
            analysis = {
                'fit_score': 8,
                'style_match': 'Great',
                'how_it_looks': raw_text[:200],
                'styling_tips': [],
                'occasion': 'Casual & Formal',
                'summary': raw_text[:100]
            }

        # Create result image
        result_bytes = _create_result_image(
            person_bytes, clothing_bytes, analysis, product_name
        )

        filename = f'tryon_{uuid.uuid4().hex[:12]}.jpg'
        (RESULT_DIR / filename).write_bytes(result_bytes)

        print(f'[TryOn] ✓ Done: {filename}')
        return {
            'success':    True,
            'result_url': f'/static/tryon_results/{filename}',
            'filename':   filename,
            'analysis':   analysis
        }

    except Exception as e:
        print(f'[TryOn] ✗ {type(e).__name__}: {e}')
        return {'success': False, 'error': f'Analysis failed: {str(e)[:200]}'}
