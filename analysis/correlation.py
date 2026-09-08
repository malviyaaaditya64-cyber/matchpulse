"""
Correlation & prediction layer.
Answers: "does coach negativity predict a losing streak?"

Approach:
  1. Build a time-ordered series of (sentiment, result_numeric) per match.
  2. Time-lagged correlation: sentiment(match N) vs result(match N+1..N+3).
  3. Granger causality test (statsmodels) — statistically tests whether
     past sentiment values help predict future results beyond what past
     results alone would predict.

Note: Granger causality needs a reasonably long, evenly-spaced series
(15-20+ matches minimum for a meaningful test) and tests linear predictive
relationships only — treat results as suggestive, not proof of causation.
"""

import os
import sys

import numpy as np
import pandas as pd
from statsmodels.tsa.stattools import grangercausalitytests

sys.path.append(os.path.join(os.path.dirname(__file__), ".."))
from storage.db import get_connection  # noqa: E402

RESULT_MAP = {"W": 1, "D": 0, "L": -1}


def load_season_dataframe(team: str) -> pd.DataFrame:
    """Return one row per match: date, result_numeric, sentiment, blame, confidence."""
    conn = get_connection()
    query = """
        SELECT m.date, m.result, m.opponent,
               AVG(q.sentiment_score) as sentiment,
               AVG(q.blame_ratio) as blame,
               AVG(q.confidence_score) as confidence
        FROM matches m
        JOIN quotes q ON m.match_id = q.match_id
        WHERE m.team = ?
        GROUP BY m.match_id
        ORDER BY m.date ASC
    """
    df = pd.read_sql_query(query, conn, params=(team,))
    conn.close()
    df["result_numeric"] = df["result"].map(RESULT_MAP)
    return df


def lagged_correlation(df: pd.DataFrame, max_lag: int = 3) -> dict:
    """
    Correlate sentiment(match N) with result(match N+lag) for lag = 1..max_lag.
    Positive correlation = negative sentiment tends to precede losses.
    """
    out = {}
    for lag in range(1, max_lag + 1):
        shifted_result = df["result_numeric"].shift(-lag)
        valid = df["sentiment"].notna() & shifted_result.notna()
        if valid.sum() < 4:
            out[int(lag)] = None
            continue
        corr = df.loc[valid, "sentiment"].corr(shifted_result[valid])
        out[int(lag)] = round(float(corr), 4) if corr is not None else None
    return out


def granger_test(df: pd.DataFrame, max_lag: int = 3) -> dict:
    """
    Runs Granger causality: does sentiment history help predict result_numeric?
    Returns p-values per lag — p < 0.05 suggests sentiment has predictive value.
    """
    data = df[["result_numeric", "sentiment"]].dropna()
    if len(data) < max_lag * 2 + 2:
        return {"error": f"Not enough data points ({len(data)}). Need at least {max_lag * 2 + 2} matches."}

        try:
            try:
                results = grangercausalitytests(data.values, maxlag=max_lag, verbose=False)
            except TypeError:
            # Newer statsmodels versions removed the `verbose` argument entirely.
                results = grangercausalitytests(data.values, maxlag=max_lag)
        except Exception as e:
         return {"error": str(e)}

    summary = {}
    for lag, res in results.items():
        p_value = res[0]["ssr_ftest"][1]
        summary[int(lag)] = round(float(p_value), 4)
    return summary


def full_report(team: str) -> dict:
    df = load_season_dataframe(team)
    if df.empty:
        return {"error": f"No data found for team '{team}'"}

    return {
        "team": team,
        "matches_analyzed": len(df),
        "season_summary": df[["date", "opponent", "result", "sentiment", "blame", "confidence"]].to_dict("records"),
        "lagged_correlation_sentiment_vs_future_result": lagged_correlation(df),
        "granger_causality_p_values": granger_test(df),
        "interpretation": (
            "Lower p-value (< 0.05) at a given lag means sentiment at that "
            "lag has statistically significant predictive power over results. "
            "Positive lagged correlation means negative sentiment tends to "
            "precede losses; negative correlation means the opposite."
        ),
    }


if __name__ == "__main__":
    import json
    print(json.dumps(full_report("Riverside FC"), indent=2, default=str))
