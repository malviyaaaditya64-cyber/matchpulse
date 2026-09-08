import React from "react";
import { LineChart, Line, ResponsiveContainer } from "recharts";

const NarrativeShift = ({ season }) => {
  const calculateShift = () => {
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

    let shiftStatus;
    if (sentimentChange > 0.2 && confidenceChange > 0.2 && blameChange < -0.2) {
      shiftStatus = "IMPROVING";
    } else if (Math.abs(sentimentChange) < 0.1 && Math.abs(confidenceChange) < 0.1 && Math.abs(blameChange) < 0.1) {
      shiftStatus = "STABLE";
    } else if (sentimentChange < -0.2 || confidenceChange < -0.2 || blameChange > 0.2) {
      shiftStatus = "DECLINING";
    } else if (Math.abs(sentimentChange) > 0.3 || Math.abs(confidenceChange) > 0.3 || Math.abs(blameChange) > 0.3) {
      shiftStatus = "VOLATILE";
    } else {
      shiftStatus = "STABLE";
    }

    return { sentimentChange, confidenceChange, blameChange, shiftStatus };
  };

  const shift = calculateShift();
  const sparkData = season?.map((m) => ({ v: m.blame })) || [];

  return (
    <div className="intel-card">
      <div className="intel-card-title">Narrative Shift Detector</div>
      {!shift ? (
        <div className="intel-empty">Not enough historical matches yet to determine a narrative shift.</div>
      ) : (
        <>
          <div className="intel-card-subtitle">
            Recent narrative is{" "}
            <b className={`status-pill ${shift.shiftStatus.toLowerCase()}`}>{shift.shiftStatus}</b>
          </div>

          <div className="shift-metric-rows">
            <div className="shift-metric-row">
              <span>Sentiment</span>
              <b>{shift.sentimentChange > 0 ? "+" : ""}{(shift.sentimentChange * 100).toFixed(0)}%</b>
            </div>
            <div className="shift-metric-row">
              <span>Confidence</span>
              <b>{shift.confidenceChange > 0 ? "+" : ""}{(shift.confidenceChange * 100).toFixed(0)}%</b>
            </div>
            <div className="shift-metric-row">
              <span>Blame</span>
              <b>{shift.blameChange > 0 ? "+" : ""}{(shift.blameChange * 100).toFixed(0)}%</b>
            </div>
          </div>

          {sparkData.length > 1 && (
            <div style={{ height: 50, marginTop: 8 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sparkData}>
                  <Line type="monotone" dataKey="v" stroke="var(--coral)" strokeWidth={2} dot={false} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default NarrativeShift;
