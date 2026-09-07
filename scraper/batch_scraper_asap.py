"""
Batch-scrape many ASAP Sports press-conference transcripts in one run.

CSV format (one row per interview):
    interview_id,team,opponent,date,result,sport

    interview_id - the id= value from the show_interview.php?id=XXXXX URL
    team          - team name
    opponent      - opponent name
    date          - YYYY-MM-DD
    result        - W, L, or D
    sport         - "football" or "cricket"

Usage:
    python scraper/batch_scraper_asap.py --csv asap_videos.csv
"""

import argparse
import csv
import os
import sys
import time

sys.path.append(os.path.dirname(__file__))
from asapsports_scraper import fetch_interview, extract_qa_only, save_entry, OUTPUT_DIR


def already_scraped(team, opponent, date, speaker) -> bool:
    match_id = f"{team}_{opponent}_{date}".replace(" ", "_")
    expected_path = os.path.join(OUTPUT_DIR, f"{match_id}_{speaker.replace(' ', '_')}.json")
    return os.path.exists(expected_path)


def main():
    parser = argparse.ArgumentParser(description="Batch-scrape ASAP Sports transcripts from a CSV list")
    parser.add_argument("--csv", required=True)
    parser.add_argument("--delay", type=float, default=1.0)
    args = parser.parse_args()

    with open(args.csv, newline="", encoding="utf-8") as f:
        rows = list(csv.DictReader(f))

    print(f"Found {len(rows)} rows in {args.csv}\n")
    succeeded, skipped, failed = [], [], []

    for i, row in enumerate(rows, 1):
        interview_id = row["interview_id"].strip()
        team = row["team"].strip()
        opponent = row["opponent"].strip()
        date = row["date"].strip()
        result = row["result"].strip().upper()
        sport = row.get("sport", "football").strip().lower() or "football"

        print(f"[{i}/{len(rows)}] {team} vs {opponent} ({date})...", end=" ")

        try:
            data = fetch_interview(interview_id)
            speaker = data["speaker"]

            if already_scraped(team, opponent, date, speaker):
                print("already scraped, skipping.")
                skipped.append((team, opponent, date))
                continue

            cleaned = extract_qa_only(data["quote_text"])
            if len(cleaned.split()) < 15:
                print(f"WARNING: cleaned transcript very short ({len(cleaned.split())} words) — check manually.")
            save_entry(interview_id, team, opponent, date, result, speaker, cleaned, sport, data["source"])
            succeeded.append((team, opponent, date))
            print("done.")
        except Exception as e:
            print(f"FAILED: {e}")
            failed.append((team, opponent, date, str(e)))

        time.sleep(args.delay)

    print("\n--- Summary ---")
    print(f"Succeeded: {len(succeeded)}")
    print(f"Skipped (already done): {len(skipped)}")
    print(f"Failed: {len(failed)}")
    if failed:
        print("\nFailed rows:")
        for team, opponent, date, err in failed:
            print(f"  - {team} vs {opponent} ({date}): {err}")


if __name__ == "__main__":
    main()
