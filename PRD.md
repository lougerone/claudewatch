# Token Tracker PRD
## Product Requirements Document v1.0

---

## 1. Product Overview

### 1.1 Product Name
**ClaudeWatch** (or TokenWatch - TBD based on trademark check)

### 1.2 Positioning Statement
Cost visibility and usage analytics for Claude API users. Stop guessing what burns your token budget - know exactly where every token goes.

### 1.3 Problem Statement
Claude API users face three critical problems:
1. **Opacity**: No visibility into token consumption per task/feature
2. **Budget bleed**: Hitting rate limits without understanding why
3. **Optimization blindness**: Can't identify which workflows to optimize

### 1.4 Solution
Real-time token tracking dashboard with:
- Per-request logging and categorization
- Cost attribution by task type
- Visual analytics and trend analysis
- Actionable optimization recommendations

### 1.5 Target Users

**Primary:**
- Solo developers using Claude API
- Indie hackers building AI-powered products
- Consultants managing client API keys

**Secondary:**
- Small dev teams (2-10 people)
- Agencies with multiple Claude projects
- Power users tracking personal usage

---

## 2. Core Features (MVP)

### 2.1 Token Logging Engine

**Functionality:**
- Intercepts Claude API requests/responses
- Extracts token counts from API metadata
- Stores: timestamp, input tokens, output tokens, model, cost
- Supports batch import from logs

**Technical Requirements:**
- Middleware proxy for API calls
- SQLite database (local storage)
- Real-time streaming updates
- Zero performance overhead (<10ms latency)

**User Stories:**
- "As a developer, I want automatic token tracking so I don't manually log usage"
- "As a consultant, I want to import historical API logs to analyze past usage"

### 2.2 Task Categorization

**Functionality:**
- Tag requests with custom categories (coding, writing, research, etc.)
- Auto-categorization via keyword detection
- Bulk re-categorization
- Category-based filtering

**Technical Requirements:**
- Flexible tagging system (1-to-many)
- Pattern matching for auto-tags
- Tag persistence in database
- Tag editing UI

**User Stories:**
- "As a user, I want to tag requests as 'client work' vs 'personal' for billing"
- "As a developer, I want auto-tagging based on prompt keywords"

### 2.3 Analytics Dashboard

**Functionality:**
- Token burn over time (daily/weekly/monthly)
- Cost breakdown by category
- Model usage distribution (Sonnet vs Opus)
- Tool usage frequency (web search, code execution, etc.)
- Request count and average tokens per request

**Technical Requirements:**
- React-based web dashboard
- Responsive design (mobile-friendly)
- Real-time updates via WebSocket
- Export to CSV/JSON

**User Stories:**
- "As a user, I want to see daily token trends to identify spikes"
- "As a manager, I want cost breakdown by project for client billing"

### 2.4 Alerts & Limits

**Functionality:**
- Budget threshold warnings (e.g., "80% of monthly limit")
- Daily/weekly usage summaries
- Anomaly detection (unusual spikes)

**Technical Requirements:**
- Configurable thresholds
- Email/webhook notifications
- Alert history log

**User Stories:**
- "As a user, I want alerts when I'm close to my monthly budget"
- "As a team lead, I want Slack notifications for unusual usage"

---

## 3. Technical Architecture

### 3.1 System Components

```
┌─────────────────┐
│   User App      │
│  (Claude API)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ ClaudeWatch     │
│ Proxy Middleware│ ◄─── Intercepts API calls
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Anthropic API  │
└────────┬────────┘
         │
         ▼
    ┌────────────┐
    │ Database   │
    │ (SQLite)   │
    └─────┬──────┘
          │
          ▼
    ┌────────────┐
    │ Dashboard  │
    │ (React UI) │
    └────────────┘
```

### 3.2 Tech Stack

**Backend:**
- **Runtime**: Node.js (Express)
- **Proxy**: HTTP interceptor middleware
- **Database**: SQLite (local), PostgreSQL (hosted version)
- **ORM**: Prisma or Drizzle
- **Real-time**: WebSocket (Socket.io)

**Frontend:**
- **Framework**: React + TypeScript
- **Styling**: Tailwind CSS (brutalist theme)
- **Charts**: Recharts or Apache ECharts
- **State**: Zustand or React Query

**Infrastructure:**
- **Hosting**: Vercel (frontend + serverless functions)
- **Database**: Vercel Postgres or Supabase
- **Auth**: NextAuth.js (for SaaS tier)

### 3.3 Data Model

```typescript
// Core schema

interface Request {
  id: string;
  timestamp: Date;
  userId: string;
  model: 'sonnet-4-5' | 'opus-4-5' | 'haiku-4-5';
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  cost: number; // USD
  tags: string[];
  toolsUsed: string[]; // ['web_search', 'bash_tool']
  duration: number; // ms
  statusCode: number;
}

interface Tag {
  id: string;
  name: string;
  color: string;
  autoPattern?: string; // regex for auto-tagging
}

interface Alert {
  id: string;
  type: 'budget' | 'spike' | 'daily_summary';
  threshold: number;
  triggered: Date;
  acknowledged: boolean;
}

interface User {
  id: string;
  apiKey: string; // encrypted
  budget: number; // monthly limit
  alerts: Alert[];
}
```

