# Deployment Guide

This guide contains step-by-step instructions for deploying the Bitespeed Identity Reconciliation service to Render.com.

## Prerequisites

- GitHub account with this repository
- Render.com account (free)
- PostgreSQL database (we'll use Render's managed PostgreSQL)

## Step 1: Create a Render Account

1. Go to [render.com](https://render.com)
2. Sign up with your GitHub account (easier for deployments)
3. Authorize Render to access your GitHub repositories

## Step 2: Create a PostgreSQL Database on Render

1. On Render Dashboard, click **New** → **PostgreSQL**
2. Configure:
   - **Name**: `bitespeed-db`
   - **Database**: `bitespeed_db`
   - **User**: `bitespeed_user`
   - **Region**: Select closest to you
   - **Plan**: Free tier is fine for testing
3. Click **Create Database**
4. After creation, copy the **Internal Database URL** (you'll need this)
   - Format: `postgresql://bitespeed_user:PASSWORD@hostname:5432/bitespeed_db`

## Step 3: Create a Web Service on Render

1. On Render Dashboard, click **New** → **Web Service**
2. Select your GitHub repository (`bitespeed-identity`)
3. Configure:
   - **Name**: `bitespeed-identity`
   - **Environment**: `Node`
   - **Build Command**: 
     ```
     npm install && npm run build && npx prisma migrate deploy
     ```
   - **Start Command**: 
     ```
     npm run start
     ```
   - **Plan**: Free

4. Add Environment Variables:
   - Click **Advanced** → **Add Environment Variable**
   - Add these variables:
     ```
     Key: DATABASE_URL
     Value: postgresql://bitespeed_user:PASSWORD@hostname:5432/bitespeed_db
     
     Key: NODE_ENV
     Value: production
     
     Key: PORT
     Value: 3000
     ```

5. Click **Create Web Service**
6. Wait for the build and deployment to finish (5-10 minutes)
7. Once deployed, Render will give you a URL like: `https://bitespeed-identity.onrender.com`

## Step 4: Verify Deployment

Test your deployed API:

```bash
# Health check
curl https://bitespeed-identity.onrender.com/health

# Test identify endpoint
curl -X POST https://bitespeed-identity.onrender.com/identify \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","phoneNumber":"1234567890"}'
```

## Step 5: Monitor and Logs

1. Go to your Web Service on Render
2. Click **Logs** tab to see real-time logs
3. Check **Metrics** tab to monitor performance

## Troubleshooting

### Database Connection Failed
- Verify `DATABASE_URL` is correctly set in environment variables
- Check that the PostgreSQL database is running
- Ensure the database URL format is correct

### Build Failed
- Check logs in Render dashboard
- Ensure all dependencies are listed in `package.json`
- Verify TypeScript compiles locally: `npm run build`

### Application Not Starting
- Check that `NODE_ENV=production` is set
- Verify `PORT=3000` is configured
- Check application logs for errors

### Prisma Migration Issues
- Ensure `prisma migrate deploy` is in build command
- Check that schema is valid: `npx prisma validate`
- Verify database is accessible from Render

## Free Plan Limitations

- Deployment pauses after 15 minutes of inactivity
- First request after pause may take 10-30 seconds
- Database might not be available indefinitely on free tier
- For production, upgrade to paid plans

## Future Enhancements for Production

1. **Add Environment Variables**:
   - `LOG_LEVEL` for different log levels
   - `API_TIMEOUT` for request timeout

2. **Performance Optimization**:
   - Add Redis caching layer
   - Implement request rate limiting
   - Add database connection pooling

3. **Monitoring**:
   - Set up error tracking (Sentry)
   - Add application performance monitoring
   - Create health check alerts

4. **Security**:
   - Enable HTTPS (automatic on Render)
   - Add API key authentication
   - Implement CORS restrictions
   - Add request validation middleware

## Next Steps

- Monitor your deployed service
- Test with real data
- Integrate with FluxKart.com or your application
- Consider upgrading to paid plan for production use

---

For more information:
- [Render Documentation](https://render.com/docs)
- [Prisma Deployment Guide](https://www.prisma.io/docs/guides/deployment)
- [Express.js in Production](https://expressjs.com/en/advanced/best-practice-performance.html)
