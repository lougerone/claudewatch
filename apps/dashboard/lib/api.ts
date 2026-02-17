export async function fetchApi<T>(path: string, params?: Record<string, string>): Promise<T> {
  const url = new URL(path, window.location.origin);
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  }
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export interface Summary {
  totalTokens: number;
  totalCost: number;
  requestCount: number;
  avgTokensPerRequest: number;
  avgDuration: number;
}

export interface DailyAggregate {
  date: string;
  totalTokens: number;
  totalCost: number;
  requestCount: number;
  avgTokensPerRequest: number;
}

export interface ModelBreakdown {
  model: string;
  totalTokens: number;
  totalCost: number;
  requestCount: number;
  percentage: number;
}

export interface TagBreakdown {
  tag: string;
  totalTokens: number;
  totalCost: number;
  requestCount: number;
  percentage: number;
}
