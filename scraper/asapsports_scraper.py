"""
Scrapes press-conference transcripts from ASAP Sports (asapsports.com) —
a public archive of verbatim sports press-conference transcripts, already
in clean English text. No video, no captions, no translation needed —
this is dramatically faster than the YouTube scraper for bulk collection.

Site structure:
    show_interview.php?id=XXXXX   -> one player/coach's transcript
    show_event.php?category=C&date=YYYY-MM-DD&title=...  -> lists all
        interview links for a given event/date (usually 2, one per team)
    show_year.php?category=C&year=YYYY -> lists all events in that year

Category IDs: 22 = Cricket, 14 = Soccer/Football (NOT id=1, which is
American football)

Usage:
    python scraper/asapsports_scraper.py --interview_id 182161 \
        --team England --opponent Pakistan --date 2022-11-13 \
        --result W --sport cricket
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

HEADERS = {"User-Agent": "Mozilla/5.0 (research project; press-conference NLP study)"}
BASE_URL = "https://www.asapsports.com/show_interview.php?id={}"


def fetch_interview(interview_id: str) -> dict:
    """
    Fetches one ASAP Sports interview transcript page and extracts:
    speaker name, date, event title, and the cleaned Q&A body text.
    """
    url = BASE_URL.format(interview_id)
    resp = requests.get(url, headers=HEADERS, timeout=15)
    resp.raise_for_status()
    soup = BeautifulSoup(resp.text, "html.parser")

    # The page title format is usually:
    # "ASAP Sports Transcripts - <Sport> - <Year> - <EVENT> - <Date> - <Speaker>"
    page_title = soup.title.get_text(strip=True) if soup.title else ""
    parts = [p.strip() for p in page_title.split(" - ")]
    speaker = parts[-1] if len(parts) >= 5 else "Unknown"
    event_title = parts[3] if len(parts) >= 4 else ""

    # Extract the main transcript body: ASAP Sports pages are simple
    # server-rendered HTML with the transcript in the main content area,
    # after the date line and before "FastScripts Transcript by ASAP Sports".
    full_text = soup.get_text("\n", strip=True)

    # Trim navigation boilerplate: keep only text between the date line
    # and the "FastScripts Transcript" signature at the end.
    date_match = re.search(r"([A-Z][a-z]+ \d{1,2}, \d{4})", full_text)
    start_idx = date_match.end() if date_match else 0
    end_marker = full_text.find("FastScripts Transcript")
    end_idx = end_marker if end_marker != -1 else len(full_text)
    body = full_text[start_idx:end_idx].strip()

    date_str = date_match.group(1) if date_match else None

    return {
        "speaker": speaker,
        "event_title": event_title,
        "date_text": date_str,
        "quote_text": body,
        "source": url,
    }


def extract_qa_only(body_text: str, min_words: int = 6) -> str:
    """
    ASAP Sports transcripts mark questions with a leading 'Q.' — this
    strips the interviewer's questions and keeps only the answers,
    mirroring the same Q&A cleaning we do for YouTube transcripts.
    """
    # Split on "Q." markers (ASAP's convention for questions)
    segments = re.split(r"Q\.\s*", body_text)
    answers = []
    for seg in segments:
        # Within each Q./A. block, the question is usually wrapped in
        # its own sentence(s) before the ALL-CAPS speaker name restates
        # the answer (e.g. "JOS BUTTLER: ..."). Keep only text after the
        # first speaker-name-colon marker if present.
        match = re.search(r"[A-Z][A-Z\s]+:\s*", seg)
        if match:
            answer = seg[match.end():].strip()
        else:
            answer = seg.strip()
        if len(answer.split()) >= min_words:
            answers.append(answer)
    return " ".join(answers)


def save_entry(interview_id, team, opponent, date, result, speaker, text, sport, source_url):
    entry = {
        "match_id": f"{team}_{opponent}_{date}".replace(" ", "_"),
        "interview_id": interview_id,
        "sport": sport,
        "date": date,
        "team": team,
        "opponent": opponent,
        "result": result,
        "speaker": speaker,
        "quote_text": text,
        "source": source_url,
        "scraped_at": datetime.utcnow().isoformat(),
    }
    out_path = os.path.join(OUTPUT_DIR, f"{entry['match_id']}_{speaker.replace(' ', '_')}.json")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(entry, f, indent=2, ensure_ascii=False)
    print(f"Saved -> {out_path}")
    return entry


def main():
    parser = argparse.ArgumentParser(description="Scrape a press conference transcript from ASAP Sports")
    parser.add_argument("--interview_id", required=True, help="The id= value from show_interview.php?id=XXXXX")
    parser.add_argument("--team", required=True)
    parser.add_argument("--opponent", required=True)
    parser.add_argument("--date", required=True, help="YYYY-MM-DD")
    parser.add_argument("--result", required=True, choices=["W", "L", "D"])
    parser.add_argument("--sport", required=True, choices=["football", "cricket"])
    args = parser.parse_args()

    data = fetch_interview(args.interview_id)
    cleaned = extract_qa_only(data["quote_text"])
    save_entry(args.interview_id, args.team, args.opponent, args.date, args.result,
               data["speaker"], cleaned, args.sport, data["source"])
    time.sleep(1)  # be polite to the server


if __name__ == "__main__":
    main()
