import React from "react";
import { ArrowUp, ArrowDown, RefreshCw } from "lucide-react";

const AnomalyDetection = ({ season }) => {
  const detectAnomalies = () => {
    if (!season || !Array.isArray(season) || season.length < 3) return null;

    const anomalies = [];

    const sentimentValues = season.map(match => match.sentiment).filter(val => typeof val === 'number' && !isNaN(val));
    const confidenceValues = season.map(match => match.confidence).filter(val => typeof val === 'number' && !isNaN(val));
    const blameValues = season.map(match => match.blame).filter(val => typeof val === 'number' && !isNaN(val));

    const sentimentMovingAvg = sentimentValues.length > 0 ? sentimentValues.reduce((sum, val) => sum + val, 0) / sentimentValues.length : 0;
    const confidenceMovingAvg = confidenceValues.length > 0 ? confidenceValues.reduce((sum, val) => sum + val, 0) / confidenceValues.length : 0;
    const blameMovingAvg = blameValues.length > 0 ? blameValues.reduce((sum, val) => sum + val, 0) / blameValues.length : 0;

    season.forEach((match) => {
      const sentiment = typeof match.sentiment === 'number' && !isNaN(match.sentiment) ? match.sentiment : null;
      if (sentiment !== null && Math.abs(sentiment - sentimentMovingAvg) > 0.5) {
        anomalies.push({
          type: "Sentiment",
          up: sentiment > sentimentMovingAvg,
          date: match.date,
          explanation: `Sentiment ${sentiment > sentimentMovingAvg ? "high" : "low"} vs season avg`,
        });
      }
      const confidence = typeof match.confidence === 'number' && !isNaN(match.confidence) ? match.confidence : null;
      if (confidence !== null && Math.abs(confidence - confidenceMovingAvg) > 0.5) {
        anomalies.push({
          type: "Confidence",
          up: confidence > confidenceMovingAvg,
          date: match.date,
          explanation: `Confidence ${confidence > confidenceMovingAvg ? "high" : "low"} vs season avg`,
        });
      }
      const blame = typeof match.blame === 'number' && !isNaN(match.blame) ? match.blame : null;
      if (blame !== null && Math.abs(blame - blameMovingAvg) > 0.5) {
        anomalies.push({
          type: "Blame",
          up: blame > blameMovingAvg,
          date: match.date,
          explanation: `Blame ${blame > blameMovingAvg ? "high" : "low"} vs season avg`,
        });
      }
    });

    for (let i = 1; i < season.length; i++) {
      const prevMatch = season[i - 1];
      const currentMatch = season[i];

      const prevSentiment = typeof prevMatch.sentiment === 'number' && !isNaN(prevMatch.sentiment) ? prevMatch.sentiment : null;
      const currentSentiment = typeof currentMatch.sentiment === 'number' && !isNaN(currentMatch.sentiment) ? currentMatch.sentiment : null;
      if (currentSentiment !== null && prevSentiment !== null && Math.abs(currentSentiment - prevSentiment) > 0.7) {
        anomalies.push({
          type: "Sudden Sentiment Change",
          isSwing: true,
          date: currentMatch.date,
          explanation: `From ${prevSentiment.toFixed(2)} to ${currentSentiment.toFixed(2)}`,
        });
      }
      const prevConfidence = typeof prevMatch.confidence === 'number' && !isNaN(prevMatch.confidence) ? prevMatch.confidence : null;
      const currentConfidence = typeof currentMatch.confidence === 'number' && !isNaN(currentMatch.confidence) ? currentMatch.confidence : null;
      if (currentConfidence !== null && prevConfidence !== null && Math.abs(currentConfidence - prevConfidence) > 0.7) {
        anomalies.push({
          type: "Sudden Confidence Change",
          isSwing: true,
          date: currentMatch.date,
          explanation: `From ${prevConfidence.toFixed(2)} to ${currentConfidence.toFixed(2)}`,
        });
      }
      const prevBlame = typeof prevMatch.blame === 'number' && !isNaN(prevMatch.blame) ? prevMatch.blame : null;
      const currentBlame = typeof currentMatch.blame === 'number' && !isNaN(currentMatch.blame) ? currentMatch.blame : null;
      if (currentBlame !== null && prevBlame !== null && Math.abs(currentBlame - prevBlame) > 0.7) {
        anomalies.push({
          type: "Sudden Blame Change",
          isSwing: true,
          date: currentMatch.date,
          explanation: `From ${prevBlame.toFixed(2)} to ${currentBlame.toFixed(2)}`,
        });
      }
    }

    return anomalies;
  };

  const anomalies = detectAnomalies();

  return (
    <div className="intel-card">
      <div className="intel-card-title">Recent Anomalies</div>
      {(!anomalies || anomalies.length === 0) ? (
        <div className="intel-empty">No anomalies detected in the match data.</div>
      ) : (
        <div className="icon-list">
          {anomalies.slice(0, 4).map((a, index) => (
            <div key={index} className="icon-list-item">
              <div className={`icon-bullet ${a.isSwing ? "info" : a.up ? "up" : "down"}`}>
                {a.isSwing ? <RefreshCw size={13} /> : a.up ? <ArrowUp size={13} /> : <ArrowDown size={13} />}
              </div>
              <div className="icon-list-text">
                <div className={`icon-list-title ${a.isSwing ? "info" : a.up ? "up" : "down"}`}>{a.type}</div>
                <div className="icon-list-meta">Date: {a.date}<br />{a.explanation}</div>
              </div>
            </div>
          ))}
        </div>
      )}
      {anomalies && anomalies.length > 4 && (
        <span className="icon-list-footer-link">View all anomalies →</span>
      )}
    </div>
  );
};

export default AnomalyDetection;
