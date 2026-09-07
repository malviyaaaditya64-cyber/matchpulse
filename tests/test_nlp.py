import pytest
from nlp.analyzer import analyze_quote

def test_sentiment_score_range():
    result = analyze_quote("This is a great game.")
    assert -1 <= result["sentiment_score"] <= 1

def test_positive_sentiment():
    result = analyze_quote("We played excellently and deserved the win.")
    assert result["sentiment_score"] > 0

def test_negative_sentiment():
    result = analyze_quote("This was a terrible performance and we are disappointed.")
    assert result["sentiment_score"] < 0

def test_neutral_sentiment():
    result = analyze_quote("The match was played today.")
    # VADER sometimes gives small scores, but shouldn't be strongly polarized
    assert -0.5 < result["sentiment_score"] < 0.5

def test_blame_detection():
    # "referee" is in EXTERNAL_BLAME_TERMS
    result = analyze_quote("The referee decision was wrong.")
    assert result["blame_ratio"] > 0

def test_self_accountability_detection():
    # "my fault" is in SELF_ACCOUNTABILITY_TERMS
    result = analyze_quote("It was my fault we lost.")
    assert result["blame_ratio"] < 0

def test_confidence_score():
    result = analyze_quote("I am absolutely certain we will win next time.")
    assert result["confidence_score"] > 0.5

def test_empty_quote():
def test_speaker_identification_coach():
    result = analyze_quote("This is a quote from the head coach", speaker="Head Coach")
    assert result["speaker_type"] == "coach"

def test_speaker_identification_player():
    result = analyze_quote("This is a quote from a player", speaker="John Smith")
    assert result["speaker_type"] == "player"

def test_speaker_identification_unknown():
    result = analyze_quote("This is a quote from an unknown speaker", speaker="Unknown")
    assert result["speaker_type"] == "unknown"

def test_transformer_sentiment():
    result = analyze_quote("This is a great game", use_transformer=True)
    assert result["sentiment_source"] == "transformer"

def test_vader_fallback():
    result = analyze_quote("This is a great game", use_transformer=False)
    assert result["sentiment_source"] == "vader"


    result = analyze_quote("")
    assert result["sentiment_score"] == 0
    assert result["blame_ratio"] == 0
    assert result["confidence_score"] == 0
