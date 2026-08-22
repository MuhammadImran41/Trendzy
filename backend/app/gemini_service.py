"""
Virtual Try-On Service for Trendzy.
Uses Groq llama-4-scout vision to analyze + Pillow to create
a realistic clothing overlay composite image.
"""
import os
import uuid
import time
import base64
import threading
import requests
from pathlib import Path
from datetime import datetime, timedelta
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance
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

# ── Helpers ───────────────────────────────────────────────────────────────────
def _resize_image(image_bytes: bytes, max_dim: int = 768) -> bytes:
    img = Image.open(io.BytesIO(image_bytes)).convert('RGB')
    w, h = img.size
    if w > max_dim or h > max_dim:
        img.thumbnail((max_dim, max_dim), Image.LANCZOS)
    buf = io.BytesIO()
    img.save(buf, format='JPEG', quality=90)
    return buf.getvalue()

def _to_b64(image_bytes: bytes) -> str:
    return base64.b64encode(image_bytes).decode('utf-8')

def _load_font(size: int):
    for font_name in ['arial.ttf', 'Arial.ttf', 'DejaVuSans.ttf', 'FreeSans.ttf']:
        try:
            return ImageFont.truetype(font_name, size)
        except Exception:
            continue
    return ImageFont.load_default()

def _remove_background_simple(img: Image.Image) -> Image.Image:
    """Simple background removal — make white/light bg transparent."""
    img = img.convert('RGBA')
    data = img.getdata()
    new_data = []
    for r, g, b, a in data:
        # If pixel is very light (white bg) make transparent
        if r > 200 and g > 200 and b > 200:
            new_data.append((r, g, b, 0))
        elif r > 180 and g > 180 and b > 180:
            # Semi-transparent for near-white
            new_data.append((r, g, b, 80))
        else:
            new_data.append((r, g, b, a))
    img.putdata(new_data)
    return img

