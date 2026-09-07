"""
Batch scraper — scrape many press conferences in one run instead of
running youtube_scraper.py one video at a time.

1. Fill out batch_input.csv (template created alongside this script) with
   one row per match: video_id, team, opponent, date, result, speaker, sport
2. Run: python scraper/batch_scrape.py
3. It scrapes every row, skips ones that fail (no captions, etc) instead of
   stopping the whole batch, and prints a summary at the end.
"""

import csv
import os
import sys

sys.path.append(os.path.join(os.path.dirname(__file__), ".."))
from scraper.youtube_scraper import fetch_transcript, extract_speaker_answers, save_entry  # noqa: E402

CSV_PATH = os.path.join(os.path.dirname(__file__), "batch_input.csv")


def create_template_if_missing():
    if os.path.exists(CSV_PATH):
        return
    with open(CSV_PATH, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["video_id", "team", "opponent", "date", "result", "speaker", "sport"])
        writer.writerow(["Ow8bMR-lOvk", "Man United", "Bournemouth", "2026-08-01", "D", "Coach", "football"])
    print(f"Created template at {CSV_PATH} — fill it in with your real video rows and re-run.")


def run_batch():
    if not os.path.exists(CSV_PATH):
        create_template_if_missing()
        return

    with open(CSV_PATH, newline="", encoding="utf-8") as f:
        rows = list(csv.DictReader(f))

    if not rows:
        print("batch_input.csv is empty — add rows first.")
        return

    succeeded, failed = [], []
    for i, row in enumerate(rows, 1):
        video_id = row["video_id"].strip()
        print(f"[{i}/{len(rows)}] Scraping {video_id} ({row['team']} vs {row['opponent']})...")
        try:
            text = fetch_transcript(video_id)
            cleaned = extract_speaker_answers(text)
            save_entry(
                video_id, row["team"], row["opponent"], row["date"],
                row["result"], row["speaker"], cleaned,
                row.get("sport", "football"),
            )
            succeeded.append(video_id)
        except Exception as e:
            print(f"    FAILED: {e}")
            failed.append((video_id, str(e)))

    print("\n--- Batch summary ---")
    print(f"Succeeded: {len(succeeded)}/{len(rows)}")
    if failed:
        print("Failed videos:")
        for vid, err in failed:
            print(f"  - {vid}: {err[:100]}")


if __name__ == "__main__":
    run_batch()
