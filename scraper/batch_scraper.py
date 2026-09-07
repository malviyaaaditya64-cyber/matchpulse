"""
Batch YouTube scraper — scrape many press conferences in one run.

Instead of running youtube_scraper.py once per video, fill in a CSV file
with one row per video, then run this script once. It processes every
row, skips rows that already have a saved file (so it's safe to re-run
if you add more rows later), and prints a summary at the end.

CSV format (see videos_template.csv for a ready-to-fill example):
    video_id,team,opponent,date,result,speaker,sport

    video_id  - the part after "v=" in the YouTube URL
    team      - team/country name, e.g. "Manchester United" or "India"
    opponent  - opponent name
    date      - YYYY-MM-DD
    result    - W, L, or D
    speaker   - coach/captain/player name
    sport     - "football" or "cricket"

Usage:
    python scraper/batch_scraper.py --csv videos.csv
"""

import argparse
import csv
import os
import sys
import time

sys.path.append(os.path.dirname(__file__))
from youtube_scraper import fetch_transcript, extract_speaker_answers, save_entry, OUTPUT_DIR


def already_scraped(team, opponent, date, speaker) -> bool:
    match_id = f"{team}_{opponent}_{date}".replace(" ", "_")
    expected_path = os.path.join(OUTPUT_DIR, f"{match_id}_{speaker.replace(' ', '_')}.json")
    return os.path.exists(expected_path)


def main():
    parser = argparse.ArgumentParser(description="Batch-scrape press conferences from a CSV list")
    parser.add_argument("--csv", required=True, help="Path to CSV file with video list")
    parser.add_argument("--delay", type=float, default=1.0, help="Seconds to wait between requests (be polite to YouTube)")
    args = parser.parse_args()

    with open(args.csv, newline="", encoding="utf-8") as f:
        rows = list(csv.DictReader(f))

    print(f"Found {len(rows)} rows in {args.csv}\n")

    succeeded, skipped, failed = [], [], []

    for i, row in enumerate(rows, 1):
        video_id = row["video_id"].strip()
        team = row["team"].strip()
        opponent = row["opponent"].strip()
        date = row["date"].strip()
        result = row["result"].strip().upper()
        speaker = row["speaker"].strip()
        sport = row.get("sport", "football").strip().lower() or "football"

        print(f"[{i}/{len(rows)}] {team} vs {opponent} ({date})...", end=" ")

        if already_scraped(team, opponent, date, speaker):
            print("already scraped, skipping.")
            skipped.append((team, opponent, date))
            continue

        try:
            raw_text = fetch_transcript(video_id)
            cleaned = extract_speaker_answers(raw_text)
            if len(cleaned.split()) < 15:
                print(f"WARNING: cleaned transcript very short ({len(cleaned.split())} words) — check manually.")
            save_entry(video_id, team, opponent, date, result, speaker, cleaned, sport)
            succeeded.append((team, opponent, date))
            print("done.")
        except Exception as e:
            print(f"FAILED: {e}")
            failed.append((team, opponent, date, str(e)))

        time.sleep(args.delay)  # be polite between requests

    print("\n--- Summary ---")
    print(f"Succeeded: {len(succeeded)}")
    print(f"Skipped (already done): {len(skipped)}")
    print(f"Failed: {len(failed)}")
    if failed:
        print("\nFailed rows (check video ID / captions availability):")
        for team, opponent, date, err in failed:
            print(f"  - {team} vs {opponent} ({date}): {err}")


if __name__ == "__main__":
    main()
