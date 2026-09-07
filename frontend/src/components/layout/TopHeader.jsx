import React from "react";
import SportSelector from "../SportSelector";

const TopHeader = ({ sports, selectedSport, onSportSelect, teams, selectedTeam, onTeamSelect }) => {
  return (
    <header className="top-header">
      <div className="header-left">
        <div className="dashboard-context">
          Professional Sports Intelligence
        </div>
      </div>

      <div className="header-center">
        {sports.length > 0 && (
          <SportSelector
            sports={sports}
            selected={selectedSport}
            onSelect={onSportSelect}
          />
        )}
      </div>

      <div className="header-right">
        {teams.length > 0 && (
          <select
            className="team-selector"
            value={selectedTeam || ""}
            onChange={(e) => onTeamSelect(e.target.value)}
          >
            {teams.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        )}
      </div>
    </header>
  );
};

export default TopHeader;


