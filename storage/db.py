"""
SQLite storage for scraped quotes + NLP scores.
Run this file directly to (re)create the schema and load all raw JSON
files from data/raw/ through the NLP analyzer into the database.
"""

import glob
import json
import os
import sqlite3
import sys

sys.path.append(os.path.join(os.path.dirname(__file__), ".."))
from nlp.analyzer import analyze_quote  # noqa: E402
from storage.data_quality import validate_match_fields  # noqa: E402

DB_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "tracker.db")
RAW_DIR = os.path.join(os.path.dirname(__file__), "..", "data", "raw")
QUARANTINE_DIR = os.path.join(RAW_DIR, "quarantine")
QUARANTINE_LOG = os.path.join(QUARANTINE_DIR, "quarantine_log.jsonl")

SCHEMA = """
CREATE TABLE IF NOT EXISTS matches (
    match_id TEXT PRIMARY KEY,
    sport TEXT DEFAULT 'football',
    team TEXT,
    opponent TEXT,
    date TEXT,
    result TEXT
);

CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    salt TEXT NOT NULL,
    created_at TEXT
);

CREATE TABLE IF NOT EXISTS quotes (
    quote_id INTEGER PRIMARY KEY AUTOINCREMENT,
    match_id TEXT,
    speaker TEXT,
    speaker_type TEXT DEFAULT 'unknown',
    raw_text TEXT,
    sentiment_score REAL,
    sentiment_source TEXT DEFAULT 'vader',
    blame_ratio REAL,
    confidence_score REAL,
    word_count INTEGER,
    source_url TEXT,
    FOREIGN KEY (match_id) REFERENCES matches(match_id)
);
"""


def get_connection():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    return sqlite3.connect(DB_PATH)


def init_schema():
    conn = get_connection()
    conn.executescript(SCHEMA)
    conn.commit()
    conn.close()
    print(f"Schema ready at {DB_PATH}")


from football_teams_map import CANONICAL_MAP

def insert_match(conn, match_id, team, opponent, date, result, sport="football"):
    # Normalize team and opponent names for football matches
    if sport == "football":
        team = CANONICAL_MAP.get(team.lower(), team)
        opponent = CANONICAL_MAP.get(opponent.lower(), opponent)
        opponent = CANONICAL_MAP.get(opponent.lower(), opponent)
    
    conn.execute(
        """
        INSERT OR REPLACE INTO matches
        (match_id, sport, team, opponent, date, result)
        VALUES (?, ?, ?, ?, ?, ?)
        """,
        (match_id, sport, team, opponent, date, result),
    )


