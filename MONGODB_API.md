# MongoDB Backend Integration Guide

## Overview

This guide covers the MongoDB backend integration for the Lead Qualifier application, including database setup, API endpoints, and usage examples.

## Architecture

### Components

1. **MongoDB Connection Utility** ([lib/mongodb.ts](lib/mongodb.ts))
   - Singleton pattern to prevent multiple connections in development
   - Automatic connection pooling
   - Error handling and logging

2. **Mongoose Schema** ([models/Lead.ts](models/Lead.ts))
   - Type-safe schema with TypeScript interfaces
   - Validation and indexing
   - Compound indexes for optimized queries

3. **API Routes** ([app/api/leads/route.ts](app/api/leads/route.ts), [app/api/leads/[id]/route.ts](app/api/leads/[id]/route.ts))
   - RESTful endpoints for CRUD operations
   - Request validation
   - Error handling

## Setup

### 1. Environment Configuration

Add your MongoDB connection string to `.env.local`:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/lead-qualifier?retryWrites=true&w=majority
```

### Local Development with MongoDB

For local development, you can use a local MongoDB instance:

```env
MONGODB_URI=mongodb://localhost:27017/lead-qualifier
```

To start local MongoDB (with Docker):

```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### Production Deployment

For production, use MongoDB Atlas:

1. Create a free cluster at https://www.mongodb.com/cloud/atlas
2. Create a database user with a strong password
3. Get your connection string
4. Set `MONGODB_URI` in your production environment variables

## API Endpoints

### 1. POST /api/leads

Create a new lead and persist it to MongoDB.

**Purpose**: Accept lead data from n8n workflow and store in database with duplicate prevention.

**Request Body**:

```json
{
  "budgetScore": 4,
  "budgetEvidence": "Original Budget: INR 5-10 lacs...",
  "authorityScore": 2,
  "authorityEvidence": "Lead's role: Marketing Manager...",
  "needScore": 8,
  "needEvidence": "Engagement Intent: Outsourcing...",
  "timelineScore": 8,
  "timelineEvidence": "Timeline: 2-4 Months...",
  "overallAssessment": "Qualified with caveats...",
  "qualificationReason": "Strong need and timely engagement...",
  "disQualificationReason": "No senior decision-maker identified...",
  "recommendedAction": "Qualify further with a stakeholder...",
  "finalStatus": "⚠️ Low Priority Lead",
  "status": "Low Priority Lead",
  "leadScore": 5.5,
  "isQualified": true,
  "leadInfo": {
    "leadName": "Poorwal Oak",
    "leadPhone": "+1 516 263 6555",
    "leadEmail": "joe.costello@castleinteract.com",
    "companyName": "Jyoti World",
    "jobTitle": "Marketing Manager",
    "companyWebsite": "castleinteract.com",
    "leadIndustry": "IT Services (SME)",
    "coSize": "1-10",
    "techTeamSize": "0",
    "location": "Mumbai | New York City, New York, United States",
    "monthlyBudget": "5 - 10 lacs",
    "techStack": ["google-cloud-cdn", "react-js"],
    "opportunity_type": "ECNB",
    "timeline": "2 - 4 Months",
    "receiverEmail": "mithun.sen@intglobal.com",
    "receiverName": "Mithun Sen"
  },
  "leadData": {
    "success_criteria": ["Build one central lead intelligence system..."],
    "lead_type": "Outbound",
    "primary_need": "Data Engg & AIA",
    "proposed_solution": "Automated Lead Management System"
  }
}
```

**Response** (201 Created):

```json
{
  "success": true,
  "message": "Lead created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "budgetScore": 4,
    ...
    "createdAt": "2026-02-12T10:30:00Z",
    "updatedAt": "2026-02-12T10:30:00Z"
  }
}
```

**Error Responses**:

- 400: Missing required fields or validation error
- 409: Duplicate email (lead already exists)
- 500: Server error

**Example cURL**:

```bash
curl -X POST http://localhost:3000/api/leads \
  -H "Content-Type: application/json" \
  -d @lead-data.json
```

### 2. GET /api/leads

Fetch all leads with optional filtering.

**Purpose**: Retrieve leads from MongoDB with support for status, date range, and score filtering.

**Query Parameters**:

- `isQualified` (optional): Filter by qualification boolean. Use `true` to return qualified leads, `false` to return disqualified leads. When provided, `isQualified` takes precedence over `status` for qualified/disqualified filtering.
- `status` (optional): Filter by textual status values (for categories such as `Low Priority Lead` or `pending`). Use this for non-binary statuses.
- `scoreMin` (optional): Minimum lead score (0-10)
- `scoreMax` (optional): Maximum lead score (0-10)
- `dateFrom` (optional): ISO date string (e.g., `2026-02-01`)
- `dateTo` (optional): ISO date string (e.g., `2026-02-28`)

**Response** (200 OK):

