"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { DailyAggregate } from "@/lib/api";

interface DailyChartProps {
  data: DailyAggregate[];
  dataKey?: "totalCost" | "totalTokens" | "requestCount";
  label?: string;
}

export function DailyChart({ data, dataKey = "totalCost", label = "Daily Cost" }: DailyChartProps) {
  const formatted = data.map((d) => ({
    ...d,
    date: d.date.slice(5), // MM-DD
  }));

  const formatter = dataKey === "totalCost"
    ? (v: number) => `$${v.toFixed(2)}`
    : (v: number) => v.toLocaleString();

  return (
    <div className="bg-card border border-border rounded-sm p-5">
      <h3 className="text-sm font-medium mb-4">{label}</h3>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={formatted}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0dbd4" />
          <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#6b6560" />
          <YAxis tick={{ fontSize: 11 }} stroke="#6b6560" tickFormatter={formatter} />
          <Tooltip
            formatter={(value: number) => [formatter(value), label]}
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #e0dbd4",
              borderRadius: "2px",
              fontSize: "12px",
            }}
          />
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke="#0d9488"
            fill="#0d948820"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
