# Render Deployment Guide - Medicine Tracking System API

## Prerequisites
1. GitHub account with your code repository
2. Render.com account (free tier available)
3. MySQL database (options below)

## Step 1: Database Setup

### Option A: Free MySQL on Railway (Recommended for Demo)
1. Go to https://railway.app
2. Sign up/login with GitHub
3. Click "New Project" → "Provision MySQL"
4. Copy the connection string from the "Connect" tab
5. Format: `Server=host;Port=port;Database=railway;User=root;Password=xxx;`

### Option B: Free MySQL on Clever Cloud
1. Go to https://www.clever-cloud.com
2. Create account and new MySQL addon
3. Copy connection details

### Option C: PlanetScale (Generous Free Tier)
1. Go to https://planetscale.com
2. Create database
3. Get connection string

## Step 2: Prepare Your Repository

1. **Commit deployment files to your repo:**
   ```bash
   git add Dockerfile .dockerignore
   git commit -m "Add Render deployment configuration"
   git push origin main
   ```

## Step 3: Deploy to Render

### 3.1 Create Web Service
1. Go to https://dashboard.render.com
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Select the repository: `MedicineTrackingSystem`

### 3.2 Configure Build Settings
- **Name:** `medicine-tracking-api` (or your preferred name)
- **Region:** Choose closest to you (Oregon, Frankfurt, Singapore, etc.)
- **Branch:** `main`
- **Root Directory:** `Backend`
- **Runtime:** `Docker`
- **Instance Type:** `Free` (for demo) or `Starter` (for production)

### 3.3 Set Environment Variables

Click "Advanced" and add these environment variables:

| Key | Value | Notes |
|-----|-------|-------|
| `ASPNETCORE_ENVIRONMENT` | `Production` | Required |
| `ASPNETCORE_URLS` | `http://+:8080` | Required |
| `ConnectionStrings__DefaultConnection` | `Server=xxx;Port=xxx;Database=xxx;User=xxx;Password=xxx;` | Use your MySQL connection string |
| `JWT__SecretKey` | Generate strong key (see below) | ⚠️ CRITICAL - Change from default! |
| `JWT__Issuer` | `MedicineTrackingAPI` | Required |
| `JWT__Audience` | `MedicineTrackingClient` | Required |
| `CORS__AllowedOrigins__0` | `https://your-frontend.com` | Your frontend URL |
| `CORS__AllowedOrigins__1` | `https://www.your-frontend.com` | Optional second origin |

**Generate JWT Secret Key:**
```bash
# On Linux/Mac:
openssl rand -base64 64

# On Windows PowerShell:
[Convert]::ToBase64String((1..64 | ForEach-Object { Get-Random -Maximum 256 }))
```

### 3.4 Deploy
1. Click "Create Web Service"
2. Wait for build to complete (5-10 minutes first time)
3. Your API will be available at: `https://medicine-tracking-api.onrender.com`

## Step 4: Verify Deployment

1. **Check health endpoint:**
   ```bash
   curl https://your-app.onrender.com/api/health
   ```

2. **Test Swagger (if enabled):**
   - Visit: `https://your-app.onrender.com/swagger`

3. **Test authentication:**
   ```bash
   curl -X POST https://your-app.onrender.com/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@hospital.com","password":"Admin123!"}'
   ```

## Step 5: Important Notes for Demo

### ⚠️ Security Considerations (Temporary Demo)
- Default admin credentials are in code (admin@hospital.com / Admin123!)
- Change JWT secret key from default value
- Use environment variables, not hardcoded values
- For production, use proper secrets management

### 💰 Cost Considerations
- **Free Tier Limitations:**
  - Sleeps after 15 min of inactivity (first request takes ~30s)
  - 750 hours/month free
  - Adequate for demos

- **Starter Tier ($7/mo):**
  - No sleep
  - Better for client presentations
  - 400 build minutes/month

### 🔄 Auto-Deploy
- Render automatically deploys when you push to main branch
- Build logs available in dashboard
- Failed deployments automatically rollback

## Step 6: Connect Frontend

Update your frontend `.env` file:
```env
VITE_API_URL=https://your-api.onrender.com/api
```

Or update your frontend config to point to the Render URL.

## Troubleshooting

### Build Fails
1. Check build logs in Render dashboard
2. Verify Dockerfile is in `Backend` directory
3. Ensure all .csproj files are committed

### Database Connection Issues
1. Verify connection string format
2. Check if database allows external connections
3. Verify SSL requirements (add `SslMode=Required` if needed)

### CORS Errors
1. Add your frontend URL to environment variables
2. Format: `CORS__AllowedOrigins__0=https://yoursite.com`
3. No trailing slashes

### API Returns 404
1. Check root directory is set to `Backend`
2. Verify dockerfile builds correctly locally:
   ```bash
   docker build -t test .
   docker run -p 8080:8080 test
   ```

## Monitoring

### View Logs
1. Go to Render dashboard
2. Select your service
3. Click "Logs" tab
4. Real-time logs available

### Metrics
- View requests, CPU, memory usage in dashboard
- Set up alerts for failures

## Updating Deployment

```bash
# Make changes locally
git add .
git commit -m "Your changes"
git push origin main

# Render auto-deploys in ~5 minutes
```

## Rollback

If deployment fails:
1. Go to Render dashboard
2. Click "Events" tab
3. Find working deployment
4. Click "Redeploy"

## Additional Recommendations

### For Production Deployment:
1. ✅ Use Starter tier or higher (no sleep)
2. ✅ Enable HTTPS only (already configured)
3. ✅ Use managed database with backups
4. ✅ Set up monitoring and alerts
5. ✅ Use proper secrets management
6. ✅ Enable rate limiting
7. ✅ Set up staging environment
8. ✅ Configure custom domain
9. ✅ Enable database migrations strategy
10. ✅ Set up CI/CD with tests

### Quick Command Reference

```bash
# Test locally first
dotnet run --project MedicineTracking.Api

# Build Docker image locally
docker build -t medicine-api .
docker run -p 8080:8080 -e ASPNETCORE_ENVIRONMENT=Production medicine-api

# Check deployment
curl https://your-app.onrender.com/api/health
```

## Support

- Render Docs: https://render.com/docs
- Community: https://community.render.com
- Status: https://status.render.com

---

**Deployment Checklist:**
- [ ] Database provisioned and connection string obtained
- [ ] JWT secret key generated
- [ ] Environment variables configured in Render
- [ ] Frontend URL added to CORS settings
- [ ] Code pushed to GitHub
- [ ] Web service created on Render
- [ ] Deployment successful (check logs)
- [ ] API accessible via URL
- [ ] Admin login works
- [ ] Frontend can connect to API
