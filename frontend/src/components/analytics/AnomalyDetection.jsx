import React from "react";

const AnomalyDetection = ({ season }) => {
  const detectAnomalies = () => {
    if (!season || !Array.isArray(season) || season.length < 3) return null;

    const anomalies = [];

    // Calculate season averages
    const sentimentValues = season.map(match => match.sentiment).filter(val => typeof val === 'number' && !isNaN(val));
    const confidenceValues = season.map(match => match.confidence).filter(val => typeof val === 'number' && !isNaN(val));
    const blameValues = season.map(match => match.blame).filter(val => typeof val === 'number' && !isNaN(val));

    const sentimentMovingAvg = sentimentValues.length > 0 ? sentimentValues.reduce((sum, val) => sum + val, 0) / sentimentValues.length : 0;
    const confidenceMovingAvg = confidenceValues.length > 0 ? confidenceValues.reduce((sum, val) => sum + val, 0) / confidenceValues.length : 0;
    const blameMovingAvg = blameValues.length > 0 ? blameValues.reduce((sum, val) => sum + val, 0) / blameValues.length : 0;

    // Detect anomalies
    season.forEach((match, index) => {
      const sentiment = typeof match.sentiment === 'number' && !isNaN(match.sentiment) ? match.sentiment : null;
      if (sentiment !== null && Math.abs(sentiment - sentimentMovingAvg) > 0.5) {
        anomalies.push({
          type: "Sentiment",
          value: sentiment,
          date: match.date,
          explanation: `Sentiment ${sentiment > sentimentMovingAvg ? "high" : "low"} compared to season average`,          
        });
      }
      const confidence = typeof match.confidence === 'number' && !isNaN(match.confidence) ? match.confidence : null;
      if (confidence !== null && Math.abs(confidence - confidenceMovingAvg) > 0.5) {
        anomalies.push({
          type: "Confidence",
          value: confidence,
          date: match.date,
          explanation: `Confidence ${confidence > confidenceMovingAvg ? "high" : "low"} compared to season average`,          
        });
      }
      const blame = typeof match.blame === 'number' && !isNaN(match.blame) ? match.blame : null;
      if (blame !== null && Math.abs(blame - blameMovingAvg) > 0.5) {
        anomalies.push({
          type: "Blame",
          value: blame,
          date: match.date,
          explanation: `Blame ${blame > blameMovingAvg ? "high" : "low"} compared to season average`,          
        });
      }
    });

    // Detect sudden changes
    for (let i = 1; i < season.length; i++) {
      const prevMatch = season[i - 1];
      const currentMatch = season[i];

      const prevSentiment = typeof prevMatch.sentiment === 'number' && !isNaN(prevMatch.sentiment) ? prevMatch.sentiment : null;
      const currentSentiment = typeof currentMatch.sentiment === 'number' && !isNaN(currentMatch.sentiment) ? currentMatch.sentiment : null;

      if (currentSentiment !== null && prevSentiment !== null && Math.abs(currentSentiment - prevSentiment) > 0.7) {
        anomalies.push({
          type: "Sudden Sentiment Change",
          value: currentSentiment,
          date: currentMatch.date,
          explanation: `Sudden sentiment change from ${prevSentiment.toFixed(2)} to ${currentSentiment.toFixed(2)}`,          
        });
      }
      const prevConfidence = typeof prevMatch.confidence === 'number' && !isNaN(prevMatch.confidence) ? prevMatch.confidence : null;
      const currentConfidence = typeof currentMatch.confidence === 'number' && !isNaN(currentMatch.confidence) ? currentMatch.confidence : null;

      if (currentConfidence !== null && prevConfidence !== null && Math.abs(currentConfidence - prevConfidence) > 0.7) {
        anomalies.push({
          type: "Sudden Confidence Change",
          value: currentConfidence,
          date: currentMatch.date,
          explanation: `Sudden confidence change from ${prevConfidence.toFixed(2)} to ${currentConfidence.toFixed(2)}`,          
        });
      }
      const prevBlame = typeof prevMatch.blame === 'number' && !isNaN(prevMatch.blame) ? prevMatch.blame : null;
      const currentBlame = typeof currentMatch.blame === 'number' && !isNaN(currentMatch.blame) ? currentMatch.blame : null;

      if (currentBlame !== null && prevBlame !== null && Math.abs(currentBlame - prevBlame) > 0.7) {
        anomalies.push({
          type: "Sudden Blame Change",
          value: currentBlame,
          date: currentMatch.date,
          explanation: `Sudden blame change from ${prevBlame.toFixed(2)} to ${currentBlame.toFixed(2)}`,          
        });
      }
    }

    return anomalies;
  };

  const anomalies = detectAnomalies();

  if (!anomalies || anomalies.length === 0) {
    return (
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-card)", borderRadius: 14, padding: 24, marginBottom: 24 }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 600, marginBottom: 3, color: "var(--text-primary)" }}>
          Anomaly Detection
        </div>
        <div style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-muted)" }}>
          No anomalies detected in the match data.
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-card)", borderRadius: 14, padding: 24, marginBottom: 24 }}>
      <div style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 600, marginBottom: 3, color: "var(--text-primary)" }}>
        Anomaly Detection
      </div>
      <div style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-muted)", marginBottom: 16 }}>
        Detected anomalies in match data:
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {anomalies.map((anomaly, index) => (
          <div key={index} style={{ background: "var(--surface-sunken)", borderRadius: 10, padding: 16 }}>
            <div style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-primary)", marginBottom: 8 }}>
              {anomaly.type}
            </div>
            <div style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-secondary)", marginBottom: 8 }}>
              Date: {anomaly.date}
            </div>
            <div style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-secondary)" }}>
              {anomaly.explanation}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnomalyDetection;