"""
Oriflame Pakistan Scraper
Uses Playwright to scrape JS-rendered pages.
Setup: pip install playwright && python -m playwright install chromium
"""
import asyncio
import re
from typing import List, Dict

CATEGORY_URLS = {
    "Skincare":  "https://www.oriflame.com.pk/skincare",
    "Makeup":    "https://www.oriflame.com.pk/makeup",
    "Fragrance": "https://www.oriflame.com.pk/fragrance",
    "Haircare":  "https://www.oriflame.com.pk/hair-care",
    "Body":      "https://www.oriflame.com.pk/body",
}

UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0.0.0 Safari/537.36"


def _parse_price(text):
    digits = re.sub(r"[^\d.]", "", text.replace(",", ""))
    try:
        return float(digits)
    except ValueError:
        return 0.0


def _detect_category(url, name):
    u, n = url.lower(), name.lower()
    if "makeup" in u or any(k in n for k in ["lipstick","mascara","foundation","blush","eyeshadow","liner","bronz","highlighter","brow","lip"]):
        return "Makeup"
    if "fragrance" in u or any(k in n for k in ["parfum","eau de","perfume","mist","deodorant"]):
        return "Fragrance"
    if "hair" in u or any(k in n for k in ["shampoo","conditioner","hair","scalp"]):
        return "Haircare"
    if "body" in u or any(k in n for k in ["body","hand cream","lotion","shower","soap"]):
        return "Body"
    return "Skincare"


def _extract_from_text(page_text, base_url):
    products = []
    lines = [l.strip() for l in page_text.split("\n") if l.strip()]
    i = 0
    while i < len(lines):
        line = lines[i]
        if re.match(r"^\(\d+\)$", line):
            try:
                j = i + 1
                brand = lines[j] if j < len(lines) else ""
                j += 1
                name_parts = []
                while j < len(lines) and "PKR" not in lines[j]:
                    name_parts.append(lines[j])
                    j += 1
                    if len(name_parts) > 3:
                        break
                if j >= len(lines) or "PKR" not in lines[j]:
                    i += 1
                    continue
                price_line = lines[j]
                name = " ".join(name_parts).strip()
                prices = re.findall(r"PKR([\d,]+\.?\d*)", price_line)
                if not prices:
                    i += 1
                    continue
                sale_price = _parse_price(prices[0])
                orig_price = _parse_price(prices[1]) if len(prices) > 1 else sale_price
                full_name = f"{brand} {name}".strip() if brand and brand.lower() not in name.lower() else name
                full_name = re.sub(r"\s+", " ", full_name).strip()
                if full_name and sale_price > 100:
                    products.append({
                        "name":          full_name,
                        "description":   f"Premium {full_name} by Oriflame Pakistan.",
                        "originalPrice": orig_price,
                        "sellerPrice":   round(sale_price * 0.85),
                        "images":        [],
                        "category":      _detect_category(base_url, full_name),
                        "tags":          ["oriflame", "pakistan"],
                        "stock":         20,
                        "oriflameUrl":   base_url,
                    })
            except (IndexError, ValueError):
                pass
        i += 1
    return products


async def scrape_oriflame_category(url: str, max_products: int = 100) -> List[Dict]:
    try:
        from playwright.async_api import async_playwright
    except ImportError:
        print("[scraper] Playwright not installed.")
        return []

    products = []
    async with async_playwright() as pw:
        browser = await pw.chromium.launch(headless=True, args=["--no-sandbox","--disable-setuid-sandbox","--disable-dev-shm-usage"])
        context = await browser.new_context(user_agent=UA, locale="en-US", viewport={"width":1440,"height":900})
        page = await context.new_page()
        await page.route("**/*.{woff,woff2,ttf,otf,eot}", lambda r: r.abort())

        try:
            print(f"[scraper] Loading {url}")
            await page.goto(url, wait_until="domcontentloaded", timeout=45000)
            await asyncio.sleep(3)
            await page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
            await asyncio.sleep(2)
            await page.evaluate("window.scrollTo(0, 0)")
            await asyncio.sleep(1)

            for _ in range(15):
                try:
                    btn = page.locator("button:has-text('Show'), button:has-text('show'), button:has-text('Load')")
                    if await btn.count() > 0 and await btn.first.is_visible():
                        await btn.first.click()
                        await asyncio.sleep(1.5)
                        await page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
                        await asyncio.sleep(0.8)
                    else:
                        break
                except Exception:
                    break

            await page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
            await asyncio.sleep(2)

            page_text = await page.evaluate("() => document.body.innerText")

            js_data = await page.evaluate("""
() => {
    var links = Array.from(document.querySelectorAll("a[href*='/products/']"))
        .map(function(a){ return a.href; })
        .filter(function(v,i,arr){ return arr.indexOf(v)===i; })
        .filter(function(h){ return h.includes("/products/") && !h.endsWith("/products/"); });
    var imgs = Array.from(document.querySelectorAll("img"))
        .map(function(img){ return img.src || img.getAttribute("data-src") || ""; })
        .filter(function(src){ return src.includes("media-cdn.oriflame.com"); });
    return { links: links, imgs: imgs };
}
""")

            product_links = js_data.get("links", [])
            cdn_images    = js_data.get("imgs", [])
            print(f"[scraper] {len(product_links)} links, {len(cdn_images)} images")

            products = _extract_from_text(page_text, url)
            print(f"[scraper] {len(products)} products parsed from {url}")

            for idx, product in enumerate(products):
                if idx < len(cdn_images):
                    product["images"] = [cdn_images[idx]]
                if idx < len(product_links):
                    product["oriflameUrl"] = product_links[idx]

        except Exception as e:
            import traceback
            print(f"[scraper] Error: {e}")
            traceback.print_exc()
        finally:
            await browser.close()

    return products[:max_products]


async def scrape_all_categories(max_per_category: int = 50) -> List[Dict]:
    all_products = []
    for category, url in CATEGORY_URLS.items():
        print(f"[scraper] === {category} ===")
        prods = await scrape_oriflame_category(url, max_per_category)
        all_products.extend(prods)
        await asyncio.sleep(2)
    return all_products
