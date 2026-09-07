import React from "react";

const ExecutiveInsights = ({ season }) => {
  const calculateInsights = () => {
    if (!season || season.length === 0) return null;

    const sentimentTrend = season.reduce((sum, match) => sum + match.sentiment, 0) / season.length;
    const confidenceTrend = season.reduce((sum, match) => sum + match.confidence, 0) / season.length;
    const blameTrend = season.reduce((sum, match) => sum + match.blame, 0) / season.length;

    let narrativeStatus;
    if (sentimentTrend > 0.5 && confidenceTrend > 0.5 && blameTrend < -0.5) {
      narrativeStatus = "STABLE / IMPROVING";
    } else if (sentimentTrend > 0.3 && confidenceTrend > 0.3) {
      narrativeStatus = "STABLE";
    } else if (sentimentTrend < -0.3 || confidenceTrend < -0.3 || blameTrend > 0.3) {
      narrativeStatus = "HIGH RISK";
    } else {
      narrativeStatus = "WATCH";
    }

    return {
      sentimentTrend,
      confidenceTrend,
      blameTrend,
      narrativeStatus,
    };
  };

  const insights = calculateInsights();

  if (!insights) {
    return (
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-card)", borderRadius: 14, padding: 24, marginBottom: 24 }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 600, marginBottom: 3, color: "var(--text-primary)" }}>
          Executive Insights
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
        Executive Insights
      </div>
      <div style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-muted)", marginBottom: 16 }}>
        Overall Narrative
      </div>
      <div style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-primary)", marginBottom: 16 }}>
        {insights.narrativeStatus === "STABLE / IMPROVING" && "Positive momentum with improving confidence."}
        {insights.narrativeStatus === "STABLE" && "Stable narrative with no significant changes."}
        {insights.narrativeStatus === "HIGH RISK" && "High risk based on combined sentiment, confidence, and blame signals."}
        {insights.narrativeStatus === "WATCH" && "Narrative requires close monitoring."}
      </div>
      <div style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-muted)", marginBottom: 8 }}>
        Key Signals
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <span style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-primary)", marginRight: 8 }}>
            {insights.sentimentTrend > 0 ? "↑" : "↓"} Sentiment
          </span>
          <span style={{ fontFamily: "var(--font-body)", fontSize: 14, color: insights.sentimentTrend > 0 ? "var(--teal)" : "var(--coral)" }}>
            {Math.abs(insights.sentimentTrend).toFixed(2)}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center" }}>
          <span style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-primary)", marginRight: 8 }}>
            {insights.confidenceTrend > 0 ? "↑" : "↓"} Confidence
          </span>
          <span style={{ fontFamily: "var(--font-body)", fontSize: 14, color: insights.confidenceTrend > 0 ? "var(--teal)" : "var(--coral)" }}>
            {Math.abs(insights.confidenceTrend).toFixed(2)}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center" }}>
          <span style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-primary)", marginRight: 8 }}>
            {insights.blameTrend > 0 ? "↑" : "↓"} Blame
          </span>
          <span style={{ fontFamily: "var(--font-body)", fontSize: 14, color: insights.blameTrend > 0 ? "var(--coral)" : "var(--teal)" }}>
            {Math.abs(insights.blameTrend).toFixed(2)}
          </span>
        </div>
      </div>
      <div style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-muted)", marginTop: 16 }}>
        Narrative Status: {insights.narrativeStatus}
      </div>
    </div>
  );
};

export default ExecutiveInsights;