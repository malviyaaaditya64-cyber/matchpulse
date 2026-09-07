import React from "react";

const EarlyWarningSignals = ({ season }) => {
  const detectWarnings = () => {
    if (!season || !Array.isArray(season) || season.length < 3) return null;

    const recentMatches = season.slice(-3);
    const olderMatches = season.slice(0, -3);

    const recentSentiment = recentMatches.reduce((sum, match) => sum + match.sentiment, 0) / recentMatches.length;
    const olderSentiment = olderMatches.reduce((sum, match) => sum + match.sentiment, 0) / olderMatches.length;

    const recentConfidence = recentMatches.reduce((sum, match) => sum + match.confidence, 0) / recentMatches.length;
    const olderConfidence = olderMatches.reduce((sum, match) => sum + match.confidence, 0) / olderMatches.length;

    const recentBlame = recentMatches.reduce((sum, match) => sum + match.blame, 0) / recentMatches.length;
    const olderBlame = olderMatches.reduce((sum, match) => sum + match.blame, 0) / olderMatches.length;

    const recentWins = recentMatches.filter((match) => match.result === "W").length;
    const olderWins = olderMatches.filter((match) => match.result === "W").length;

    const recentLosses = recentMatches.filter((match) => match.result === "L").length;

    let warningStatus = "Normal";
    const warnings = [];

    if (recentSentiment < olderSentiment - 0.3) {
      warningStatus = "Warning";
      warnings.push("Sustained sentiment decline");
    }

    if (recentConfidence < olderConfidence - 0.3) {
      warningStatus = "Warning";
      warnings.push("Confidence decline");
    }

    if (recentBlame > olderBlame + 0.3) {
      warningStatus = "Warning";
      warnings.push("Blame increase");
    }

    if (recentLosses > 1 && recentWins < olderWins) {
      warningStatus = "Warning";
      warnings.push("Repeated losses");
    }

    if (Math.abs(recentSentiment - olderSentiment) > 0.5 || Math.abs(recentConfidence - olderConfidence) > 0.5 || Math.abs(recentBlame - olderBlame) > 0.5) {
      warningStatus = "Watch";
      warnings.push("Sudden metric deterioration");
    }

    return {
      warningStatus,
      warnings,
    };
  };

  const warnings = detectWarnings();

  if (!warnings) {
    return (
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-card)", borderRadius: 14, padding: 24, marginBottom: 24 }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 600, marginBottom: 3, color: "var(--text-primary)" }}>
          Early Warning Signals
        </div>
        <div style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-muted)" }}>
          Insufficient data to detect warning signals.
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-card)", borderRadius: 14, padding: 24, marginBottom: 24 }}>
      <div style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 600, marginBottom: 3, color: "var(--text-primary)" }}>
        Early Warning Signals
      </div>
      <div style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-muted)", marginBottom: 16 }}>
        Current status: {warnings.warningStatus}
      </div>
      {warnings.warnings.length > 0 && (
        <div style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-primary)", marginBottom: 16 }}>
          Detected warning signals:
        </div>
      )}
      <ul style={{ paddingLeft: 20 }}>
        {warnings.warnings.map((warning, index) => (
          <li key={index} style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-primary)" }}>
            {warning}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default EarlyWarningSignals;