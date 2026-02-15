# MongoDB Connection Setup Guide

## Option 1: MongoDB Atlas (Recommended for Production)

### Step 1: Create MongoDB Atlas Account

1. Visit https://www.mongodb.com/cloud/atlas
2. Sign up with email or Google account
3. Create a new organization and project

### Step 2: Create a Cluster

1. Click "Create a Deployment"
2. Choose Shared (Free tier) or Dedicated
3. Select a region close to your servers
4. Wait for cluster to be created (~10 minutes)

### Step 3: Create Database User

1. In Atlas Dashboard, go to "Database Access"
2. Click "Add New Database User"
3. Choose "Password" authentication method
4. Set username: `lead-qualifier`
5. Set password: (generate a strong password)
6. Built-in Role: `readWriteAnyDatabase`
7. Click "Add User"

### Step 4: Get Connection String

1. Go to "Databases" → Your Cluster
2. Click "Connect"
3. Choose "Drivers" → Node.js
4. Copy the connection string
5. Replace `<password>` with your user password
6. Replace `<username>` with your username

### Step 5: Add IP Whitelist (IMPORTANT)

1. Go to "Network Access"
2. Click "Add IP Address"
3. For development: Add `127.0.0.1` (your machine)
4. For production: Add your server's IP
5. Or allow all: `0.0.0.0/0` (not recommended)

### Step 6: Update .env.local

```env
MONGODB_URI=mongodb+srv://lead-qualifier:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/lead-qualifier?retryWrites=true&w=majority
```

---

## Option 2: Local MongoDB (For Development Only)

### Using Docker (Easiest)

```bash
# Install Docker if not already installed
# Then run:
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### Using Homebrew (macOS)

```bash
# Install MongoDB
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB service
brew services start mongodb-community

# Stop when done
brew services stop mongodb-community
```

### Using Homebrew (macOS) - Alternate

```bash
# Using the built-in command
mongod --dbpath /usr/local/var/mongodb
```

### Direct Download (All Platforms)

1. Download from https://www.mongodb.com/try/download/community
2. Install MongoDB
3. Start MongoDB:
   - **Windows**: `mongod.exe` from installation directory
   - **macOS/Linux**: `mongod`

### Update .env.local

```env
MONGODB_URI=mongodb://localhost:27017/lead-qualifier
```

---

## Option 3: MongoDB Atlas Free Tier (Recommended Starting Point)

### Why Use Free Tier?

✅ No credit card required  
✅ 512 MB free storage  
✅ Perfect for testing and development  
✅ Easy upgrade path  
✅ Automatic backups

### Setup Steps

1. Create free cluster (M0 Sandbox)
2. Create database user
3. Get connection string
4. Whitelist your IP
5. Use in `.env.local`

---

## Connection String Format

### MongoDB Atlas

```
mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
```

### Local MongoDB

```
mongodb://localhost:27017/lead-qualifier
```

### With Port (if non-default)

```
mongodb://username:password@host:27017/lead-qualifier
```

---

## Environment Variables

### .env.local Template

```env
# Required for MongoDB backend
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/lead-qualifier?retryWrites=true&w=majority

# Keep existing variables
N8N_WEBHOOK_URL=https://your-n8n-webhook-url

# Optional: Google Sheets integration (if using)
# GOOGLE_SHEETS_API_KEY=your-key
# GOOGLE_SHEETS_ID=your-sheet-id
```

### Development vs Production

**Development (.env.local)**

```
MONGODB_URI=mongodb://localhost:27017/lead-qualifier
```

**Production (.env)**

```
MONGODB_URI=mongodb+srv://prod-user:secure-password@prod-cluster.mongodb.net/lead-qualifier?retryWrites=true&w=majority
```

---

## Testing Connection

### Option 1: Using the Test Script

```bash
npm run dev
./scripts/test-api.sh create
```

### Option 2: Using MongoDB CLI

```bash
# Install mongodb-org-tools (includes mongosh)
# Then connect:
mongosh "mongodb+srv://username:password@cluster.mongodb.net/lead-qualifier"

# Or locally:
mongosh

# Check connection
db.runCommand({ ping: 1 })
```

### Option 3: Using Node.js

```javascript
const mongoose = require("mongoose");

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected!"))
  .catch((err) => console.error("Connection failed:", err));
```

---

## Security Best Practices

### 1. Strong Passwords

Generate with: `openssl rand -base64 32`

### 2. IP Whitelisting

- Development: Only your machine's IP
- Production: Only your server's IP
- Never use `0.0.0.0/0` in production

### 3. Database User Permissions

- Use least privilege principle
- Create separate users for different environments
- Use `readWriteAnyDatabase` minimally

### 4. Connection String Protection

- Never commit `.env.local` to git
- Use environment variables in production
- Rotate passwords periodically

### 5. VPC Peering (Enterprise)

- Connect your application VPC to MongoDB Atlas VPC
- Prevents internet exposure
- For production applications

---

## Troubleshooting

### Connection Timeout

```
Error: connect ECONNREFUSED 127.0.0.1:27017
```

**Solution**: Ensure MongoDB is running locally or check MongoDB Atlas cluster status

### Authentication Failed

```
Error: Authentication failed
```

**Solution**:

- Verify username and password in connection string
- Check IP is whitelisted in MongoDB Atlas
- Ensure user exists in correct database

### Invalid Connection String

```
Error: Invalid connection string
```

**Solution**:

- Check for typos in connection string
- Ensure password is URL-encoded
- Use `mongodb+srv://` for Atlas, `mongodb://` for local

### Cluster Not Ready

```
Error: cluster not ready
```

**Solution**: Wait for Atlas cluster to finish initialization (10-15 minutes)

### Network Error

```
Error: getaddrinfo ENOTFOUND cluster0.xxxxx.mongodb.net
```

**Solution**:

- Check internet connection
- Verify cluster name in connection string
- Try pinging the host: `ping cluster0.xxxxx.mongodb.net`

---

## Verification Checklist

- [ ] Created MongoDB account (Atlas or local)
- [ ] Created/started MongoDB cluster or instance
- [ ] Created database user with password
- [ ] Whitelisted your IP address
- [ ] Copied connection string
- [ ] Updated `.env.local` with `MONGODB_URI`
- [ ] Tested connection with `./scripts/test-api.sh create`
- [ ] All tests passing

---

## Next Steps

1. Complete setup following one of the three options above
2. Update `.env.local` with your MongoDB URI
3. Run `npm run dev` to start development server
4. Test with: `./scripts/test-api.sh all`
5. Check [MONGODB_QUICKSTART.md](MONGODB_QUICKSTART.md) for API usage

---

## Support

For more information:

- MongoDB Docs: https://docs.mongodb.com/
- Mongoose Docs: https://mongoosejs.com/
- MongoDB Atlas Docs: https://docs.atlas.mongodb.com/

Need help? Check the main documentation files:

- [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)
- [MONGODB_API.md](MONGODB_API.md)
- [MONGODB_QUICKSTART.md](MONGODB_QUICKSTART.md)
