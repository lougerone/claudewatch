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

export function DailyChart({
  data,
  dataKey = "totalCost",
  label = "Daily Cost",
}: DailyChartProps) {
  const formatted = data.map((d) => ({
    ...d,
    date: d.date.slice(5),
  }));

  const formatter =
    dataKey === "totalCost"
      ? (v: number) => `$${v.toFixed(2)}`
      : (v: number) => v.toLocaleString();

  return (
    <div className="paper rounded p-5">
      <h3 className="text-[13px] font-sans font-medium text-foreground mb-5">
        {label}
      </h3>
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={formatted}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E3DDD4" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fontFamily: "var(--font-poppins)", fill: "#7A736A" }}
            stroke="#D4CFC7"
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fontFamily: "var(--font-poppins)", fill: "#7A736A" }}
            stroke="#D4CFC7"
            tickLine={false}
            tickFormatter={formatter}
          />
          <Tooltip
            formatter={(value: number) => [formatter(value), label]}
            contentStyle={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #E3DDD4",
              borderRadius: "6px",
              fontSize: "12px",
              fontFamily: "var(--font-lora)",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            }}
            labelStyle={{ fontFamily: "var(--font-poppins)", fontSize: "11px", color: "#7A736A" }}
          />
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke="#C15F3C"
            fill="rgba(193, 95, 60, 0.08)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
