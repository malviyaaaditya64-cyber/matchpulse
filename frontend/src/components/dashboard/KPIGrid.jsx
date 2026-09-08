import React from "react";
import { Trophy, Shield, XCircle, Activity } from "lucide-react";

function sentimentLabel(avgSentiment) {
  const v = parseFloat(avgSentiment);
  if (isNaN(v)) return "";
  if (v > 0.5) return "Very Positive";
  if (v > 0.1) return "Positive";
  if (v > -0.1) return "Neutral";
  if (v > -0.5) return "Negative";
  return "Very Negative";
}

const KPIGrid = ({ wins, draws, losses, avgSentiment }) => {
  const total = wins + draws + losses;
  const pct = (n) => (total > 0 ? `${((n / total) * 100).toFixed(1)}%` : "—");

  return (
    <div className="kpi-grid">
      <div className="kpi-card kpi-wins">
        <div className="kpi-card-text">
          <div className="kpi-label">Wins</div>
          <div className="kpi-value">{wins}</div>
          <div className="kpi-sub">{pct(wins)}</div>
        </div>
        <div className="kpi-icon-circle">
          <Trophy size={20} />
        </div>
      </div>

      <div className="kpi-card kpi-draws">
        <div className="kpi-card-text">
          <div className="kpi-label">Draws</div>
          <div className="kpi-value">{draws}</div>
          <div className="kpi-sub">{pct(draws)}</div>
        </div>
        <div className="kpi-icon-circle">
          <Shield size={20} />
        </div>
      </div>

      <div className="kpi-card kpi-losses">
        <div className="kpi-card-text">
          <div className="kpi-label">Losses</div>
          <div className="kpi-value">{losses}</div>
          <div className="kpi-sub">{pct(losses)}</div>
        </div>
        <div className="kpi-icon-circle">
          <XCircle size={20} />
        </div>
      </div>

      <div className="kpi-card kpi-sentiment">
        <div className="kpi-card-text">
          <div className="kpi-label">Avg Sentiment</div>
          <div className="kpi-value">{avgSentiment}</div>
          <div className="kpi-sub">{sentimentLabel(avgSentiment)}</div>
        </div>
        <div className="kpi-icon-circle">
          <Activity size={20} />
        </div>
      </div>
    </div>
  );
};

export default KPIGrid;
