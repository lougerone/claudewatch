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
      <div className="flex items-center justify-center h-96">
        <p className="text-sm text-muted-foreground font-serif italic">
          Loading analytics...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-sans font-semibold text-foreground">
          Analytics
        </h2>
        <p className="text-sm text-muted-foreground font-serif mt-1">
          Detailed breakdowns of your token usage and spending patterns.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <DailyChart
          data={daily || []}
          dataKey="totalCost"
          label="Daily Cost ($)"
        />
        <DailyChart
          data={daily || []}
          dataKey="totalTokens"
          label="Daily Tokens"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ModelChart data={models || []} />

        <div className="paper rounded p-5">
          <h3 className="text-[13px] font-sans font-medium text-foreground mb-5">
            Cost by Tag
          </h3>
          {!tags?.length ? (
            <p className="text-sm text-muted-foreground py-12 text-center font-serif italic">
              No tagged requests yet.
            </p>
          ) : (
            <div className="space-y-4">
              {tags.map((t) => (
                <div key={t.tag}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-sans font-medium text-foreground">
                      {t.tag}
                    </span>
                    <span className="font-serif text-ink-500">
                      ${t.totalCost.toFixed(2)}{" "}
                      <span className="text-ink-300">
                        ({t.percentage.toFixed(1)}%)
                      </span>
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-sm h-2">
                    <div
                      className="bg-accent h-2 rounded-sm transition-all"
                      style={{ width: `${Math.min(100, t.percentage)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <DailyChart
        data={daily || []}
        dataKey="requestCount"
        label="Daily Request Count"
      />
    </div>
  );
}
