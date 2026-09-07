import React from "react";

const TeamBanner = ({ team, sport, wins, draws, losses, matchCount }) => {
  // Simple visual representation based on sport and team
  const getTeamVisual = () => {
    if (sport === "football") return "⚽";
    if (sport === "cricket") return "🏏";
    return team?.substring(0, 1).toUpperCase() || "T";
  };

  return (
    <div className="team-banner">
      <div className="team-banner-content">
        <div className="team-banner-visual">
          {getTeamVisual()}
        </div>
        <div className="team-banner-info">
          <h2 className="team-banner-title">{team}</h2>
          <div className="team-banner-meta">
            <span className="team-banner-record">
              {wins}W · {draws}D · {losses}L
            </span>
            <span className="team-banner-tracked">
              • {matchCount} tracked matches
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamBanner;
