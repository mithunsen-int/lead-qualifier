# Deployment & Configuration Guide

## Quick Start

### Local Development

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure n8n Webhook**
   - Create a `.env.local` file with your webhook URL
   - See [Environment Configuration](.env.local.example)

3. **Run development server**

   ```bash
   npm run dev
   ```

4. **Open browser**
   ```
   http://localhost:3000
   ```

## n8n Webhook Setup (Step-by-Step)

### 1. Access or Deploy n8n

**Option A: Use n8n Cloud**

1. Go to [n8n.io](https://n8n.io)
2. Sign up for a free account
3. Create a new workflow

**Option B: Self-Host n8n**

1. Install Docker
2. Run: `docker run -it --rm --name n8n -p 5678:5678 -e NODE_ENV=production n8nio/n8n`
3. Access at `http://localhost:5678`

### 2. Create Data Source Connection

1. In your n8n workflow, add your data source:
   - **Google Sheets**: Use "Google Sheets" node to read from a sheet
   - **Database**: Use "MySQL", "PostgreSQL", or other DB node
   - **API**: Use "HTTP Request" node to fetch from an API
   - **CSV**: Use "Read Binary File" node or import via CSV node

2. Configure your data source credentials

### 3. Create Webhook Node

1. Add a "Webhook" node to your workflow
2. Set HTTP Method to "GET"
3. Copy the webhook URL (it will be displayed)
4. Your webhook URL will look like:
   ```
   https://your-n8n-instance.com/webhook/lead-data
   ```

### 4. Configure Data Format

1. Add a function node to transform your data to match the expected format:

   ```javascript
   return [
     {
       leadId: "L001",
       clientName: "Acme Corp",
       business: "Software",
       industry: "Technology",
       location: "San Francisco",
       budget: 50000,
       // ... other fields
     },
   ];
   ```

2. Return as JSON array or one of these formats:
   - Direct array: `[{...}, {...}]`
   - Object with leads: `{ leads: [{...}] }`
   - Object with data: `{ data: [{...}] }`
   - Object with body: `{ body: [{...}] }`

### 5. Set Environment Variables

Create `.env.local` in your project root:

```bash
# Your n8n webhook URL (with or without trailing /json)
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/lead-data
```

For more details, see [.env.local.example](.env.local.example)

## Deployment Options

### Option 1: Deploy on Vercel (Recommended)

1. **Push to GitHub**

   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/lead-score-board.git
   git push -u origin main
   ```

2. **Connect to Vercel**
   - Go to [Vercel](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Click "Import"

3. **Set Environment Variables**
   - In project settings, go to "Environment Variables"
   - Add: `N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/lead-data`
   - Click "Save"

4. **Deploy**
   - Vercel will automatically deploy your project
   - Your app will be available at `your-project.vercel.app`

### Option 2: Deploy on Railway

1. Push your code to GitHub

2. Go to [Railway](https://railway.app)

3. Create new project → "Deploy from GitHub"

4. Select your repository

5. Add environment variables in settings

6. Deploy!

### Option 3: Deploy on Docker

Create `Dockerfile`:

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

Build and run:

```bash
docker build -t lead-score-board .
docker run -p 3000:3000 \
  -e N8N_WEBHOOK_URL='https://your-n8n-instance.com/webhook/lead-data' \
  lead-score-board
```

### Option 4: Deploy on AWS EC2

1. Launch an EC2 instance (Ubuntu 22.04)

2. Connect via SSH

3. Install Node.js:

   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

4. Clone your repository:

   ```bash
   git clone https://github.com/YOUR_USERNAME/lead-score-board.git
   cd lead-score-board
   ```

5. Install PM2 (process manager):

   ```bash
   npm install -g pm2
   ```

6. Create `.env.local` with your webhook URL:

   ```
   N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/lead-data
   ```

7. Build and start:

   ```bash
   npm install
   npm run build
   pm2 start "npm start" --name "lead-score-board"
   pm2 startup
   pm2 save
   ```

8. Set up Nginx as reverse proxy

## Performance Optimization

### Data Caching

The application caches webhook or database query data for 60 seconds. To adjust:

Edit your cache configuration or [lib/mongodb.ts](lib/mongodb.ts):

```typescript
// Adjust CACHE_DURATION or database polling settings as needed
```

### n8n Optimization

1. **Optimize n8n Workflow**:
   - Minimize data transformations
   - Use n8n's built-in functions instead of JavaScript nodes when possible
   - Enable node execution caching

2. **Response Format**:
   - Return only necessary fields to reduce payload size
   - Use array format instead of nested objects for faster parsing

### Database Integration (Optional)

For high-traffic applications, consider:

1. **Add Database Layer**:
   - Use n8n to sync data to PostgreSQL/MySQL periodically
   - Query from database instead of webhook for every request
   - Set `N8N_WEBHOOK_URL` to database query endpoint

2. **Implement Redis Caching**:
   - Cache webhook responses in Redis
   - Reduce webhook calls for repeated requests
   - Set TTL based on data freshness requirements

## Security Best Practices

✅ **DO:**

- Store webhook URL in environment variables only
- Use `.env.local` for local development (never commit)
- Secure n8n instance with authentication
- Use HTTPS for all webhook endpoints
- Rotate n8n API keys if using authenticated webhooks
- Implement rate limiting on n8n webhook endpoint
- Use HTTPS in production
- Monitor webhook calls and set up alerts

❌ **DON'T:**

- Commit `.env.local` to version control
- Share webhook URLs publicly
- Expose webhook URL in client-side code
- Store credentials in source code
- Use HTTP for webhook endpoints in production
- Skip n8n instance authentication
- Expose error messages with webhook details

## Monitoring & Debugging

### Check Application Logs

**Vercel:**

- Go to project → "Deployments" → "View Logs"

**Local:**

```bash
npm run dev
# Check console for webhook errors
```

### Monitor n8n Webhook

1. Go to your n8n instance
2. In the workflow, check the webhook execution logs
3. Monitor request/response data
4. Check for webhook timeout or error responses

### Enable Debug Logging

In your environment, add:

```bash
DEBUG=app:*
```

### Webhook Health Checks

Monitor webhook endpoint availability:

```bash
curl -I https://your-n8n-instance.com/webhook/lead-data
```

Should return `200 OK` or `400` (for missing data), not `5xx` errors.

## Environment Checklists

### Local Development

- [ ] Node.js 18+ installed
- [ ] `.env.local` file created with `N8N_WEBHOOK_URL`
- [ ] n8n instance running or accessible
- [ ] Webhook endpoint returns correct data format
- [ ] `npm install` completed
- [ ] `npm run dev` works

### Production Deployment

- [ ] Environment variables set in deployment platform
- [ ] `N8N_WEBHOOK_URL` configured correctly
- [ ] HTTPS enabled
- [ ] n8n webhook rate limiting configured
- [ ] Error monitoring configured (Sentry, DataDog)
- [ ] Webhook health monitoring active

## Troubleshooting

### "Cannot find N8N_WEBHOOK_URL"

- Check `.env.local` exists in root directory
- Verify environment variable is set in deployment platform
- Ensure webhook URL is correct and accessible

### "Failed to fetch leads"

- Verify n8n webhook endpoint is active and responding
- Check webhook URL is correct (with `/json` suffix if required)
- Verify webhook returns data in one of the supported formats:
  - Direct array: `[{...}]`
  - `{leads: [{...}]}`
  - `{data: [{...}]}`
  - `{body: [{...}]}`
- Check n8n workflow for errors in the logs
- Verify network connectivity to n8n instance

### "Build fails with TypeScript errors"

- Run `npm run build` locally first
- Fix TypeScript errors before deploying
- Check Node.js version matches (18+)

### "Slow performance"

- Check n8n workflow execution time
- Increase cache duration in your cache layer or [lib/mongodb.ts](lib/mongodb.ts)
- Optimize n8n workflow (remove unnecessary nodes)
- Consider implementing a database layer for large datasets
- Enable CDN caching in deployment platform

### "Webhook timeout errors"

- Check n8n instance performance
- Increase webhook timeout in deployment settings
- Optimize n8n workflow to execute faster
- Consider breaking workflow into smaller steps

## Scaling the Application

### When to Add Database Layer

- **Dataset Size**: > 10,000 rows
- **Concurrent Users**: > 100
- **Query Frequency**: > 1,000 requests/hour
- **Data Freshness**: Real-time updates required

### Webhook Scaling Strategy

1. **Add Caching**:
   - Increase cache duration in your cache layer or [lib/mongodb.ts](lib/mongodb.ts)
   - Implement Redis for distributed caching

2. **Scale n8n**:
   - Use n8n Cloud Professional plan for higher concurrency
   - Add database connection pooling
   - Optimize workflow for speed

3. **Add Database**:
   - Configure n8n to sync data to PostgreSQL periodically
   - Query from database instead of webhook
   - Keep webhook URL pointing to database query endpoint

4. **Load Balancing**:
   - Deploy multiple app instances behind load balancer
   - Separate n8n webhook endpoint
   - Share Redis cache across instances

### Load Testing

```bash
# Install Apache Bench
npm install -g ab

# Load test (1000 requests, 10 concurrent)
ab -n 1000 -c 10 https://your-app.com/api/leads
```

## Maintenance

### Regular Tasks

- **Weekly**: Check application error logs
- **Weekly**: Monitor webhook response times
- **Monthly**: Test webhook endpoint manually
- **Monthly**: Update dependencies (`npm update`)
- **Monthly**: Check n8n workflow for errors
- **Quarterly**: Full security audit
- **Quarterly**: Review and optimize n8n workflow

### Automated Monitoring

Set up webhook health checks:

```bash
# Create health check script
node scripts/health-check.js

# Schedule with cron (Linux/Mac)
*/5 * * * * curl -f https://your-app.com/api/leads || notify-admin
```

### Data Sync with n8n

For optimal performance, configure n8n to:

1. **Cache Data Locally** (if using database):
   - Sync from source to database every 5-15 minutes
   - Webhook queries the database for instant responses

2. **Monitor Sync Status**:
   - Set up n8n error notifications
   - Track sync failures
   - Maintain sync audit logs

## Support & Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Google Sheets API Docs](https://developers.google.com/sheets/api)
- [Vercel Docs](https://vercel.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)

---

**Questions?** Check the main [README.md](README.md) or create an issue in your repository.
