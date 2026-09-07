"""
NLP analysis layer for press-conference quotes.

Produces three signals per quote:
  1. sentiment_score   -> VADER compound score, -1 (very negative) to +1 (very positive)
  2. blame_ratio        -> external-blame mentions vs self-accountability mentions
                           >0 means more external blame, <0 means more self-accountability
  3. confidence_score   -> ratio of confident/assertive language vs hedging language

These are lexicon-based (fast, transparent, no training data needed).
For higher accuracy later, swap sentiment for a HuggingFace transformer
(e.g. cardiffnlp/twitter-roberta-base-sentiment) and train a small
classifier on top of the lexicon-labelled data as weak supervision.
"""

import re
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

_vader = SentimentIntensityAnalyzer()

# --- Optional transformer-based sentiment (more accurate on context) ---
# VADER is a word-lexicon tool: it flags words like "wrong", "penalty",
# "baffling" as negative even when the overall sentence is actually
# positive about the team (e.g. a coach praising his players while
# complaining about a referee decision). A transformer model reads the
# whole sentence's context instead of scoring individual words, so it
# handles this much better. It's optional because it needs `transformers`
# + `torch` installed (large downloads, ~500MB+ on first run) — if they
# aren't available, everything falls back to VADER automatically.
_transformer_pipeline = None
_transformer_load_attempted = False


def _get_transformer_pipeline():
    """Lazily load the transformer sentiment model on first use."""
    global _transformer_pipeline, _transformer_load_attempted
    if _transformer_load_attempted:
        return _transformer_pipeline
    _transformer_load_attempted = True
    try:
        from transformers import pipeline
        _transformer_pipeline = pipeline(
            "sentiment-analysis",
            model="cardiffnlp/twitter-roberta-base-sentiment-latest",
        )
    except Exception as e:
        print(f"[analyzer] Transformer model unavailable, falling back to VADER: {e}")
        _transformer_pipeline = None
    return _transformer_pipeline


from typing import Optional


def _get_transformer_pipeline():
    """Lazily load the transformer sentiment model on first use."""
    global _transformer_pipeline, _transformer_load_attempted
    if _transformer_load_attempted:
        return _transformer_pipeline
    _transformer_load_attempted = True
    try:
        from transformers import pipeline
        _transformer_pipeline = pipeline(
            "sentiment-analysis",
            model="cardiffnlp/twitter-roberta-base-sentiment-latest",
        )
    except Exception as e:
        print(f"[analyzer] Transformer model unavailable, falling back to VADER: {e}")
        _transformer_pipeline = None
    return _transformer_pipeline


def sentiment_score_transformer(text: str) -> Optional[float]:
    """
    Returns a -1..1 score using cardiffnlp/twitter-roberta-base-sentiment-latest.
    Returns None if the transformer model isn't available (missing deps,
    no internet on first download, etc) so callers can fall back to VADER.

    RoBERTa has a ~512 token limit (~2000-2500 characters). Long press
    conference transcripts easily exceed that, so instead of truncating
    (which only analyzes the beginning and misses everything after), this
    splits the text into ~1800-character chunks and averages the sentiment
    across all of them — giving every part of the transcript a voice in
    the final score.
    """
    clf = _get_transformer_pipeline()
    if clf is None:
        return None

    chunk_size = 1800
    chunks = [text[i:i + chunk_size] for i in range(0, len(text), chunk_size)] or [text]

    try:
        scores = []
        for chunk in chunks:
            if not chunk.strip():
                continue
            result = clf(chunk)[0]
            label, score = result["label"].lower(), result["score"]
            if label == "positive":
                scores.append(score)
            elif label == "negative":
                scores.append(-score)
            else:
                scores.append(0.0)
        return sum(scores) / len(scores) if scores else 0.0
    except Exception as e:
        print(f"[analyzer] Transformer sentiment failed: {e}")
        return None


def _hybrid_200_sentiment(text: str) -> float:
    """Calculate sentiment using Hybrid 200 strategy."""
    sentences = re.split(r'(?<=[.!?])\s+', text)
    segments = []
    for sentence in sentences:
        if not sentence.strip():
            continue
        words = sentence.split()
        if len(words) > 200:
            for i in range(0, len(words), 200):
                segment = ' '.join(words[i:i+200])
                segments.append(segment)
        else:
            segments.append(sentence)
    segment_scores = [_vader.polarity_scores(seg)['compound'] for seg in segments if seg.strip()]
    return sum(segment_scores) / len(segment_scores) if segment_scores else 0.0


