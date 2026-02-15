# LeadScore - Architecture & Roadmap

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT SIDE (Browser)                │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │           React Components (Client)                 │   │
│  │  - Sidebar (Navigation)                             │   │
│  │  - Dashboard (KPI Cards + Charts)                   │   │
│  │  - Leads Page (Table + Filters)                     │   │
│  │  - Qualified/Disqualified Pages                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                              ↑↓                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │      React Hooks (State Management)                 │   │
│  │  - useState: Local component state                  │   │
│  │  - useEffect: Data fetching                         │   │
  │  - mongodb.ts / Mongoose: Primary data access       │   │
  │  - analytics.ts: Calculate metrics                  │   │
  │  - export.ts: Export functionality                  │   │
  └─────────────────────────────────────────────────────┘   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                            ↓↑
             HTTP Requests (fetch API)
                            ↓↑
┌─────────────────────────────────────────────────────────────┐
  │  - External source connectors (optional)            │   │
  │  - Database query node                              │   │
  │  - REST API connector                               │   │
  │  - Data transformation & mapping                    │   │
  └─────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │            API Routes (REST Endpoints)              │   │
│  │  GET /api/leads                                     │   │
│  │    - Accepts query filters                          │   │
│  │    - Returns filtered leads data                    │   │
│  └─────────────────────────────────────────────────────┘   │
│                              ↓↑                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │        Service Layer (Business Logic)               │   │
│  │  - mongodb.ts / Mongoose: Primary data access       │   │
│  │  - analytics.ts: Calculate metrics                  │   │
  │  - MongoDB (primary)                                │   │
  │  - External sources (Google Sheets, webhooks) opt.  │   │
  │  - Real-time or cached data                         │   │
  └─────────────────────────────────────────────────────┘   │
│  └─────────────────────────────────────────────────────┘   │
│                              ↓↑                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │           Middleware & Cache Layer                  │   │
│  │  - 60-second in-memory cache                        │   │
│  │  - Request validation                               │   │
│  │  - Error handling                                   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                            ↓↑
             Network (HTTPS/REST API)
                            ↓↑
┌─────────────────────────────────────────────────────────────┐
│                 n8n Webhook (Data Source)                   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │          n8n Webhook Endpoint                       │   │
│  │  - Flexible data source integration                 │   │
│  │  - Supports multiple response formats               │   │
│  │  - Authentication optional                          │   │
│  └─────────────────────────────────────────────────────┘   │
│                              ↓↑                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │       n8n Workflow (Data Orchestration)             │   │
│  │  - External source connectors (optional)            │   │
│  │  - Database query node                              │   │
│  │  - REST API connector                               │   │
│  │  - Data transformation & mapping                    │   │
│  └─────────────────────────────────────────────────────┘   │
│                              ↓↑                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │         Data Source (Flexible)                      │   │
│  │  - MongoDB (primary) / External sources (optional)  │   │
│  │  - Real-time or cached data                         │   │
│  │  - Transformations applied by n8n                   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. Initial Page Load (Dashboard)

```
User → Browser
  ↓
Load /app/page.tsx (Server Component)
  ↓
Call getLeadsWithAnalytics()
  ↓
Fetch from n8n Webhook URL
  ↓
Parse and cache results (60 seconds)
  ↓
Render dashboard with data
  ↓
Browser displays analytics
```

### 2. Filtering Leads

```
User clicks "Apply Filters"
  ↓
Frontend calls /api/leads with query params
  ↓
Next.js API Route receives request
  ↓
Validates query parameters
  ↓
Fetches data from cache or n8n Webhook
  ↓
Applies server-side filters
  ↓
Returns filtered JSON response
  ↓
Frontend updates table
```

### 3. Component Hierarchy

```
RootLayout
├── Sidebar (Navigation)
│   ├── Dashboard Link
│   ├── All Leads Link
│   ├── Qualified Leads Link
│   └── Disqualified Leads Link
│
└── Main Content
    ├── DashboardPage
    │   ├── KPIStatCard (x4)
    │   ├── VerdictChart
    │   ├── IndustryChart
    │   ├── TimeSeriesChart
    │   └── BudgetChart
    │
    ├── LeadsPage
    │   ├── FilterBar
    │   └── LeadTable
    │       ├── LeadRow (x100)
    │       ├── VerdictBadge
    │       └── ScoreBadge
    │
    ├── QualifiedLeadsPage
    │   ├── KPIStatCard (x3)
    │   └── LeadTable
    │
    └── DisqualifiedLeadsPage
        ├── KPIStatCard (x3)
        └── LeadTable
```

