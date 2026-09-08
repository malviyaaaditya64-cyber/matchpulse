import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ReferenceLine,
  Tooltip,
} from "recharts";

function MiniTooltip({ active, payload, colorVar }) {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0].payload;
  return (
    <div
      style={{
        background: "var(--surface-raised)",
        border: "1px solid var(--border)",
        borderRadius: 8,
        padding: "6px 10px",
        fontFamily: "var(--font-mono)",
        fontSize: 12,
        color: colorVar,
      }}
    >
      vs {d.opponent}: {payload[0].value.toFixed(2)}
    </div>
  );
}

export default function SignalBars({ season, dataKey, color, title, hint }) {
  return (
    <div className="intel-card">
      <div className="intel-card-title">{title}</div>
      <div className="intel-card-subtitle">{hint}</div>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={season} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <ReferenceLine y={0} stroke="var(--border)" />
          <XAxis dataKey="date" hide />
          <YAxis
            domain={[-1, 1]}
            tick={{ fill: "var(--text-muted)", fontSize: 10, fontFamily: "var(--font-mono)" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<MiniTooltip colorVar={color} />} />
          <Bar dataKey={dataKey} fill={color} radius={[3, 3, 3, 3]} isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
