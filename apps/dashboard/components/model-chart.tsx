"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { ModelBreakdown } from "@/lib/api";

const COLORS = ["#0d9488", "#e07a5f", "#6b6560", "#3b82f6"];

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
    <div className="bg-card border border-border rounded-sm p-5">
      <h3 className="text-sm font-medium mb-4">By Model</h3>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={formatted}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            dataKey="value"
            nameKey="name"
            strokeWidth={1}
            stroke="#faf8f5"
          >
            {formatted.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => [`$${value.toFixed(3)}`, "Cost"]}
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #e0dbd4",
              borderRadius: "2px",
              fontSize: "12px",
            }}
          />
          <Legend
            formatter={(value: string) => (
              <span className="text-xs text-foreground">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
