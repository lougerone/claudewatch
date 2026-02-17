"use client";

import { useDaily, useModelBreakdown, useTagBreakdown } from "@/lib/hooks";
import { DailyChart } from "@/components/daily-chart";
import { ModelChart } from "@/components/model-chart";

export default function AnalyticsPage() {
  const { data: daily, isLoading: ld } = useDaily();
  const { data: models, isLoading: lm } = useModelBreakdown();
  const { data: tags, isLoading: lt } = useTagBreakdown();

  if (ld || lm || lt) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-sm text-muted-foreground font-mono">Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Analytics</h2>
        <p className="text-sm text-muted-foreground">Last 30 days</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <DailyChart data={daily || []} dataKey="totalCost" label="Daily Cost ($)" />
        <DailyChart data={daily || []} dataKey="totalTokens" label="Daily Tokens" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ModelChart data={models || []} />

        <div className="bg-card border border-border rounded-sm p-5">
          <h3 className="text-sm font-medium mb-4">By Tag</h3>
          {!tags?.length ? (
            <p className="text-xs text-muted-foreground py-8 text-center">
              No tagged requests yet
            </p>
          ) : (
            <div className="space-y-3">
              {tags.map((t) => (
                <div key={t.tag}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium">{t.tag}</span>
                    <span className="text-muted-foreground">
                      ${t.totalCost.toFixed(2)} ({t.percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-sm h-2">
                    <div
                      className="bg-terracotta-400 h-2 rounded-sm transition-all"
                      style={{ width: `${Math.min(100, t.percentage)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <DailyChart data={daily || []} dataKey="requestCount" label="Daily Request Count" />
    </div>
  );
}
