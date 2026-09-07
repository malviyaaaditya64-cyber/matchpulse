"""
Scrapes quoted press-conference statements from a news article page.
Works for sites that wrap direct quotes in <blockquote> or quotation marks
inside <p> tags (common pattern on ESPN, Sky Sports, ESPNcricinfo, etc).

NOTE: Selectors differ per site. Adjust `QUOTE_SELECTORS` for the site
you're targeting, and always check robots.txt before scraping at scale.

Usage:
    python news_scraper.py --url "https://example.com/article" \
        --team "India" --opponent "Australia" --date 2026-08-01 \
        --result L --speaker "Coach Name"
"""

import argparse
import json
import os
import re
import time
from datetime import datetime

import requests
from bs4 import BeautifulSoup

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "data", "raw")
os.makedirs(OUTPUT_DIR, exist_ok=True)

HEADERS = {"User-Agent": "Mozilla/5.0 (research bot; contact: you@example.com)"}

# Common containers where direct quotes live. Extend as needed per site.
QUOTE_SELECTORS = ["blockquote", "p"]
QUOTE_PATTERN = re.compile(r'"([^"]{20,400})"')  # sentences in quotes, 20-400 chars


def fetch_page(url: str) -> BeautifulSoup:
    resp = requests.get(url, headers=HEADERS, timeout=15)
    resp.raise_for_status()
    return BeautifulSoup(resp.text, "html.parser")


def extract_quotes(soup: BeautifulSoup) -> list[str]:
    """Pull out direct-quote sentences from likely containers."""
    quotes = []
    for tag in soup.select(",".join(QUOTE_SELECTORS)):
        text = tag.get_text(" ", strip=True)
        quotes.extend(QUOTE_PATTERN.findall(text))
    # de-duplicate while preserving order
    seen = set()
    unique = []
    for q in quotes:
        if q not in seen:
            seen.add(q)
            unique.append(q)
    return unique


def save_entry(url, team, opponent, date, result, speaker, quotes):
    entry = {
        "match_id": f"{team}_{opponent}_{date}".replace(" ", "_"),
        "date": date,
        "team": team,
        "opponent": opponent,
        "result": result,
        "speaker": speaker,
        "quote_text": " ".join(quotes),
        "quote_count": len(quotes),
        "source": url,
        "scraped_at": datetime.utcnow().isoformat(),
    }
    out_path = os.path.join(OUTPUT_DIR, f"{entry['match_id']}_{speaker.replace(' ', '_')}_news.json")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(entry, f, indent=2, ensure_ascii=False)
    print(f"Saved -> {out_path} ({len(quotes)} quotes found)")
    return entry


def main():
    parser = argparse.ArgumentParser(description="Scrape press-conference quotes from a news article")
    parser.add_argument("--url", required=True)
    parser.add_argument("--team", required=True)
    parser.add_argument("--opponent", required=True)
    parser.add_argument("--date", required=True)
    parser.add_argument("--result", required=True, choices=["W", "L", "D"])
    parser.add_argument("--speaker", required=True)
    args = parser.parse_args()

    soup = fetch_page(args.url)
    quotes = extract_quotes(soup)
    if not quotes:
        print("No quotes found — check QUOTE_SELECTORS / QUOTE_PATTERN for this site's HTML structure.")
    save_entry(args.url, args.team, args.opponent, args.date, args.result, args.speaker, quotes)
    time.sleep(1)  # be polite between requests when batching


if __name__ == "__main__":
    main()
