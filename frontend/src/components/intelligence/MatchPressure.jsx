import React from "react";

const MatchPressure = ({ season }) => {
  const calculatePressure = () => {
    if (!season || !Array.isArray(season) || season.length === 0) return null;

    const recentMatches = season.slice(-3);
    const sentiment = recentMatches.reduce((sum, match) => sum + match.sentiment, 0) / recentMatches.length;
    const confidence = recentMatches.reduce((sum, match) => sum + match.confidence, 0) / recentMatches.length;
    const blame = recentMatches.reduce((sum, match) => sum + match.blame, 0) / recentMatches.length;

    let pressureLevel;
    let pressureFactors = [];

    if (sentiment < -0.5 && confidence < -0.5 && blame > 0.5) {
      pressureLevel = "High";
      pressureFactors = ["Low sentiment", "Low confidence", "High blame"];
    } else if (sentiment < -0.3 || confidence < -0.3 || blame > 0.3) {
      pressureLevel = "Medium";
      pressureFactors = [
        sentiment < -0.3 ? "Low sentiment" : null,
        confidence < -0.3 ? "Low confidence" : null,
        blame > 0.3 ? "High blame" : null,
      ].filter(Boolean);
    } else {
      pressureLevel = "Low";
      pressureFactors = ["Stable sentiment", "Stable confidence", "Stable blame"];
    }

    return {
      pressureLevel,
      pressureFactors,
    };
  };

  const pressure = calculatePressure();

  if (!pressure) {
    return (
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-card)", borderRadius: 14, padding: 24, marginBottom: 24 }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 600, marginBottom: 3, color: "var(--text-primary)" }}>
          Match Pressure
        </div>
        <div style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-muted)" }}>
          Not enough match data to calculate pressure.
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-card)", borderRadius: 14, padding: 24, marginBottom: 24 }}>
      <div style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 600, marginBottom: 3, color: "var(--text-primary)" }}>
        Match Pressure
      </div>
      <div style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-muted)", marginBottom: 16 }}>
        Current pressure level: {pressure.pressureLevel}
      </div>
      <div style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-primary)", marginBottom: 16 }}>
        Factors contributing to pressure:
      </div>
      <ul style={{ paddingLeft: 20, marginBottom: 16 }}>
        {pressure.pressureFactors.map((factor, index) => (
          <li key={index} style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-primary)" }}>
            {factor}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MatchPressure;