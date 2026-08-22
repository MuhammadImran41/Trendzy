"""Direct SQLite seed using raw SQL — bypasses SQLAlchemy ORM version issues."""
import sqlite3, uuid, json
from datetime import datetime

DB_PATH = "./trendzy.db"
conn = sqlite3.connect(DB_PATH)
cur = conn.cursor()

now = datetime.utcnow().isoformat()

# ── Categories ────────────────────────────────────────────────────────────────
categories = [
    ("Clothing",     "👗", "https://images.unsplash.com/photo-1594938298603-c8148c4b4aea?w=600", ["Women","Men","Kids"], 1),
    ("Beauty",       "💄", "https://images.unsplash.com/photo-1512207736890-6ffed8a84e8d?w=600", ["Skincare","Makeup","Fragrance"], 2),
    ("Electronics",  "📱", "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=600", ["Phones","Earbuds","Gadgets"], 3),
    ("Kitchen",      "🍳", "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600",    ["Cookware","Appliances","Storage"], 4),
    ("Footwear",     "👟", "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600",    ["Women","Men","Kids"], 5),
    ("Accessories",  "👜", "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600",    ["Bags","Jewellery","Wallets"], 6),
    ("Sports",       "⚽", "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600", ["Gym","Outdoor","Cricket"], 7),
    ("Home Decor",   "🕯️", "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600", ["Candles","Wall Art","Rugs"], 8),
    ("Bedsheets",    "🛏️", "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600", ["King","Double","Single"], 9),
    ("Kids & Toys",  "🧸", "https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=600", ["Toys","Games","Baby"], 10),
]

cur.execute("DELETE FROM categories")
for name, icon, image, subs, order in categories:
    cur.execute(
        "INSERT INTO categories (id,name,icon,image,subcategories,\"order\") VALUES (?,?,?,?,?,?)",
        (str(uuid.uuid4()), name, icon, image, json.dumps(subs), order)
    )
print(f"✓ Inserted {len(categories)} categories")

# ── Products ──────────────────────────────────────────────────────────────────
def prod(name, desc, orig, sell, cat, img, tags, stock=20):
    return (str(uuid.uuid4()), name, desc, orig, sell, cat,
            json.dumps([img]), json.dumps(tags), stock, 1, now, now)

