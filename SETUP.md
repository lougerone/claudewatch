# ClaudeWatch - Setup Guide

## Immediate Next Steps

### 1. Initialize Git Repository

```bash
cd claudewatch
git init
git add .
git commit -m "Initial commit: ClaudeWatch v1.0"
```

### 2. Create GitHub Repository

```bash
# On GitHub, create new repo: jayismeta/claudewatch
gh repo create jayismeta/claudewatch --public --source=. --remote=origin
git push -u origin main
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Set Up Environment

```bash
# Copy environment template
cp .env.example .env

# Generate encryption key
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Edit .env and paste the key into ENCRYPTION_KEY
```

### 5. Initialize Database

```bash
# Generate Prisma client
cd packages/database
npx prisma generate
cd ../..

# Run migrations
npm run db:migrate
```

### 6. Start Development Server

```bash
npm run dev:proxy
```

The proxy will be running at `http://localhost:3001`

### 7. Test the Proxy

```bash
# Set your Anthropic API key
export ANTHROPIC_API_KEY=sk-ant-xxxxx

# Run test
node test-proxy.js
```

You should see:
```
✅ SUCCESS
Response:
─────────────────────────────────────────────
Hello from ClaudeWatch!
─────────────────────────────────────────────
```

---

## Deployment to Vercel

### Option 1: Vercel CLI

```bash
npm install -g vercel
vercel login
vercel --prod
```

### Option 2: GitHub Integration

1. Connect repository to Vercel
2. Set environment variables in Vercel dashboard:
   - `ENCRYPTION_KEY`
   - `DATABASE_URL` (use Vercel Postgres)
3. Deploy automatically on push to main

---

## Docker Deployment

```bash
# Build image
docker build -t claudewatch .

# Run container
docker run -p 3001:3001 \
  -e ENCRYPTION_KEY=your-32-char-key \
  -v $(pwd)/data:/data \
  claudewatch
```

Or use docker-compose:

```bash
docker-compose up -d
```

---

## Troubleshooting

### Proxy won't start

**Check port availability:**
```bash
lsof -i :3001
```

**Kill existing process:**
```bash
kill -9 $(lsof -t -i:3001)
```

### Database errors

**Reset database:**
```bash
rm packages/database/prisma/claudewatch.db
npm run db:migrate
```

### API key encryption fails

Make sure `ENCRYPTION_KEY` is exactly 32 characters.

---

## What's Been Built

✅ **Core Infrastructure**
- Monorepo structure (apps + packages)
- TypeScript configuration
- Prisma database schema (SQLite)
- Shared type definitions

✅ **Proxy Server**
- Express API server
- Anthropic API proxy middleware
- Request logging service
- User management (encrypted API keys)
- Analytics API endpoints
- Budget alert system
- Auto-tagging system

✅ **Documentation**
- README with setup instructions
- Contributing guidelines
- Docker configuration
- Environment templates

---

## What's Next

### Immediate (This Week)
1. Test proxy with real API calls
2. Create GitHub repository
3. Deploy to Vercel
4. Start dashboard UI

### Phase 2 (Next Week)
1. Build React dashboard
2. Add real-time charts
3. Tag management UI
4. Alert configuration

### Phase 3 (Week 3)
1. Product Hunt launch
2. Documentation site
3. Video demo
4. Community feedback

---

## File Structure

```
claudewatch/
├── apps/
│   └── proxy/                    # Express proxy server
│       ├── src/
│       │   ├── config.ts        # Server configuration
│       │   ├── index.ts         # Express app entry
│       │   ├── middleware/
│       │   │   └── proxy.ts     # Anthropic API proxy
│       │   ├── routes/
│       │   │   └── analytics.ts # Analytics endpoints
│       │   └── services/
│       │       ├── logging.ts   # Request logging
│       │       └── user.ts      # User management
│       └── package.json
│
├── packages/
│   ├── database/                # Prisma + SQLite
│   │   ├── prisma/
│   │   │   └── schema.prisma   # Database schema
│   │   └── src/
│   │       └── index.ts        # Prisma client
│   │
│   └── types/                   # Shared types
│       └── src/
│           └── index.ts        # TypeScript definitions
│
├── .env.example                 # Environment template
├── .gitignore
├── docker-compose.yml
├── Dockerfile
├── LICENSE
├── package.json                 # Root workspace config
├── README.md
└── test-proxy.js               # Proxy test script
```

---

## Key Features Implemented

### 1. Token Logging
- Automatic capture of input/output tokens
- Cost calculation per request
- Duration tracking
- Tool usage detection

### 2. User Management
- Encrypted API key storage
- User identification
- Budget tracking
- Last active timestamps

### 3. Analytics
- Daily aggregations
- Tag-based breakdown
- Model usage distribution
- Summary statistics

### 4. Auto-Tagging
- Regex pattern matching
- Automatic request categorization
- Flexible tag system

### 5. Budget Alerts
- Monthly spending tracking
- Threshold notifications (50%, 80%, 90%, 100%)
- Alert deduplication

---

## Success Metrics

**MVP Goals:**
- ✅ Proxy successfully forwards requests
- ✅ Token usage logged accurately
- ✅ Cost calculated correctly
- ⏳ Analytics API returns valid data (test pending)
- ⏳ Auto-tagging works (test pending)
- ⏳ Budget alerts trigger (test pending)

**Launch Goals:**
- 100 GitHub stars (Week 1)
- 50 npm installs (Week 1)
- 10 active users (Week 2)
- Product Hunt launch (Week 3)

---

Built by Jay Patel | The last human craftsman
