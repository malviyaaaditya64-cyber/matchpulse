import sqlite3

conn = sqlite3.connect('data/tracker.db')
c = conn.cursor()

print("=== Sport-wise count ===")
c.execute("SELECT sport, COUNT(*) FROM matches GROUP BY sport")
for row in c.fetchall():
    print(f"{row[0]}: {row[1]}")

print("\n=== Unknown team/opponent count ===")
c.execute("SELECT COUNT(*) FROM matches WHERE team='Unknown' OR opponent='Unknown'")
print(c.fetchone()[0])

print("\n=== Likely-failed (all-zero sentiment) entries ===")
c.execute("SELECT COUNT(*) FROM quotes WHERE sentiment_score=0.0 AND blame_ratio=0.0 AND confidence_score=0.0")
print(c.fetchone()[0])

print("\n=== Duplicate match groups (same team+opponent+date) ===")
c.execute("SELECT team, opponent, date, COUNT(*) as cnt FROM matches GROUP BY team, opponent, date HAVING cnt > 1")
rows = c.fetchall()
print(f"Total duplicate groups: {len(rows)}")
for r in rows[:20]:
    print(r)

conn.close()