### 3.4 API Endpoints

**Internal API (Dashboard ↔ Backend):**
```
GET  /api/requests          # Fetch requests (paginated, filtered)
POST /api/requests          # Log new request
GET  /api/analytics/daily   # Daily aggregates
GET  /api/analytics/byTag   # Cost breakdown by tag
POST /api/tags              # Create tag
PUT  /api/tags/:id          # Update tag
GET  /api/alerts            # Fetch alerts
POST /api/alerts/config     # Configure alert thresholds
```

**Proxy API (User App → ClaudeWatch → Anthropic):**
```
POST /proxy/v1/messages     # Proxies Anthropic API, logs tokens
```

---

## 4. User Experience

### 4.1 Setup Flow

**Step 1: Installation**
```bash
npm install -g claudewatch
claudewatch init
```

**Step 2: Configuration**
```bash
# .env file
ANTHROPIC_API_KEY=sk-ant-xxxxx
CLAUDEWATCH_PORT=3001
DATABASE_URL=file:./claudewatch.db
```

**Step 3: Proxy Integration**
User changes API endpoint from:
```javascript
// Before
const client = new Anthropic({ apiKey: 'sk-ant-xxxxx' });

// After
const client = new Anthropic({
  apiKey: 'sk-ant-xxxxx',
  baseURL: 'http://localhost:3001/proxy'
});
```

**Step 4: Dashboard Access**
Navigate to `http://localhost:3000` - dashboard auto-opens

### 4.2 Dashboard UI/UX

**Layout: Brutalist Terminal Theme**
- Monospace font (JetBrains Mono)
- High contrast (green on black, classic terminal)
- ASCII art borders/separators
- No rounded corners, drop shadows, or gradients

**Primary Views:**

**1. Overview (Home)**
```
╔════════════════════════════════════════════╗
║ CLAUDEWATCH v1.0                           ║
║ Last 30 Days                               ║
╠════════════════════════════════════════════╣
║ Total Tokens:     2,847,392                ║
║ Total Cost:       $42.71                   ║
║ Requests:         1,284                    ║
║ Avg/Request:      2,217 tokens             ║
╠════════════════════════════════════════════╣
║ BURN RATE (7-day avg)                      ║
║ ████████████████░░░░  $1.89/day            ║
╠════════════════════════════════════════════╣
║ TOP CATEGORIES                             ║
║ [coding]          $18.24  (42.7%)          ║
║ [research]        $12.10  (28.3%)          ║
║ [writing]         $8.45   (19.8%)          ║
║ [other]           $3.92   (9.2%)           ║
╚════════════════════════════════════════════╝
```

**2. Analytics**
- Time series chart (token usage over time)
- Stacked bar chart (tokens by category)
- Pie chart (model distribution)
- Heatmap (usage by hour/day of week)

**3. Requests Log**
Searchable/filterable table:
```
┌──────────────┬────────┬────────┬────────┬─────────┐
│ Timestamp    │ Model  │ Tokens │ Cost   │ Tags    │
├──────────────┼────────┼────────┼────────┼─────────┤
│ 2h ago       │ Sonnet │ 4,521  │ $0.068 │ coding  │
│ 5h ago       │ Opus   │ 12,384 │ $0.371 │ research│
│ 1d ago       │ Sonnet │ 1,203  │ $0.018 │ writing │
└──────────────┴────────┴────────┴────────┴─────────┘
```

**4. Settings**
- API key management
- Budget configuration
- Alert thresholds
- Tag management
- Export data

### 4.3 Mobile Responsiveness

**Priority:**
- Dashboard must work on mobile (responsive grid)
- Charts scale down gracefully
- Critical data visible without scrolling

---

## 5. Distribution Strategy

### 5.1 GitHub (Open Source Core)

**Repository Structure:**
```
claudewatch/
├── packages/
│   ├── core/          # Proxy + logging engine
│   ├── dashboard/     # React UI
│   └── cli/           # CLI tool
├── docs/
│   ├── setup.md
│   ├── api.md
│   └── self-hosting.md
├── examples/
│   ├── express-app/
│   └── nextjs-app/
└── README.md
```

**README Structure:**
1. Hero: "Stop guessing. Track every token."
2. Demo GIF (dashboard in action)
3. Quick start (3 commands)
4. Features list
5. Architecture diagram
6. Contributing guidelines
7. License (MIT)

**Launch Checklist:**
- [ ] Polished README with screenshots
- [ ] CI/CD (GitHub Actions)
- [ ] Docker image published
- [ ] npm package published
- [ ] Documentation site (Vercel)

### 5.2 Vercel Hosting (SaaS Version)

