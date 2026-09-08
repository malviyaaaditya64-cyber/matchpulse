import React from "react";
import { TrendingUp, TrendingDown, Zap, Flame, RefreshCw } from "lucide-react";

const MatchInsights = ({ season }) => {
  const calculateInsights = () => {
    if (!season || !Array.isArray(season) || season.length === 0) return null;

    const insights = [];

    const strongestPositiveMatch = season.reduce((max, match) => (match.sentiment > max.sentiment ? match : max), season[0]);
    if (strongestPositiveMatch) {
      insights.push({
        type: "Strongest Positive Sentiment",
        icon: "up",
        date: strongestPositiveMatch.date,
        opponent: strongestPositiveMatch.opponent,
        explanation: `Highest sentiment score of ${strongestPositiveMatch.sentiment.toFixed(2)}`,
      });
    }

    const weakestSentimentMatch = season.reduce((min, match) => (match.sentiment < min.sentiment ? match : min), season[0]);
    if (weakestSentimentMatch) {
      insights.push({
        type: "Weakest Sentiment",
        icon: "down",
        date: weakestSentimentMatch.date,
        opponent: weakestSentimentMatch.opponent,
        explanation: `Lowest sentiment score of ${weakestSentimentMatch.sentiment.toFixed(2)}`,
      });
    }

    const highestConfidenceMatch = season.reduce((max, match) => (match.confidence > max.confidence ? match : max), season[0]);
    if (highestConfidenceMatch) {
      insights.push({
        type: "Highest Confidence",
        icon: "zap",
        date: highestConfidenceMatch.date,
        opponent: highestConfidenceMatch.opponent,
        explanation: `Highest confidence score of ${highestConfidenceMatch.confidence.toFixed(2)}`,
      });
    }

    const highestBlameMatch = season.reduce((max, match) => (match.blame > max.blame ? match : max), season[0]);
    if (highestBlameMatch) {
      insights.push({
        type: "Highest Blame",
        icon: "flame",
        date: highestBlameMatch.date,
        opponent: highestBlameMatch.opponent,
        explanation: `Highest blame score of ${highestBlameMatch.blame.toFixed(2)}`,
      });
    }

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
          icon: "swing",
          date: changeMatch.date,
          opponent: changeMatch.opponent,
          explanation: `Biggest sentiment change of ${maxChange.toFixed(2)}`,
        });
      }
    }

    return insights;
  };

  const insights = calculateInsights();

  const ICONS = { up: TrendingUp, down: TrendingDown, zap: Zap, flame: Flame, swing: RefreshCw };
  const COLORS = { up: "up", down: "down", zap: "info", flame: "down", swing: "info" };

  return (
    <div className="intel-card">
      <div className="intel-card-title">Key Match Insights</div>
      {(!insights || insights.length === 0) ? (
        <div className="intel-empty">Not enough match data to generate insights.</div>
      ) : (
        <div className="icon-list">
          {insights.map((insight, index) => {
            const Icon = ICONS[insight.icon] || TrendingUp;
            const color = COLORS[insight.icon] || "info";
            return (
              <div key={index} className="icon-list-item">
                <div className={`icon-bullet ${color}`}>
                  <Icon size={13} />
                </div>
                <div className="icon-list-text">
                  <div className={`icon-list-title ${color}`}>{insight.type}</div>
                  <div className="icon-list-meta">
                    {insight.date} vs {insight.opponent || "Unknown Opponent"}<br />
                    {insight.explanation}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MatchInsights;
