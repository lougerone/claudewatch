import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL || 'file:./claudewatch.db',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  
  // Rate limiting
  rateLimitWindowMs: 15 * 60 * 1000, // 15 minutes
  rateLimitMax: 100, // Max 100 requests per window
  
  // Logging
  logLevel: process.env.LOG_LEVEL || 'info',
} as const;

// Validate required config
if (!config.anthropicApiKey && config.nodeEnv === 'production') {
  console.warn('⚠️  ANTHROPIC_API_KEY not set - proxy will require API key in requests');
}
