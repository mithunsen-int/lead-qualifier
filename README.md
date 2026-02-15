# LeadScore - Lead Qualification Portal

A modern, production-ready lead qualification dashboard built with Next.js, TypeScript, Tailwind CSS, and n8n webhook integration for flexible data sourcing.

## 🎯 Features

- **Dashboard Analytics**: Real-time overview of leads with KPI cards and charts
- **Lead Management**: View all leads with advanced filtering and search
- **Lead Filtering**: Filter by verdict, industry, BANT score range
- **Qualified/Disqualified Views**: Dedicated pages for different lead statuses
- **Interactive Charts**:
  - Pie chart: Lead distribution by verdict
  - Bar chart: Leads by industry
  - Line chart: Leads over time
  - Bar chart: Budget distribution
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Dark Mode Ready**: Tailwind CSS built-in dark mode support
- **Secure**: Server-side data fetching, environment-based credentials
- **Performance**: Optimized with Server Components, 60-second caching
- **Flexible Data Source**: Works with any data source via n8n webhook

## 🏗️ Architecture

### Tech Stack

- **Frontend**: React 19, Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Charts**: Recharts
- **Icons**: Lucide React
- **Data Source**: n8n Webhook (supports any backend)
- **API**: REST API routes

### Project Structure

```
lead-score-board/
├── app/
│   ├── api/leads/route.ts           # API endpoint for leads
│   ├── layout.tsx                    # Root layout with sidebar
│   ├── page.tsx                      # Dashboard page
│   ├── leads/
│   │   ├── page.tsx                 # All leads listing
│   │   ├── qualified/page.tsx       # Qualified leads
│   │   └── disqualified/page.tsx    # Disqualified leads
│   └── globals.css                   # Global styles
├── components/
│   ├── Sidebar.tsx                   # Navigation sidebar
│   ├── KPIStatCard.tsx              # KPI metric cards
│   ├── LeadTable.tsx                # Leads data table
│   ├── FilterBar.tsx                # Filter controls
│   ├── VerdictBadge.tsx             # Verdict status badge
│   ├── ScoreBadge.tsx               # Score display
│   ├── VerdictChart.tsx             # Pie chart component
│   ├── IndustryChart.tsx            # Bar chart component
│   ├── TimeSeriesChart.tsx          # Line chart component
│   └── BudgetChart.tsx              # Budget distribution chart
├── lib/
│   ├── mongodb.ts                   # MongoDB connection & data layer
│   └── analytics.ts                 # Analytics calculations
├── types/
│   └── lead.ts                      # TypeScript types
├── .env.local.example               # Environment variables template
└── package.json
```

## 📊 Data Model

### Lead Interface

```typescript
interface Lead {
  id: string;
  clientName: string;
  business: string;
  industry: string;
  location: string;
  budget: number;
  bantScore: number;
  budgetScore: number;
  authorityScore: number;
  needScore: number;
  timingScore: number;
  verdict: "Qualified" | "Disqualified" | "Nurture";
  reason: string;
  createdAt: string; // ISO format
}
```

## 🚀 Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up n8n Webhook

Follow the [n8n Configuration Guide](.env.local.example):

