import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './config';
import { proxyMiddleware } from './middleware/proxy';
import analyticsRoutes from './routes/analytics';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: config.corsOrigin,
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMax,
  message: 'Too many requests from this IP, please try again later.',
});
app.use(limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Analytics API routes
app.use('/api/analytics', analyticsRoutes);

// Proxy route - intercepts Claude API calls
app.post('/v1/messages', proxyMiddleware);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not found',
    message: 'ClaudeWatch proxy is running. Use POST /v1/messages to proxy Claude API calls.',
  });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: config.nodeEnv === 'development' ? err.message : undefined,
  });
});

// Start server
app.listen(config.port, () => {
  console.log(`
╔════════════════════════════════════════════╗
║ CLAUDEWATCH PROXY SERVER                   ║
╠════════════════════════════════════════════╣
║ Status:     RUNNING                        ║
║ Port:       ${config.port}                            ║
║ Env:        ${config.nodeEnv}                    ║
║ Dashboard:  ${config.corsOrigin}         ║
╠════════════════════════════════════════════╣
║ Proxy endpoint:                            ║
║ POST http://localhost:${config.port}/v1/messages    ║
╠════════════════════════════════════════════╣
║ Configure your Anthropic client:          ║
║ baseURL: 'http://localhost:${config.port}'        ║
╚════════════════════════════════════════════╝
  `);
});

export default app;
