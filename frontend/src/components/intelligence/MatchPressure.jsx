import React from "react";

const LEVEL_ANGLE = { Low: 150, Medium: 90, High: 30 };
const LEVEL_COLOR = { Low: "var(--teal)", Medium: "var(--amber)", High: "var(--coral)" };

function needlePoint(level) {
  const angleDeg = LEVEL_ANGLE[level] ?? 90;
  const rad = (angleDeg * Math.PI) / 180;
  const cx = 80;
  const cy = 80;
  const r = 52;
  return { x: cx + r * Math.cos(rad), y: cy - r * Math.sin(rad) };
}

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

    return { pressureLevel, pressureFactors };
  };

  const pressure = calculatePressure();

  return (
    <div className="intel-card">
      <div className="intel-card-title">Match Pressure</div>
      {!pressure ? (
        <div className="intel-empty">Not enough match data to calculate pressure.</div>
      ) : (
        <div className="gauge-wrap">
          <div className={`gauge-level-label gauge-${pressure.pressureLevel.toLowerCase()}`}>
            Current pressure level: <b>{pressure.pressureLevel}</b>
          </div>
          <div className="gauge-svg-wrap">
            <svg width="160" height="90" viewBox="0 0 160 90">
              <path d="M 20 80 A 60 60 0 0 1 71.5 21.3" fill="none" stroke="var(--teal)" strokeWidth="10" strokeLinecap="round" />
              <path d="M 71.5 21.3 A 60 60 0 0 1 88.5 21.3" fill="none" stroke="var(--amber)" strokeWidth="10" strokeLinecap="round" />
              <path d="M 88.5 21.3 A 60 60 0 0 1 140 80" fill="none" stroke="var(--coral)" strokeWidth="10" strokeLinecap="round" />
              {(() => {
                const p = needlePoint(pressure.pressureLevel);
                return (
                  <>
                    <line x1="80" y1="80" x2={p.x} y2={p.y} stroke="var(--text-primary)" strokeWidth="3" strokeLinecap="round" />
                    <circle cx="80" cy="80" r="5" fill="var(--text-primary)" />
                  </>
                );
              })()}
            </svg>
            <div className="gauge-value-label" style={{ color: LEVEL_COLOR[pressure.pressureLevel] }}>
              {pressure.pressureLevel}
            </div>
          </div>
          <div className="gauge-factors">
            {pressure.pressureFactors.map((f, i) => (
              <span key={i} className="gauge-factor-chip">{f}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MatchPressure;