def analyze_quote(text: str) -> dict:
    """
    Analyze a press-conference quote and return the three signals.
    
    Args:
        text: The quote text to analyze.
    
    Returns:
        dict: A dictionary containing:
            - sentiment_score: VADER compound score (-1 to +1)
            - blame_ratio: External blame mentions vs self-accountability mentions
            - confidence_score: Ratio of confident/assertive language vs hedging language
    """
    if not text.strip():
        return {
            "sentiment_score": 0.0,
            "blame_ratio": 0.0,
            "confidence_score": 0.0,
        }

    # --- Sentiment ---
    sentiment_score = _hybrid_200_sentiment(text)

    # --- Blame Ratio ---
    blame_keywords = {
        "blame", "fault", "responsible", "accountable", "to blame", "at fault",
        "should have", "could have", "would have", "must have", "should've",
        "could've", "would've", "must've", "my fault", "our fault",
        "their fault", "his fault", "her fault", "its fault", "their mistake",
        "his mistake", "her mistake", "its mistake", "my mistake", "our mistake",
    }
    self_accountability_keywords = {
        "we", "our", "ourselves", "ourself", "we're", "we've", "we'll", "we'd",
        "we're accountable", "we're responsible", "we take responsibility",
        "we take accountability", "we accept responsibility", "we accept accountability",
    }

    blame_count = 0
    self_accountability_count = 0
    words = re.findall(r"\w+", text.lower())
    for word in words:
        if word in blame_keywords:
            blame_count += 1
        if word in self_accountability_keywords:
            self_accountability_count += 1

    blame_ratio = (blame_count - self_accountability_count) / (len(words) + 1e-6)

    # --- Confidence Score ---
    confident_keywords = {
        "absolutely", "certainly", "definitely", "undoubtedly", "without a doubt",
        "for sure", "surely", "positively", "100%", "100 percent", "100 percent sure",
        "100% sure", "100% confident", "100 percent confident", "100% positive",
        "100 percent positive", "100% accurate", "100 percent accurate", "100% certain",
        "100 percent certain", "100% definitely", "100 percent definitely",
    }
    hedging_keywords = {
        "maybe", "perhaps", "possibly", "possibly", "might", "could", "might", "could",
        "might be", "could be", "might have", "could have", "might not", "could not",
        "might not be", "could not be", "might not have", "could not have",
        "possibly could", "possibly might", "possibly could be", "possibly might be",
    }

    confident_count = 0
    hedging_count = 0
    for word in words:
        if word in confident_keywords:
            confident_count += 1
        if word in hedging_keywords:
            hedging_count += 1

    confidence_score = (confident_count - hedging_count) / (len(words) + 1e-6)

    return {
        "sentiment_score": max(-1.0, min(1.0, sentiment_score)),
        "blame_ratio": blame_ratio,
        "confidence_score": confidence_score,
    }



# --- Blame-shifting lexicon ---------------------------------------------
EXTERNAL_BLAME_TERMS = [
    "referee", "umpire", "decision", "var", "pitch condition", "lucky",
    "unlucky", "bad luck", "no control", "out of our hands", "conditions",
    "injury", "injuries", "schedule", "fixture list", "travel", "fatigue",
    "the officials", "the call", "controversial", "harsh", "unfair",
    # sports-specific additions found from real transcript testing:
    "penalty", "wrong decision", "got it wrong", "baffling", "astonishing",
    "should have been given", "should have had", "denied us", "cost us",
    "the officials got", "poor decision", "wrong call", "soft penalty",
]

SELF_ACCOUNTABILITY_TERMS = [
    "my fault", "our fault", "i take responsibility", "we take responsibility",
    "we were outplayed", "not good enough", "we let ourselves down",
    "i got it wrong", "my mistake", "we made mistakes", "we need to improve",
    "on me", "own it", "accountable", "we underperformed",
]

# --- Confidence / hedging lexicon ---------------------------------------
CONFIDENT_TERMS = [
    "we will", "we are going to", "we will win", "definitely", "certain",
    "no doubt", "confident", "we know we can", "believe in", "will bounce back",
    "will turn this around",
]

HEDGING_TERMS = [
    "hopefully", "we'll see", "if things go", "maybe", "possibly",
    "we might", "try to", "hope to", "let's hope", "not sure",
    "i don't know", "we'll try",
]


def _count_terms(text: str, terms: list[str]) -> int:
    text_lower = text.lower()
    return sum(text_lower.count(term) for term in terms)


def sentiment_score(text: str) -> float:
    """VADER compound sentiment score, -1 to +1."""
    return _vader.polarity_scores(text)["compound"]


def blame_ratio(text: str) -> float:
    """
    Positive = leans toward blaming external factors.
    Negative = leans toward self-accountability.
    0 = neutral / no blame language detected.
    """
    external = _count_terms(text, EXTERNAL_BLAME_TERMS)
    internal = _count_terms(text, SELF_ACCOUNTABILITY_TERMS)
    total = external + internal
    if total == 0:
        return 0.0
    return (external - internal) / total


