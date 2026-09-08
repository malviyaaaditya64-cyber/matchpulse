import React from "react";
import SidebarNavigation from "./SidebarNavigation";

const Sidebar = ({
  team,
  matchCount,
  activeNavItem,
  onNavItemClick,
  onLogout,
  onChangeTeamClick,
}) => {
  return (
    <aside className="sidebar">
      {/* Branding Section */}
      <div className="sidebar-branding">
        <div className="branding-top">
          <div className="logo-icon">M</div>
          <div className="brand-name">MatchPulse</div>
        </div>
        <div className="brand-subtitle">PRESS CONFERENCE INTELLIGENCE</div>
        <button onClick={onLogout} className="sidebar-logout">
          Logout
        </button>
      </div>

      {/* Navigation */}
      <SidebarNavigation
        activeNavItem={activeNavItem}
        onNavItemClick={onNavItemClick}
      />

      {/* Selected Team Card at the bottom */}
      {team && (
        <div className="selected-team-card">
          <div className="team-info">
            <div className="team-icon-placeholder">
              {team.substring(0, 1).toUpperCase()}
            </div>
            <div className="team-details">
              <div className="team-name">{team}</div>
              <div className="match-count">{matchCount} tracked matches</div>
            </div>
          </div>
          <button className="change-team-btn" onClick={onChangeTeamClick}>
            Change Team
          </button>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
