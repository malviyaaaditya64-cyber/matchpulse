import React from "react";

function verdict(analysis) {
  const pValues = analysis.granger_causality_p_values || {};
  const significant = Object.entries(pValues).filter(([, p]) => typeof p === "number" && p < 0.05);
  if ("error" in pValues) return { text: "Not enough matches yet for a reliable test.", ok: false };
  if (significant.length === 0) {
    return { text: "No statistically significant lag found yet — sentiment isn't a reliable predictor here, but keep collecting matches.", ok: false };
  }
  const lags = significant.map(([lag]) => lag).join(", ");
  return { text: `Sentiment shows significant predictive power at lag ${lags} match(es) ahead (p < 0.05).`, ok: true };
}

export default function CorrelationPanel({ analysis }) {
  const v = verdict(analysis);
  const lagCorr = analysis.lagged_correlation_sentiment_vs_future_result || {};
  const pValues = analysis.granger_causality_p_values || {};

  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        boxShadow: "var(--shadow-card)",
        borderRadius: 14,
        padding: 24,
      }}
    >
      <div style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 600, marginBottom: 4 }}>
        Does negativity predict a losing streak?
      </div>
      <div
        style={{
          fontFamily: "var(--font-body)",
          fontSize: 13,
          color: v.ok ? "var(--teal)" : "var(--text-secondary)",
          marginBottom: 16,
        }}
      >
        {v.text}
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "var(--font-mono)", fontSize: 12 }}>
        <thead>
          <tr style={{ color: "var(--text-muted)", textAlign: "left" }}>
            <th style={{ paddingBottom: 6 }}>Lag (matches ahead)</th>
            <th style={{ paddingBottom: 6 }}>Correlation</th>
            <th style={{ paddingBottom: 6 }}>Granger p-value</th>
          </tr>
        </thead>
        <tbody>
          {Object.keys(lagCorr).map((lag) => {
            const p = pValues[lag];
            const sig = typeof p === "number" && p < 0.05;
            return (
              <tr key={lag} style={{ borderTop: "1px solid var(--border)" }}>
                <td style={{ padding: "6px 0", color: "var(--text-secondary)" }}>+{lag}</td>
                <td style={{ padding: "6px 0", color: "var(--text-primary)" }}>
                  {lagCorr[lag] === null ? "—" : lagCorr[lag]}
                </td>
                <td style={{ padding: "6px 0", color: sig ? "var(--teal)" : "var(--text-secondary)" }}>
                  {typeof p === "number" ? p : "—"}
                  {sig && " *"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--text-muted)", marginTop: 10 }}>
        * p &lt; 0.05. Correlation is positive when negative sentiment tends to precede losses.
      </div>
    </div>
  );
}
