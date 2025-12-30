# OAuth Setup Guide

This guide covers setting up Google and Apple Sign-In for your Called It! app using Supabase authentication.

---

## Google OAuth Setup

### 1. Create Google Cloud Project

1. **Go to [Google Cloud Console](https://console.cloud.google.com/)**
2. **Create a new project:**
   - Click "Select a project" → "New Project"
   - Name: `Called It`
   - Click "Create"

### 2. Configure OAuth Consent Screen

1. **Navigate to:** APIs & Services → OAuth consent screen
2. **User Type:** External
3. **Fill in required fields:**
   - App name: `Called It`
   - User support email: `your-email@example.com`
   - Developer contact: `your-email@example.com`
4. **Scopes:** Add these scopes:
   - `userinfo.email`
   - `userinfo.profile`
5. **Test users (optional):** Add your email for testing
6. **Click "Save and Continue"**

### 2a. Customizing the Consent Screen (Fix "Sign in to [URL]")
To change the app name displayed to users (e.g., from `fgdedmsndzcswojfxuds.supabase.co` to `Called It!`):

1.  **Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials/consent) > APIs & Services > OAuth consent screen**.
2.  **Edit App Info**: Click "Edit App".
3.  **App Name**: Change this field to `Called It!`.
4.  **App Logo**: (Optional) Upload your app icon.
5.  **Save**.


### 3. Create OAuth Credentials

1. **Navigate to:** APIs & Services → Credentials
2. **Click "Create Credentials" → OAuth client ID**
3. **Application type:** Web application
4. **Name:** `Called It Web Client`
5. **Authorized JavaScript origins:**
   ```
   http://localhost:3000
   https://calledit.club
   https://www.calledit.club
   ```
6. **Authorized redirect URIs:**
   ```
   http://localhost:3000/auth/callback
   https://calledit.club/auth/callback
   https://[your-project-ref].supabase.co/auth/v1/callback
   ```
7. **Click "Create"**
8. **Save your credentials:**
   - Client ID: `123456789-abc.apps.googleusercontent.com`
   - Client Secret: `GOCSPX-...`

### 4. Configure Supabase

1. **Go to Supabase Dashboard** → Authentication → Providers
2. **Enable Google provider**
3. **Add credentials:**
   - Client ID: (from step 3)
   - Client Secret: (from step 3)
4. **Copy the Callback URL** shown in Supabase
5. **Verify it matches** the redirect URI in Google Console
6. **Click "Save"**

### 5. Test Google Sign-In

1. **Run your app locally:** `npm run dev`
2. **Click "Sign in with Google"**
3. **Verify you can authenticate**
4. **Check Supabase Dashboard** → Authentication → Users to see new user

---

## Apple Sign-In Setup

### 1. Apple Developer Account Requirements

- **Apple Developer Program membership** ($99/year)
- **Enrolled as an organization** (not individual) for production apps
- For testing: Individual account works

### 2. Register App ID

