import React from "react";

const NarrativeAlerts = ({ season }) => {
  const calculateAlerts = () => {
    if (!season || season.length < 2) return null;

    const recentMatches = season.slice(-3);
    const olderMatches = season.slice(0, -3);
    if (olderMatches.length === 0) return null;

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

    return { alertStatus, alertMessage };
  };

  const alerts = calculateAlerts();

  const pillClass = (status) => {
    if (status === "HIGH RISK") return "high";
    if (status === "WATCH") return "watch";
    if (status === "POSITIVE") return "positive";
    return "none";
  };

  const RESULT_COLOR = { W: "var(--teal)", D: "var(--amber)", L: "var(--coral)" };

  return (
    <div className="intel-card">
      <div className="intel-card-title">Narrative Alerts</div>

      {alerts ? (
        <>
          <div className="intel-card-subtitle">
            Status: <span className={`status-pill ${pillClass(alerts.alertStatus)}`}>{alerts.alertStatus}</span>
          </div>
          <div style={{ fontSize: 12.5, color: "var(--text-primary)" }}>{alerts.alertMessage}</div>
        </>
      ) : (
        <div className="intel-empty">Not enough historical matches yet to detect a trend.</div>
      )}

      {season && season.length > 0 && (
        <>
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 14 }}>
            Press-conference tone across the season
          </div>
          <div className="narrative-alerts-strip">
            {season.map((m) => (
              <div
                key={m.match_id}
                title={`${m.opponent}: ${m.result}`}
                className="narrative-alerts-bar"
                style={{ background: RESULT_COLOR[m.result] || "var(--surface-sunken)" }}
              />
            ))}
          </div>
          <div className="narrative-alerts-legend">
            <span><span className="legend-dot" style={{ background: "var(--teal)" }} /> Win</span>
            <span><span className="legend-dot" style={{ background: "var(--amber)" }} /> Draw</span>
            <span><span className="legend-dot" style={{ background: "var(--coral)" }} /> Loss</span>
          </div>
        </>
      )}
    </div>
  );
};

export default NarrativeAlerts;
