# Post-Match Press Conference Sentiment & Narrative Tracker

Scrapes post-match press conferences, runs NLP for sentiment / blame-shifting /
confidence, and tests whether coach negativity statistically predicts a
losing streak (Granger causality) — served through a FastAPI backend and a
React dashboard.

## Project structure

```
press_sentiment_tracker/
├── scraper/            YouTube + news scrapers -> data/raw/*.json
├── nlp/analyzer.py      Sentiment, blame-ratio, confidence scoring (VADER + lexicon)
├── storage/db.py        SQLite schema + loader (raw JSON -> database)
├── analysis/correlation.py   Lagged correlation + Granger causality test
├── backend/main.py       FastAPI app serving all of the above to the frontend
├── frontend/             React + Recharts dashboard (Vite)
├── seed_demo_data.py     Generates a synthetic season so the app works instantly
└── requirements.txt
```

## 1. Backend setup

```bash
cd press_sentiment_tracker
pip install -r backend/requirements.txt

# Generate a demo season (12 matches with a realistic mid-season losing streak)
python seed_demo_data.py

# Start the API
uvicorn backend.main:app --reload --port 8000
```

Check it's running: open `http://localhost:8000/api/teams` — should return `["Riverside FC"]`.

## 2. Frontend setup

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`. The dashboard shows:
- **Sentiment pulse** — press-conference tone across the season, with a
  win/loss rhythm strip underneath.
- **Blame-shifting** and **confidence** bar charts per match.
- **Correlation panel** — lagged correlation + Granger causality p-values
  answering "does negativity predict a losing streak?"

## 3. Feeding it real data (replacing the demo season)

### Option A — one video at a time
```bash
python scraper/youtube_scraper.py --video_id XXXXXXXXXXX \
    --team "Man United" --opponent "Liverpool" --date 2026-08-01 \
    --result L --speaker "Coach Name" --sport football
```

### Option B — batch scrape many videos at once (recommended for multiple teams)

1. Open `videos_template.csv` and fill in real values for each row:
   - `video_id` — the part after `v=` in the YouTube URL
   - `team`, `opponent`, `date` (YYYY-MM-DD), `result` (W/L/D), `speaker`, `sport` (football/cricket)
   - Rename it to something like `videos.csv` once filled in.
   - You don't need to fill every row at once — leave rows for teams you
     haven't found videos for yet, or delete them and add more later.

2. Run the batch scraper:
   ```bash
   python scraper/batch_scraper.py --csv videos.csv
   ```
   It processes every row, skips any that are already scraped (safe to
   re-run after adding more rows), and prints a summary of successes,
   skips, and failures at the end.

3. Load everything into the database:
   ```bash
   python storage/db.py
   ```

**Where to find videos**: search each team's official YouTube channel for
"post match press conference" (football) or "post match presentation" /
"press conference" (cricket). Only videos with captions/subtitles enabled
will work — auto-generated captions are fine.

## 4. Improving accuracy later

- Swap VADER for a transformer (`cardiffnlp/twitter-roberta-base-sentiment`
  via HuggingFace) for better sports-context sentiment.
- Expand `EXTERNAL_BLAME_TERMS` / `SELF_ACCOUNTABILITY_TERMS` in
  `nlp/analyzer.py` — this lexicon is a solid starting point but grows more
  accurate the more real transcripts you review.
- Once you have 15-20+ real quote-labelled matches, use the lexicon output
  as weak-supervision labels to train a small classifier.

## 4. Improving accuracy later

- The transformer model is loaded lazily and cached for better performance
- Speaker identification is conservative and defaults to "unknown" when uncertain
- All existing functionality is preserved, including VADER baseline and lexicon-based analysis
- The system continues to work even if the transformer model is unavailable


- Added speaker identification hierarchy to distinguish between coach and player quotes
- Added cardiffnlp/twitter-roberta-base-sentiment-latest as a more context-aware alternative to VADER
- Speaker identification is now available through the speaker_type field
- Sentiment source is now available through the sentiment_source field
- The system now falls back to VADER if the transformer model is unavailable
- Speaker identification and sentiment analysis are validated against representative samples


## Notes on scraping responsibly

Always check `robots.txt` and rate-limit requests when scraping at scale.
YouTube transcripts are the most reliable and lowest-risk source since
they're official captions on public videos.
