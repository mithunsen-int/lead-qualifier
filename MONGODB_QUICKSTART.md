# MongoDB Backend - Quick Start Guide

## Installation ✅ Complete

MongoDB and Mongoose packages have been installed.

## 1. Configure Environment

Add your MongoDB connection string to `.env.local`:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/lead-qualifier?retryWrites=true&w=majority
```

**Options:**

- **MongoDB Atlas** (Recommended for production): https://www.mongodb.com/cloud/atlas
- **Local MongoDB** (Development): `mongodb://localhost:27017/lead-qualifier`

## 2. Test the API

### Create a Lead (n8n Integration)

```bash
curl -X POST http://localhost:3000/api/leads \
  -H "Content-Type: application/json" \
  -d '{
    "budgetScore": 4,
    "authorityScore": 2,
    "needScore": 8,
    "timelineScore": 8,
    "status": "Low Priority Lead",
    "leadScore": 5.5,
    "isQualified": true,
    "leadInfo": {
      "leadName": "John Doe",
      "leadEmail": "john@example.com",
      "companyName": "Tech Corp",
      "jobTitle": "Marketing Manager",
      "coSize": "1-10",
      "techTeamSize": "0"
    }
  }'
```

### Fetch All Leads

```bash
curl "http://localhost:3000/api/leads"
```

### Filter by Qualification / Status

```bash
# Qualified leads (use boolean filter)
curl "http://localhost:3000/api/leads?isQualified=true"

# Alternatively filter by textual status (e.g. Low Priority)
curl "http://localhost:3000/api/leads?status=Low%20Priority%20Lead"
```

### Fetch Single Lead

```bash
curl "http://localhost:3000/api/leads/[LEAD_ID]"
```

Replace `[LEAD_ID]` with the MongoDB ID from creation response.

## 3. File Structure

```
├── lib/
│   └── mongodb.ts              # MongoDB connection utility (singleton)
├── models/
│   └── Lead.ts                 # Mongoose Lead schema with validation
├── app/
│   └── api/
│       └── leads/
│           ├── route.ts        # POST, GET /api/leads
│           └── [id]/
│               └── route.ts    # GET, PATCH, DELETE /api/leads/:id
├── .env.local                  # Environment variables (MONGODB_URI)
└── MONGODB_API.md              # Complete API documentation
```

## 4. Schema Overview

The Lead model includes:

- **Scores**: Budget, Authority, Need, Timeline (0-10)
- **Evidence**: Text explanations for each score
- **Assessment**: Overall assessment, qualification/disqualification reasons
- **Status**: Qualified, Disqualified, Low Priority Lead, pending
- **Lead Info**: Contact details, company info, tech stack
- **Lead Data**: Success criteria, lead type, primary need, proposed solution

## 5. API Endpoints

| Method | Endpoint         | Description                                 |
| ------ | ---------------- | ------------------------------------------- |
| POST   | `/api/leads`     | Create new lead (with duplicate prevention) |
| GET    | `/api/leads`     | Fetch all leads with optional filters       |
| GET    | `/api/leads/:id` | Fetch single lead by ID                     |
| PATCH  | `/api/leads/:id` | Update lead                                 |
| DELETE | `/api/leads/:id` | Delete lead                                 |

## 6. Query Filters

```bash
# Filter by status
?status=Qualified
?status=Disqualified
?status=Low Priority Lead

# Filter by score range
?scoreMin=7
?scoreMax=9

# Filter by date range
?dateFrom=2026-02-01&dateTo=2026-02-28

# Combine filters
?status=Qualified&scoreMin=7&dateFrom=2026-02-01
```

## 7. Integration with n8n

Configure your n8n webhook to POST leads:

```
URL: https://your-domain.com/api/leads
Method: POST
Body: {
  "budgetScore": <number>,
  "authorityScore": <number>,
  "needScore": <number>,
  "timelineScore": <number>,
  "status": "<status>",
  "leadScore": <number>,
  "isQualified": <boolean>,
  "leadInfo": { ... },
  "leadData": { ... }
}
```

## 8. Key Features

✅ **Singleton Pattern**: Prevents multiple MongoDB connections in dev mode  
✅ **Validation**: Mongoose schema enforces data types and required fields  
✅ **Indexing**: Optimized queries for status, score, and date filtering  
✅ **Duplicate Prevention**: Unique email constraint prevents duplicate leads  
✅ **Type Safety**: Full TypeScript support with interfaces  
✅ **Error Handling**: Comprehensive error messages and status codes

## 9. Next Steps

1. Set `MONGODB_URI` in `.env.local`
2. Start your Next.js app: `npm run dev`
3. Test endpoints with the curl commands above
4. Update n8n workflow to send leads to `/api/leads`
5. Update frontend components to use MongoDB endpoints
6. See [MONGODB_API.md](MONGODB_API.md) for complete documentation

## Troubleshooting

**Connection Error?**

- Ensure `MONGODB_URI` is set in `.env.local`
- Verify MongoDB cluster is accessible
- Check IP whitelist in MongoDB Atlas

**Duplicate Email Error?**

- Use PATCH endpoint to update existing lead
- Or use a unique email for testing

**Invalid ObjectId Error?**

- Ensure the lead ID is a valid 24-character hex string
- Copy the `_id` from the POST response

---

For detailed API documentation, see [MONGODB_API.md](MONGODB_API.md)
