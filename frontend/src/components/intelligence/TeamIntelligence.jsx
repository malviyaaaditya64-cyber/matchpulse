import React from "react";

const TeamIntelligence = ({ season }) => {
  const calculateIntelligence = () => {
    if (!season || !Array.isArray(season) || season.length === 0) return null;

    const sentimentTrend = season.reduce((sum, match) => sum + match.sentiment, 0) / season.length;
    const confidenceTrend = season.reduce((sum, match) => sum + match.confidence, 0) / season.length;
    const blameTrend = season.reduce((sum, match) => sum + match.blame, 0) / season.length;

    const wins = season.filter((match) => match.result === "W").length;
    const losses = season.filter((match) => match.result === "L").length;

    const form = wins > losses ? "Good" : wins === losses ? "Mixed" : "Poor";

    let intelligenceStatus;
    if (sentimentTrend > 0.3 && confidenceTrend > 0.3 && blameTrend < -0.3) {
      intelligenceStatus = "High";
    } else if (sentimentTrend > 0.1 && confidenceTrend > 0.1) {
      intelligenceStatus = "Medium";
    } else {
      intelligenceStatus = "Low";
    }

    return {
      form,
      sentimentTrend,
      confidenceTrend,
      blameTrend,
      intelligenceStatus,
    };
  };

  const intelligence = calculateIntelligence();

  if (!intelligence) {
    return (
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-card)", borderRadius: 14, padding: 24, marginBottom: 24 }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 600, marginBottom: 3, color: "var(--text-primary)" }}>
          Team Intelligence
        </div>
        <div style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-muted)" }}>
          Not enough match data to calculate team intelligence.
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-card)", borderRadius: 14, padding: 24, marginBottom: 24 }}>
      <div style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 600, marginBottom: 3, color: "var(--text-primary)" }}>
        Team Intelligence
      </div>
      <div style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-muted)", marginBottom: 16 }}>
        Current form: {intelligence.form}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <span style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-primary)", marginRight: 8 }}>
            Sentiment: {intelligence.sentimentTrend > 0 ? "+" : ""}{(intelligence.sentimentTrend * 100).toFixed(0)}%
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center" }}>
          <span style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-primary)", marginRight: 8 }}>
            Confidence: {intelligence.confidenceTrend > 0 ? "+" : ""}{(intelligence.confidenceTrend * 100).toFixed(0)}%
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center" }}>
          <span style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-primary)", marginRight: 8 }}>
            Blame: {intelligence.blameTrend > 0 ? "+" : ""}{(intelligence.blameTrend * 100).toFixed(0)}%
          </span>
        </div>
      </div>
      <div style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-primary)", marginTop: 16 }}>
        Intelligence Status: {intelligence.intelligenceStatus}
      </div>
    </div>
  );
};

export default TeamIntelligence;