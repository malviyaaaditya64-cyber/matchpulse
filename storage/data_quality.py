"""
Sanity checks for scraped raw JSON before it's allowed into the database.

Root cause this guards against: some scraped files have the full video
*title* sitting in the `team` (or `opponent`) field instead of the actual
team name -- e.g.

    "team": "EDWARDS: \u201cFINAL NAIL IN THE COFFIN!\u201d  Wolves"

instead of

    "team": "Wolves"

This happens for a few different title shapes (quote-led headlines,
"Team - Person - Description" recaps, "Person FULL PRESS CONFERENCE Team",
fan-reaction headlines, etc.), so there's no single regex that reliably
*recovers* the real team name for all of them. Instead we just detect that
a value looks like a headline rather than a team name, so it can be kept
out of the database (and out of team dropdowns / filters) without deleting
the underlying raw file.
"""

import re

# Real team names never contain these. Any one of them is enough to flag
# the field as "this is a headline, not a team name".
_HEADLINE_MARKERS = [
    "\u201c", "\u201d",  # smart quotes
    '"', "'",
    "!",
    "?",
    ":",
    " - ",
    "\u2013", "\u2014",  # en dash / em dash
]

# Team names are short. Anything longer than this many words is almost
# certainly a leaked title, not a team name.
_MAX_TEAM_WORDS = 5


def is_malformed_name_field(value: str) -> bool:
    """
    Return True if `value` (a team/opponent field) looks like scraped
    headline/title text rather than an actual team name.
    """
    if not value:
        return False  # empty is handled separately (missing data, not malformed)

    value = value.strip()

    for marker in _HEADLINE_MARKERS:
        if marker in value:
            return True

    if len(value.split()) > _MAX_TEAM_WORDS:
        return True

    return False


def validate_match_fields(team: str, opponent: str, sport: str = "football"):
    """
    Check a match's team/opponent fields.

    Returns (is_valid, reasons) where `reasons` is a list of human-readable
    strings describing what's wrong (empty if is_valid is True).
    Only applied to football for now -- cricket team/entity naming is
    freer-form and the scraper for it doesn't have this bug.
    """
    if sport != "football":
        return True, []

    reasons = []
    if is_malformed_name_field(team):
        reasons.append(f"team field looks like a headline: {team!r}")
    if is_malformed_name_field(opponent):
        reasons.append(f"opponent field looks like a headline: {opponent!r}")

    return (len(reasons) == 0), reasons