"""
Seed script — inserts all categories with multiple products into trendzy-db
Run: python seed_data.py
"""
import uuid
from datetime import datetime
from app.database import SessionLocal, ProductDB, init_db

init_db()
db = SessionLocal()

def p(name, desc, orig, sell, cat, imgs, tags, stock=20):
    return ProductDB(
        id=str(uuid.uuid4()), name=name, description=desc,
        originalPrice=orig, sellerPrice=sell, category=cat,
        images=imgs, tags=tags, stock=stock, isActive=True,
        oriflameUrl=None, createdAt=datetime.utcnow(), updatedAt=datetime.utcnow()
    )

products = [

# ── Clothing ──────────────────────────────────────────────────────────
p("Women Embroidered Lawn Suit","3-piece embroidered lawn suit with chiffon dupatta",3500,2800,"Clothing",
  ["https://images.unsplash.com/photo-1594938298603-c8148c4b4aea?w=600"],["women","lawn","suit"],30),
p("Men Shalwar Kameez","Classic white cotton shalwar kameez with light embroidery",2800,2200,"Clothing",
  ["https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=600"],["men","shalwar kameez"],25),
p("Girls Frock Dress","Colourful printed frock for girls ages 4-12",1500,1100,"Clothing",
  ["https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=600"],["kids","girls","frock"],40),
p("Boys Casual T-Shirt","Soft cotton printed t-shirt for boys",800,600,"Clothing",
  ["https://images.unsplash.com/photo-1622445275463-afa2ab738c73?w=600"],["kids","boys","t-shirt"],50),
p("Women Abaya","Elegant black abaya with lace border",3200,2500,"Clothing",
  ["https://images.unsplash.com/photo-1629367494173-c78a56567877?w=600"],["women","abaya","modest"],20),
p("Men Polo Shirt","Premium pique polo shirt in multiple colors",1800,1400,"Clothing",
  ["https://images.unsplash.com/photo-1598032895397-b9472444bf93?w=600"],["men","polo","casual"],35),
p("Women Winter Shawl Suit","Warm woolen 3-piece shawl suit",4500,3600,"Clothing",
  ["https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=600"],["women","winter","shawl"],15),
p("Denim Jeans Men","Slim fit stretch denim jeans",2500,1950,"Clothing",
  ["https://images.unsplash.com/photo-1542272604-787c3835535d?w=600"],["men","jeans","denim"],30),

# ── Beauty ────────────────────────────────────────────────────────────
p("HydraFusion Night Cream","Deep moisturizing night cream with hyaluronic acid",2800,2200,"Beauty",
  ["https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600"],["skincare","night cream"],25),
p("Velvet Rose Lipstick","Long-lasting matte lipstick, 12-hour wear",1200,950,"Beauty",
  ["https://images.unsplash.com/photo-1586495777744-4e6232bf9f06?w=600"],["makeup","lipstick"],50),
p("Vitamin C Glow Serum","Brightening serum that reduces dark spots",3500,2800,"Beauty",
  ["https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=600"],["skincare","serum"],18),
p("Rose Water Face Toner","Balancing toner with rose water and niacinamide",1800,1400,"Beauty",
  ["https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600"],["skincare","toner"],35),
p("Lash Extend Mascara","Volumizing and lengthening mascara",1600,1250,"Beauty",
  ["https://images.unsplash.com/photo-1512207736890-6ffed8a84e8d?w=600"],["makeup","mascara"],42),
p("Silk Floral Perfume","Floral oriental fragrance with jasmine and sandalwood",4200,3400,"Beauty",
  ["https://images.unsplash.com/photo-1541643600914-78b084683702?w=600"],["fragrance","perfume"],15),
p("SPF 50 Sunscreen","Lightweight sunscreen with UVA/UVB protection",2200,1750,"Beauty",
  ["https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600"],["skincare","sunscreen"],30),
p("Foundation Stick","Full coverage foundation stick for all skin tones",2500,1950,"Beauty",
  ["https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=600"],["makeup","foundation"],28),

# ── Electronics ──────────────────────────────────────────────────────
p("Wireless Earbuds","True wireless earbuds with 24hr battery life",4500,3600,"Electronics",
  ["https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=600"],["earbuds","wireless","audio"],20),
p("Bluetooth Speaker","Portable waterproof speaker with deep bass",3800,3000,"Electronics",
  ["https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600"],["speaker","bluetooth"],15),
p("Smart Watch","Fitness smart watch with heart rate monitor",8500,6800,"Electronics",
  ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600"],["smartwatch","fitness"],12),
p("Power Bank 20000mAh","Fast charging portable power bank",3200,2500,"Electronics",
  ["https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=600"],["powerbank","charging"],25),
p("USB-C Hub 7-in-1","Multi-port USB hub for laptops",2800,2200,"Electronics",
  ["https://images.unsplash.com/photo-1625948515291-3abd4c04b197?w=600"],["usb hub","laptop"],18),
p("Phone Case iPhone","Premium leather phone case",1200,900,"Electronics",
  ["https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=600"],["phone case","iphone"],60),
p("Laptop Backpack","Anti-theft waterproof 15.6 inch laptop bag",3500,2800,"Electronics",
  ["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600"],["backpack","laptop bag"],22),

# ── Kitchen ──────────────────────────────────────────────────────────
p("Non-stick Frying Pan","Granite coated non-stick pan 28cm",2500,1900,"Kitchen",
  ["https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600"],["pan","cookware"],20),
p("Electric Kettle 1.8L","Stainless steel fast boil electric kettle",2200,1700,"Kitchen",
  ["https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600"],["kettle","electric"],18),
p("Air Fryer 4.5L","Digital air fryer with 8 cooking presets",9500,7500,"Kitchen",
  ["https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600"],["air fryer","appliance"],10),
p("Knife Set 6-piece","Professional stainless steel kitchen knife set",3800,3000,"Kitchen",
  ["https://images.unsplash.com/photo-1593618998160-e34014e67546?w=600"],["knives","kitchen"],15),
p("Lunch Box 3-tier","Stainless steel insulated tiffin box",1500,1100,"Kitchen",
  ["https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600"],["lunchbox","tiffin"],40),
p("Blender 600W","Multi-speed personal blender with travel cup",3200,2500,"Kitchen",
  ["https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=600"],["blender","appliance"],12),
p("Pressure Cooker 5L","Aluminium pressure cooker with safety valve",2800,2200,"Kitchen",
  ["https://images.unsplash.com/photo-1584949091598-c31daaaa4aa9?w=600"],["pressure cooker","cookware"],15),

# ── Bedsheets ────────────────────────────────────────────────────────
p("King Size Cotton Bedsheet","300 thread count pure cotton king size set",4500,3500,"Bedsheets",
  ["https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600"],["bedsheet","king","cotton"],20),
p("Double Bed Comforter","Warm microfiber double bed comforter",5500,4400,"Bedsheets",
  ["https://images.unsplash.com/photo-1584100936595-c0654b55a2e6?w=600"],["comforter","double"],15),
p("Pillow Set of 2","Soft hollow fibre sleeping pillows",1800,1400,"Bedsheets",
  ["https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600"],["pillows","sleeping"],25),
p("Single Bed Duvet Cover","Floral printed duvet cover with pillow case",2200,1700,"Bedsheets",
  ["https://images.unsplash.com/photo-1586105449897-20b5efeb3233?w=600"],["duvet","single"],18),
p("Mattress Protector","Waterproof quilted mattress protector",3000,2400,"Bedsheets",
  ["https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600"],["mattress","protector"],12),

# ── Accessories ──────────────────────────────────────────────────────
p("Leather Handbag","Genuine leather women's handbag",5500,4400,"Accessories",
  ["https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600"],["handbag","leather","women"],12),
p("Gold Earrings Set","18K gold plated earring set with cubic zirconia",2500,1950,"Accessories",
  ["https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600"],["earrings","gold","jewellery"],30),
p("Men Leather Wallet","Slim genuine leather bifold wallet",2200,1700,"Accessories",
  ["https://images.unsplash.com/photo-1627123424574-724758594e93?w=600"],["wallet","men","leather"],25),
p("Silk Scarf","100% silk printed scarf",3200,2500,"Accessories",
  ["https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=600"],["scarf","silk","women"],20),
p("Sunglasses UV400","Polarized sunglasses with UV400 protection",1800,1400,"Accessories",
  ["https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600"],["sunglasses","uv400"],35),
p("Backpack Casual","Trendy casual backpack for school/college",2800,2200,"Accessories",
  ["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600"],["backpack","bag"],22),
p("Statement Necklace","Gold layered statement necklace",1500,1150,"Accessories",
  ["https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600"],["necklace","jewellery"],28),

# ── Sports ───────────────────────────────────────────────────────────
p("Yoga Mat Anti-slip","6mm thick non-slip exercise yoga mat",2200,1700,"Sports",
  ["https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=600"],["yoga","mat","fitness"],25),
p("Dumbbells 5kg Pair","Rubber coated hex dumbbells 5kg",3500,2800,"Sports",
  ["https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600"],["dumbbells","weights","gym"],15),
p("Jump Rope Speed","Adjustable speed skipping rope",800,600,"Sports",
  ["https://images.unsplash.com/photo-1434682881908-b43d0467b798?w=600"],["jump rope","cardio"],40),
p("Gym Gloves","Weight lifting gym gloves with wrist support",1500,1150,"Sports",
  ["https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600"],["gloves","gym","lifting"],30),
p("Cricket Bat","Kashmir willow cricket bat for club play",3800,3000,"Sports",
  ["https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=600"],["cricket","bat"],10),
p("Football Size 5","FIFA approved match football",2200,1700,"Sports",
  ["https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=600"],["football","outdoor"],18),
p("Resistance Bands Set","5-piece resistance band set for home workout",1800,1400,"Sports",
  ["https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=600"],["resistance bands","workout"],35),

# ── Kids & Toys ──────────────────────────────────────────────────────
p("LEGO Building Blocks","200-piece colorful building blocks set",2800,2200,"Kids & Toys",
  ["https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=600"],["lego","blocks","kids"],20),
p("Remote Control Car","1:16 scale RC car with 2.4GHz remote",4500,3600,"Kids & Toys",
  ["https://images.unsplash.com/photo-1560419015-7c427e8ae5ba?w=600"],["rc car","remote control"],12),
p("Baby Rattles Set","Colourful soft baby rattle toy set",800,600,"Kids & Toys",
  ["https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=600"],["baby","rattles","infant"],35),
p("Barbie Fashion Doll","Fashion doll with accessories and clothes",1800,1400,"Kids & Toys",
  ["https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=600"],["doll","barbie","girls"],25),
p("Board Game Family","Classic family board game for 2-6 players",2200,1700,"Kids & Toys",
  ["https://images.unsplash.com/photo-1611891487122-207579d67d98?w=600"],["board game","family"],15),
p("Art & Craft Kit","Complete art kit with colors, brushes and canvas",1500,1150,"Kids & Toys",
  ["https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600"],["art","craft","kids"],30),
p("Puzzle 500 Pieces","Scenic landscape jigsaw puzzle 500pcs",1200,900,"Kids & Toys",
  ["https://images.unsplash.com/photo-1606503153255-59d5e417b65a?w=600"],["puzzle","jigsaw"],22),

# ── Home Decor ───────────────────────────────────────────────────────
p("Scented Candle Set","Soy wax scented candles in 3 fragrances",2200,1700,"Home Decor",
  ["https://images.unsplash.com/photo-1602607027059-9f0c7e5a2a3a?w=600"],["candles","scented","decor"],25),
p("Wall Art Canvas","Modern abstract canvas wall art 40x60cm",3500,2800,"Home Decor",
  ["https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600"],["wall art","canvas"],15),
p("Decorative Vase","Ceramic flower vase with geometric pattern",1800,1400,"Home Decor",
  ["https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?w=600"],["vase","ceramic","decor"],20),
p("Fairy Lights 10m","Warm white LED fairy string lights",1200,900,"Home Decor",
  ["https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=600"],["fairy lights","led","decor"],40),
p("Throw Cushion Set","Velvet throw cushion covers set of 4",2500,1950,"Home Decor",
  ["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600"],["cushion","throw","decor"],18),
p("Area Rug 4x6 ft","Geometric pattern area rug for living room",5500,4400,"Home Decor",
  ["https://images.unsplash.com/photo-1600166898405-da9535204843?w=600"],["rug","carpet","decor"],8),
p("Table Lamp Modern","Minimalist metal table lamp with warm light",3200,2500,"Home Decor",
  ["https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600"],["lamp","lighting","decor"],12),

# ── Daily Gadgets ────────────────────────────────────────────────────
p("Mini Desk Fan USB","Portable USB-powered desk fan 3 speeds",1500,1150,"Daily Gadgets",
  ["https://images.unsplash.com/photo-1617396900799-f4ec2b43c7d3?w=600"],["fan","usb","desk"],30),
p("Smart LED Bulb","WiFi smart bulb 9W RGB color changing",1800,1400,"Daily Gadgets",
  ["https://images.unsplash.com/photo-1550985616-10811abbcbed?w=600"],["smart bulb","led","wifi"],35),
p("Electric Shaver Men","Rechargeable rotary electric shaver",4500,3600,"Daily Gadgets",
  ["https://images.unsplash.com/photo-1504703395950-b89145a5425b?w=600"],["shaver","electric","men"],12),
p("Hair Dryer 2000W","Professional ionic hair dryer with diffuser",3800,3000,"Daily Gadgets",
  ["https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=600"],["hair dryer","salon"],15),
p("Neck Massage Pillow","Electric kneading neck and shoulder massager",3200,2500,"Daily Gadgets",
  ["https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=600"],["massager","neck","electric"],18),
p("Cable Organiser Set","Reusable cable ties and wire organizer kit",500,380,"Daily Gadgets",
  ["https://images.unsplash.com/photo-1612815292594-5b9e8f25a5d0?w=600"],["cable","organiser"],60),
p("Digital Kitchen Scale","Electronic food scale 5kg precision 1g",1200,900,"Daily Gadgets",
  ["https://images.unsplash.com/photo-1588421357574-87938a86fa28?w=600"],["scale","kitchen","digital"],25),

# ── Footwear ─────────────────────────────────────────────────────────
p("Women Block Heels","Comfortable block heel sandals",3200,2500,"Footwear",
  ["https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600"],["heels","women","sandals"],20),
p("Men Formal Shoes","Oxford leather formal dress shoes",5500,4400,"Footwear",
  ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600"],["formal","shoes","men"],15),
p("Kids Canvas Sneakers","Colourful canvas sneakers for kids",1800,1400,"Footwear",
  ["https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=600"],["sneakers","kids","canvas"],30),
p("Men Sports Trainers","Lightweight mesh running shoes",4500,3600,"Footwear",
  ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600"],["trainers","running","sports"],18),
p("Women Flat Sandals","Comfortable beaded flat sandals",2200,1700,"Footwear",
  ["https://images.unsplash.com/photo-1603487742131-4160ec999306?w=600"],["sandals","flats","women"],25),
p("Khussa Embroidered","Traditional hand-embroidered khussa",2800,2200,"Footwear",
  ["https://images.unsplash.com/photo-1519415510236-718bdfcd89c8?w=600"],["khussa","traditional","ethnic"],20),
p("Rubber Slippers","Soft anti-slip home slippers",600,450,"Footwear",
  ["https://images.unsplash.com/photo-1535043934128-cf0b28d52f95?w=600"],["slippers","home"],50),

# ── Stationery ───────────────────────────────────────────────────────
p("Notebook A5 Set of 3","Hardcover ruled A5 notebooks",900,700,"Stationery",
  ["https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=600"],["notebook","diary"],35),
p("Pen Set 12pcs","Ballpoint pen set in assorted colors",600,450,"Stationery",
  ["https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=600"],["pens","writing"],50),
p("Watercolor Paint Set","24-color professional watercolor set",1800,1400,"Stationery",
  ["https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600"],["watercolor","art"],20),
p("School Geometry Box","Complete geometry set with compass",500,380,"Stationery",
  ["https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?w=600"],["geometry","school"],40),
p("Sticky Notes 5-pack","Neon colored sticky notes 400 sheets",700,530,"Stationery",
  ["https://images.unsplash.com/photo-1586339949916-3e9457bef6d3?w=600"],["sticky notes","office"],45),
p("Scientific Calculator","12-digit scientific calculator",1500,1150,"Stationery",
  ["https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=600"],["calculator","scientific"],18),
p("Sketch Book A4","80 pages acid-free sketch book",800,600,"Stationery",
  ["https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?w=600"],["sketch","art","drawing"],30),
]

# Clear existing products first
existing = db.query(ProductDB).count()
if existing > 0:
    print(f"Deleting {existing} existing products...")
    db.query(ProductDB).delete()
    db.commit()

db.bulk_save_objects(products)
db.commit()
print(f"✓ Inserted {len(products)} products across all categories!")
db.close()
