import React from "react";

const NarrativeShift = ({ season }) => {
  const calculateShift = () => {
    if (!season || season.length < 2) return null;

    const recentMatches = season.slice(-3);
    const olderMatches = season.slice(0, -3);

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

    return {
      sentimentChange,
      confidenceChange,
      blameChange,
      shiftStatus,
    };
  };

  const shift = calculateShift();

  if (!shift) {
    return (
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-card)", borderRadius: 14, padding: 24, marginBottom: 24 }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 600, marginBottom: 3, color: "var(--text-primary)" }}>
          Narrative Shift Detector
        </div>
        <div style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-muted)" }}>
          Not enough match data to determine a narrative shift.
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-card)", borderRadius: 14, padding: 24, marginBottom: 24 }}>
      <div style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 600, marginBottom: 3, color: "var(--text-primary)" }}>
        Narrative Shift Detector
      </div>
      <div style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-muted)", marginBottom: 16 }}>
        Recent narrative is {shift.shiftStatus.toLowerCase()}.
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <span style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-primary)", marginRight: 8 }}>
            Sentiment: {shift.sentimentChange > 0 ? "+" : ""}{(shift.sentimentChange * 100).toFixed(0)}%
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center" }}>
          <span style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-primary)", marginRight: 8 }}>
            Confidence: {shift.confidenceChange > 0 ? "+" : ""}{(shift.confidenceChange * 100).toFixed(0)}%
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center" }}>
          <span style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-primary)", marginRight: 8 }}>
            Blame: {shift.blameChange > 0 ? "+" : ""}{(shift.blameChange * 100).toFixed(0)}%
          </span>
        </div>
      </div>
    </div>
  );
};

export default NarrativeShift;