"""
Oriflame Product Scraper
Uses Playwright (headless browser) to scrape product data.
Run: playwright install chromium  (once)
"""
import asyncio
from playwright.async_api import async_playwright
from bs4 import BeautifulSoup
from typing import List, Dict

async def scrape_oriflame_category(url: str) -> List[Dict]:
    """
    Scrape product listings from an Oriflame category page.
    Returns a list of product dicts.
    """
    products = []

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()

        # Set headers to avoid bot detection
        await page.set_extra_http_headers({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })

        try:
            await page.goto(url, wait_until='networkidle', timeout=30000)
            await asyncio.sleep(3)  # Wait for dynamic content

            html = await page.content()
            soup = BeautifulSoup(html, 'html.parser')

            # NOTE: These selectors may need updating based on Oriflame's current HTML structure
            # Inspect the site and update accordingly
            product_cards = soup.select('.product-card, [class*="product-item"], [class*="ProductCard"]')

            for card in product_cards[:20]:  # Limit to 20 per scrape
                try:
                    name_el = card.select_one('[class*="product-name"], [class*="ProductName"], h3, h2')
                    price_el = card.select_one('[class*="price"], [class*="Price"]')
                    img_el = card.select_one('img')
                    link_el = card.select_one('a[href]')

                    name = name_el.get_text(strip=True) if name_el else 'Unknown Product'
                    price_text = price_el.get_text(strip=True) if price_el else '0'
                    price = float(''.join(filter(str.isdigit, price_text)) or 0)
                    image = img_el.get('src') or img_el.get('data-src', '') if img_el else ''
                    product_url = 'https://www.oriflame.com' + link_el['href'] if link_el else url

                    if name != 'Unknown Product':
                        products.append({
                            'name': name,
                            'description': f'Premium {name} from Oriflame. High quality beauty product.',
                            'price': price,
                            'originalPrice': price,
                            'sellerPrice': round(price * 0.85),
                            'images': [image] if image else [],
                            'category': 'Skincare',
                            'tags': [],
                            'oriflameUrl': product_url,
                        })
                except Exception:
                    continue

        except Exception as e:
            print(f'Scraper error: {e}')
        finally:
            await browser.close()

    return products
