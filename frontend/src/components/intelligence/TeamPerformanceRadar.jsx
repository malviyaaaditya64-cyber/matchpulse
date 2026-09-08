import React from "react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";

const TeamPerformanceRadar = ({ season }) => {
  const calculateMetrics = () => {
    if (!season || !Array.isArray(season) || season.length === 0) return null;

    const sentiment = season.reduce((sum, match) => sum + match.sentiment, 0) / season.length;
    const confidence = season.reduce((sum, match) => sum + match.confidence, 0) / season.length;
    const blame = season.reduce((sum, match) => sum + match.blame, 0) / season.length;

    const wins = season.filter((match) => match.result === "W").length;
    const draws = season.filter((match) => match.result === "D").length;
    const losses = season.filter((match) => match.result === "L").length;

    const form = wins > losses ? "Good" : wins === losses ? "Mixed" : "Poor";

    return {
      sentiment: Math.round((sentiment + 1) * 50),
      confidence: Math.round((confidence + 1) * 50),
      blame: Math.round((blame + 1) * 50),
      wins,
      draws,
      losses,
      form,
    };
  };

  const metrics = calculateMetrics();

  return (
    <div className="intel-card">
      <div className="intel-card-title">Team Performance Radar</div>
      {!metrics ? (
        <div className="intel-empty">Not enough match data to display performance metrics.</div>
      ) : (
        <>
          <div className="intel-card-subtitle">
            Form: <b className={metrics.form === "Good" ? "outlook-improving" : metrics.form === "Poor" ? "outlook-declining" : "outlook-stable"}>{metrics.form}</b>
          </div>
          <div style={{ height: 240, margin: "0 -4px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart
                cx="50%"
                cy="50%"
                outerRadius="55%"
                data={[
                  { subject: "Sentiment", A: metrics.sentiment, fullMark: 100 },
                  { subject: "Confidence", A: metrics.confidence, fullMark: 100 },
                  { subject: "Blame", A: metrics.blame, fullMark: 100 },
                  { subject: "Wins", A: (metrics.wins / (metrics.wins + metrics.draws + metrics.losses || 1)) * 100, fullMark: 100 },
                  { subject: "Losses", A: (metrics.losses / (metrics.wins + metrics.draws + metrics.losses || 1)) * 100, fullMark: 100 },
                ]}
              >
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: "var(--text-muted)", fontSize: 9, fontFamily: "var(--font-body)" }} />
                <PolarRadiusAxis tick={false} axisLine={false} domain={[0, 100]} />
                <Radar name="Performance" dataKey="A" stroke="var(--coral)" fill="var(--coral)" fillOpacity={0.35} isAnimationActive={false} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
};

export default TeamPerformanceRadar;
