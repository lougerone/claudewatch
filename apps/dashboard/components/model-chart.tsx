"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { ModelBreakdown } from "@/lib/api";

// Earthy, warm tones aligned with brand
const COLORS = ["#C15F3C", "#5B8A6F", "#7A736A", "#D4A574"];

function shortModel(model: string): string {
  if (model.includes("opus")) return "Opus";
  if (model.includes("sonnet")) return "Sonnet";
  if (model.includes("haiku")) return "Haiku";
  return model;
}

export function ModelChart({ data }: { data: ModelBreakdown[] }) {
  const formatted = data.map((d) => ({
    name: shortModel(d.model),
    value: d.totalCost,
    count: d.requestCount,
  }));

  return (
    <div className="paper rounded p-5">
      <h3 className="text-[13px] font-sans font-medium text-foreground mb-5">
        Model Distribution
      </h3>
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={formatted}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={90}
            dataKey="value"
            nameKey="name"
            strokeWidth={2}
            stroke="#FAF7F2"
          >
            {formatted.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => [`$${value.toFixed(3)}`, "Cost"]}
            contentStyle={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #E3DDD4",
              borderRadius: "6px",
              fontSize: "12px",
              fontFamily: "var(--font-lora)",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            }}
          />
          <Legend
            formatter={(value: string) => (
              <span className="text-xs font-sans text-ink-700">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
