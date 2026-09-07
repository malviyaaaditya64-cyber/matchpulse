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

  if (!metrics) {
    return (
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-card)", borderRadius: 14, padding: 24, marginBottom: 24 }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 600, marginBottom: 3, color: "var(--text-primary)" }}>
          Team Performance Radar
        </div>
        <div style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-muted)" }}>
          Not enough match data to display performance metrics.
        </div>
      </div>
    );
  }

  const data = [
    { subject: "Sentiment", A: metrics.sentiment, fullMark: 100 },
    { subject: "Confidence", A: metrics.confidence, fullMark: 100 },
    { subject: "Blame", A: metrics.blame, fullMark: 100 },
    { subject: "Wins", A: metrics.wins, fullMark: season.length },
    { subject: "Draws", A: metrics.draws, fullMark: season.length },
    { subject: "Losses", A: metrics.losses, fullMark: season.length },
  ];

  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-card)", borderRadius: 14, padding: 24, marginBottom: 24 }}>
      <div style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 600, marginBottom: 3, color: "var(--text-primary)" }}>
        Team Performance Radar
      </div>
      <div style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-muted)", marginBottom: 16 }}>
        Current form: {metrics.form}
      </div>
      <div style={{ height: 400 }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
            <PolarGrid />
            <PolarAngleAxis dataKey="subject" />
            <PolarRadiusAxis />
            <Radar name="Performance" dataKey="A" stroke="var(--accent)" fill="var(--accent)" fillOpacity={0.6} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TeamPerformanceRadar;