import pytest
import sqlite3
import os
from storage.db import init_schema, get_connection

TEST_DB = "tests/test_tracker.db"

@pytest.fixture(autouse=True)
def setup_db():
    if os.path.exists(TEST_DB):
        os.remove(TEST_DB)
    # Patch get_connection to use test DB
    import storage.db
    storage.db.DB_PATH = TEST_DB
    init_schema()
    yield
    if os.path.exists(TEST_DB):
        os.remove(TEST_DB)

def test_init_schema():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='matches'")
    assert cursor.fetchone() is not None
    conn.close()

def test_insert_match():
    conn = get_connection()
    conn.execute("INSERT INTO matches (match_id, team, opponent, date, result) VALUES (?,?,?,?,?)",
                 ("m1", "A", "B", "2026-01-01", "W"))
    conn.commit()
    res = conn.execute("SELECT * FROM matches WHERE match_id='m1'").fetchone()
    assert res is not None
    conn.close()
