import React from "react";

const NarrativeAlerts = ({ season }) => {
  const calculateAlerts = () => {
    if (!season || season.length < 2) return null;

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

    let alertStatus;
    let alertMessage;

    if (sentimentChange < -0.3 && confidenceChange < -0.3 && blameChange > 0.3) {
      alertStatus = "HIGH RISK";
      alertMessage = "Strong negative trends in sentiment, confidence, and blame.";
    } else if (sentimentChange < -0.2 || confidenceChange < -0.2 || blameChange > 0.2) {
      alertStatus = "WATCH";
      alertMessage = "Moderate negative trends detected.";
    } else if (sentimentChange > 0.2 && confidenceChange > 0.2 && blameChange < -0.2) {
      alertStatus = "POSITIVE";
      alertMessage = "Improving sentiment, confidence, and blame trends.";
    } else {
      alertStatus = "NONE";
      alertMessage = "No significant trends detected.";
    }

    return {
      alertStatus,
      alertMessage,
    };
  };

  const alerts = calculateAlerts();

  if (!alerts) {
    return (
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-card)", borderRadius: 14, padding: 24, marginBottom: 24 }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 600, marginBottom: 3, color: "var(--text-primary)" }}>
          Narrative Alerts
        </div>
        <div style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-muted)" }}>
          Not enough match data to generate alerts.
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-card)", borderRadius: 14, padding: 24, marginBottom: 24 }}>
      <div style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 600, marginBottom: 3, color: "var(--text-primary)" }}>
        Narrative Alerts
      </div>
      <div style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-muted)", marginBottom: 16 }}>
        Current status: {alerts.alertStatus}
      </div>
      <div style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-primary)" }}>
        {alerts.alertMessage}
      </div>
    </div>
  );
};

export default NarrativeAlerts;