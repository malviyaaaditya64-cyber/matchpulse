import React from "react";
import { ShieldCheck, ShieldAlert, AlertTriangle } from "lucide-react";

const EarlyWarningSignals = ({ season }) => {
  const detectWarnings = () => {
    if (!season || !Array.isArray(season) || season.length < 3) return null;

    const recentMatches = season.slice(-3);
    const olderMatches = season.slice(0, -3);
    if (olderMatches.length === 0) return null;

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

    return { warningStatus, warnings };
  };

  const warnings = detectWarnings();

  return (
    <div className="intel-card">
      <div className="intel-card-title">Early Warning Signals</div>
      {!warnings ? (
        <div className="intel-empty">Insufficient data to detect warning signals.</div>
      ) : (
        <div className="warning-shield-wrap">
          <div className={`warning-shield ${warnings.warningStatus.toLowerCase()}`}>
            {warnings.warningStatus === "Normal" && <ShieldCheck size={32} />}
            {warnings.warningStatus === "Watch" && <ShieldAlert size={32} />}
            {warnings.warningStatus === "Warning" && <AlertTriangle size={32} />}
          </div>
          <div className="warning-status-label">
            Status: <b>{warnings.warningStatus}</b>
          </div>
          {warnings.warnings.length === 0 ? (
            <div className="warning-status-sub">All signals within normal range</div>
          ) : (
            <div className="warning-list">
              {warnings.warnings.map((w, i) => (
                <div key={i} className="warning-list-item">
                  <AlertTriangle size={11} /> {w}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EarlyWarningSignals;
