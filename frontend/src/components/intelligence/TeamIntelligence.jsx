import React from "react";
import { ArrowUp, ArrowDown } from "lucide-react";

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

    return { form, sentimentTrend, confidenceTrend, blameTrend, intelligenceStatus };
  };

  const intelligence = calculateIntelligence();

  const Row = ({ label, value, goodWhenUp }) => {
    const up = value > 0;
    const good = goodWhenUp ? up : !up;
    return (
      <div className="stat-row">
        <span className="stat-row-label">{label}</span>
        <span className={`stat-row-value ${good ? "up" : "down"}`}>
          {up ? "+" : ""}{(value * 100).toFixed(0)}%
          {up ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
        </span>
      </div>
    );
  };

  return (
    <div className="intel-card">
      <div className="intel-card-title">Team Intelligence</div>
      {!intelligence ? (
        <div className="intel-empty">Not enough match data to calculate team intelligence.</div>
      ) : (
        <>
          <div className="intel-card-subtitle">
            Form: <b className={intelligence.form === "Good" ? "outlook-improving" : intelligence.form === "Poor" ? "outlook-declining" : "outlook-stable"}>{intelligence.form}</b>
          </div>
          <div className="stat-rows">
            <Row label="Sentiment" value={intelligence.sentimentTrend} goodWhenUp={true} />
            <Row label="Confidence" value={intelligence.confidenceTrend} goodWhenUp={true} />
            <Row label="Blame" value={intelligence.blameTrend} goodWhenUp={false} />
          </div>
          <div className="intel-footer-row">
            <span>Intelligence Status</span>
            <span className={`status-pill ${intelligence.intelligenceStatus.toLowerCase()}`}>{intelligence.intelligenceStatus}</span>
          </div>
        </>
      )}
    </div>
  );
};

export default TeamIntelligence;