def confidence_score(text: str) -> float:
    """
    Positive = confident/assertive language dominates.
    Negative = hedging/uncertain language dominates.
    """
    confident = _count_terms(text, CONFIDENT_TERMS)
    hedging = _count_terms(text, HEDGING_TERMS)
    total = confident + hedging
    if total == 0:
        return 0.0
    return (confident - hedging) / total


def identify_speaker(speaker: str) -> str:
    """
    Implement a reliable speaker identification hierarchy.
    
    Priority:
    1. Explicit speaker information (coach/player titles)
    2. Existing speaker metadata
    3. Known coach/player information already available
    4. Transcript attribution patterns
    5. Transcript structure
    6. Conservative contextual heuristics
    7. Unknown
    
    Allowed values: 'coach', 'player', 'unknown'
    
    IMPORTANT: Do NOT classify a quote as coach/player simply because the text contains:
    coach, manager, captain, striker, goalkeeper, defender, etc.
    These words may refer to another person.
    
    Never invent a speaker identity.
    If confidence is insufficient: speaker_type = "unknown"
    """
    if not speaker or not isinstance(speaker, str):
        return "unknown"
    
    speaker_lower = speaker.strip().lower()
    
    # Special case for "Unknown" speaker
    if speaker_lower == "unknown":
        return "unknown"
    
    # Priority 1: Explicit coach/player titles in speaker field
    # Look for explicit coach identification
    if any(title in speaker_lower for title in ['head coach', 'manager', 'coach', 'headcoach']):
        return "coach"
    
    # Look for explicit player identification
    if any(title in speaker_lower for title in ['player', 'captain', 'goalkeeper', 'striker', 'defender', 'midfielder']):
        return "player"
    
    # Priority 2: Existing speaker metadata patterns
    # Common coach naming patterns
    if re.search(r'\b(coach|manager)\b', speaker_lower):
        return "coach"
    
    # Common player naming patterns (first name + last name, or just last name)
    # Players often have names like "John Smith", "Smith", "J. Smith"
    name_parts = speaker_lower.split()
    if len(name_parts) >= 2 or (len(name_parts) == 1 and len(name_parts[0]) > 2):
        # If it looks like a name (not just "Coach" or "Manager")
        if not re.search(r'\b(coach|manager|head|assistant|staff)\b', speaker_lower):
            return "player"
    
    # Priority 3: Check for known coach/player patterns in common formats
    # Coach names often include "Coach" or "Manager" as part of the name
    if re.search(r'\b(coach|manager)\b', speaker_lower):
        return "coach"
    
    # Priority 4: Transcript attribution patterns
    # Look for patterns like "Coach X said..." or "Player Y stated..."
    # This is harder to detect from just the speaker field, so we rely on the speaker field itself
    
    # Priority 5: Conservative contextual heuristics
    # Only use if we're reasonably confident
    # If speaker contains common coach names or titles
    coach_indicators = ['head', 'assistant', 'first team', 'senior', 'chief']
    if any(indicator in speaker_lower for indicator in coach_indicators):
        return "coach"
    
    # If speaker contains common player indicators
    player_indicators = ['forward', 'defender', 'midfielder', 'goalkeeper', 'striker', 'winger']
    if any(indicator in speaker_lower for indicator in player_indicators):
        return "player"
    
    # Priority 6: Default to unknown if no clear identification
    return "unknown"


def analyze_quote(text: str, speaker: str = None, use_transformer: bool = True) -> dict:
    """
    Run all three signals on a single quote and return a summary dict.

    If use_transformer is True (default), attempts the more accurate
    transformer-based sentiment model first and only falls back to VADER
    if it's unavailable. Set use_transformer=False to force VADER (faster,
    no extra dependencies — useful for quick testing or low-resource setups).
    
    Args:
        text: The quote text to analyze
        speaker: Optional speaker name for speaker identification
        use_transformer: Whether to attempt transformer sentiment analysis
    
    Returns:
        Dict with sentiment_score, sentiment_source, blame_ratio, confidence_score, word_count
    """
    # Identify speaker type
    speaker_type = identify_speaker(speaker) if speaker else "unknown"
    
    # Calculate sentiment
    transformer_result = sentiment_score_transformer(text) if use_transformer else None
    used_sentiment = transformer_result if transformer_result is not None else sentiment_score(text)
    used_source = "transformer" if transformer_result is not None else "vader"

    return {
        "sentiment_score": round(used_sentiment, 4),
        "sentiment_source": used_source,
        "speaker_type": speaker_type,
        "blame_ratio": round(blame_ratio(text), 4),
        "confidence_score": round(confidence_score(text), 4),
        "word_count": len(text.split()),
    }


if __name__ == "__main__":
    sample = (
        "It's my fault, I take full responsibility for that result. "
        "We were not good enough today and we know we need to improve. "
        "But I'm confident we will bounce back next week."
    )
    print(analyze_quote(sample))
