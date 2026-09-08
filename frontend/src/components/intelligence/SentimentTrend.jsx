import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const SentimentTrend = ({ season }) => {
  const data = season?.map((match) => ({
    date: match.date,
    Sentiment: match.sentiment,
    Confidence: match.confidence,
    Blame: match.blame,
  })) || [];

  return (
    <div className="intel-card">
      <div className="intel-card-title">Sentiment Trend Timeline</div>
      <div className="intel-card-subtitle">Match-by-match sentiment, confidence, and blame trends</div>
      {(!season || season.length === 0) ? (
        <div className="intel-empty">Not enough match data to display trend.</div>
      ) : (
        <div style={{ height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 20, left: -15, bottom: 0 }}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: "var(--text-muted)", fontSize: 10, fontFamily: "var(--font-mono)" }} axisLine={{ stroke: "var(--border)" }} tickLine={false} />
              <YAxis domain={[-1, 1]} tick={{ fill: "var(--text-muted)", fontSize: 10, fontFamily: "var(--font-mono)" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: "var(--surface-raised)", border: "1px solid var(--border)", borderRadius: 8, fontFamily: "var(--font-mono)", fontSize: 12 }}
              />
              <Legend wrapperStyle={{ fontFamily: "var(--font-body)", fontSize: 11 }} />
              <Line type="monotone" dataKey="Sentiment" stroke="var(--teal)" strokeWidth={2} dot={false} isAnimationActive={false} />
              <Line type="monotone" dataKey="Confidence" stroke="var(--accent)" strokeWidth={2} dot={false} isAnimationActive={false} />
              <Line type="monotone" dataKey="Blame" stroke="var(--coral)" strokeWidth={2} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default SentimentTrend;
