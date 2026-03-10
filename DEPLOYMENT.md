# Deployment Guide - MD to PDF

## ⚠️ Vercel Deployment Issues

This application uses **Puppeteer** for PDF generation, which requires a full Chromium/Chrome browser. **Vercel's serverless environment does not support Puppeteer** out of the box.

### Why This Won't Work on Vercel

1. **No Chromium**: Vercel serverless functions don't have Chrome installed
2. **Serverless Timeout**: PDF generation can take >10 seconds, exceeding Vercel's timeout
3. **File Storage**: `multer` uploads require persistent storage, which serverless doesn't provide
4. **Long-running Server**: Express servers don't fit Vercel's event-driven model

## ✅ Recommended Deployment Platforms

### Option 1: Render (Recommended) 🌟
- **Free tier**: Yes
- **Puppeteer support**: ✅ Yes
- **Easy setup**: ✅ Very easy
- **URL**: https://render.com

**Deploy Steps:**
```bash
# 1. Connect your GitHub repo to Render
# 2. Choose "Web Service"
# 3. Configure:
#    - Build Command: npm install
#    - Start Command: node server.js
#    - Instance Type: Free
# 4. Deploy!
```

### Option 2: Railway
- **Free tier**: Yes
- **Puppeteer support**: ✅ Yes
- **Easy setup**: ✅ Very easy
- **URL**: https://railway.app

**Deploy Steps:**
```bash
# 1. Connect GitHub repo to Railway
# 2. Choose "Deploy from GitHub repo"
# 3. Configure:
#    - Build Command: npm install
#    - Start Command: node server.js
# 4. Deploy!
```

### Option 3: Fly.io
- **Free tier**: Yes
- **Puppeteer support**: ✅ Yes
- **Easy setup**: ✅ Easy
- **URL**: https://fly.io

**Deploy Steps:**
```bash
# Install Fly CLI
curl -L https://fly.io/install.sh | sh

# Login
fly auth login

# Initialize
fly launch

# Deploy
fly deploy
```

### Option 4: Heroku
- **Free tier**: ❌ No
- **Puppeteer support**: ✅ Yes (with buildpacks)
- **Easy setup**: ✅ Very easy
- **URL**: https://heroku.com

**Deploy Steps:**
```bash
# Install Heroku CLI
# Login
heroku login

# Create app
heroku create

# Add Puppeteer buildpack
heroku buildpacks:add https://github.com/jontewks/puppeteer-heroku-buildpack

# Deploy
git push heroku main
```

## 📋 Pre-Deployment Checklist

1. **Environment Variables** (if needed):
   - `PORT`: Usually auto-configured by platform

2. **Required Files**:
   - ✅ `package.json` (exists)
   - ✅ `server.js` (exists)
   - ✅ `.gitignore` (recommended)

3. **Test Locally First**:
   ```bash
   cd /root/.openclaw/workspace-dev-agent/md-to-pdf
   npm install
   npm start
   # Visit http://localhost:3000
   ```

## 🔧 Vercel Deployment (Not Recommended)

If you really want to try Vercel despite the issues, you'll need to:

1. **Refactor the app** to use serverless-compatible PDF generation
2. **Replace Puppeteer** with:
   - `@vercel/og` (images only, not PDF)
   - External API (e.g., AWS Lambda with Chrome)
   - `pdf-lib` or `jsPDF` (limited functionality)

3. **Convert Express to Vercel API Routes**:
   - Split `/convert/file` and `/convert/text` into separate functions
   - Use Vercel's Edge Runtime or Node.js runtime
   - Handle stateless execution

**This will require significant code changes.**

## 📊 Quick Comparison

| Platform | Free Tier | Puppeteer | Setup Time | Recommended |
|----------|-----------|-----------|------------|-------------|
| **Render** | ✅ Yes | ✅ Yes | 5 min | ⭐⭐⭐⭐⭐ |
| **Railway** | ✅ Yes | ✅ Yes | 5 min | ⭐⭐⭐⭐⭐ |
| **Fly.io** | ✅ Yes | ✅ Yes | 10 min | ⭐⭐⭐⭐ |
| **Heroku** | ❌ No | ✅ Yes | 5 min | ⭐⭐⭐ |
| **Vercel** | ✅ Yes | ❌ No | - | ⭐ |

## 🚀 My Recommendation

**Use Render or Railway** - they're free, support Puppeteer, and have the easiest setup process. You can deploy this exact codebase without any modifications.

### Quick Deploy to Render:

1. Go to https://render.com
2. Sign up/login with GitHub
3. Click "New +"
4. Select "Web Service"
5. Connect repo: `MotiTheDog/md-to-pdf`
6. Configure:
   - Name: `md-to-pdf`
   - Runtime: Node
   - Build Command: `npm install`
   - Start Command: `node server.js`
7. Click "Deploy Web Service"
8. Wait ~2-3 minutes
9. Your app is live! 🎉

## 📝 Notes

- All platforms above automatically detect the `package.json` and `start` script
- They handle SSL certificates automatically
- They provide a public URL for your application
- Some platforms may spin down free instances after inactivity (cold starts)

---

**Need help?** The deployment process for Render/Railway is very straightforward and should work without any code changes!