**Deployment:**
- `claudewatch.vercel.app` (or custom domain)
- Serverless functions for API
- Vercel Postgres for database
- NextAuth for user accounts

**Hosting Tiers:**

**Free Tier:**
- Self-hosted only (GitHub)
- Community support

**Hosted Pro ($9/mo):**
- Managed hosting on Vercel
- 30-day data retention
- Email alerts
- CSV export

**Team Tier ($49/mo):**
- Multi-user access
- 90-day retention
- Slack webhooks
- Priority support

---

## 6. Success Metrics

### 6.1 MVP Metrics (Month 1)

**Adoption:**
- 100 GitHub stars
- 50 npm downloads
- 10 self-hosted deployments

**Engagement:**
- 5 active daily users
- 3 community contributions (PRs/issues)

**Revenue (SaaS):**
- 5 paid subscribers ($45 MRR)

### 6.2 Growth Metrics (Month 3)

**Adoption:**
- 500 GitHub stars
- 500 npm downloads/week
- 100 self-hosted deployments

**Engagement:**
- 50 active daily users
- 20 community contributions

**Revenue:**
- 50 paid subscribers ($450 MRR)
- 5 team tier subscribers ($245 MRR)

---

## 7. Roadmap

### Phase 1: MVP (Weeks 1-2)
- [x] PRD finalized
- [ ] Core proxy middleware
- [ ] SQLite database + schema
- [ ] Basic dashboard (overview + log)
- [ ] CLI tool
- [ ] GitHub repo launch

### Phase 2: Analytics (Week 3)
- [ ] Time series charts
- [ ] Category breakdown
- [ ] Export to CSV
- [ ] Alert system
- [ ] Product Hunt launch

### Phase 3: SaaS (Week 4)
- [ ] Vercel deployment
- [ ] User authentication
- [ ] Subscription billing (Stripe)
- [ ] Multi-user support
- [ ] Documentation site

### Phase 4: Extensions (Month 2+)
- [ ] Chrome extension (web usage tracking)
- [ ] Obsidian plugin
- [ ] VS Code extension
- [ ] Slack bot integration
- [ ] API for third-party integrations

---

## 8. Open Questions / Decisions Needed

### 8.1 Naming
- **ClaudeWatch** (clear, Claude-specific)
- **TokenWatch** (broader, works for other LLMs)
- **TokenScope** (analytics angle)

**Decision:** TBD - trademark check required

### 8.2 Pricing
- Is $9/mo too low? (Undervaluing?)
- Should free tier exist for hosted version? (Freemium drag?)

**Decision:** Start at $9, increase based on value delivery

### 8.3 Data Privacy
- Should we store API keys? (Security risk)
- Option: Users host proxy themselves, dashboard queries locally

**Decision:** Self-hosted = no API key storage. SaaS = encrypted storage.

### 8.4 Competitive Analysis
- Any existing Claude token trackers?
- LangSmith/LangFuse positioning?

**Action:** Research competitive landscape before launch

---

## 9. Risk Assessment

### 9.1 Technical Risks

**Risk:** Proxy adds latency to API calls
- **Mitigation:** Async logging, <10ms overhead target
- **Severity:** Medium

**Risk:** Database grows too large (millions of requests)
- **Mitigation:** Automatic archiving, retention limits
- **Severity:** Low

### 9.2 Market Risks

**Risk:** Anthropic launches native token tracking
- **Mitigation:** Differentiate with advanced analytics
- **Severity:** High

**Risk:** Low adoption (niche problem)
- **Mitigation:** Validate with beta users before full launch
- **Severity:** Medium

### 9.3 Legal Risks

**Risk:** ToS violation (API proxying)
- **Mitigation:** Review Anthropic ToS, get legal input
- **Severity:** High

---

## 10. Go-to-Market Plan

### Week 1: Soft Launch
- [ ] GitHub repo live
- [ ] Post to r/ClaudeAI, r/LangChain
- [ ] Tweet thread from @jayismeta
- [ ] Share in Anthropic Discord

### Week 2: Content Marketing
- [ ] Dev.to article: "I built a token tracker in a weekend"
- [ ] YouTube demo video
- [ ] Reach out to AI dev newsletter curators

### Week 3: Product Hunt
- [ ] PH launch (aim for #1 Product of the Day)
- [ ] Coordinate upvotes/comments
- [ ] Press kit + demo video ready

### Week 4: SaaS Launch
- [ ] Hosted version live
- [ ] Stripe integration tested
- [ ] Onboarding flow polished
- [ ] Twitter Ads campaign ($500 budget)

---

## Next Steps

1. **Finalize naming** (trademark check)
2. **Build MVP** (2-week sprint)
3. **Beta testing** (recruit 10 users)
4. **GitHub launch** (Week 3)
5. **SaaS deployment** (Week 4)

---

**Questions for Jay:**
1. Naming preference: ClaudeWatch vs TokenWatch?
2. Self-hosted only for MVP, or launch SaaS simultaneously?
3. Want me to start building core proxy now?
