import React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

const PerformanceForecast = ({ season }) => {
  const calculateForecast = () => {
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
      explanation = "Negative trend in sentiment, confidence, or blame.";
      confidenceLevel = "High";
    } else {
      outlook = "Stable";
      explanation = "Mixed trends in sentiment, confidence, and blame.";
      confidenceLevel = "Medium";
    }

    return { outlook, explanation, sentimentChange, confidenceChange, blameChange, confidenceLevel };
  };

  const forecast = calculateForecast();

  const MetricCell = ({ label, change }) => {
    const up = change > 0;
    const Icon = change === 0 ? Minus : up ? TrendingUp : TrendingDown;
    return (
      <div>
        <div className="perf-trend-metric-label">{label}</div>
        <div className={`perf-trend-metric-value ${up ? "up" : "down"}`}>
          {up ? "+" : ""}
          {(change * 100).toFixed(0)}%
          <Icon size={14} />
        </div>
      </div>
    );
  };

  if (!forecast) {
    return (
      <div className="perf-trend-card">
        <div className="perf-trend-header">
          <span className="perf-trend-title">Performance Trend</span>
        </div>
        <div className="intel-empty">Not enough historical matches yet to compare recent trends.</div>
      </div>
    );
  }

  return (
    <div className="perf-trend-card">
      <div className="perf-trend-header">
        <span className="perf-trend-title">Performance Trend</span>
        <button type="button" className="perf-trend-view-btn">View Details</button>
      </div>

      <div className="perf-trend-outlook">
        Overall outlook:{" "}
        <b className={`outlook-${forecast.outlook.toLowerCase()}`}>{forecast.outlook}</b>
      </div>
      <div className="perf-trend-explain">{forecast.explanation}</div>

      <div className="perf-trend-metrics">
        <MetricCell label="Sentiment" change={forecast.sentimentChange} />
        <MetricCell label="Confidence" change={forecast.confidenceChange} />
        <MetricCell label="Blame" change={forecast.blameChange} />
      </div>

      <div className="perf-trend-footer">
        <span className="perf-trend-compared">Compared to previous matches</span>
        <span className={`confidence-pill ${forecast.confidenceLevel.toLowerCase()}`}>
          {forecast.confidenceLevel}
        </span>
      </div>
    </div>
  );
};

export default PerformanceForecast;
