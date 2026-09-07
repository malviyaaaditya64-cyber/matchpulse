import React from "react";

const MatchInsights = ({ season }) => {
  const calculateInsights = () => {
    if (!season || !Array.isArray(season) || season.length === 0) return null;

    const insights = [];

    // Find strongest positive sentiment match
    const strongestPositiveMatch = season.reduce((max, match) => (match.sentiment > max.sentiment ? match : max), season[0]);
    if (strongestPositiveMatch) {
      insights.push({
        type: "Strongest Positive Sentiment",
        value: strongestPositiveMatch.sentiment,
        date: strongestPositiveMatch.date,
        opponent: strongestPositiveMatch.opponent,
        explanation: `Highest sentiment score of ${strongestPositiveMatch.sentiment.toFixed(2)}`,          
      });
    }

    // Find weakest sentiment match
    const weakestSentimentMatch = season.reduce((min, match) => (match.sentiment < min.sentiment ? match : min), season[0]);
    if (weakestSentimentMatch) {
      insights.push({
        type: "Weakest Sentiment",
        value: weakestSentimentMatch.sentiment,
        date: weakestSentimentMatch.date,
        opponent: weakestSentimentMatch.opponent,
        explanation: `Lowest sentiment score of ${weakestSentimentMatch.sentiment.toFixed(2)}`,          
      });
    }

    // Find highest confidence match
    const highestConfidenceMatch = season.reduce((max, match) => (match.confidence > max.confidence ? match : max), season[0]);
    if (highestConfidenceMatch) {
      insights.push({
        type: "Highest Confidence",
        value: highestConfidenceMatch.confidence,
        date: highestConfidenceMatch.date,
        opponent: highestConfidenceMatch.opponent,
        explanation: `Highest confidence score of ${highestConfidenceMatch.confidence.toFixed(2)}`,          
      });
    }

    // Find highest blame match
    const highestBlameMatch = season.reduce((max, match) => (match.blame > max.blame ? match : max), season[0]);
    if (highestBlameMatch) {
      insights.push({
        type: "Highest Blame",
        value: highestBlameMatch.blame,
        date: highestBlameMatch.date,
        opponent: highestBlameMatch.opponent,
        explanation: `Highest blame score of ${highestBlameMatch.blame.toFixed(2)}`,          
      });
    }

    // Find biggest sentiment change
    if (season.length > 1) {
      let maxChange = 0;
      let changeMatch = null;
      for (let i = 1; i < season.length; i++) {
        const change = Math.abs(season[i].sentiment - season[i - 1].sentiment);
        if (change > maxChange) {
          maxChange = change;
          changeMatch = season[i];
        }
      }
      if (changeMatch) {
        insights.push({
          type: "Biggest Sentiment Change",
          value: maxChange,
          date: changeMatch.date,
          opponent: changeMatch.opponent,
          explanation: `Biggest sentiment change of ${maxChange.toFixed(2)}`,          
        });
      }
    }

    return insights;
  };

  const insights = calculateInsights();

  if (!insights || insights.length === 0) {
    return (
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-card)", borderRadius: 14, padding: 24, marginBottom: 24 }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 600, marginBottom: 3, color: "var(--text-primary)" }}>
          Match Insights
        </div>
        <div style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-muted)" }}>
          Not enough match data to generate insights.
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-card)", borderRadius: 14, padding: 24, marginBottom: 24 }}>
      <div style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 600, marginBottom: 3, color: "var(--text-primary)" }}>
        Match Insights
      </div>
      <div style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-muted)", marginBottom: 16 }}>
        Key match-level signals:
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {insights.map((insight, index) => (
          <div key={index} style={{ background: "var(--surface-sunken)", borderRadius: 10, padding: 16 }}>
            <div style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-primary)", marginBottom: 8 }}>
              {insight.type}
            </div>
            <div style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-secondary)", marginBottom: 8 }}>
              Date: {insight.date} vs {insight.opponent || "Unknown Opponent"}
            </div>
            <div style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-secondary)" }}>
              {insight.explanation}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MatchInsights;