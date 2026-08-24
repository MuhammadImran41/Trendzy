import sqlite3
conn = sqlite3.connect('trendzy.db')
cur = conn.cursor()
cur.execute('SELECT name FROM categories ORDER BY "order"')
print([r[0] for r in cur.fetchall()])
conn.close()
