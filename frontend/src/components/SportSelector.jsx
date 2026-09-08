import React from "react";

const SPORT_LABELS = {
  football: "⚽  Football",
  cricket: "🏏  Cricket",
};

export default function SportSelector({ sports, selected, onSelect }) {
  return (
    <div className="sport-toggle">
      {sports.map((s) => {
        const active = s === selected;
        return (
          <button
            key={s}
            type="button"
            onClick={() => onSelect(s)}
            className={`sport-toggle-btn ${active ? "active" : ""}`}
          >
            {SPORT_LABELS[s] || s}
          </button>
        );
      })}
    </div>
  );
}
