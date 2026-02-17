"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "@/lib/api";
import { useState } from "react";

interface RequestRow {
  id: string;
  timestamp: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  cost: number;
  duration: number;
  statusCode: number;
  tags: string[];
}

interface RequestsResponse {
  data: RequestRow[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

function shortModel(model: string): string {
  if (model.includes("opus")) return "Opus";
  if (model.includes("sonnet")) return "Sonnet";
  if (model.includes("haiku")) return "Haiku";
  return model;
}

function timeAgo(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

const modelColors: Record<string, string> = {
  Opus: "bg-accent-muted text-accent",
  Sonnet: "bg-success-muted text-success",
  Haiku: "bg-muted text-ink-700",
};

export default function RequestsPage() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["requests", page],
    queryFn: () =>
      fetchApi<RequestsResponse>("/api/analytics/requests", {
        page: page.toString(),
        limit: "25",
      }),
  });

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-xl font-sans font-semibold text-foreground">
          Request Log
        </h2>
        <p className="text-sm text-muted-foreground font-serif mt-1">
          {data
            ? `${data.pagination.total.toLocaleString()} requests recorded.`
            : "Loading your request history..."}
        </p>
      </div>

      <div className="paper rounded overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left px-4 py-3 font-sans font-medium text-muted-foreground text-[11px] uppercase tracking-wider">
                Time
              </th>
              <th className="text-left px-4 py-3 font-sans font-medium text-muted-foreground text-[11px] uppercase tracking-wider">
                Model
              </th>
              <th className="text-right px-4 py-3 font-sans font-medium text-muted-foreground text-[11px] uppercase tracking-wider">
                Input
              </th>
              <th className="text-right px-4 py-3 font-sans font-medium text-muted-foreground text-[11px] uppercase tracking-wider">
                Output
              </th>
              <th className="text-right px-4 py-3 font-sans font-medium text-muted-foreground text-[11px] uppercase tracking-wider">
                Cost
              </th>
              <th className="text-right px-4 py-3 font-sans font-medium text-muted-foreground text-[11px] uppercase tracking-wider">
                Duration
              </th>
              <th className="text-left px-4 py-3 font-sans font-medium text-muted-foreground text-[11px] uppercase tracking-wider">
                Tags
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-12 text-center text-muted-foreground font-serif italic text-sm"
                >
                  Loading...
                </td>
              </tr>
            ) : !data?.data.length ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-12 text-center text-muted-foreground font-serif text-sm"
                >
                  No requests logged yet. Point your Anthropic client to the
                  proxy to begin tracking.
                </td>
              </tr>
            ) : (
              data.data.map((r) => {
                const model = shortModel(r.model);
                return (
                  <tr
                    key={r.id}
                    className="border-b border-border last:border-0 hover:bg-card-hover transition-colors"
                  >
                    <td className="px-4 py-3 font-mono text-xs text-ink-500">
                      {timeAgo(r.timestamp)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2 py-0.5 text-[11px] font-sans font-medium rounded ${
                          modelColors[model] || "bg-muted text-ink-700"
                        }`}
                      >
                        {model}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-xs text-ink-700">
                      {r.inputTokens.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-xs text-ink-700">
                      {r.outputTokens.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-xs font-medium text-foreground">
                      ${r.cost.toFixed(4)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-xs text-ink-500">
                      {(r.duration / 1000).toFixed(1)}s
                    </td>
                    <td className="px-4 py-3">
                      {r.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-block mr-1 px-1.5 py-0.5 text-[10px] font-sans rounded bg-accent-muted text-accent"
                        >
                          {tag}
                        </span>
                      ))}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {data && data.pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-5">
          <p className="text-xs text-muted-foreground font-serif">
            Page {data.pagination.page} of {data.pagination.totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 text-xs font-sans border border-border rounded hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() =>
                setPage((p) => Math.min(data.pagination.totalPages, p + 1))
              }
              disabled={page >= data.pagination.totalPages}
              className="px-3 py-1.5 text-xs font-sans border border-border rounded hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