## Technology Stack Deep Dive

### Frontend

- **React 19**: Latest React with automatic batching, transitions, hooks
- **Next.js 16 (App Router)**: Server Components for performance
- **TypeScript**: Type safety across the codebase
- **Tailwind CSS 4**: Utility-first CSS framework
- **Lucide React**: 400+ consistent icons

### Backend

- **Next.js API Routes**: Serverless functions
- **Node.js**: JavaScript runtime
- **Google Sheets API**: Real-time data source

### Data Visualization

- **Recharts**: React charting library
  - PieChart: Verdict distribution
  - BarChart: Industry & budget
  - LineChart: Trends over time

### Development

- **TypeScript**: Type checking
- **ESLint**: Code linting
- **PostCSS**: CSS processing

## File Structure & Responsibilities

```
app/
├── api/leads/route.ts          # REST API endpoint for leads data
├── layout.tsx                   # Root layout with Sidebar
├── page.tsx                     # Dashboard (Server Component)
├── globals.css                  # Global styles
└── leads/
    ├── page.tsx                # All leads listing (Client Component)
    ├── qualified/page.tsx      # Qualified leads view
    └── disqualified/page.tsx   # Disqualified leads view

components/
├── Sidebar.tsx                 # Navigation sidebar
├── KPIStatCard.tsx            # KPI metric display
├── LeadTable.tsx              # Data table with leads
├── FilterBar.tsx              # Filter controls
├── VerdictBadge.tsx           # Status badge component
├── ScoreBadge.tsx             # Score display component
├── VerdictChart.tsx           # Pie chart
├── IndustryChart.tsx          # Industry bar chart
├── TimeSeriesChart.tsx        # Trend line chart
└── BudgetChart.tsx            # Budget distribution chart

lib/
├── mongodb.ts                 # MongoDB connection (primary data source)
├── analytics.ts               # Analytics calculations & utilities
└── export.ts                  # CSV/JSON export functions

types/
└── lead.ts                    # TypeScript interfaces & types

public/                         # Static assets
```

## Key Design Decisions

### 1. Server Components for Dashboard

**Why**: The dashboard doesn't need interactivity on initial load

- Fetch data server-side for better performance
- Reduce JavaScript sent to browser
- Security: Keep API credentials server-side

```typescript
// page.tsx is a Server Component by default
export default async function DashboardPage() {
  const data = await getLeadsWithAnalytics();
  return <Dashboard data={data} />;
}
```

### 2. Client Components for Interactivity

**Why**: Leads page needs filtering and search

- Interactivity requires JavaScript
- Client-side state management with hooks
- Instant UI feedback

```typescript
"use client";
const [leads, setLeads] = useState<Lead[]>([]);
// User interactions → state updates → re-render
```

### 3. API Route for Data Filtering

**Why**: Server-side filtering is more efficient and secure

- Fewer records sent over network
- Prevents client-side tampering
- Better performance

```typescript
// API handles filtering server-side
const filteredLeads = filterLeads(data.leads, filterOptions);
return NextResponse.json(filteredLeads);
```

### 4. 60-Second Caching

**Why**: Balance between real-time data and webhook response time

- n8n webhook has execution limits
- 60 seconds balances freshness vs. workflow load
- Configurable via `lib/mongodb.ts` or environment variables

### 5. TypeScript for Type Safety

**Why**: Catch errors early

- Prevents runtime bugs
- Improves IDE autocomplete
- Better refactoring

## Performance Characteristics

### Metrics (Baseline)

- **First Page Load**: ~1.2s (with cold cache)
- **Subsequent Loads**: ~300ms (with cache hit)
- **Filter Search**: ~150ms (client-side)
- **API Response**: ~300-800ms (n8n webhook)

### Optimization Strategies

1. **Code Splitting**: Next.js automatic per-route
2. **Image Optimization**: Lucide SVG icons (lightweight)
3. **Data Caching**: 60-second in-memory cache
4. **Lazy Loading**: Charts render client-side
5. **CSS Purging**: Tailwind removes unused styles

