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
    <div className="intel-card">
      <div className="intel-card-title">Does negativity predict a losing streak?</div>
      <div className={`corr-verdict ${v.ok ? "ok" : "pending"}`}>{v.text}</div>

      <table className="corr-table">
        <thead>
          <tr>
            <th>Lag (matches ahead)</th>
            <th>Correlation</th>
            <th>Granger p-value</th>
          </tr>
        </thead>
        <tbody>
          {Object.keys(lagCorr).map((lag) => {
            const p = pValues[lag];
            const sig = typeof p === "number" && p < 0.05;
            return (
              <tr key={lag}>
                <td style={{ color: "var(--text-secondary)" }}>+{lag}</td>
                <td style={{ color: "var(--text-primary)" }}>
                  {lagCorr[lag] === null ? "—" : lagCorr[lag]}
                </td>
                <td style={{ color: sig ? "var(--teal)" : "var(--text-secondary)" }}>
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
