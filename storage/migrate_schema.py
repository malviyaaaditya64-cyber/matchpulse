import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "tracker.db")

def migrate_schema():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Check if the columns already exist
    cursor.execute("PRAGMA table_info(quotes)")
    columns = [column[1] for column in cursor.fetchall()]

    # Add speaker_type if it doesn't exist
    if "speaker_type" not in columns:
        cursor.execute("ALTER TABLE quotes ADD COLUMN speaker_type TEXT DEFAULT 'unknown'")

    # Add sentiment_source if it doesn't exist
    if "sentiment_source" not in columns:
        cursor.execute("ALTER TABLE quotes ADD COLUMN sentiment_source TEXT DEFAULT 'vader'")

    conn.commit()
    conn.close()
    print("Schema migration completed successfully")

if __name__ == "__main__":
    migrate_schema()