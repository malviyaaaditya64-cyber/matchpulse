import React from "react";

const KPIGrid = ({ wins, draws, losses, avgSentiment }) => {
  return (
    <div className="kpi-grid">
      <div className="kpi-card kpi-wins">
        <div className="kpi-label">Wins</div>
        <div className="kpi-value">{wins}</div>
      </div>

      <div className="kpi-card kpi-draws">
        <div className="kpi-label">Draws</div>
        <div className="kpi-value">{draws}</div>
      </div>

      <div className="kpi-card kpi-losses">
        <div className="kpi-label">Losses</div>
        <div className="kpi-value">{losses}</div>
      </div>

      <div className="kpi-card kpi-sentiment">
        <div className="kpi-label">Avg Sentiment</div>
        <div className="kpi-value">{avgSentiment}</div>
      </div>
    </div>
  );
};

export default KPIGrid;