1. **Go to [Apple Developer Portal](https://developer.apple.com/account/)**
2. **Navigate to:** Certificates, Identifiers & Profiles → Identifiers
3. **Click "+" to create new identifier**
4. **Select:** App IDs → Continue
5. **Fill in details:**
   - Description: `Called It`
   - Bundle ID: `club.calledit.app` (or your chosen ID)
   - **Enable "Sign in with Apple"** capability
6. **Click "Continue" → Register**

### 3. Create Services ID

1. **Navigate to:** Identifiers → Click "+"
2. **Select:** Services IDs → Continue
3. **Fill in details:**
   - Description: `Called It Web`
   - Identifier: `club.calledit.service` (must be different from App ID)
4. **Enable "Sign in with Apple"**
5. **Click "Configure" next to Sign in with Apple:**
   - Primary App ID: Select your App ID from step 2
   - Domains and Subdomains:
     ```
     calledit.club
     [your-project-ref].supabase.co
     ```
   - Return URLs:
     ```
     https://[your-project-ref].supabase.co/auth/v1/callback
     ```
6. **Click "Save" → Continue → Register**

### 4. Create Private Key

1. **Navigate to:** Keys → Click "+"
2. **Key Name:** `Called It Sign in with Apple Key`
3. **Enable:** Sign in with Apple
4. **Click "Configure":**
   - Select your Primary App ID
5. **Click "Save" → Continue → Register**
6. **Download the key file** (.p8 file)
   - ⚠️ **You can only download this once!** Save it securely
7. **Note your Key ID** (10-character string, e.g., `ABC123DEFG`)

### 5. Get Team ID

1. **In Apple Developer Portal**, click your name (top right)
2. **View Membership**
3. **Copy your Team ID** (10-character string, e.g., `XYZ987TEAM`)

### 6. Configure Supabase

1. **Go to Supabase Dashboard** → Authentication → Providers
2. **Enable Apple provider**
3. **Add credentials:**
   - Services ID: `club.calledit.service` (from step 3)
   - Team ID: (from step 5)
   - Key ID: (from step 4)
   - Private Key: (paste contents of .p8 file from step 4)
     ```
     -----BEGIN PRIVATE KEY-----
     MIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkwdwIBAQQg...
     -----END PRIVATE KEY-----
     ```
4. **Click "Save"**

### 7. Test Apple Sign-In

1. **Deploy to production** (Apple Sign-In doesn't work on localhost)
2. **Visit your production site**
3. **Click "Sign in with Apple"**
4. **Verify authentication works**
5. **Check Supabase Dashboard** → Users

---

## Update Your App Code

Your app already has the UI components for OAuth. Verify these are in place:

### LoginButton Component
```tsx
// src/components/auth/LoginButton.tsx
// Should already have Google and Apple sign-in buttons
```

### Supabase Client
```tsx
// src/lib/supabase.ts
// Should already be configured
```

---

## Environment Variables

No additional environment variables needed! Supabase handles OAuth configuration through the dashboard.

Your existing `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://[project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

---

## Production Deployment Checklist

### Google OAuth
- [ ] Update Google Console with production domain
- [ ] Add production redirect URI to Google Console
- [ ] Test sign-in on production site
- [ ] Verify email is captured in Supabase

### Apple Sign-In
- [ ] Verify Services ID has production domain
- [ ] Verify Return URLs include production Supabase URL
- [ ] Test sign-in on production site (won't work on localhost)
- [ ] Verify user data is captured in Supabase

---

## Troubleshooting

### Google OAuth Issues

**Error: "redirect_uri_mismatch"**
- Verify redirect URI in Google Console exactly matches Supabase callback URL
- Check for trailing slashes or http vs https

**Error: "Access blocked: This app's request is invalid"**
- Complete OAuth consent screen configuration
- Add required scopes (email, profile)

**Users not appearing in Supabase**
- Check Supabase logs: Authentication → Logs
- Verify RLS policies allow user creation

### Apple Sign-In Issues

**Error: "invalid_client"**
- Verify Services ID matches exactly
- Check Team ID and Key ID are correct
- Ensure private key is complete (including BEGIN/END lines)

**Error: "Invalid domain"**
- Add domain to Services ID configuration
- Wait 24 hours for Apple's DNS verification

**Sign-in button doesn't appear**
- Apple Sign-In only works on HTTPS (production)
- Test on deployed site, not localhost

**Error: "unauthorized_client"**
- Verify Return URL matches Supabase callback exactly
- Check Services ID is enabled for Sign in with Apple

---

## Security Best Practices

- [ ] Never commit private keys to git
- [ ] Store Apple .p8 file securely (password manager)
- [ ] Use different OAuth credentials for dev/prod
- [ ] Enable 2FA on Google Cloud and Apple Developer accounts
- [ ] Regularly review authorized users in OAuth consent screen
- [ ] Monitor authentication logs in Supabase

---

## Cost Summary

| Service | Cost |
|---------|------|
| Google OAuth | Free |
| Apple Developer Program | $99/year |
| Supabase Auth | Free (included in free tier) |

---

## Testing Checklist

### Development
- [ ] Google sign-in works on localhost
- [ ] User data appears in Supabase
- [ ] User can sign out and sign back in
- [ ] Profile information is captured

### Production
- [ ] Google sign-in works on production domain
- [ ] Apple sign-in works on production domain
- [ ] Both providers create users in production Supabase
- [ ] Email addresses are captured correctly
- [ ] Users can switch between providers (same email)

---

## Next Steps

After OAuth is working:
1. Customize user profile fields in Supabase
2. Set up email verification (optional)
3. Configure session duration
4. Add user metadata (avatar, display name)
5. Implement account deletion flow
