"""Seed categories with subcategories into DB. Run: python seed_categories.py"""
import uuid
from datetime import datetime
from app.database import SessionLocal, CategoryDB, init_db

init_db()
db = SessionLocal()

def cat(name, icon, image, subs, order):
    return CategoryDB(
        id=str(uuid.uuid4()), name=name, icon=icon,
        image=image, subcategories=subs, order=order
    )

CATEGORIES = [
cat("Cosmetics","💄","https://images.unsplash.com/photo-1512207736890-6ffed8a84e8d?w=600&q=80&fit=crop",
    ["Skin Care","Hair Dryers","Shavers & Trimmers","Hair Care","Curlers & Straighteners",
     "K-Beauty","Face","Serum & Oil","Lip","Hair Removal","Grooming Accessories",
     "Makeup Accessories","Eye","Bundles","Personal Care","Nails","Mehndi"],1),

cat("Women's Unstitched","👗","https://images.unsplash.com/photo-1594938298603-c8148c4b4aea?w=600&q=80&fit=crop",
    ["Shirt","2 Piece Suits","Kurti","3 Piece Suits"],2),

cat("Women's Stitched","👚","https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=600&q=80&fit=crop",
    ["Shirt","2 Piece Suits","West","Women's Hoodies","Women's Coat","Women's Sweater",
     "3 Piece Suits","Maxi","Dupatta","Women's Kurta","Lehenga","Swimwear",
     "Trouser","Sleep Wear","Women's Track Suit","Sweaters & Sweatshirts"],3),

cat("Men's Unstitched","🧵","https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?w=600&q=80&fit=crop",
    ["Cotton","Kheddar","Doski","Wool","Wash n Wear","Men's Originals","Silk","Karandi"],4),

cat("Men's Stitched","👔","https://images.unsplash.com/photo-1598032895397-b9472444bf93?w=600&q=80&fit=crop",
    ["T-Shirts","Hoodies","Track Suit","Men's Jacket","Pants & Trousers",
     "Men's Shirt","Waist Coat","Men's Sweater","Men's Sleep Wear"],5),

cat("Kids Clothing","🧒","https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=600&q=80&fit=crop",
    ["Full Dress","Kids Formal Wear","Girl's Kurta","Kids Bathrobes","Kids Hoodies",
     "Kid's Trouser","Kids Track Suits","Kid's Jacket","Kids Sleep Wear",
     "Costumes","West","Bottoms"],6),

cat("Kids Accessories","🎒","https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=600&q=80&fit=crop",
    ["Kids Shoes","Bags","Styling Accessories","Educational Toys",
     "Classic Toys","Sports & Outdoor Toys"],7),

cat("Women's Handbags","👜","https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80&fit=crop",
    ["Clutches","Shoulder Bags","Hand Bags","Purse"],8),

cat("Jewellery","💍","https://images.unsplash.com/photo-1535043934128-cf0b28d52f95?w=600&q=80&fit=crop",
    ["Necklace","Artificial Sets","Earrings","Rings","Bangles & Bracelets",
     "Tikka","Jewellery Accessories","Anklets","Jewellery Organizers"],9),

cat("Electronics","📱","https://images.unsplash.com/photo-1498049794561-7780e7231661?w=600&q=80&fit=crop",
    ["Mobile Phones","Laptops","Tablets","Earbuds","Bluetooth Speakers",
     "Smart Watches","Power Banks","USB Accessories","Cameras"],10),

cat("Home Appliances","🏠","https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80&fit=crop",
    ["Air Conditioners","Refrigerators","Washing Machines","Microwaves",
     "Fans","Irons","Vacuum Cleaners","Water Dispensers"],11),

cat("Kitchen","🍳","https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80&fit=crop",
    ["Cookware","Air Fryers","Blenders","Electric Kettles","Pressure Cookers",
     "Lunch Boxes","Knives & Cutlery","Storage Containers"],12),

cat("Footwear","👟","https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80&fit=crop",
    ["Women's Heels","Women's Flats","Men's Formal","Men's Casual",
     "Sneakers","Kids Shoes","Slippers","Khussa"],13),

cat("Sports & Outdoors","⚽","https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&q=80&fit=crop",
    ["Cricket","Football","Gym & Fitness","Yoga","Cycling",
     "Badminton","Swimming","Outdoor Camping"],14),

cat("Bedsheets & Curtains","🛏️","https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&q=80&fit=crop",
    ["King Bedsheets","Double Bedsheets","Single Bedsheets","Comforters",
     "Pillows","Curtains","Blankets","Mattress Covers"],15),

cat("Home Decor","🕯️","https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&q=80&fit=crop",
    ["Wall Art","Vases","Candles","Rugs","Fairy Lights",
     "Photo Frames","Clocks","Artificial Plants"],16),

cat("Bags & Travel","🧳","https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80&fit=crop",
    ["Backpacks","Laptop Bags","Travel Bags","Wallets",
     "Men's Bags","Toiletry Bags","Luggage"],17),

cat("Books & Stationery","📚","https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?w=600&q=80&fit=crop",
    ["Notebooks","Pens & Markers","Art Supplies","Geometry Sets",
     "Sticky Notes","Calculators","Sketch Books"],18),

cat("Toys & Games","🧸","https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=600&q=80&fit=crop",
    ["Building Blocks","RC Cars","Dolls","Board Games",
     "Puzzles","Outdoor Toys","Baby Toys","Action Figures"],19),

cat("Health & Wellness","💊","https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=600&q=80&fit=crop",
    ["Vitamins","Protein Supplements","Medical Devices",
     "Personal Care","Massagers","First Aid"],20),

cat("Kitchenware","🍽️","https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80&fit=crop",
    ["Kitchen Accessories","Kitchen Organizers","Kitchen Appliances","Utensils",
     "Cookware","Bakeware","Cleaning Accessories","Bottles",
     "Cutlery","Trays & Dishes","Glasses & Cups","Plates & Bowls"],21),

cat("Fashion Accessories","👜","https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80&fit=crop",
    ["Men's Watches","Women's Watches","Men's Wallets","Socks & Hosiery",
     "Hats & Caps","Women's Wallets","Gloves & Mufflers","Women's Belt",
     "Men's Belt","Men's Cufflinks","Scarves & Stoles","Laces",
     "Sunglasses","Unisex Wallets","Couple Watches","Hair Accessories"],22),

cat("Home Essentials","🏠","https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&q=80&fit=crop",
    ["Home Accessories","Home Organizers","Home Appliances","Bathroom Essentials",
     "Health Accessories","Travel Accessories","Hardware & Tools","Gardening Tools"],23),

cat("Bedding","🛏️","https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&q=80&fit=crop",
    ["Single Bedsheets","Double Bed Sheets","Comforter Sets","Razai Sets",
     "Bridal Sets","Blankets","Mattress & Covers","Bed Pillows",
     "Pillow Covers","Bedspread","Fitted Sheets"],24),

cat("Shoes","👠","https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80&fit=crop",
    ["Women's Khussa","Women's Flats","Women Sandals","Women's Pumps",
     "Women's Heels","Men's Shoes","Men's Slippers","Men's Sandals",
     "Men's Joggers","Women's Joggers","Shoes Accessories","Men's Chappals","Men's Boots"],25),

cat("Festive Collection","🎉","https://images.unsplash.com/photo-1594938298603-c8148c4b4aea?w=600&q=80&fit=crop",
    ["Nikkah Dupatta","Fancy Dresses","Fancy Stitched","3 Piece Unstitched",
     "2 Piece Stitched","3 Piece Stitched","Saree"],26),

cat("Home Decor","🕯️","https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&q=80&fit=crop",
    ["Wall Clocks","Decoration","Wall Decor","Rugs & Carpets",
     "Decor Lights","Artificial Plants & Flowers"],27),

cat("Islamic Accessories","🕌","https://images.unsplash.com/photo-1609081219090-a6d81d3085bf?w=600&q=80&fit=crop",
    ["Prayer Mats","Tasbeeh","Caps","Abaya",
     "Scarf","Umrah Accessories","Romal"],28),

cat("Mother & Baby","👶","https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=600&q=80&fit=crop",
    ["Baby Bags","Feeder & Pacifier","Baby Accessories","Baby Toys",
     "Baby Shoes","Baby Health","Diapers","Baby Clothes","Baby Care"],29),

cat("Women Undergarments","👙","https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=600&q=80&fit=crop",
    ["Bras","Bra Sets","Panties","Lingerie",
     "Women's Thermals","Camisoles","Undergarment Accessories"],30),

cat("Men's Undergarments","👕","https://images.unsplash.com/photo-1598032895397-b9472444bf93?w=600&q=80&fit=crop",
    ["Undershirts","Men's Underwear","Men's Thermals"],31),

cat("Books & Stationery","📚","https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?w=600&q=80&fit=crop",
    ["Biography","Fiction Books","Kid's Books","Learning Books",
     "Non Fiction Books","Novels","Self Help Learning Books","Stationery",
     "Office Supplies","Party Supplies","School Bags"],32),

cat("Electronic Accessories","🎧","https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=600&q=80&fit=crop",
    ["Headphones & Headsets","Smart Watches","Speakers","Chargers & Cables",
     "Power Banks","Ring Lights","Tripods & Stands","Mobile Accessories",
     "Computer Accessories","Cellphone Bags","Mobile Cover","Handsfree"],33),

cat("Perfumes","🧴","https://images.unsplash.com/photo-1541643600914-78b084683702?w=600&q=80&fit=crop",
    ["Women's Perfumes","Men's Perfumes","Perfume Oil","Unisex Perfumes"],34),

cat("Men's Shawls","🧣","https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=600&q=80&fit=crop",
    ["Wool Shawls","Cotton Shawls","Velvet Shawls"],35),

cat("Women's Shawls","🧣","https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=600&q=80&fit=crop",
    ["Pashmina Shawls","Cashmere Shawls","Cape Shawls","Lawn Shawls",
     "Woolen Shawls","Linen Shawls","Swiss Shawls","Velvet Shawls"],36),

cat("Bags","👝","https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80&fit=crop",
    ["Travel Bags","Duffel Bags","Crossbody Bags","Laptop Bags"],37),

cat("Home Linen","🏡","https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&q=80&fit=crop",
    ["Sofa Covers","Towels","Covers","Curtains",
     "Cushion Covers","Anti Covers","Kitchen & Table Linen"],38),

cat("Auto & Bike Accessories","🚗","https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&q=80&fit=crop",
    ["Car Accessories","Bike Accessories","Bi-Cycle Accessories"],39),

cat("Fitness","💪","https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&q=80&fit=crop",
    ["Gym","Sports"],40),

cat("Unisex Clothing","👕","https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80&fit=crop",
    ["Unisex Shirts","Unisex Tracksuit"],41),

cat("Other","🎁","https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600&q=80&fit=crop",
    ["Gift Items"],42),
]

existing = db.query(CategoryDB).count()
if existing > 0:
    db.query(CategoryDB).delete()
    db.commit()
    print(f"Deleted {existing} old categories")

db.bulk_save_objects(CATEGORIES)
db.commit()
print(f"✓ Inserted {len(CATEGORIES)} categories!")
db.close()
