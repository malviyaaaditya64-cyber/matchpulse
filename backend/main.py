"""
FastAPI backend for the Press-Match Sentiment Tracker.

Run with:
    uvicorn backend.main:app --reload --port 8000

Endpoints:
    GET /api/teams                 -> list of teams in the database
    GET /api/season/{team}         -> per-match sentiment/blame/confidence + result
    GET /api/analysis/{team}       -> lagged correlation + Granger causality report
    GET /api/quotes/{match_id}     -> raw quotes for a specific match
"""

import os
import sqlite3
import sys

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
import jwt

sys.path.append(os.path.join(os.path.dirname(__file__), ".."))
from storage.db import get_connection, create_user, get_user_by_username, init_schema, load_all_raw_files  # noqa: E402
from analysis.correlation import full_report  # noqa: E402
from backend.auth import hash_password, verify_password, create_access_token, decode_access_token  # noqa: E402

app = FastAPI(title="Press Conference Sentiment Tracker API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten this to your frontend's origin in production
    allow_methods=["*"],
    allow_headers=["*"],
)

security = HTTPBearer()


# Initialize database schema and load raw files on startup
@app.on_event("startup")
async def startup_event():
    init_schema()
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM matches")
    match_count = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(*) FROM quotes")
    quote_count = cursor.fetchone()[0]
    conn.close()

    if match_count == 0 and quote_count == 0:
        load_all_raw_files()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    """Dependency that verifies the JWT on protected routes. Raises 401 if invalid/expired."""
    try:
        username = decode_access_token(credentials.credentials)
        return username
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Session expired, please log in again")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid authentication token")


class AuthRequest(BaseModel):
    username: str
    password: str


@app.post("/api/auth/register")
def register(body: AuthRequest):
    if len(body.username.strip()) < 3:
        raise HTTPException(status_code=400, detail="Username must be at least 3 characters")
    if len(body.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")

    conn = get_connection()
    pw_hash, salt = hash_password(body.password)
    success = create_user(conn, body.username.strip(), pw_hash, salt)
    conn.close()

    if not success:
        raise HTTPException(status_code=400, detail="Username already taken")

    token = create_access_token(body.username.strip())
    return {"access_token": token, "username": body.username.strip()}


@app.post("/api/auth/login")
def login(body: AuthRequest):
    conn = get_connection()
    user = get_user_by_username(conn, body.username.strip())
    conn.close()

    if not user or not verify_password(body.password, user["salt"], user["password_hash"]):
        raise HTTPException(status_code=401, detail="Incorrect username or password")

    token = create_access_token(user["username"])
    return {"access_token": token, "username": user["username"]}


def dict_factory(cursor, row):
    fields = [column[0] for column in cursor.description]
    return {key: value for key, value in zip(fields, row)}


def query(sql, params=()):
    conn = get_connection()
    conn.row_factory = dict_factory
    cur = conn.execute(sql, params)
    rows = cur.fetchall()
    conn.close()
    return rows


@app.get("/api/sports")
def list_sports(current_user: str = Depends(get_current_user)):
    rows = query("SELECT DISTINCT sport FROM matches ORDER BY sport")
    return [r["sport"] for r in rows]


@app.get("/api/teams")
def list_teams(sport: str = None, current_user: str = Depends(get_current_user)):
    if sport:
        rows = query(
            "SELECT DISTINCT team FROM matches WHERE sport = ? AND team IS NOT NULL AND team != '' AND team != 'Unknown' AND team != 'UNKNOWN' ORDER BY team",
            (sport,)
        )
    else:
        rows = query(
            "SELECT DISTINCT team FROM matches WHERE team IS NOT NULL AND team != '' AND team != 'Unknown' AND team != 'UNKNOWN' ORDER BY team"
        )
    return [r["team"] for r in rows]


@app.get("/api/season/{team}")
def get_season(team: str, current_user: str = Depends(get_current_user)):
    rows = query(
        """
        SELECT m.match_id, m.date, m.opponent, m.result,
               AVG(q.sentiment_score) as sentiment,
               AVG(q.blame_ratio) as blame,
               AVG(q.confidence_score) as confidence
        FROM matches m
        JOIN quotes q ON m.match_id = q.match_id
        WHERE m.team = ?
        GROUP BY m.match_id
        ORDER BY m.date ASC
        """,
        (team,),
    )
    if not rows:
        raise HTTPException(status_code=404, detail=f"No data for team '{team}'")
    return rows


@app.get("/api/analysis/{team}")
def get_analysis(team: str, current_user: str = Depends(get_current_user)):
    report = full_report(team)
    if "error" in report:
        raise HTTPException(status_code=404, detail=report["error"])
    return report


@app.get("/api/quotes/{match_id}")
def get_quotes(match_id: str, current_user: str = Depends(get_current_user)):
    rows = query(
        "SELECT speaker, speaker_type, raw_text, sentiment_score, sentiment_source, blame_ratio, confidence_score, source_url "
        "FROM quotes WHERE match_id = ?",
        (match_id,),
    )
    if not rows:
        raise HTTPException(status_code=404, detail=f"No quotes for match '{match_id}'")
    return rows


@app.get("/")
def root():
    return {"status": "ok", "message": "Press Conference Sentiment Tracker API is running"}