def insert_quote(conn, match_id, speaker, raw_text, scores, source_url):
    conn.execute(
        """
        INSERT INTO quotes
        (
            match_id,
            speaker,
            speaker_type,
            raw_text,
            sentiment_score,
            sentiment_source,
            blame_ratio,
            confidence_score,
            word_count,
            source_url
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            match_id,
            speaker,
            scores.get("speaker_type", "unknown"),
            raw_text,
            scores["sentiment_score"],
            scores["sentiment_source"],
            scores["blame_ratio"],
            scores["confidence_score"],
            scores["word_count"],
            source_url,
        ),
    )


def create_user(conn, username, password_hash, salt):
    """Insert a new user. Returns True on success, False if username taken."""
    try:
        conn.execute(
            """
            INSERT INTO users
            (username, password_hash, salt, created_at)
            VALUES (?, ?, ?, datetime('now'))
            """,
            (username, password_hash, salt),
        )
        conn.commit()
        return True
    except sqlite3.IntegrityError:
        return False


def get_user_by_username(conn, username):
    """Returns a dict {id, username, password_hash, salt} or None."""
    conn.row_factory = sqlite3.Row
    cur = conn.execute(
        "SELECT * FROM users WHERE username = ?",
        (username,),
    )
    row = cur.fetchone()
    return dict(row) if row else None


def _quarantine(path, entry, reasons):
    """
    Record a malformed raw file without touching it on disk. Appends one
    line to data/raw/quarantine/quarantine_log.jsonl so bad entries can be
    reviewed / manually fixed later.
    """
    os.makedirs(QUARANTINE_DIR, exist_ok=True)
    record = {
        "file": os.path.basename(path),
        "reasons": reasons,
        "team": entry.get("team", ""),
        "opponent": entry.get("opponent", ""),
        "video_id": entry.get("video_id"),
        "match_id": entry.get("match_id"),
    }
    with open(QUARANTINE_LOG, "a", encoding="utf-8") as f:
        f.write(json.dumps(record, ensure_ascii=False) + "\n")


def load_all_raw_files():
    """
    Read every JSON file scraped into data/raw/, run NLP, and store results.

    Supports both:
    1. Original project JSON files using `match_id`
    2. Apify JSON files using `video_id`
    """

    conn = get_connection()

    # Check if the columns exist and add them if not
    cursor = conn.cursor()
    cursor.execute("PRAGMA table_info(quotes)")
    columns = [column[1] for column in cursor.fetchall()]

    if "speaker_type" not in columns:
        cursor.execute("ALTER TABLE quotes ADD COLUMN speaker_type TEXT DEFAULT 'unknown'")
    if "sentiment_source" not in columns:
        cursor.execute("ALTER TABLE quotes ADD COLUMN sentiment_source TEXT DEFAULT 'vader'")
    conn.commit()

    files = glob.glob(os.path.join(RAW_DIR, "*.json"))

    if not files:
        print(f"No raw files found in {RAW_DIR}. Run the scraper first.")
        conn.close()
        return

    loaded = 0
    skipped = 0
    quarantined = 0

    for path in files:
        try:
            with open(path, "r", encoding="utf-8") as f:
                entry = json.load(f)

            # Original project files use match_id.
            # Apify files use video_id.
            match_id = entry.get("match_id") or entry.get("video_id")

            if not match_id:
                print(f"SKIPPED {path}: missing match_id/video_id")
                skipped += 1
                continue

            # Required text field for NLP.
            quote_text = entry.get("quote_text", "").strip()

            if not quote_text:
                print(f"SKIPPED {path}: missing quote_text")
                skipped += 1
                continue

            sport = entry.get("sport", "football")

            # Sanity check: some scraped files have the full video title
            # sitting in the team/opponent field instead of an actual team
            # name (a scraper/parsing bug). Keep those out of the database
            # instead of polluting team lists and charts. The raw file is
            # left untouched on disk -- only a record is appended to the
            # quarantine log for later review.
            is_valid, reasons = validate_match_fields(
                entry.get("team", ""), entry.get("opponent", ""), sport
            )
            if not is_valid:
                print(f"QUARANTINED {path}: {'; '.join(reasons)}")
                _quarantine(path, entry, reasons)
                quarantined += 1
                continue

            insert_match(
                conn,
                match_id,
                entry.get("team", ""),
                entry.get("opponent", ""),
                entry.get("date", ""),
                entry.get("result", ""),
                sport,
            )

            # Existing project uses VADER for this domain.
            scores = analyze_quote(
                quote_text,
                use_transformer=False,
            )

            insert_quote(
                conn,
                match_id,
                entry.get("speaker", "Unknown"),
                quote_text,
                scores,
                entry.get("source", ""),
            )

            loaded += 1

            print(
                f"Loaded {path} -> "
                f"sentiment={scores['sentiment_score']}, "
                f"blame={scores['blame_ratio']}, "
                f"confidence={scores['confidence_score']}"
            )

        except Exception as exc:
            print(f"SKIPPED {path}: {exc}")
            skipped += 1

    conn.commit()
    conn.close()

    print()
    print("========================================")
    print(f"Successfully loaded: {loaded}")
    print(f"Skipped (missing data): {skipped}")
    print(f"Quarantined (malformed team/opponent): {quarantined}")
    if quarantined:
        print(f"  -> see {QUARANTINE_LOG}")
    print("========================================")


if __name__ == "__main__":
    init_schema()
    load_all_raw_files()