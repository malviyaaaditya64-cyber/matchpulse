import React from "react";

const SPORT_LABELS = {
  football: "⚽  Football",
  cricket: "🏏  Cricket",
};

export default function SportSelector({ sports, selected, onSelect }) {
  return (
    <div
      style={{
        display: "inline-flex",
        gap: 2,
        padding: 3,
        background: "var(--surface-sunken)",
        border: "1px solid var(--border)",
        borderRadius: 10,
      }}
    >
      {sports.map((s) => {
        const active = s === selected;
        return (
          <button
            key={s}
            onClick={() => onSelect(s)}
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 13.5,
              fontWeight: 600,
              padding: "8px 18px",
              borderRadius: 8,
              border: "none",
              background: active ? "var(--surface)" : "transparent",
              color: active ? "var(--accent)" : "var(--text-secondary)",
              cursor: "pointer",
              boxShadow: active ? "var(--shadow-card)" : "none",
              transition: "all 0.15s ease",
            }}
          >
            {SPORT_LABELS[s] || s}
          </button>
        );
      })}
    </div>
  );
}
