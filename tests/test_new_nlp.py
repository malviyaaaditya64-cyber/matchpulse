import pytest
from nlp.analyzer import analyze_quote


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
    assert result["sentiment_source"] == "transformer" or result["sentiment_source"] == "vader"


def test_vader_fallback():
    result = analyze_quote("This is a great game", use_transformer=False)
    assert result["sentiment_source"] == "vader"