```json
{
  "success": true,
  "leads": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "budgetScore": 4,
      "status": "Low Priority Lead",
      "leadScore": 5.5,
      "leadInfo": {
        "leadName": "Poorwal Oak",
        "leadEmail": "joe.costello@castleinteract.com",
        ...
      },
      "createdAt": "2026-02-12T10:30:00Z",
      "updatedAt": "2026-02-12T10:30:00Z"
    }
  ],
  "stats": {
    "total": 1,
    "qualified": 0,
    "disqualified": 0,
    "lowPriority": 1,
    "averageScore": 5.5
  }
}
```

**Example Requests**:

```bash
# Get all leads (MongoDB is used by default)
curl "http://localhost:3000/api/leads"

# Get qualified leads (use boolean filter)
curl "http://localhost:3000/api/leads?isQualified=true"

# Get leads with score >= 7
curl "http://localhost:3000/api/leads?scoreMin=7"

# Get leads from date range
curl "http://localhost:3000/api/leads?dateFrom=2026-02-01&dateTo=2026-02-28"

# Combine filters (isQualified takes precedence over status)
curl "http://localhost:3000/api/leads?isQualified=true&scoreMin=7&dateFrom=2026-02-01"
```

### 3. GET /api/leads/:id

Fetch a single lead by MongoDB ID.

**Purpose**: Retrieve detailed information about a specific lead.

**Path Parameters**:

- `id`: MongoDB ObjectId (24-character hex string)

**Response** (200 OK):

```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "budgetScore": 4,
    "budgetEvidence": "Original Budget: INR 5-10 lacs...",
    "authorityScore": 2,
    "needScore": 8,
    "timelineScore": 8,
    "overallAssessment": "Qualified with caveats...",
    "qualificationReason": "Strong need and timely engagement...",
    "disQualificationReason": "No senior decision-maker identified...",
    "recommendedAction": "Qualify further with a stakeholder...",
    "finalStatus": "⚠️ Low Priority Lead",
    "status": "Low Priority Lead",
    "leadScore": 5.5,
    "isQualified": true,
    "leadInfo": {
      "leadName": "Poorwal Oak",
      "leadPhone": "+1 516 263 6555",
      "leadEmail": "joe.costello@castleinteract.com",
      "companyName": "Jyoti World",
      "jobTitle": "Marketing Manager",
      "companyWebsite": "castleinteract.com",
      "leadIndustry": "IT Services (SME)",
      "coSize": "1-10",
      "techTeamSize": "0",
      "revenue": "0",
      "location": "Mumbai | New York City, New York, United States",
      "businessModel": "",
      "monthlyBudget": "5 - 10 lacs",
      "techStack": ["google-cloud-cdn", "google-cloud-platform", "react-js"],
      "opportunity_type": "ECNB",
      "timeline": "2 - 4 Months",
      "receiverEmail": "mithun.sen@intglobal.com",
      "receiverName": "Mithun Sen"
    },
    "leadData": {
      "success_criteria": ["Build one central lead intelligence system..."],
      "lead_type": "Outbound",
      "primary_need": "Data Engg & AIA",
      "proposed_solution": "Automated Lead Management System"
    },
    "createdAt": "2026-02-12T10:30:00Z",
    "updatedAt": "2026-02-12T10:30:00Z"
  }
}
```

**Error Responses**:

- 400: Invalid MongoDB ObjectId format
- 404: Lead not found
- 500: Server error

**Example Request**:

```bash
curl "http://localhost:3000/api/leads/507f1f77bcf86cd799439011"
```

### 4. PATCH /api/leads/:id

Update a lead's information.

**Purpose**: Modify specific fields of an existing lead.

**Path Parameters**:

- `id`: MongoDB ObjectId

**Request Body** (partial update):

```json
{
  "status": "Qualified",
  "leadScore": 8.5,
  "leadInfo": {
    "leadName": "Updated Name"
  }
}
```

**Response** (200 OK):

```json
{
  "success": true,
  "message": "Lead updated successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "status": "Qualified",
    "leadScore": 8.5,
    ...
  }
}
```

**Example Request**:

```bash
curl -X PATCH http://localhost:3000/api/leads/507f1f77bcf86cd799439011 \
  -H "Content-Type: application/json" \
  -d '{"status": "Qualified", "leadScore": 8.5}'
```

### 5. DELETE /api/leads/:id

Delete a lead from the database.

**Purpose**: Remove a lead record permanently.

**Path Parameters**:

- `id`: MongoDB ObjectId

**Response** (200 OK):

```json
{
  "success": true,
  "message": "Lead deleted successfully"
}
```

**Example Request**:

```bash
curl -X DELETE http://localhost:3000/api/leads/507f1f77bcf86cd799439011
```

## Database Schema

### Lead Schema

