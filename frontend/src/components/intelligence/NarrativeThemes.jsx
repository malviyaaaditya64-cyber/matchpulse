import React from "react";

const NarrativeThemes = ({ season }) => {
  const analyzeThemes = () => {
    if (!season || !Array.isArray(season) || season.length === 0) return null;

    const positiveThemes = [];
    const negativeThemes = [];

    const sentimentTrend = season.reduce((sum, match) => sum + match.sentiment, 0) / season.length;
    if (sentimentTrend > 0.3) positiveThemes.push("Positive sentiment trend");
    else if (sentimentTrend < -0.3) negativeThemes.push("Negative sentiment trend");

    const confidenceTrend = season.reduce((sum, match) => sum + match.confidence, 0) / season.length;
    if (confidenceTrend > 0.3) positiveThemes.push("High confidence");
    else if (confidenceTrend < -0.3) negativeThemes.push("Low confidence");

    const blameTrend = season.reduce((sum, match) => sum + match.blame, 0) / season.length;
    if (blameTrend < -0.3) positiveThemes.push("Low blame");
    else if (blameTrend > 0.3) negativeThemes.push("High blame");

    const wins = season.filter((match) => match.result === "W").length;
    const losses = season.filter((match) => match.result === "L").length;
    if (wins > losses) positiveThemes.push("Winning form");
    else if (losses > wins) negativeThemes.push("Losing form");

    return { positiveThemes, negativeThemes };
  };

  const themes = analyzeThemes();

  return (
    <div className="intel-card">
      <div className="intel-card-title">Narrative Themes</div>
      {!themes ? (
        <div className="intel-empty">Not enough match data to identify narrative themes.</div>
      ) : (
        <>
          <div className="theme-group">
            <div className="theme-group-label positive">Positive Themes</div>
            {themes.positiveThemes.length > 0 ? (
              themes.positiveThemes.map((t, i) => (
                <div key={i} className="theme-item">
                  <span className="theme-dot positive" /> {t}
                </div>
              ))
            ) : (
              <div className="intel-empty">No positive themes identified</div>
            )}
          </div>
          <div className="theme-group">
            <div className="theme-group-label negative">Negative Themes</div>
            {themes.negativeThemes.length > 0 ? (
              themes.negativeThemes.map((t, i) => (
                <div key={i} className="theme-item">
                  <span className="theme-dot negative" /> {t}
                </div>
              ))
            ) : (
              <div className="intel-empty">No negative themes identified</div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default NarrativeThemes;
