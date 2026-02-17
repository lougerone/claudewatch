# ClaudeWatch

**Cost visibility and usage analytics for Claude API users.**

Stop guessing what burns your token budget - know exactly where every token goes.

---

## Features

- **Real-time token tracking** - Automatic logging of all Claude API requests
- **Cost breakdown** - See exactly how much you're spending per task, tag, or model
- **Budget alerts** - Get notified when approaching spending limits
- **Analytics dashboard** - Visualize usage trends over time
- **Tag system** - Categorize requests for detailed cost attribution
- **Self-hosted** - Your data stays on your machine

---

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/jayismeta/claudewatch.git
cd claudewatch

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env and set your ENCRYPTION_KEY

# Initialize database
npm run db:migrate

# Start the proxy server
npm run dev:proxy
```

The proxy server will start on `http://localhost:3001`

### Configure Your Application

Change your Anthropic client to point to ClaudeWatch:

```javascript
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
  baseURL: 'http://localhost:3001', // Point to ClaudeWatch proxy
});

// Use normally - all requests will be logged
const message = await client.messages.create({
  model: 'claude-sonnet-4-5-20250929',
  max_tokens: 1024,
  messages: [{ role: 'user', content: 'Hello, Claude!' }],
});
```

That's it! All your Claude API requests will now be tracked.

---

## Architecture

```
┌─────────────────┐
│   Your App      │
│  (Claude API)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ ClaudeWatch     │
│ Proxy Server    │ ◄─── Logs tokens, cost, duration
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Anthropic API  │
└────────┬────────┘
         │
         ▼
    ┌────────────┐
    │  SQLite    │
    │  Database  │
    └────────────┘
```

### How It Works

1. **Your app** makes Claude API requests to ClaudeWatch proxy (`localhost:3001`)
2. **ClaudeWatch** forwards the request to Anthropic's API
3. **Response** is returned to your app (transparent passthrough)
4. **Logging** happens asynchronously - zero latency impact
5. **Dashboard** queries the database for analytics

---

## API Endpoints

### Proxy

**POST /v1/messages**
- Proxies requests to Anthropic's `/v1/messages` endpoint
- Automatically logs token usage, cost, and duration
- Requires `Authorization: Bearer sk-ant-xxxxx` header

### Analytics

**GET /api/analytics/summary**
- Returns overall usage statistics
- Query params: `userId`, `startDate`, `endDate`

**GET /api/analytics/daily**
- Returns daily aggregated usage
- Query params: `userId`, `startDate`, `endDate`

**GET /api/analytics/by-tag**
- Returns cost breakdown by tag
- Query params: `userId`, `startDate`, `endDate`

**GET /api/analytics/by-model**
- Returns usage breakdown by model
- Query params: `userId`, `startDate`, `endDate`

---

## Database Schema

### Tables

- **users** - API key storage (encrypted)
- **requests** - Individual API request logs
- **tags** - Custom categorization tags
- **request_tags** - Many-to-many relationship
- **alerts** - Budget threshold notifications

### Key Fields

```typescript
Request {
  id: string
  timestamp: Date
  model: string
  inputTokens: number
  outputTokens: number
  totalTokens: number
  cost: number  // USD
  duration: number  // ms
  tags: Tag[]
}
```

---

## Development

### Project Structure

```
claudewatch/
├── apps/
│   ├── proxy/          # Express API server
│   └── dashboard/      # Next.js dashboard (coming soon)
├── packages/
│   ├── database/       # Prisma schema + client
│   └── types/          # Shared TypeScript types
└── docs/               # Documentation
```

### Scripts

```bash
# Development
npm run dev              # Start both proxy and dashboard
npm run dev:proxy        # Start only proxy server
npm run dev:dashboard    # Start only dashboard

# Database
npm run db:migrate       # Run Prisma migrations
npm run db:studio        # Open Prisma Studio (DB GUI)

# Build
npm run build            # Build all packages
```

---

## Configuration

### Environment Variables

See `.env.example` for all available options:

- `PORT` - Proxy server port (default: 3001)
- `DATABASE_URL` - SQLite database location
- `ENCRYPTION_KEY` - 32-character key for API key encryption (REQUIRED)
- `CORS_ORIGIN` - Dashboard URL for CORS (default: http://localhost:3000)

### Security Notes

⚠️ **IMPORTANT**: Change `ENCRYPTION_KEY` in production!

```bash
# Generate a secure random key
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Roadmap

### Phase 1: Core Proxy ✅
- [x] Request logging
- [x] Token tracking
- [x] Cost calculation
- [x] Analytics API

### Phase 2: Dashboard (In Progress)
- [ ] React dashboard UI
- [ ] Real-time charts
- [ ] Tag management
- [ ] Alert configuration

### Phase 3: Advanced Features
- [ ] Budget forecasting
- [ ] Anomaly detection
- [ ] Export to CSV
- [ ] Slack/Discord webhooks

### Phase 4: Extensions
- [ ] Chrome extension
- [ ] Obsidian plugin
- [ ] VS Code extension

---

## Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

MIT © Jay Patel

---

## Support

- **Issues**: [GitHub Issues](https://github.com/jayismeta/claudewatch/issues)
- **Twitter**: [@jayismeta](https://twitter.com/jayismeta)
- **Email**: jay@jayismeta.com

---

**Built by a human, not AI slop.**

*The last craftsman in a sea of automation.*
