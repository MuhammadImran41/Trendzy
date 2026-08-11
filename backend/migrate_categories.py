"""
Migrate products to 5 nav categories + delete uncategorized ones.
Run: python migrate_categories.py
"""
from dotenv import load_dotenv
load_dotenv('.env')

from app.database import SessionLocal, ProductDB

db = SessionLocal()

# ── Mapping: old category → new category ─────────────────────────────────────
REMAP = {
    # Women
    "Women's Unstitched":   "Clothing",
    "Women's Stitched":     "Clothing",
    "Women's Shawls":       "Clothing",
    "Festive Collection":   "Clothing",
    "Women Undergarments":  "Clothing",

    # Men
    "Men's Unstitched":     "Clothing",
    "Men's Stitched":       "Clothing",
    "Men's Shawls":         "Clothing",
    "Men's Undergarments":  "Clothing",
    "Unisex Clothing":      "Clothing",
    "Kids Clothing":        "Clothing",

    # Beauty
    "Cosmetics":            "Beauty",
    "Perfumes":             "Beauty",

    # Footwear
    "Shoes":                "Footwear",
    "Footwear":             "Footwear",

    # Accessories / Handbags
    "Women's Handbags":     "Accessories",
    "Bags":                 "Accessories",
    "Fashion Accessories":  "Accessories",
    "Jewellery":            "Accessories",
}

# Categories to DELETE completely
DELETE_CATS = [
    'Electronics', 'Kitchenware', 'Books & Stationery', 'Home Decor',
    'Fitness', 'Kids Accessories', 'Auto & Bike Accessories',
    'Mother & Baby', 'Home Essentials', 'Home Linen',
    'Electronic Accessories', 'Bedding', 'Sports & Outdoors',
    'Bedsheets & Curtains', 'Islamic Accessories',
]

# Also add sub-tags so Women/Men filters work in frontend
SUBTAG = {
    "Women's Unstitched":  "Women's Unstitched",
    "Women's Stitched":    "Women's Stitched",
    "Women's Shawls":      "Women's Unstitched",
    "Festive Collection":  "Women's Stitched",
    "Women Undergarments": "Women's Casual",
    "Men's Unstitched":    "Men's Unstitched",
    "Men's Stitched":      "Men's Stitched",
    "Men's Shawls":        "Men's Unstitched",
    "Men's Undergarments": "Men's Casual",
    "Unisex Clothing":     "Men's Casual",
    "Kids Clothing":       "Women's Casual",
}

# ── Step 1: Delete unwanted products ─────────────────────────────────────────
deleted = db.query(ProductDB).filter(ProductDB.category.in_(DELETE_CATS)).delete(synchronize_session=False)
print(f"Deleted {deleted} products from unwanted categories")

# ── Step 2: Remap categories + set subtag ────────────────────────────────────
updated = 0
for old_cat, new_cat in REMAP.items():
    products = db.query(ProductDB).filter(ProductDB.category == old_cat).all()
    for p in products:
        p.category = new_cat
        # Set subtag as first tag so frontend sub-filter works
        subtag = SUBTAG.get(old_cat)
        if subtag:
            existing = list(p.tags or [])
            # Remove any existing sub-tags to avoid duplicates
            known_subs = list(SUBTAG.values())
            existing = [t for t in existing if t not in known_subs]
            p.tags = [subtag] + existing
        updated += 1

db.commit()
print(f"Remapped {updated} products")

# ── Step 3: Summary ──────────────────────────────────────────────────────────
from sqlalchemy import func
results = db.query(ProductDB.category, func.count(ProductDB.id)).group_by(ProductDB.category).all()
print("\nFinal category distribution:")
for cat, cnt in sorted(results, key=lambda x: -x[1]):
    print(f"  {cnt:4d}  {cat}")

total = db.query(func.count(ProductDB.id)).scalar()
print(f"\nTotal products remaining: {total}")
db.close()
