import { useQuery } from "@tanstack/react-query";
import { fetchApi, Summary, DailyAggregate, ModelBreakdown, TagBreakdown } from "./api";

// Default userId for local single-user setup
const DEFAULT_USER_ID = "demo";

function dateParams(days: number = 30) {
  const end = new Date();
  const start = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  return {
    startDate: start.toISOString(),
    endDate: end.toISOString(),
  };
}

export function useSummary(userId: string = DEFAULT_USER_ID, days: number = 30) {
  return useQuery({
    queryKey: ["summary", userId, days],
    queryFn: () =>
      fetchApi<Summary>("/api/analytics/summary", {
        userId,
        ...dateParams(days),
      }),
  });
}

export function useDaily(userId: string = DEFAULT_USER_ID, days: number = 30) {
  return useQuery({
    queryKey: ["daily", userId, days],
    queryFn: () =>
      fetchApi<DailyAggregate[]>("/api/analytics/daily", {
        userId,
        ...dateParams(days),
      }),
  });
}

export function useModelBreakdown(userId: string = DEFAULT_USER_ID, days: number = 30) {
  return useQuery({
    queryKey: ["by-model", userId, days],
    queryFn: () =>
      fetchApi<ModelBreakdown[]>("/api/analytics/by-model", {
        userId,
        ...dateParams(days),
      }),
  });
}

export function useTagBreakdown(userId: string = DEFAULT_USER_ID, days: number = 30) {
  return useQuery({
    queryKey: ["by-tag", userId, days],
    queryFn: () =>
      fetchApi<TagBreakdown[]>("/api/analytics/by-tag", {
        userId,
        ...dateParams(days),
      }),
  });
}
