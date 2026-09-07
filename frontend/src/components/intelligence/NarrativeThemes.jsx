import React from "react";

const NarrativeThemes = ({ season }) => {
  const analyzeThemes = () => {
    if (!season || !Array.isArray(season) || season.length === 0) return null;

    const positiveThemes = [];
    const negativeThemes = [];

    // Analyze sentiment trends
    const sentimentTrend = season.reduce((sum, match) => sum + match.sentiment, 0) / season.length;
    if (sentimentTrend > 0.3) {
      positiveThemes.push("Positive sentiment trend");
    } else if (sentimentTrend < -0.3) {
      negativeThemes.push("Negative sentiment trend");
    }

    // Analyze confidence trends
    const confidenceTrend = season.reduce((sum, match) => sum + match.confidence, 0) / season.length;
    if (confidenceTrend > 0.3) {
      positiveThemes.push("High confidence");
    } else if (confidenceTrend < -0.3) {
      negativeThemes.push("Low confidence");
    }

    // Analyze blame trends
    const blameTrend = season.reduce((sum, match) => sum + match.blame, 0) / season.length;
    if (blameTrend < -0.3) {
      positiveThemes.push("Low blame");
    } else if (blameTrend > 0.3) {
      negativeThemes.push("High blame");
    }

    // Analyze match results
    const wins = season.filter((match) => match.result === "W").length;
    const losses = season.filter((match) => match.result === "L").length;
    if (wins > losses) {
      positiveThemes.push("Winning form");
    } else if (losses > wins) {
      negativeThemes.push("Losing form");
    }

    return {
      positiveThemes,
      negativeThemes,
    };
  };

  const themes = analyzeThemes();

  if (!themes) {
    return (
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-card)", borderRadius: 14, padding: 24, marginBottom: 24 }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 600, marginBottom: 3, color: "var(--text-primary)" }}>
          Narrative Themes
        </div>
        <div style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-muted)" }}>
          Not enough match data to identify narrative themes.
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-card)", borderRadius: 14, padding: 24, marginBottom: 24 }}>
      <div style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 600, marginBottom: 3, color: "var(--text-primary)" }}>
        Narrative Themes
      </div>
      <div style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-muted)", marginBottom: 16 }}>
        Identified themes based on recent match data:
      </div>
      <div style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-primary)", marginBottom: 16 }}>
        Positive Themes:
      </div>
      <ul style={{ paddingLeft: 20, marginBottom: 16 }}>
        {themes.positiveThemes.length > 0 ? (
          themes.positiveThemes.map((theme, index) => (
            <li key={index} style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--teal)" }}>
              {theme}
            </li>
          ))
        ) : (
          <li style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-muted)" }}>No positive themes identified</li>
        )}
      </ul>
      <div style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-primary)", marginBottom: 16 }}>
        Negative Themes:
      </div>
      <ul style={{ paddingLeft: 20 }}>
        {themes.negativeThemes.length > 0 ? (
          themes.negativeThemes.map((theme, index) => (
            <li key={index} style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--coral)" }}>
              {theme}
            </li>
          ))
        ) : (
          <li style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-muted)" }}>No negative themes identified</li>
        )}
      </ul>
    </div>
  );
};

export default NarrativeThemes;