def _create_composite_tryon(
    person_bytes: bytes,
    clothing_bytes: bytes,
    analysis: dict,
    product_name: str
) -> bytes:
    """
    Create a premium try-on result:
    - Large person photo on left with clothing overlaid on torso area
    - Clothing reference on right  
    - AI analysis card at bottom
    """
    person_img   = Image.open(io.BytesIO(person_bytes)).convert('RGBA')
    clothing_img = Image.open(io.BytesIO(clothing_bytes)).convert('RGBA')

    # ── Canvas setup ──────────────────────────────────────────────────────────
    person_w, person_h = 420, 520
    clothing_w, clothing_h = 300, 360
    padding   = 24
    info_h    = 200
    total_w   = person_w + clothing_w + padding * 3
    total_h   = max(person_h, clothing_h + 100) + info_h + padding * 2 + 60

    canvas = Image.new('RGBA', (total_w, total_h), (26, 20, 16, 255))
    draw   = ImageDraw.Draw(canvas)

    # ── Gold header bar ────────────────────────────────────────────────────────
    header_h = 52
    for y in range(header_h):
        ratio = y / header_h
        r = int(201 * (1 - ratio * 0.3))
        g = int(169 * (1 - ratio * 0.3))
        b = int(110 * (1 - ratio * 0.3))
        draw.line([(0, y), (total_w, y)], fill=(r, g, b, 255))

    # Header text
    font_header = _load_font(22)
    font_sub    = _load_font(13)
    draw.text((padding, 14), "✦ TRENDZY Virtual Try-On",
              fill=(26, 20, 16), font=font_header)
    draw.text((total_w - 180, 19), "AI Fashion Analysis",
              fill=(26, 20, 16, 180), font=font_sub)

    # ── Person photo (left panel) ──────────────────────────────────────────────
    p_img = person_img.copy()
    p_img.thumbnail((person_w, person_h), Image.LANCZOS)
    pw, ph = p_img.size
    px = padding
    py = header_h + padding

    # Shadow effect
    shadow = Image.new('RGBA', (pw + 8, ph + 8), (0, 0, 0, 0))
    shadow_draw = ImageDraw.Draw(shadow)
    shadow_draw.rectangle([4, 4, pw + 4, ph + 4], fill=(0, 0, 0, 120))
    shadow = shadow.filter(ImageFilter.GaussianBlur(6))
    canvas.paste(shadow, (px - 2, py - 2), shadow)
    canvas.paste(p_img, (px, py), p_img)

    # Gold border around person
    draw.rectangle([px - 3, py - 3, px + pw + 3, py + ph + 3],
                   outline=(201, 169, 110, 255), width=2)

    # ── Clothing OVERLAY on person torso ──────────────────────────────────────
    # Place clothing semi-transparently on the torso area of person photo
    cl_overlay = clothing_img.copy()

    # Estimate torso area: roughly middle 50% width, top 30-70% height
    torso_w = int(pw * 0.75)
    torso_h = int(ph * 0.48)
    cl_overlay.thumbnail((torso_w, torso_h), Image.LANCZOS)
    cow, coh = cl_overlay.size

    # Position: centered horizontally, upper-middle of person
    cl_x = px + (pw - cow) // 2
    cl_y = py + int(ph * 0.22)

    # Make clothing semi-transparent for overlay effect
    cl_rgba = cl_overlay.convert('RGBA')
    # Remove white background
    cl_rgba = _remove_background_simple(cl_rgba)
    # Apply blend transparency
    r2, g2, b2, a2 = cl_rgba.split()
    a2 = a2.point(lambda x: int(x * 0.72))  # 72% opacity
    cl_rgba = Image.merge('RGBA', (r2, g2, b2, a2))

    canvas.paste(cl_rgba, (cl_x, cl_y), cl_rgba)

    # Small "Try-On" badge on overlay
    draw.rectangle([cl_x, cl_y - 18, cl_x + 70, cl_y - 2],
                   fill=(201, 169, 110, 220))
    draw.text((cl_x + 4, cl_y - 16), "▶ Try-On",
              fill=(26, 20, 16), font=_load_font(11))

    # "YOU" label
    draw.rectangle([px, py + ph + 6, px + pw, py + ph + 26],
                   fill=(201, 169, 110, 200))
    draw.text((px + pw // 2 - 14, py + ph + 8), "YOU",
              fill=(26, 20, 16), font=_load_font(13))

    # ── Clothing reference (right panel) ──────────────────────────────────────
    cl_ref = clothing_img.copy()
    cl_ref.thumbnail((clothing_w, clothing_h), Image.LANCZOS)
    crw, crh = cl_ref.size
    crx = px + pw + padding * 2
    cry = header_h + padding + 40

    # White card bg for clothing
    card_pad = 12
    draw.rectangle([crx - card_pad, cry - card_pad,
                    crx + crw + card_pad, cry + crh + card_pad],
                   fill=(245, 240, 232, 255))
    draw.rectangle([crx - card_pad - 1, cry - card_pad - 1,
                    crx + crw + card_pad + 1, cry + crh + card_pad + 1],
                   outline=(201, 169, 110, 255), width=2)
    canvas.paste(cl_ref, (crx, cry), cl_ref)

    # "OUTFIT" label
    draw.rectangle([crx - card_pad, cry + crh + card_pad + 2,
                    crx + crw + card_pad, cry + crh + card_pad + 22],
                   fill=(201, 169, 110, 200))
    draw.text((crx + crw // 2 - 22, cry + crh + card_pad + 4), "OUTFIT",
              fill=(26, 20, 16), font=_load_font(13))

    # Product name under outfit
    draw.text((crx - card_pad, cry + crh + card_pad + 28),
              product_name[:35], fill=(245, 240, 232, 255), font=_load_font(13))

    # ── AI Analysis card (bottom) ──────────────────────────────────────────────
    info_y = header_h + padding + max(person_h, clothing_h + 60) + padding

    # Dark info card
    draw.rectangle([padding, info_y, total_w - padding, info_y + info_h],
                   fill=(30, 26, 22, 255))
    draw.rectangle([padding - 1, info_y - 1,
                    total_w - padding + 1, info_y + info_h + 1],
                   outline=(201, 169, 110, 180), width=1)

    # Fit score + style
    fit_score   = analysis.get('fit_score', 8)
    style_match = analysis.get('style_match', 'Great')
    occasion    = analysis.get('occasion', '')[:40]
    how_it_looks = analysis.get('how_it_looks', '')
    tips        = analysis.get('styling_tips', [])

    font_label  = _load_font(11)
    font_value  = _load_font(16)
    font_body   = _load_font(12)

    # Score badges
    bx = padding + 12
    by = info_y + 14
    draw.rectangle([bx, by, bx + 110, by + 30], fill=(201, 169, 110, 255))
    draw.text((bx + 8, by + 7), f"Fit Score: {fit_score}/10",
              fill=(26, 20, 16), font=font_value)

    draw.rectangle([bx + 120, by, bx + 240, by + 30], fill=(50, 44, 38, 255))
    draw.rectangle([bx + 119, by - 1, bx + 241, by + 31],
                   outline=(201, 169, 110, 150), width=1)
    draw.text((bx + 128, by + 7), f"Style: {style_match}",
              fill=(201, 169, 110), font=font_value)

    draw.rectangle([bx + 250, by, bx + 420, by + 30], fill=(50, 44, 38, 255))
    draw.rectangle([bx + 249, by - 1, bx + 421, by + 31],
                   outline=(201, 169, 110, 150), width=1)
    draw.text((bx + 258, by + 7), f"✦ {occasion}",
              fill=(158, 152, 144), font=font_value)

    # How it looks
    draw.text((bx, by + 40), "How it looks on you:",
              fill=(201, 169, 110), font=_load_font(13))

    # Wrap text
    words = how_it_looks.split()
    line, lines_out = '', []
    for word in words:
        test = f"{line} {word}".strip()
        if len(test) > 85:
            lines_out.append(line)
            line = word
        else:
            line = test
    if line:
        lines_out.append(line)

    for i, ln in enumerate(lines_out[:3]):
        draw.text((bx, by + 58 + i * 18), ln,
                  fill=(200, 195, 188), font=font_body)

    # Tips
    if tips:
        draw.text((bx, by + 58 + 3 * 18 + 8), "Tips:",
                  fill=(201, 169, 110), font=_load_font(12))
        for i, tip in enumerate(tips[:2]):
            draw.text((bx + 8, by + 58 + 3 * 18 + 24 + i * 16),
                      f"• {tip[:75]}", fill=(158, 152, 144), font=font_label)

    # ── Convert & return ───────────────────────────────────────────────────────
    final = canvas.convert('RGB')
    buf   = io.BytesIO()
    final.save(buf, format='JPEG', quality=92)
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
        person_bytes_r   = _resize_image(user_photo_bytes, 800)
        clothing_bytes_r = _resize_image(clothing_image_bytes, 600)

        print(f'[TryOn] Calling Groq llama-4-scout for: {product_name}')

        client = Groq(api_key=GROQ_API_KEY)

        response = client.chat.completions.create(
            model="meta-llama/llama-4-scout-17b-16e-instruct",
            messages=[{
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": f"""You are an expert AI fashion stylist for Trendzy premium fashion store.

I am showing you TWO images:
- IMAGE 1: A person's photo (their face, body, skin tone, current outfit)
- IMAGE 2: A clothing product called "{product_name}"

Your job is to give a DETAILED, PERSONALIZED virtual try-on analysis — describe EXACTLY how this specific clothing item would look on THIS specific person.

Be very specific: mention their skin tone, body shape, how the color complements them, how the fit would be, what the overall look would be.

Return ONLY this JSON (no markdown, no extra text):
{{
  "fit_score": <integer 1-10>,
  "style_match": "<Excellent|Great|Good|Fair>",
  "body_analysis": "<Describe this person specifically: skin tone, body type, height estimate, their current style>",
  "outfit_analysis": "<Describe the clothing: colors, style, fabric look, design details>",
  "how_it_looks": "<DETAILED 4-5 sentences: How would THIS outfit look on THIS person? Describe the color contrast with their skin, how it fits their body type, the overall vibe they'd give off, what features it highlights>",
  "styling_tips": ["<Specific tip 1 for this person>", "<Specific tip 2>", "<Specific tip 3>"],
  "occasion": "<Best occasions for this person to wear this>",
  "summary": "<One powerful sentence about the complete look>"
}}"""
                    },
                    {
                        "type": "image_url",
                        "image_url": {"url": f"data:image/jpeg;base64,{_to_b64(person_bytes_r)}"}
                    },
                    {
                        "type": "image_url",
                        "image_url": {"url": f"data:image/jpeg;base64,{_to_b64(clothing_bytes_r)}"}
                    }
                ]
            }],
            temperature=0.4,
            max_tokens=1200,
        )

        raw_text = response.choices[0].message.content.strip()
        print(f'[TryOn] Groq response: {len(raw_text)} chars')

        import json, re
        json_match = re.search(r'\{.*\}', raw_text, re.DOTALL)
        if json_match:
            analysis = json.loads(json_match.group())
        else:
            analysis = {
                'fit_score': 8, 'style_match': 'Great',
                'how_it_looks': raw_text[:300],
                'styling_tips': [], 'occasion': 'Casual & Formal',
                'summary': raw_text[:100]
            }

        # Build composite result image
        result_bytes = _create_composite_tryon(
            person_bytes_r, clothing_bytes_r, analysis, product_name
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
