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
    <div style={{ flex: 1 }}>
      <div style={{ fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 600, marginBottom: 2 }}>
        {title}
      </div>
      <div style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--text-muted)", marginBottom: 8 }}>
        {hint}
      </div>
      <ResponsiveContainer width="100%" height={140}>
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
