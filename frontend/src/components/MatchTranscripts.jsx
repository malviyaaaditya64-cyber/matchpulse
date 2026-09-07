import React, { useEffect, useState } from "react";
import { api } from "../api";
import { highlightText, HighlightLegend } from "../nlpHighlight";

const RESULT_STYLE = {
  W: { bg: "var(--teal-dim)", color: "var(--teal)", label: "Win" },
  D: { bg: "var(--amber-dim)", color: "var(--amber)", label: "Draw" },
  L: { bg: "var(--coral-dim)", color: "var(--coral)", label: "Loss" },
};

function scoreExplanation(q) {
  const parts = [];
  if (q.sentiment_score > 0.3) parts.push("the overall tone reads as positive");
  else if (q.sentiment_score < -0.3) parts.push("the overall tone reads as negative");
  else parts.push("the tone is fairly neutral/mixed");

  if (q.blame_ratio > 0.3) parts.push("with more blame placed on external factors (referee, luck, injuries) than on the team itself");
  else if (q.blame_ratio < -0.3) parts.push("with more self-accountability language than external blame");

  if (q.confidence_score > 0.3) parts.push("and the language is assertive/confident");
  else if (q.confidence_score < -0.3) parts.push("and the language leans hesitant/hedging");

  return "This quote scored the way it did because " + parts.join(", ") + ".";
}

export default function MatchTranscripts({ season, team }) {
  const [selectedId, setSelectedId] = useState(season?.[0]?.match_id ?? null);
  const [quotes, setQuotes] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!selectedId) return;
    setLoading(true);
    setError(null);
    api
      .getQuotes(selectedId)
      .then(setQuotes)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [selectedId]);

  const matchOptions = season?.map((match) => ({
    value: match.match_id,
    label: `${team || match.team || "Team"} vs ${match.opponent}`,
  })) || [];

  const selectedMatch = season?.find((m) => m.match_id === selectedId);

  return (
    <div style={{ display: "flex", gap: 24 }}>
      {/* Match list */}
      <div style={{ width: 220, flexShrink: 0 }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 600, marginBottom: 10, color: "var(--text-primary)" }}>
          Matches
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 480, overflowY: "auto" }}>
          {season.map((m) => {
            const style = RESULT_STYLE[m.result] || RESULT_STYLE.D;
            const active = m.match_id === selectedId;
            return (
              <button
                key={m.match_id}
                onClick={() => setSelectedId(m.match_id)}
                style={{
                  textAlign: "left",
                  padding: "10px 12px",
                  borderRadius: 8,
                  border: active ? "1.5px solid var(--accent)" : "1px solid var(--border)",
                  background: active ? "var(--accent-dim)" : "var(--surface)",
                  cursor: "pointer",
                  fontFamily: "var(--font-body)",
                }}
              >
                <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text-primary)" }}>vs {m.opponent || "Unknown Opponent"}</div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 3 }}>
                  <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{m.date}</span>
                  <span
                    style={{
                      fontSize: 10.5,
                      fontWeight: 700,
                      color: style.color,
                      background: style.bg,
                      borderRadius: 5,
                      padding: "1px 6px",
                    }}
                  >
                    {style.label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Transcript panel */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {selectedMatch && (
          <div style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 600, marginBottom: 4, color: "var(--text-primary)" }}>
            {team || selectedMatch.team || "Team"} vs {selectedMatch.opponent} — {selectedMatch.date}
          </div>
        )}
        <div style={{ marginBottom: 14 }}>
          <HighlightLegend />
        </div>

        {loading && (
          <div style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-muted)" }}>Loading transcript…</div>
        )}
        {error && (
          <div style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--coral)" }}>{error}</div>
        )}

        {quotes && !loading && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {quotes.map((q, i) => (
              <div key={i}>
                <div
                  style={{
                    background: "var(--surface-sunken)",
                    borderRadius: 10,
                    padding: 16,
                    fontFamily: "var(--font-body)",
                    fontSize: 14,
                    lineHeight: 1.65,
                    color: "var(--text-primary)",
                    maxHeight: 260,
                    overflowY: "auto",
                  }}
                >
                  <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 8 }}>
                    {q.speaker}
                  </div>
                  {highlightText(q.raw_text)}
                </div>
                <div
                  style={{
                    marginTop: 8,
                    fontFamily: "var(--font-body)",
                    fontSize: 12.5,
                    color: "var(--text-secondary)",
                    background: "var(--accent-dim)",
                    borderRadius: 8,
                    padding: "10px 12px",
                  }}
                >
                  💡 {scoreExplanation(q)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
