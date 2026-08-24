import sqlite3, json, uuid

conn = sqlite3.connect('trendzy.db')
cur = conn.cursor()

cats = [
    ('Women Undergarments', '👙',
     'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=600&q=80&fit=crop',
     ['Bras', 'Bra Sets', 'Panties', 'Lingerie', 'Camisoles', 'Thermals'], 5),
    ("Men's Undergarments", '👕',
     'https://images.unsplash.com/photo-1598032895397-b9472444bf93?w=600&q=80&fit=crop',
     ['Undershirts', 'Underwear', 'Thermals', 'Boxers'], 6),
]

for name, icon, image, subs, order in cats:
    cur.execute('SELECT id FROM categories WHERE name=?', (name,))
    if not cur.fetchone():
        cur.execute('INSERT INTO categories (id,name,icon,image,subcategories,"order") VALUES (?,?,?,?,?,?)',
            (str(uuid.uuid4()), name, icon, image, json.dumps(subs), order))
        print(f'Added: {name}')
    else:
        print(f'Already exists: {name}')

conn.commit()
conn.close()
print('Done')
