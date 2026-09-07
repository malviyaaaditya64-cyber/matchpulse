"""
Scrapes press-conference transcripts from YouTube videos.
"""

import argparse
import json
import os
import re
import time
from datetime import datetime

from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api._errors import TranscriptsDisabled, NoTranscriptFound

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "data", "raw")
os.makedirs(OUTPUT_DIR, exist_ok=True)


def _translate_with_retry(translator, text, max_retries=3, base_delay=2.0):
    """Translate one chunk, retrying with backoff if the service is rate-limited."""
    for attempt in range(max_retries):
        try:
            return translator.translate(text)
        except Exception as e:
            if attempt == max_retries - 1:
                raise
            wait = base_delay * (attempt + 1)
            print(f"[scraper] Translation chunk rate-limited, waiting {wait}s and retrying...")
            time.sleep(wait)


def fetch_transcript(video_id: str) -> str:
    """Pull the full transcript text for a YouTube video, in English."""
    api = YouTubeTranscriptApi()
    try:
        fetched = api.fetch(video_id, languages=["en"])
        return " ".join(snippet.text for snippet in fetched)
    except (TranscriptsDisabled, NoTranscriptFound):
        pass

    transcript_list = api.list(video_id)
    original_text = None
    for transcript in transcript_list:
        fetched = transcript.fetch()
        original_text = " ".join(snippet.text for snippet in fetched)
        break

    if original_text is None:
        raise RuntimeError(f"No transcript available for {video_id}: no captions found at all.")

    google_chunk_size = 4500
    google_chunks = [original_text[i:i + google_chunk_size]
                      for i in range(0, len(original_text), google_chunk_size)
                      if original_text[i:i + google_chunk_size].strip()]

    try:
        from deep_translator import GoogleTranslator
        translator = GoogleTranslator(source="auto", target="en")
        translated_chunks = [translator.translate(c) for c in google_chunks]
        return " ".join(translated_chunks)
    except Exception as e:
        print(f"[scraper] Google Translate failed ({e}), trying MyMemory as backup...")

    try:
        from deep_translator import MyMemoryTranslator
        mymemory_chunk_size = 450
        mymemory_chunks = [original_text[i:i + mymemory_chunk_size]
                            for i in range(0, len(original_text), mymemory_chunk_size)
                            if original_text[i:i + mymemory_chunk_size].strip()]
        translator = MyMemoryTranslator(source="auto", target="en-GB")
        translated_chunks = []
        for c in mymemory_chunks:
            translated_chunks.append(_translate_with_retry(translator, c))
            time.sleep(1.2)  # stay well under MyMemory's shared rate limit
        return " ".join(translated_chunks)
    except Exception as e:
        print(f"[scraper] WARNING: both translators failed ({e}), saving original-language text as-is. "
              f"NLP sentiment/blame scores will be unreliable for this quote.")
        return original_text


def extract_speaker_answers(raw_text: str, min_words: int = 6) -> str:
    segments = [s.strip() for s in raw_text.split(">>") if s.strip()]
    answers = []
    for seg in segments:
        sentences = re.split(r'(?<=[.?!])\s+', seg)
        kept = [s for s in sentences if not s.rstrip().endswith("?")]
        kept_text = " ".join(kept).strip()
        if len(kept_text.split()) >= min_words:
            answers.append(kept_text)
    return " ".join(answers)


def save_entry(video_id, team, opponent, date, result, speaker, text, sport="football"):
    entry = {
        "match_id": f"{team}_{opponent}_{date}".replace(" ", "_"),
        "video_id": video_id,
        "sport": sport,
        "date": date,
        "team": team,
        "opponent": opponent,
        "result": result,
        "speaker": speaker,
        "quote_text": text,
        "source": f"https://youtube.com/watch?v={video_id}",
        "scraped_at": datetime.utcnow().isoformat(),
    }
    out_path = os.path.join(OUTPUT_DIR, f"{entry['match_id']}_{speaker.replace(' ', '_')}.json")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(entry, f, indent=2, ensure_ascii=False)
    print(f"Saved -> {out_path}")
    return entry


def main():
    parser = argparse.ArgumentParser(description="Scrape a press conference transcript from YouTube")
    parser.add_argument("--video_id", required=True)
    parser.add_argument("--team", required=True)
    parser.add_argument("--opponent", required=True)
    parser.add_argument("--date", required=True)
    parser.add_argument("--result", required=False, default="")
    parser.add_argument("--speaker", required=True)
    parser.add_argument("--sport", default="football", choices=["football", "cricket"])
    args = parser.parse_args()

    text = fetch_transcript(args.video_id)
    cleaned_text = extract_speaker_answers(text)
    save_entry(args.video_id, args.team, args.opponent, args.date, args.result,
               args.speaker, cleaned_text, args.sport)


if __name__ == "__main__":
    main()

