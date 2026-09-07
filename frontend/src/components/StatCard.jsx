import React from "react";

export default function StatCard({ label, value, accent, sub }) {
  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        boxShadow: "var(--shadow-card)",
        borderRadius: 12,
        padding: "18px 20px",
        flex: 1,
      }}
    >
      <div style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-secondary)" }}>
        {label}
      </div>
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 26,
          fontWeight: 500,
          color: accent || "var(--text-primary)",
          marginTop: 4,
        }}
      >
        {value}
      </div>
      {sub && (
        <div style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
          {sub}
        </div>
      )}
    </div>
  );
}