| Field                | Type          | Required | Unique | Index | Description                                                      |
| -------------------- | ------------- | -------- | ------ | ----- | ---------------------------------------------------------------- |
| budgetScore          | Number (0-10) | Yes      | No     | Yes   | Budget evaluation score                                          |
| budgetEvidence       | String        | No       | No     | No    | Explanation of budget score                                      |
| authorityScore       | Number (0-10) | Yes      | No     | Yes   | Authority evaluation score                                       |
| authorityEvidence    | String        | No       | No     | No    | Explanation of authority score                                   |
| needScore            | Number (0-10) | Yes      | No     | Yes   | Need evaluation score                                            |
| needEvidence         | String        | No       | No     | No    | Explanation of need score                                        |
| timelineScore        | Number (0-10) | Yes      | No     | Yes   | Timeline evaluation score                                        |
| timelineEvidence     | String        | No       | No     | No    | Explanation of timeline score                                    |
| status               | String        | Yes      | No     | Yes   | Status enum: Qualified, Disqualified, Low Priority Lead, pending |
| leadScore            | Number (0-10) | Yes      | No     | Yes   | Overall lead score                                               |
| isQualified          | Boolean       | Yes      | No     | Yes   | Qualification flag                                               |
| leadInfo             | Object        | Yes      | No     | No    | Lead contact and company information                             |
| leadInfo.leadEmail   | String        | Yes      | Yes    | Yes   | Lead email (unique)                                              |
| leadInfo.leadName    | String        | Yes      | No     | No    | Lead name                                                        |
| leadInfo.companyName | String        | Yes      | No     | No    | Company name                                                     |
| leadData             | Object        | No       | No     | No    | Additional lead data                                             |
| createdAt            | Date          | Auto     | No     | Yes   | Creation timestamp                                               |
| updatedAt            | Date          | Auto     | No     | No    | Last update timestamp                                            |

### Indexes

- `leadEmail` (unique): Prevents duplicate leads
- `status, createdAt`: Optimizes filtering by status
- `leadScore, createdAt`: Optimizes sorting by score

## Integration with n8n

### Webhook Setup

Configure your n8n workflow to send leads to:

```
POST https://your-domain.com/api/leads
```

### n8n Webhook Configuration

```json
{
  "method": "POST",
  "url": "https://your-domain.com/api/leads",
  "headers": {
    "Content-Type": "application/json"
  },
  "body": {
    "budgetScore": "{{ $node.LeadScoring.json.budgetScore }}",
    "authorityScore": "{{ $node.LeadScoring.json.authorityScore }}",
    "needScore": "{{ $node.LeadScoring.json.needScore }}",
    "timelineScore": "{{ $node.LeadScoring.json.timelineScore }}",
    "status": "{{ $node.LeadScoring.json.status }}",
    "leadScore": "{{ $node.LeadScoring.json.leadScore }}",
    "isQualified": "{{ $node.LeadScoring.json.isQualified }}",
    "leadInfo": "{{ $node.ExtractLeadInfo.json.leadInfo }}",
    "leadData": "{{ $node.ExtractLeadInfo.json.leadData }}"
  }
}
```

## Best Practices

### 1. Error Handling

Always check response status and error messages:

```javascript
const response = await fetch("/api/leads", {
  method: "POST",
  body: JSON.stringify(leadData),
});

if (!response.ok) {
  const error = await response.json();
  console.error("API Error:", error.error);
}
```

### 2. Duplicate Prevention

The system automatically prevents duplicate leads using email as the unique identifier. If you attempt to create a lead with an existing email, you'll receive a 409 Conflict error.

To update an existing lead instead, use the PATCH endpoint with the lead's MongoDB ID.

### 3. Filtering Performance

Use indexed fields for filtering:

- `status`: Highly recommended
- `leadScore`: Recommended for score-based filtering
- `createdAt`: Recommended for date range queries

### 4. Pagination (Future Enhancement)

Current implementation retrieves all matching records. For large datasets, consider adding pagination:

```
GET /api/leads?useDb=true&page=1&limit=50
```

## Troubleshooting

### MongoDB Connection Issues

**Error**: "Please define the MONGODB_URI environment variable"

- Ensure `.env.local` has the `MONGODB_URI` variable set

### Duplicate Email Error

**Error**: "Lead with this email already exists" (409)

- Use PATCH to update the existing lead
- Or use a unique email identifier

### Invalid ObjectId Error

**Error**: "Invalid lead ID format" (400)

- Ensure the ID is a valid 24-character hex string
- Copy the `_id` field from the response when creating a lead

## Performance Optimization

### Current Indexes

- Single field indexes on: `budgetScore`, `authorityScore`, `needScore`, `timelineScore`, `status`, `leadScore`, `isQualified`, `createdAt`
- Compound index on: `status, createdAt`
- Compound index on: `leadScore, createdAt`
- Unique index on: `leadInfo.leadEmail`

### Query Examples

```javascript
// Fast: Uses compound index
db.leads.find({ status: "Qualified", createdAt: { $gte: date } });

// Fast: Uses single index
db.leads.find({ leadScore: { $gte: 7 } });

// Slow: No index on leadInfo.leadName
db.leads.find({ "leadInfo.leadName": "John" });
```

## Next Steps

1. Update your n8n workflow to send data to `/api/leads`
2. Update frontend components to use the new MongoDB endpoints
3. Implement real-time dashboard updates
4. Add analytics and reporting features
5. Consider adding authentication to API endpoints
