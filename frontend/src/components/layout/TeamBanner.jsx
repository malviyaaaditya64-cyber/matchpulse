import React from "react";

const TeamBanner = ({ team, sport, wins, draws, losses, matchCount }) => {
  const getTeamVisual = () => {
    if (sport === "football") return "⚽";
    if (sport === "cricket") return "🏏";
    return team?.substring(0, 1).toUpperCase() || "T";
  };

  return (
    <div className="team-banner">
      <div className="team-banner-watermark">{team?.toUpperCase()}</div>
      <div className="team-banner-content">
        <div className="team-banner-flag">{getTeamVisual()}</div>
        <div className="team-banner-info">
          <h2 className="team-banner-title">{team}</h2>
          <div className="team-banner-meta">
            <span className="team-banner-record">
              <span className="w">{wins}W</span> · <span className="d">{draws}D</span> · <span className="l">{losses}L</span>
            </span>
            <span>Across {matchCount} tracked matches</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamBanner;
