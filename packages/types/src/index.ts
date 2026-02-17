// Core data models

export type ClaudeModel = 'claude-sonnet-4-5-20250929' | 'claude-opus-4-5-20251101' | 'claude-haiku-4-5-20251001';

export interface ClaudeRequest {
  id: string;
  timestamp: Date;
  userId: string;
  model: ClaudeModel;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  cost: number; // USD
  tags: string[];
  toolsUsed: string[];
  duration: number; // milliseconds
  statusCode: number;
  metadata?: Record<string, any>;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  autoPattern?: string; // regex pattern for auto-tagging
  createdAt: Date;
}

export interface Alert {
  id: string;
  type: 'budget' | 'spike' | 'daily_summary';
  threshold: number;
  triggered: Date;
  acknowledged: boolean;
  message: string;
}

export interface User {
  id: string;
  apiKey: string; // encrypted
  monthlyBudget?: number;
  createdAt: Date;
  lastActive: Date;
}

// Analytics aggregations

export interface DailyAggregate {
  date: string; // YYYY-MM-DD
  totalTokens: number;
  totalCost: number;
  requestCount: number;
  avgTokensPerRequest: number;
}

export interface TagBreakdown {
  tag: string;
  totalTokens: number;
  totalCost: number;
  requestCount: number;
  percentage: number;
}

export interface ModelBreakdown {
  model: ClaudeModel;
  totalTokens: number;
  totalCost: number;
  requestCount: number;
  percentage: number;
}

// API request/response types

export interface AnthropicMessageRequest {
  model: string;
  messages: Array<{
    role: 'user' | 'assistant';
    content: string | any[];
  }>;
  max_tokens: number;
  temperature?: number;
  top_p?: number;
  top_k?: number;
  metadata?: Record<string, any>;
  stop_sequences?: string[];
  stream?: boolean;
  system?: string;
  tools?: any[];
}

export interface AnthropicMessageResponse {
  id: string;
  type: 'message';
  role: 'assistant';
  content: Array<{
    type: string;
    text?: string;
  }>;
  model: string;
  stop_reason: string;
  stop_sequence: string | null;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

// Pricing (as of Jan 2025)
export const MODEL_PRICING: Record<ClaudeModel, { input: number; output: number }> = {
  'claude-sonnet-4-5-20250929': {
    input: 3.00 / 1_000_000, // $3 per million input tokens
    output: 15.00 / 1_000_000, // $15 per million output tokens
  },
  'claude-opus-4-5-20251101': {
    input: 15.00 / 1_000_000,
    output: 75.00 / 1_000_000,
  },
  'claude-haiku-4-5-20251001': {
    input: 0.80 / 1_000_000,
    output: 4.00 / 1_000_000,
  },
};

// Helper function to calculate cost
export function calculateCost(model: ClaudeModel, inputTokens: number, outputTokens: number): number {
  const pricing = MODEL_PRICING[model];
  return (inputTokens * pricing.input) + (outputTokens * pricing.output);
}

