import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const SentimentTrend = ({ season }) => {
  if (!season || season.length === 0) {
    return (
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-card)", borderRadius: 14, padding: 24, marginBottom: 24 }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 600, marginBottom: 3, color: "var(--text-primary)" }}>
          Sentiment Trend Timeline
        </div>
        <div style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-muted)" }}>
          Not enough match data to display trend.
        </div>
      </div>
    );
  }

  const data = season.map((match) => ({
    date: match.date,
    sentiment: match.sentiment,
    confidence: match.confidence,
    blame: match.blame,
  }));

  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-card)", borderRadius: 14, padding: 24, marginBottom: 24 }}>
      <div style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 600, marginBottom: 3, color: "var(--text-primary)" }}>
        Sentiment Trend Timeline
      </div>
      <div style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-muted)", marginBottom: 16 }}>
        Match-by-match sentiment, confidence, and blame trends
      </div>
      <div style={{ height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="sentiment" stroke="var(--teal)" name="Sentiment" />
            <Line type="monotone" dataKey="confidence" stroke="var(--amber)" name="Confidence" />
            <Line type="monotone" dataKey="blame" stroke="var(--coral)" name="Blame" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SentimentTrend;