products = [
    # Clothing
    prod("Women Embroidered Lawn Suit","3-piece embroidered lawn suit with chiffon dupatta",3500,2800,"Clothing","https://images.unsplash.com/photo-1594938298603-c8148c4b4aea?w=600",["women","lawn","suit"],30),
    prod("Men Shalwar Kameez","Classic white cotton shalwar kameez",2800,2200,"Clothing","https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=600",["men","shalwar"],25),
    prod("Girls Frock Dress","Colourful printed frock for girls",1500,1100,"Clothing","https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=600",["kids","girls"],40),
    prod("Boys Casual T-Shirt","Soft cotton printed t-shirt for boys",800,600,"Clothing","https://images.unsplash.com/photo-1622445275463-afa2ab738c73?w=600",["kids","boys"],50),
    prod("Women Abaya","Elegant black abaya with lace border",3200,2500,"Clothing","https://images.unsplash.com/photo-1629367494173-c78a56567877?w=600",["women","abaya"],20),
    prod("Men Polo Shirt","Premium pique polo shirt",1800,1400,"Clothing","https://images.unsplash.com/photo-1598032895397-b9472444bf93?w=600",["men","polo"],35),
    prod("Denim Jeans Men","Slim fit stretch denim jeans",2500,1950,"Clothing","https://images.unsplash.com/photo-1542272604-787c3835535d?w=600",["men","jeans"],30),
    prod("Women Winter Shawl Suit","Warm woolen 3-piece shawl suit",4500,3600,"Clothing","https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=600",["women","winter"],15),
    # Beauty
    prod("HydraFusion Night Cream","Deep moisturizing night cream",2800,2200,"Beauty","https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600",["skincare","cream"],25),
    prod("Velvet Rose Lipstick","Long-lasting matte lipstick",1200,950,"Beauty","https://images.unsplash.com/photo-1586495777744-4e6232bf9f06?w=600",["makeup","lipstick"],50),
    prod("Vitamin C Glow Serum","Brightening serum for dark spots",3500,2800,"Beauty","https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=600",["skincare","serum"],18),
    prod("Rose Water Face Toner","Balancing toner with rose water",1800,1400,"Beauty","https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600",["skincare","toner"],35),
    prod("Silk Floral Perfume","Floral oriental fragrance",4200,3400,"Beauty","https://images.unsplash.com/photo-1541643600914-78b084683702?w=600",["fragrance","perfume"],15),
    prod("SPF 50 Sunscreen","Lightweight UVA/UVB sunscreen",2200,1750,"Beauty","https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600",["skincare","sunscreen"],30),
    prod("Lash Extend Mascara","Volumizing mascara",1600,1250,"Beauty","https://images.unsplash.com/photo-1512207736890-6ffed8a84e8d?w=600",["makeup","mascara"],42),
    prod("Foundation Stick","Full coverage foundation stick",2500,1950,"Beauty","https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=600",["makeup","foundation"],28),
    # Electronics
    prod("Wireless Earbuds","True wireless earbuds 24hr battery",4500,3600,"Electronics","https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=600",["earbuds","wireless"],20),
    prod("Bluetooth Speaker","Portable waterproof speaker",3800,3000,"Electronics","https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600",["speaker","bluetooth"],15),
    prod("Smart Watch","Fitness smart watch heart rate monitor",8500,6800,"Electronics","https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600",["smartwatch","fitness"],12),
    prod("Power Bank 20000mAh","Fast charging portable power bank",3200,2500,"Electronics","https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=600",["powerbank"],25),
    prod("USB-C Hub 7-in-1","Multi-port USB hub for laptops",2800,2200,"Electronics","https://images.unsplash.com/photo-1625948515291-3abd4c04b197?w=600",["usb","laptop"],18),
    prod("Laptop Backpack","Anti-theft waterproof laptop bag",3500,2800,"Electronics","https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600",["backpack","laptop"],22),
    # Kitchen
    prod("Non-stick Frying Pan","Granite coated non-stick pan 28cm",2500,1900,"Kitchen","https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600",["pan","cookware"],20),
    prod("Electric Kettle 1.8L","Stainless steel fast boil kettle",2200,1700,"Kitchen","https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600",["kettle"],18),
    prod("Air Fryer 4.5L","Digital air fryer 8 cooking presets",9500,7500,"Kitchen","https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600",["air fryer"],10),
    prod("Knife Set 6-piece","Professional stainless steel knife set",3800,3000,"Kitchen","https://images.unsplash.com/photo-1593618998160-e34014e67546?w=600",["knives"],15),
    prod("Blender 600W","Multi-speed personal blender",3200,2500,"Kitchen","https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=600",["blender"],12),
    prod("Pressure Cooker 5L","Aluminium pressure cooker",2800,2200,"Kitchen","https://images.unsplash.com/photo-1584949091598-c31daaaa4aa9?w=600",["pressure cooker"],15),
    # Footwear
    prod("Women Block Heels","Comfortable block heel sandals",3200,2500,"Footwear","https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600",["heels","women"],20),
    prod("Men Formal Shoes","Oxford leather formal dress shoes",5500,4400,"Footwear","https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600",["formal","men"],15),
    prod("Kids Canvas Sneakers","Colourful canvas sneakers",1800,1400,"Footwear","https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=600",["sneakers","kids"],30),
    prod("Rubber Slippers","Soft anti-slip home slippers",600,450,"Footwear","https://images.unsplash.com/photo-1535043934128-cf0b28d52f95?w=600",["slippers"],50),
    prod("Khussa Embroidered","Hand-embroidered traditional khussa",2800,2200,"Footwear","https://images.unsplash.com/photo-1519415510236-718bdfcd89c8?w=600",["khussa","ethnic"],20),
    # Accessories
    prod("Leather Handbag","Genuine leather women's handbag",5500,4400,"Accessories","https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600",["handbag","leather"],12),
    prod("Gold Earrings Set","18K gold plated earring set",2500,1950,"Accessories","https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600",["earrings","gold"],30),
    prod("Men Leather Wallet","Slim genuine leather bifold wallet",2200,1700,"Accessories","https://images.unsplash.com/photo-1627123424574-724758594e93?w=600",["wallet","men"],25),
    prod("Sunglasses UV400","Polarized UV400 sunglasses",1800,1400,"Accessories","https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600",["sunglasses"],35),
    # Sports
    prod("Yoga Mat Anti-slip","6mm thick non-slip yoga mat",2200,1700,"Sports","https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=600",["yoga","fitness"],25),
    prod("Dumbbells 5kg Pair","Rubber coated hex dumbbells",3500,2800,"Sports","https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600",["dumbbells","gym"],15),
    prod("Jump Rope Speed","Adjustable speed skipping rope",800,600,"Sports","https://images.unsplash.com/photo-1434682881908-b43d0467b798?w=600",["jump rope"],40),
    prod("Cricket Bat","Kashmir willow cricket bat",3800,3000,"Sports","https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=600",["cricket"],10),
    prod("Football Size 5","FIFA approved match football",2200,1700,"Sports","https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=600",["football"],18),
    # Home Decor
    prod("Scented Candle Set","Soy wax scented candles 3 fragrances",2200,1700,"Home Decor","https://images.unsplash.com/photo-1602607027059-9f0c7e5a2a3a?w=600",["candles","decor"],25),
    prod("Wall Art Canvas","Modern abstract canvas 40x60cm",3500,2800,"Home Decor","https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600",["wall art"],15),
    prod("Fairy Lights 10m","Warm white LED fairy string lights",1200,900,"Home Decor","https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=600",["fairy lights","led"],40),
    prod("Throw Cushion Set","Velvet throw cushion covers set of 4",2500,1950,"Home Decor","https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600",["cushion"],18),
    prod("Table Lamp Modern","Minimalist metal table lamp",3200,2500,"Home Decor","https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600",["lamp","lighting"],12),
    # Bedsheets
    prod("King Size Cotton Bedsheet","300 thread count pure cotton king set",4500,3500,"Bedsheets","https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600",["bedsheet","king"],20),
    prod("Double Bed Comforter","Warm microfiber double bed comforter",5500,4400,"Bedsheets","https://images.unsplash.com/photo-1584100936595-c0654b55a2e6?w=600",["comforter"],15),
    prod("Pillow Set of 2","Soft hollow fibre sleeping pillows",1800,1400,"Bedsheets","https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600",["pillows"],25),
    prod("Mattress Protector","Waterproof quilted mattress protector",3000,2400,"Bedsheets","https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600",["mattress"],12),
    # Kids & Toys
    prod("LEGO Building Blocks","200-piece colorful building blocks",2800,2200,"Kids & Toys","https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=600",["lego","kids"],20),
    prod("Remote Control Car","1:16 scale RC car 2.4GHz",4500,3600,"Kids & Toys","https://images.unsplash.com/photo-1560419015-7c427e8ae5ba?w=600",["rc car"],12),
    prod("Barbie Fashion Doll","Fashion doll with accessories",1800,1400,"Kids & Toys","https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=600",["doll","girls"],25),
    prod("Board Game Family","Classic family board game",2200,1700,"Kids & Toys","https://images.unsplash.com/photo-1611891487122-207579d67d98?w=600",["board game"],15),
    prod("Puzzle 500 Pieces","Scenic landscape jigsaw puzzle",1200,900,"Kids & Toys","https://images.unsplash.com/photo-1606503153255-59d5e417b65a?w=600",["puzzle"],22),
]

cur.execute("DELETE FROM products")
cur.executemany(
    "INSERT INTO products (id,name,description,originalPrice,sellerPrice,category,images,tags,stock,isActive,createdAt,updatedAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)",
    products
)
print(f"✓ Inserted {len(products)} products")

conn.commit()
conn.close()
print("✓ Database seeded successfully!")