1. Create or access your n8n instance
2. Create a workflow that fetches your lead data
3. Configure a webhook trigger to expose the data
4. Copy the webhook URL

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/lead-data
```

See [.env.local.example](.env.local.example) for detailed instructions and expected data formats.

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

## 📈 Analytics Metrics

The dashboard displays:

- **Total Leads**: Count of all leads in the system
- **Qualified Leads**: Leads meeting qualification criteria
- **Disqualified Leads**: Leads that don't meet criteria
- **Nurture Leads**: Leads requiring further development
- **Qualification Rate**: Percentage of qualified leads
- **Average BANT Score**: Mean BANT score across all leads
- **Budget Distribution**: Leads grouped by budget ranges
- **Industry Distribution**: Top 5 industries by lead count
- **Trends Over Time**: Monthly lead progression by verdict

## 🔧 API Endpoints

### GET /api/leads

Fetch leads with optional filtering.

**Query Parameters:**

- `verdict`: Filter by "Qualified", "Disqualified", or "Nurture"
- `industry`: Filter by industry name
- `scoreMin`: Minimum BANT score (0-100)
- `scoreMax`: Maximum BANT score (0-100)
- `search`: Search by client name or business
- `sortBy`: "date" or "score"
- `sortOrder`: "asc" or "desc"

**Example:**

```
GET /api/leads?verdict=Qualified&scoreMin=70&sortBy=score&sortOrder=desc
```

## 🎨 UI Components

### KPIStatCard

Displays key performance indicators with values, icons, and trend indicators.

### LeadTable

Responsive table showing lead information with sorting and highlighting.

### FilterBar

Advanced filtering with search, verdict filter, industry, and score range.

### VerdictBadge

Color-coded badge displaying lead verdict (Green/Red/Yellow).

### Charts

Interactive Recharts visualizations for analytics and trends.

## 📱 Responsive Design

- Mobile: Full-screen sidebar with hamburger menu
- Tablet: Side-by-side layout
- Desktop: Fixed sidebar + main content

## 🔒 Security

- **Server-side data fetching**: All API calls to n8n webhook are server-side only
- **Credential management**: Service account keys stored in environment variables
- **No client-side exposure**: Credentials never sent to the browser
- **Input validation**: All query parameters validated before use
- **Caching**: 60-second cache to reduce API calls

## 📦 Build & Deployment

### Build for Production

```bash
npm run build
npm start
```

### Deploy on Vercel (Recommended)

```bash
vercel
```

Remember to set environment variables in your deployment platform.

## 🧪 Performance Optimizations

- **Server Components**: Dashboard uses React Server Components for initial load
- **Client Components**: Used only for interactive elements (filters, charts)
- **Data Caching**: 60-second cache for webhook data
- **Code Splitting**: Automatic with Next.js App Router
- **Image Optimization**: Lucide icons are lightweight SVGs
- **CSS**: Tailwind CSS with PurgeCSS removes unused styles

## 📋 Spreadsheet Setup

Your n8n webhook must return data in one of these formats:

- Direct array: `[{...}, {...}]`
- Wrapped in `leads`: `{ leads: [{...}] }`
- Wrapped in `data`: `{ data: [{...}] }`
- Wrapped in `body`: `{ body: [{...}] }`

The following fields are required in each lead object:

- `leadId` or `lead_id` - Unique identifier
- `clientName` or `client_name` - Company or contact name
- `business` - Business type
- `industry` - Industry classification
- `location` - Geographic location
- `budget` - Budget amount (number)
- `bantScore` or `bant_score` - BANT assessment (0-100)
- `budgetScore` or `budget_score` - Budget qualification (0-100)
- `authorityScore` or `authority_score` - Authority level (0-100)
- `needScore` or `need_score` - Need assessment (0-100)
- `timingScore` or `timing_score` - Timing fit (0-100)
- `verdict` - "Qualified", "Disqualified", or "Nurture"
- `reason` - Why verdict was given
- `createdAt` or `created_at` - ISO date string

## 🐛 Troubleshooting

### "Failed to fetch leads from n8n webhook"

- Verify `N8N_WEBHOOK_URL` is correct and accessible
- Check that the webhook is active in your n8n instance
- Ensure webhook returns data in one of the supported formats
- Check n8n workflow logs for errors

### Blank dashboard

- Ensure your n8n webhook is returning data
- Verify field names match expected field mapping
- Check date format is ISO (YYYY-MM-DDTHH:MM:SSZ)

### Slow performance

- Check n8n webhook response time
- Consider increasing cache duration in your cache layer or `lib/mongodb.ts`
- Verify internet connection speed

## 📚 Learning Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [Recharts](https://recharts.org)
- [n8n Documentation](https://docs.n8n.io)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)

## 📝 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions are welcome! Feel free to submit issues and enhancement requests.

---

**Built with ❤️ for sales teams**
