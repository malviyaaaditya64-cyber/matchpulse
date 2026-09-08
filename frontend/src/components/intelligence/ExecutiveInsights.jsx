import React from "react";
import { ArrowUp, ArrowDown } from "lucide-react";

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

    return { sentimentTrend, confidenceTrend, blameTrend, narrativeStatus };
  };

  const insights = calculateInsights();

  const pillClass = (status) => {
    if (status === "HIGH RISK") return "high";
    if (status === "WATCH") return "watch";
    if (status === "STABLE / IMPROVING") return "improving";
    return "stable";
  };

  return (
    <div className="intel-card">
      <div className="intel-card-title">Executive Insights</div>
      {!insights ? (
        <div className="intel-empty">Not enough match data to generate insights.</div>
      ) : (
        <>
          <div className="exec-desc">
            {insights.narrativeStatus === "STABLE / IMPROVING" && "Positive momentum with improving confidence."}
            {insights.narrativeStatus === "STABLE" && "Stable narrative with no significant changes."}
            {insights.narrativeStatus === "HIGH RISK" && "High risk based on combined sentiment, confidence, and blame signals."}
            {insights.narrativeStatus === "WATCH" && "Narrative requires close monitoring."}
          </div>

          <div className="exec-stat-grid">
            <div className="exec-stat-box">
              <div className={`exec-stat-arrow ${insights.sentimentTrend > 0 ? "up" : "down"}`}>
                {insights.sentimentTrend > 0 ? <ArrowUp size={11} /> : <ArrowDown size={11} />} Sentiment
              </div>
              <div className="exec-stat-value">{Math.abs(insights.sentimentTrend).toFixed(2)}</div>
            </div>
            <div className="exec-stat-box">
              <div className={`exec-stat-arrow ${insights.confidenceTrend > 0 ? "up" : "down"}`}>
                {insights.confidenceTrend > 0 ? <ArrowUp size={11} /> : <ArrowDown size={11} />} Confidence
              </div>
              <div className="exec-stat-value">{Math.abs(insights.confidenceTrend).toFixed(2)}</div>
            </div>
            <div className="exec-stat-box">
              <div className={`exec-stat-arrow ${insights.blameTrend > 0 ? "up" : "down"}`}>
                {insights.blameTrend > 0 ? <ArrowUp size={11} /> : <ArrowDown size={11} />} Blame
              </div>
              <div className="exec-stat-value">{Math.abs(insights.blameTrend).toFixed(2)}</div>
            </div>
          </div>

          <div className="intel-footer-row">
            <span>Narrative Status</span>
            <span className={`status-pill ${pillClass(insights.narrativeStatus)}`}>{insights.narrativeStatus}</span>
          </div>
        </>
      )}
    </div>
  );
};

export default ExecutiveInsights;
