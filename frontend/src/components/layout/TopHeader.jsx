import React, { useState } from "react";
import { Bell, Sun } from "lucide-react";
import SportSelector from "../SportSelector";
import { api } from "../../api";

const TopHeader = ({ sports, selectedSport, onSportSelect, teams, selectedTeam, onTeamSelect }) => {
  const username = api.getStoredUsername() || "Analyst";
  const initials = username.substring(0, 2).toUpperCase();
  const currentYear = new Date().getFullYear();
  const [tooltip, setTooltip] = useState(null);

  const showComingSoon = (label) => {
    setTooltip(label);
    setTimeout(() => setTooltip((t) => (t === label ? null : t)), 1800);
  };

  return (
    <header className="top-header">
      <div className="header-left">
        <div className="mp-header-logo">
          <div className="mp-header-logo-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 12h4l2 8 4-16 2 8h8" />
            </svg>
          </div>
          <div className="mp-header-logo-text">
            <span className="mp-header-logo-title">MATCHPULSE</span>
            <span className="mp-header-logo-sub">Press Conference Intelligence</span>
          </div>
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

      <div className="header-right mp-header-right">
        {teams.length > 0 && (
          <select
            id="team-select"
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

        <div className="season-selector">
          <span>SEASON</span>
          <select defaultValue={currentYear}>
            <option value={currentYear}>{currentYear}</option>
          </select>
        </div>

        <div style={{ position: "relative" }}>
          <button
            className="icon-btn"
            title="Toggle theme"
            type="button"
            onClick={() => showComingSoon("theme")}
          >
            <Sun size={16} />
          </button>
          {tooltip === "theme" && <span className="header-tooltip">Dark mode — coming soon</span>}
        </div>

        <div style={{ position: "relative" }}>
          <button
            className="icon-btn"
            title="Notifications"
            type="button"
            onClick={() => showComingSoon("bell")}
          >
            <Bell size={16} />
          </button>
          {tooltip === "bell" && <span className="header-tooltip">Notifications — coming soon</span>}
        </div>

        <div className="mp-user">
          <div className="mp-user-avatar">{initials}</div>
          <div className="mp-user-meta">
            <span className="mp-user-name">{username}</span>
            <span className="mp-user-role">Analyst</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopHeader;
