"""
Markaz.app Product Scraper for Trendzy
---------------------------------------
Scrapes products from markaz.app and saves to Trendzy PostgreSQL database.

Usage:
  python markaz_scraper.py                          # Scrape all categories (50 each)
  python markaz_scraper.py --limit 100              # 100 products per category
  python markaz_scraper.py --category women         # Single category
  python markaz_scraper.py --markup 40              # 40% markup on cost price
"""

import asyncio
import sys
import uuid
import json
import re
import argparse
from datetime import datetime
from dotenv import load_dotenv
from playwright.async_api import async_playwright

load_dotenv()

from app.database import SessionLocal, ProductDB, init_db

# ── Category URLs ──────────────────────────────────────────────────────────────
CATEGORIES = {
    "womens-unstitched":     ("https://www.markaz.app/shop/home-page/Women%27s%20Unstitched",    "Women's Unstitched"),
    "womens-stitched":       ("https://www.markaz.app/shop/home-page/Women%27s%20Stitched",      "Women's Stitched"),
    "mens-unstitched":       ("https://www.markaz.app/shop/home-page/Men%27s%20Unstitched",      "Men's Unstitched"),
    "mens-stitched":         ("https://www.markaz.app/shop/home-page/Men%27s%20Stitched",        "Men's Stitched"),
    "kids-clothing":         ("https://www.markaz.app/shop/home-page/Kids%20Clothing",           "Kids Clothing"),
    "kids-accessories":      ("https://www.markaz.app/shop/home-page/Kids%20Accessories",        "Kids Accessories"),
    "cosmetics":             ("https://www.markaz.app/shop/home-page/Cosmetics",                 "Cosmetics"),
    "jewellery":             ("https://www.markaz.app/shop/home-page/Jewellery",                 "Jewellery"),
    "shoes":                 ("https://www.markaz.app/shop/home-page/Shoes",                     "Shoes"),
    "bags":                  ("https://www.markaz.app/shop/home-page/Bags",                      "Bags"),
    "electronics":           ("https://www.markaz.app/shop/home-page/Electronics",               "Electronics"),
    "electronic-accessories":("https://www.markaz.app/shop/home-page/Electronic%20Accessories",  "Electronic Accessories"),
    "home-decor":            ("https://www.markaz.app/shop/home-page/Home%20Decor",              "Home Decor"),
    "home-essentials":       ("https://www.markaz.app/shop/home-page/Home%20Essentials",         "Home Essentials"),
    "home-linen":            ("https://www.markaz.app/shop/home-page/Home%20Linen",              "Home Linen"),
    "bedding":               ("https://www.markaz.app/shop/home-page/Bedding",                   "Bedding"),
    "kitchenware":           ("https://www.markaz.app/shop/home-page/Kitchenware",               "Kitchenware"),
    "fashion-accessories":   ("https://www.markaz.app/shop/home-page/Fashion%20Accessories",     "Fashion Accessories"),
    "perfumes":              ("https://www.markaz.app/shop/home-page/Perfumes",                  "Perfumes"),
    "womens-handbags":       ("https://www.markaz.app/shop/home-page/Women%27s%20Handbags",      "Women's Handbags"),
    "fitness":               ("https://www.markaz.app/shop/home-page/Fitness",                   "Fitness"),
    "mother-baby":           ("https://www.markaz.app/shop/home-page/Mother%20%26%20Baby",       "Mother & Baby"),
    "islamic-accessories":   ("https://www.markaz.app/shop/home-page/Islamic%20Accessories",     "Islamic Accessories"),
    "auto-bike":             ("https://www.markaz.app/shop/home-page/Auto%20%26%20Bike%20Accessories", "Auto & Bike Accessories"),
    "unisex-clothing":       ("https://www.markaz.app/shop/home-page/Unisex%20Clothing",         "Unisex Clothing"),
    "books-stationery":      ("https://www.markaz.app/shop/home-page/Books%20%26%20Stationery",  "Books & Stationery"),
    "womens-shawls":         ("https://www.markaz.app/shop/home-page/Women%27s%20Shawls",        "Women's Shawls"),
    "mens-shawls":           ("https://www.markaz.app/shop/home-page/Men%27s%20Shawls",          "Men's Shawls"),
    "mens-undergarments":    ("https://www.markaz.app/shop/home-page/Men%27s%20Undergarments",   "Men's Undergarments"),
    "festive":               ("https://www.markaz.app/shop/home-page/Festive%20Collection",      "Festive Collection"),
}

UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36"