### Bottlenecks & Solutions

| Bottleneck                | Impact           | Solution             |
| ------------------------- | ---------------- | -------------------- |
| n8n webhook latency       | 300-800ms        | Optimize workflow    |
| Large datasets (10K+rows) | Memory usage     | Implement pagination |
| Many concurrent users     | API quota        | Add read replicas    |
| Complex analytics         | Calculation time | Precalculate metrics |

## Security Model

### Authentication Flow

```
Service Account (JSON Key)
    ↓
Environment Variables (.env.local)
    ↓
Next.js Server (credentials never exposed)
    ↓
Google Sheets API
```

### Key Security Features

1. **No Client-Side Credentials**: All API calls server-side
2. **Environment Variables**: Webhook URL not in code
3. **Webhook Security**: Use HTTPS only
4. **Input Validation**: Query parameters validated
5. **Rate Limiting**: Can be added via middleware

### Webhook URL Management

1. Secure your n8n instance with authentication
2. Consider using API keys for n8n webhook calls
3. Rotate API keys quarterly
4. Monitor webhook access logs
5. Use HTTPS for all webhook communication

## Scalability Path

### Phase 1: Current Architecture (0-1000 leads)

- n8n webhook data source
- In-memory caching
- Single deployment

### Phase 2: Add Database (1000-10000 leads)

- PostgreSQL primary data source
- n8n for data orchestration/sync
- Redis caching layer
- Horizontal scaling

### Phase 3: Enterprise Scale (10K+ leads)

- Distributed database (Postgres with replicas)
- Multi-region deployment
- Advanced caching (CloudFlare, Redis)
- Analytics separate from operational data

## Future Enhancements

### Planned Features

- [ ] User authentication & roles (Admin/Manager/Viewer)
- [ ] Lead notes & internal comments
- [ ] Lead history & audit trail
- [ ] Bulk import/export (CSV, Excel)
- [ ] Custom fields & scoring models
- [ ] Automated lead scoring
- [ ] Email notifications
- [ ] Slack integration
- [ ] Real-time collaboration
- [ ] Advanced reporting & exports

### Potential Integrations

- **Slack**: Automated lead notifications
- **HubSpot**: Lead sync & CRM integration
- **Salesforce**: Enterprise CRM sync
- **Zapier**: Workflow automation (n8n alternative)
- **Mail Chimp**: Email campaign tracking
- **Analytics**: Analytics integration

## Testing Strategy

### Unit Tests

```typescript
// Test analytics calculations
describe("calculateAnalyticsData", () => {
  it("should calculate qualification rate correctly", () => {
    const leads = [
      /* test data */
    ];
    const result = calculateAnalyticsData(leads);
    expect(result.qualificationRate).toBe(0.5);
  });
});
```

### Integration Tests

```typescript
// Test API endpoint
describe("GET /api/leads", () => {
  it("should filter by verdict", async () => {
    const response = await fetch("/api/leads?verdict=Qualified");
    const data = await response.json();
    expect(data.leads[0].verdict).toBe("Qualified");
  });
});
```

### E2E Tests (Recommended: Playwright)

```typescript
// Test user flow
test("user can filter and view qualified leads", async ({ page }) => {
  await page.goto("http://localhost:3000/leads");
  await page.selectOption("select", "Qualified");
  await page.click('button:has-text("Apply Filters")');
  await expect(page.locator("table tr")).not.toContainText("Disqualified");
});
```

## Monitoring & Observability

### Key Metrics to Track

- **API Response Time**: Target < 1000ms
- **n8n Webhook Status**: Monitor availability & response time
- **Error Rate**: Track failures
- **User Sessions**: Monitor engagement
- **Page Load Time**: Core Web Vitals

### Tools to Consider

- **Vercel Analytics**: Built-in performance monitoring
- **Sentry**: Error tracking & reporting
- **DataDog**: Full-stack monitoring
- **New Relic**: APM & infrastructure

### Logging Strategy

```typescript
// Structured logging
console.log({
  timestamp: new Date().toISOString(),
  level: "info",
  action: "fetch_leads",
  duration: Date.now() - startTime,
  rowCount: leads.length,
});
```

---

**Last Updated**: February 2026
**Current Version**: 1.0.0
