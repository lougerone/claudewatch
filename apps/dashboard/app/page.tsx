"use client";

import { useSummary, useDaily, useModelBreakdown } from "@/lib/hooks";
import { StatCard } from "@/components/stat-card";
import { DailyChart } from "@/components/daily-chart";
import { ModelChart } from "@/components/model-chart";

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

export default function OverviewPage() {
  const { data: summary, isLoading: loadingSummary } = useSummary();
  const { data: daily, isLoading: loadingDaily } = useDaily();
  const { data: models, isLoading: loadingModels } = useModelBreakdown();

  if (loadingSummary || loadingDaily || loadingModels) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-sm text-muted-foreground font-serif italic">
          Loading your analytics...
        </p>
      </div>
    );
  }

  const s = summary || {
    totalTokens: 0,
    totalCost: 0,
    requestCount: 0,
    avgTokensPerRequest: 0,
    avgDuration: 0,
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-xl font-sans font-semibold text-foreground">
          Overview
        </h2>
        <p className="text-sm text-muted-foreground font-serif mt-1">
          A summary of your Claude API usage over the last 30 days.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total Tokens"
          value={formatTokens(s.totalTokens)}
          sub={`${s.totalTokens.toLocaleString()} exact`}
        />
        <StatCard label="Total Cost" value={`$${s.totalCost.toFixed(2)}`} />
        <StatCard label="Requests" value={s.requestCount.toLocaleString()} />
        <StatCard
          label="Avg Duration"
          value={`${(s.avgDuration / 1000).toFixed(1)}s`}
          sub={`${formatTokens(s.avgTokensPerRequest)} tokens per request`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <DailyChart data={daily || []} />
        </div>
        <div>
          <ModelChart data={models || []} />
        </div>
      </div>
    </div>
  );
}