# ── Scrape one category ────────────────────────────────────────────────────────
async def scrape_category(url: str, cat_name: str, limit: int) -> list[dict]:
    products = []

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True, args=["--no-sandbox"])
        ctx     = await browser.new_context(user_agent=UA, viewport={"width": 1440, "height": 900})
        page    = await ctx.new_page()

        # Intercept RSC / JSON API calls
        rsc_data = []
        async def intercept(res):
            url_ = res.url
            if "_rsc" in url_ or "products" in url_:
                try:
                    text = await res.text()
                    if text and len(text) > 50:
                        rsc_data.append({"url": url_, "text": text})
                except Exception:
                    pass
        page.on("response", intercept)

        print(f"  [→] Loading: {url}")
        try:
            await page.goto(url, timeout=30000, wait_until="domcontentloaded")
            await page.wait_for_timeout(4000)
        except Exception as e:
            print(f"  [!] Load error: {e}")

        # Scroll to load more
        scroll_rounds = min(limit // 8 + 1, 8)
        for i in range(scroll_rounds):
            await page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
            await page.wait_for_timeout(1800)

        # ── Try 1: Extract from DOM ─────────────────────────────────────────────
        dom_products = await page.evaluate("""
            () => {
                const results = [];
                // Find all anchor tags pointing to product pages
                const links = document.querySelectorAll('a[href*="/product/"], a[href*="/p/"]');
                links.forEach(a => {
                    const img = a.querySelector('img');
                    const texts = [...a.querySelectorAll('*')].map(el => el.innerText).filter(t => t && t.trim());
                    const priceMatch = texts.join(' ').match(/(?:PKR|Rs\\.?|₨)\\s*([\\d,]+)/i);
                    const nameEl = a.querySelector('h2, h3, [class*="name"], [class*="title"], p');
                    const name = nameEl?.innerText?.trim() || texts.find(t => t.length > 5 && t.length < 100);
                    if (name) {
                        results.push({
                            name:   name,
                            price:  priceMatch ? priceMatch[1].replace(/,/g,'') : '0',
                            image:  img?.src || img?.dataset?.src || '',
                            href:   a.href || '',
                        });
                    }
                });
                // Also try card containers
                const cards = document.querySelectorAll('[class*="card"], [class*="Card"], [class*="product"], article');
                cards.forEach(card => {
                    const img = card.querySelector('img');
                    const nameEl = card.querySelector('h2, h3, h4, [class*="name"], [class*="title"]');
                    const priceEl = card.querySelector('[class*="price"], [class*="Price"]');
                    const linkEl = card.querySelector('a');
                    const name = nameEl?.innerText?.trim();
                    if (name && name.length > 3) {
                        const priceText = priceEl?.innerText || '';
                        const priceMatch = priceText.match(/[\\d,]+/);
                        results.push({
                            name:   name,
                            price:  priceMatch ? priceMatch[0].replace(/,/g,'') : '0',
                            image:  img?.src || img?.dataset?.src || '',
                            href:   linkEl?.href || '',
                        });
                    }
                });
                return results;
            }
        """)

        if dom_products:
            print(f"  [DOM] Found {len(dom_products)} products")
            for p_data in dom_products[:limit]:
                if p_data.get("name"):
                    products.append({
                        "name":     p_data["name"].strip(),
                        "price":    float(p_data.get("price") or 0),
                        "image":    p_data.get("image", ""),
                        "url":      p_data.get("href", ""),
                        "category": cat_name,
                    })

        # ── Try 2: Extract from RSC/JSON responses ──────────────────────────────
        if len(products) < 5:
            print(f"  [RSC] Checking {len(rsc_data)} intercepted responses...")
            for resp in rsc_data:
                extracted = _parse_rsc_text(resp["text"], cat_name)
                for e in extracted:
                    if e not in products:
                        products.append(e)
                if len(products) >= limit:
                    break

        # ── Try 3: __NEXT_DATA__ ────────────────────────────────────────────────
        if len(products) < 5:
            next_script = await page.evaluate("() => document.getElementById('__NEXT_DATA__')?.textContent || ''")
            if next_script:
                try:
                    nd = json.loads(next_script)
                    extracted = _walk_for_products(nd, cat_name)
                    products.extend(extracted[:limit - len(products)])
                    if extracted:
                        print(f"  [NEXT_DATA] Found {len(extracted)} products")
                except Exception:
                    pass

        await browser.close()

    # Deduplicate by name
    seen = set()
    unique = []
    for p in products:
        name = p.get("name", "").strip()
        if name and name not in seen and len(name) > 3:
            seen.add(name)
            unique.append(p)

    print(f"  [✓] {len(unique)} unique products scraped")
    return unique[:limit]


def _parse_rsc_text(text: str, cat_name: str) -> list[dict]:
    """Extract product data from React Server Component responses."""
    results = []
    # RSC format: 1:["$","div",null,{"children":[...]}]
    # Look for product-like JSON objects
    patterns = [
        r'"(?:productName|name)"\s*:\s*"([^"]{5,100})"',
        r'"(?:price|sellingPrice|mrp)"\s*:\s*(\d+(?:\.\d+)?)',
        r'"(?:imageUrl|image|thumbnail)"\s*:\s*"(https?://[^"]+)"',
    ]
    names  = re.findall(patterns[0], text)
    prices = re.findall(patterns[1], text)
    images = re.findall(patterns[2], text)

    for i, name in enumerate(names[:50]):
        if any(skip in name.lower() for skip in ['undefined', 'null', 'class', 'component']):
            continue
        results.append({
            "name":     name.strip(),
            "price":    float(prices[i]) if i < len(prices) else 0,
            "image":    images[i] if i < len(images) else "",
            "category": cat_name,
        })
    return results


def _walk_for_products(obj, cat_name: str) -> list[dict]:
    """Recursively walk JSON to find product objects."""
    results = []

    def _walk(o):
        if isinstance(o, dict):
            name = o.get("productName") or o.get("name") or o.get("title")
            price = o.get("price") or o.get("sellingPrice") or o.get("mrp") or 0
            img = o.get("imageUrl") or o.get("image") or o.get("thumbnail") or ""
            if isinstance(img, list):
                img = img[0] if img else ""
            if name and isinstance(name, str) and len(name) > 3 and len(name) < 150:
                results.append({
                    "name":     name.strip(),
                    "price":    float(str(price).replace(",", "")) if price else 0,
                    "image":    str(img),
                    "category": cat_name,
                })
            for v in o.values():
                _walk(v)
        elif isinstance(o, list):
            for item in o:
                _walk(item)

    _walk(obj)
    return results


# ── Save to DB ─────────────────────────────────────────────────────────────────
def save_to_db(products: list[dict], markup: float = 30.0) -> tuple[int, int]:
    db = SessionLocal()
    saved = skipped = 0

    for p in products:
        name = (p.get("name") or "").strip()
        if not name or len(name) < 3:
            skipped += 1
            continue

        # Skip duplicates
        if db.query(ProductDB).filter(ProductDB.name == name).first():
            skipped += 1
            continue

        cost   = p.get("price") or 999
        sell   = round(cost * (1 + markup / 100) / 10) * 10  # round to 10s
        orig   = round(sell * 1.25 / 10) * 10

        image  = p.get("image") or ""
        # Fix relative image URLs
        if image.startswith("//"):
            image = "https:" + image

        try:
            db.add(ProductDB(
                id            = str(uuid.uuid4()),
                name          = name,
                description   = f"Premium quality {name}. Available for fast delivery across Pakistan.",
                originalPrice = orig or sell * 1.25,
                sellerPrice   = sell or 999,
                images        = [image] if image else [],
                category      = p.get("category", "Imported"),
                tags          = ["markaz", "imported"],
                stock         = 50,
                isActive      = True,
                oriflameUrl   = p.get("url") or None,
                createdAt     = datetime.utcnow(),
                updatedAt     = datetime.utcnow(),
            ))
            saved += 1
        except Exception as e:
            skipped += 1
            db.rollback()
            print(f"  [DB] Error: {e}")

    db.commit()
    db.close()
    return saved, skipped


# ── Main ───────────────────────────────────────────────────────────────────────
async def main():
    parser = argparse.ArgumentParser(description="Markaz.app → Trendzy Importer")
    parser.add_argument("--category", choices=list(CATEGORIES.keys()), help="Single category slug")
    parser.add_argument("--limit",    type=int,   default=50,   help="Products per category (default: 50)")
    parser.add_argument("--markup",   type=float, default=30.0, help="Markup %% on cost price (default: 30)")
    args = parser.parse_args()

    init_db()

    to_scrape = (
        {args.category: CATEGORIES[args.category]}
        if args.category else CATEGORIES
    )

    print("=" * 60)
    print("  Markaz.app  →  Trendzy Importer")
    print("=" * 60)
    print(f"  Categories : {len(to_scrape)}")
    print(f"  Limit      : {args.limit} per category")
    print(f"  Markup     : {args.markup}%")
    print("=" * 60)

    total_saved = total_skipped = 0

    for slug, (url, cat_name) in to_scrape.items():
        print(f"\n📦  {cat_name}  ({slug})")
        products = await scrape_category(url, cat_name, args.limit)
        if products:
            saved, skipped = save_to_db(products, args.markup)
            total_saved   += saved
            total_skipped += skipped
            print(f"  💾 Saved: {saved} | Skipped: {skipped}")
            # Show sample
            for p in products[:2]:
                print(f"     → {p['name'][:55]} | PKR {p['price']}")
        else:
            print(f"  ⚠️  No products found")

    print(f"\n{'='*60}")
    print(f"  ✅ Total saved   : {total_saved}")
    print(f"  ⏭  Total skipped : {total_skipped}")
    print(f"{'='*60}\n")


if __name__ == "__main__":
    asyncio.run(main())
