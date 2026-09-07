import React from "react";

// Small curated word lists mirroring the backend lexicon (nlp/analyzer.py) —
// used here only to visually highlight text, not to compute scores.
const POSITIVE_WORDS = [
  "proud", "excellent", "brilliant", "great", "positive", "confident",
  "strong", "well", "believe", "pleased", "happy", "delighted",
];
const NEGATIVE_WORDS = [
  "wrong", "baffling", "astonishing", "poor", "disappointing", "frustrated",
  "difficult", "tough", "not good enough", "bad", "worse", "unfair",
];
const BLAME_WORDS = [
  "referee", "umpire", "decision", "penalty", "var", "unlucky", "luck",
  "injuries", "injury", "conditions", "schedule", "harsh", "controversial",
];
const ACCOUNTABILITY_WORDS = [
  "my fault", "our fault", "take responsibility", "not good enough",
  "own it", "accountable", "we let ourselves down", "underperformed",
];

function buildPattern(words) {
  const escaped = words.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  return new RegExp(`\\b(${escaped.join("|")})\\b`, "gi");
}

const PATTERNS = [
  { pattern: buildPattern(POSITIVE_WORDS), color: "var(--teal)", bg: "var(--teal-dim)" },
  { pattern: buildPattern(NEGATIVE_WORDS), color: "var(--coral)", bg: "var(--coral-dim)" },
  { pattern: buildPattern(BLAME_WORDS), color: "var(--amber)", bg: "var(--amber-dim)" },
  { pattern: buildPattern(ACCOUNTABILITY_WORDS), color: "var(--accent)", bg: "var(--accent-dim)" },
];

/** Splits text into segments, wrapping matched words in colored <mark> spans. */
export function highlightText(text) {
  // Tag every character position with which pattern (if any) matches there.
  let matches = [];
  PATTERNS.forEach(({ pattern, color, bg }) => {
    let m;
    const re = new RegExp(pattern);
    while ((m = re.exec(text)) !== null) {
      matches.push({ start: m.index, end: m.index + m[0].length, text: m[0], color, bg });
    }
  });
  matches.sort((a, b) => a.start - b.start);

  // Remove overlaps (keep first match found at each position)
  const clean = [];
  let lastEnd = 0;
  for (const m of matches) {
    if (m.start >= lastEnd) {
      clean.push(m);
      lastEnd = m.end;
    }
  }

  const nodes = [];
  let cursor = 0;
  clean.forEach((m, i) => {
    if (m.start > cursor) nodes.push(text.slice(cursor, m.start));
    nodes.push(
      <mark
        key={i}
        style={{
          background: m.bg,
          color: m.color,
          borderRadius: 3,
          padding: "1px 3px",
          fontWeight: 600,
        }}
      >
        {m.text}
      </mark>
    );
    cursor = m.end;
  });
  if (cursor < text.length) nodes.push(text.slice(cursor));
  return nodes;
}

export function HighlightLegend() {
  const items = [
    { label: "Positive language", color: "var(--teal)", bg: "var(--teal-dim)" },
    { label: "Negative language", color: "var(--coral)", bg: "var(--coral-dim)" },
    { label: "Blaming external factors", color: "var(--amber)", bg: "var(--amber-dim)" },
    { label: "Self-accountability", color: "var(--accent)", bg: "var(--accent-dim)" },
  ];
  return (
    <div style={{ display: "flex", gap: 14, flexWrap: "wrap", fontFamily: "var(--font-body)", fontSize: 12 }}>
      {items.map((it) => (
        <div key={it.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 10, height: 10, borderRadius: 3, background: it.bg, border: `1.5px solid ${it.color}` }} />
          <span style={{ color: "var(--text-secondary)" }}>{it.label}</span>
        </div>
      ))}
    </div>
  );
}
