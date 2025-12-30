# Deployment Checklist

## Pre-Deployment Setup

### 1. Domain Purchase
- [ ] Purchase **calledit.club** domain
  - Recommended registrars:
    - **Namecheap** - $8-12/year
    - **Cloudflare** - At-cost pricing
    - **Google Domains/Squarespace** - Easy but pricier
  - Keep login credentials secure

### 2. Create Supabase Projects

#### Development Project
- [ ] Go to [supabase.com](https://supabase.com)
- [ ] Create new project: `calledit-dev`
- [ ] Save credentials:
  - Project URL: `https://[project-id].supabase.co`
  - Anon/Public Key: `eyJ...`
- [ ] Run schema migration:
  ```bash
  # Copy schema from supabase/schema.sql
  # Paste into SQL Editor in Supabase dashboard
  ```
- [ ] Add test data for development

#### Production Project
- [ ] Create new project: `calledit-production`
- [ ] Save credentials (keep separate from dev!)
- [ ] Run schema migration (same as dev)
- [ ] **DO NOT** add test data (production should start clean)

### 3. Prepare GitHub Repository
- [ ] Ensure code is committed to GitHub
- [ ] Create branches:
  ```bash
  git checkout -b dev
  git push origin dev
  git checkout main
  ```
- [ ] Verify `.gitignore` includes:
  - `.env.local`
  - `node_modules`
  - `.next`

---

## Vercel Deployment

### 1. Initial Setup
- [ ] Go to [vercel.com](https://vercel.com)
- [ ] Sign in with GitHub
- [ ] Click "New Project"
- [ ] Import your `icallit` repository

### 2. Configure Production (main branch)
- [ ] Set Framework Preset: **Next.js**
- [ ] Root Directory: `./` (default)
- [ ] Add Environment Variables:
  ```
  NEXT_PUBLIC_SUPABASE_URL=<production-supabase-url>
  NEXT_PUBLIC_SUPABASE_ANON_KEY=<production-anon-key>
  NEXT_PUBLIC_APP_URL=https://calledit.club
  ```
- [ ] Click "Deploy"
- [ ] Wait for build to complete (~2-3 minutes)

### 3. Configure Development Environment
- [ ] In Vercel dashboard → Settings → Environment Variables
- [ ] Add variables for **Preview** deployments:
  ```
  NEXT_PUBLIC_SUPABASE_URL=<dev-supabase-url>
  NEXT_PUBLIC_SUPABASE_ANON_KEY=<dev-anon-key>
  NEXT_PUBLIC_APP_URL=https://calledit-git-dev-[your-username].vercel.app
  ```

### 4. Add Custom Domain
- [ ] In Vercel → Settings → Domains
- [ ] Add domain: `calledit.club`
- [ ] Add domain: `www.calledit.club` (optional)
- [ ] Copy DNS records shown by Vercel
- [ ] Go to your domain registrar's DNS settings
- [ ] Add the DNS records:
  - Type: `A` → Value: `76.76.21.21`
  - Type: `CNAME` → Name: `www` → Value: `cname.vercel-dns.com`
- [ ] Wait for DNS propagation (5-60 minutes)
- [ ] Verify SSL certificate is active (Vercel does this automatically)

---

## Email Setup

### Option 1: Use Personal Email (Immediate)
- [ ] Use your existing email for `support@` inquiries
- [ ] Add email to site footer/contact page
- ✅ **Pros:** Free, immediate
- ❌ **Cons:** Less professional

### Option 2: Email Forwarding (Recommended - FREE)
- [ ] Go to [Cloudflare](https://cloudflare.com)
- [ ] Add your domain to Cloudflare
- [ ] Update nameservers at your registrar to Cloudflare's
- [ ] Enable Email Routing (free)
- [ ] Create forwarding addresses:
  - `hello@calledit.club` → your-email@gmail.com
  - `support@calledit.club` → your-email@gmail.com
- ✅ **Pros:** Free, professional addresses
- ❌ **Cons:** Forwarding only (can't send FROM custom domain easily)

### Option 3: Google Workspace (Professional)
- [ ] Go to [workspace.google.com](https://workspace.google.com)
- [ ] Sign up ($6/user/month)
- [ ] Verify domain ownership
- [ ] Create email accounts:
  - `hello@calledit.club`
  - `support@calledit.club`
  - `your-name@calledit.club`
- ✅ **Pros:** Full email suite, can send/receive
- ❌ **Cons:** $6/month per user

---

## Post-Deployment Verification

### Production Site
- [ ] Visit https://calledit.club
- [ ] Test homepage loads correctly
- [ ] Test user authentication (sign up/login)
- [ ] Create a test prediction
- [ ] View feed page
- [ ] Test share functionality
- [ ] Verify OG images generate correctly
- [ ] Test on mobile device
- [ ] Check browser console for errors

### Development Site
- [ ] Push a commit to `dev` branch
- [ ] Verify Vercel auto-deploys preview
- [ ] Test new features on dev before merging to main

---

## Ongoing Workflow

### Making Changes
1. **Local Development:**
   ```bash
   npm run dev
   # Test changes at localhost:3000
   ```

2. **Deploy to Dev:**
   ```bash
   git checkout dev
   git add .
   git commit -m "Add new feature"
   git push origin dev
   # Vercel auto-deploys to preview URL
   ```

3. **Deploy to Production:**
   ```bash
   git checkout main
   git merge dev
   git push origin main
   # Vercel auto-deploys to calledit.club
   ```

### Monitoring
- [ ] Set up Vercel Analytics (free tier)
- [ ] Monitor Supabase usage dashboard
- [ ] Check error logs in Vercel dashboard

---

## Troubleshooting

### Build Fails
- Check Vercel build logs
- Verify all environment variables are set
- Test build locally: `npm run build`

### Database Connection Issues
- Verify Supabase URL and keys are correct
- Check Supabase project is not paused (free tier pauses after inactivity)
- Verify RLS policies allow public access where needed

### Domain Not Working
- Wait 24-48 hours for full DNS propagation
- Use [dnschecker.org](https://dnschecker.org) to verify DNS records
- Clear browser cache
- Try incognito/private browsing mode

---

## Security Checklist

- [ ] Never commit `.env.local` to git
- [ ] Keep production Supabase keys separate from dev
- [ ] Enable Supabase RLS policies for all tables
- [ ] Set up Vercel password protection for preview deployments (optional)
- [ ] Review Supabase auth settings
- [ ] Enable 2FA on Vercel account
- [ ] Enable 2FA on Supabase account

### Supabase Security Configuration (Critical)
Since the application connects directly to Supabase from the client, you must restrict access at the platform level:

#### 1. API Side (CORS)
- Go to **Supabase Dashboard** -> **Settings** -> **API**
- Find **"Allow list"** under **"API Settings"**
- **Add your domains**:
  - `http://localhost:3000` (for local dev)
  - `https://your-project.vercel.app` (for preview)
  - `https://calledit.club` (production)
- **Save**. This prevents other websites from calling your database even if they have your Anon Key.

#### 2. Authentication URL Configuration
- Go to **Supabase Dashboard** -> **Authentication** -> **URL Configuration**
- **Site URL**: Set to your production URL `https://calledit.club`
- **Redirect URLs**: Add all valid callback URLs:
  - `http://localhost:3000/auth/callback`
  - `https://calledit.club/auth/callback`
  - `https://[your-vercel-url].vercel.app/auth/callback`
- **Save**. This prevents phishing attacks that try to redirect users to malicious sites after login.


---

## Cost Breakdown (Monthly)

| Service | Free Tier | Paid (if needed) |
|---------|-----------|------------------|
| Vercel | ✅ Unlimited (hobby) | $20/month (Pro) |
| Supabase | ✅ 500MB DB, 1GB file storage | $25/month (Pro) |
| Domain | - | ~$1/month (.club) |
| Email (Cloudflare) | ✅ Free forwarding | - |
| Email (Google Workspace) | - | $6/user/month |

**Total to start:** $1/month (just domain)  
**With Google Workspace:** $7/month

---

## Next Steps After Launch

- [ ] Set up Google Analytics or Vercel Analytics
- [ ] Create social media accounts (@calleditclub)
- [ ] Set up error monitoring (Sentry, free tier)
- [ ] Create backup strategy for Supabase data
- [ ] Document API/database schema
- [ ] Create user documentation/FAQ
