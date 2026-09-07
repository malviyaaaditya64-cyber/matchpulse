import React from "react";

const PerformanceForecast = ({ season }) => {
  const calculateForecast = () => {
    if (!season || !Array.isArray(season) || season.length < 3) return null;

    const recentMatches = season.slice(-3);
    const olderMatches = season.slice(0, -3);

    const recentSentiment = recentMatches.reduce((sum, match) => sum + match.sentiment, 0) / recentMatches.length;
    const olderSentiment = olderMatches.reduce((sum, match) => sum + match.sentiment, 0) / olderMatches.length;

    const recentConfidence = recentMatches.reduce((sum, match) => sum + match.confidence, 0) / recentMatches.length;
    const olderConfidence = olderMatches.reduce((sum, match) => sum + match.confidence, 0) / olderMatches.length;

    const recentBlame = recentMatches.reduce((sum, match) => sum + match.blame, 0) / recentMatches.length;
    const olderBlame = olderMatches.reduce((sum, match) => sum + match.blame, 0) / olderMatches.length;

    const sentimentChange = recentSentiment - olderSentiment;
    const confidenceChange = recentConfidence - olderConfidence;
    const blameChange = recentBlame - olderBlame;

    let outlook;
    let explanation;
    let confidenceLevel;

    if (sentimentChange > 0.2 && confidenceChange > 0.2 && blameChange < -0.2) {
      outlook = "Improving";
      explanation = "Positive trends in sentiment, confidence, and blame.";
      confidenceLevel = "High";
    } else if (Math.abs(sentimentChange) < 0.1 && Math.abs(confidenceChange) < 0.1 && Math.abs(blameChange) < 0.1) {
      outlook = "Stable";
      explanation = "No significant changes in sentiment, confidence, or blame.";
      confidenceLevel = "Medium";
    } else if (sentimentChange < -0.2 || confidenceChange < -0.2 || blameChange > 0.2) {
      outlook = "Declining";
      explanation = "Negative trends in sentiment, confidence, or blame.";
      confidenceLevel = "High";
    } else {
      outlook = "Stable";
      explanation = "Mixed trends in sentiment, confidence, and blame.";
      confidenceLevel = "Medium";
    }

    return {
      outlook,
      explanation,
      sentimentChange,
      confidenceChange,
      blameChange,
      confidenceLevel,
    };
  };

  const forecast = calculateForecast();

  if (!forecast) {
    return (
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-card)", borderRadius: 14, padding: 24, marginBottom: 24 }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 600, marginBottom: 3, color: "var(--text-primary)" }}>
          Performance Trend
        </div>
        <div style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-muted)" }}>
          Insufficient historical data to generate a forecast.
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-card)", borderRadius: 14, padding: 24, marginBottom: 24 }}>
      <div style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 600, marginBottom: 3, color: "var(--text-primary)" }}>
        Performance Forecast
      </div>
      <div style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-muted)", marginBottom: 16 }}>
        Overall outlook: {forecast.outlook}
      </div>
      <div style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-primary)", marginBottom: 16 }}>
        {forecast.explanation}
      </div>
      <div style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-muted)", marginBottom: 8 }}>
        Recent trend compared with earlier matches:
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <span style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-primary)", marginRight: 8 }}>
            Sentiment: {forecast.sentimentChange > 0 ? "+" : ""}{(forecast.sentimentChange * 100).toFixed(0)}%
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center" }}>
          <span style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-primary)", marginRight: 8 }}>
            Confidence: {forecast.confidenceChange > 0 ? "+" : ""}{(forecast.confidenceChange * 100).toFixed(0)}%
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center" }}>
          <span style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-primary)", marginRight: 8 }}>
            Blame: {forecast.blameChange > 0 ? "+" : ""}{(forecast.blameChange * 100).toFixed(0)}%
          </span>
        </div>
      </div>
      <div style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-primary)", marginTop: 16 }}>
        Confidence level: {forecast.confidenceLevel}
      </div>
    </div>
  );
};

export default PerformanceForecast;