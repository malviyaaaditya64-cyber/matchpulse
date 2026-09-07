import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  CartesianGrid,
} from "recharts";

const RESULT_COLOR = { W: "var(--teal)", D: "var(--amber)", L: "var(--coral)" };

function CustomTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0].payload;
  return (
    <div
      style={{
        background: "var(--surface-raised)",
        border: "1px solid var(--border)",
        borderRadius: 8,
        padding: "8px 12px",
        fontFamily: "var(--font-mono)",
        fontSize: 12,
      }}
    >
      <div style={{ color: "var(--text-primary)", marginBottom: 4 }}>
        vs {d.opponent}
      </div>
      <div style={{ color: RESULT_COLOR[d.result] }}>{d.result} · sentiment {d.sentiment.toFixed(2)}</div>
    </div>
  );
}

export default function SentimentPulse({ season }) {
  const data = season.map((m) => ({ ...m, x: m.date }));

  return (
    <div>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
          <CartesianGrid stroke="var(--border)" vertical={false} />
          <ReferenceLine y={0} stroke="var(--text-muted)" strokeDasharray="3 3" />
          <XAxis
            dataKey="x"
            tick={{ fill: "var(--text-muted)", fontSize: 11, fontFamily: "var(--font-mono)" }}
            axisLine={{ stroke: "var(--border)" }}
            tickLine={false}
          />
          <YAxis
            domain={[-1, 1]}
            tick={{ fill: "var(--text-muted)", fontSize: 11, fontFamily: "var(--font-mono)" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="sentiment"
            stroke="var(--teal)"
            strokeWidth={2}
            dot={{ r: 3, fill: "var(--bg)", stroke: "var(--teal)", strokeWidth: 2 }}
            activeDot={{ r: 5 }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* win/loss tick row underneath, like an EKG rhythm strip */}
      <div style={{ display: "flex", gap: 3, padding: "4px 20px 0 10px" }}>
        {data.map((m) => (
          <div
            key={m.match_id}
            title={`${m.opponent}: ${m.result}`}
            style={{
              flex: 1,
              height: 4,
              borderRadius: 2,
              background: RESULT_COLOR[m.result],
              opacity: 0.85,
            }}
          />
        ))}
      </div>
    </div>
  );
}
