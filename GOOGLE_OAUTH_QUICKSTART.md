# Google OAuth Quick Setup (5 Minutes)

## Error You're Seeing
```
Unsupported provider: provider is not enabled
```

**Cause:** Google OAuth provider is not enabled in Supabase yet.

## Fix (5 Minutes)

### Step 1: Create Google OAuth Credentials (2 min)

1. Go to: https://console.cloud.google.com/apis/credentials
2. Click **"Create Credentials"** → **"OAuth 2.0 Client ID"**
3. If prompted, configure OAuth consent screen:
   - User Type: **External**
   - App name: **DealPress**
   - User support email: **your email**
   - Developer contact: **your email**
   - Click **Save and Continue** (skip scopes, test users)
4. Create OAuth Client ID:
   - Application type: **Web application**
   - Name: **DealPress**
   - Authorized redirect URIs: **Add this EXACT URL**:
     ```
     https://YOUR-PROJECT-ID.supabase.co/auth/v1/callback
     ```
     Replace `YOUR-PROJECT-ID` with your actual Supabase project ID
     (Find it in Supabase Dashboard → Settings → General)

5. **Copy** the Client ID and Client Secret

### Step 2: Enable Google in Supabase (2 min)

1. Go to: https://app.supabase.com
2. Select your project
3. Go to: **Authentication** → **Providers**
4. Find **Google** and click to configure
5. Toggle **"Enable Google provider"** to ON
6. Paste your **Client ID**
7. Paste your **Client Secret**
8. Click **Save**

### Step 3: Test (1 min)

1. Go to your app: https://your-app.vercel.app/login
2. Click **"Continue with Google"**
3. Should redirect to Google login
4. After login, should redirect back to your dashboard

## Quick Reference

### Where to find your Supabase Project ID:
- Supabase Dashboard → Settings → General → Project ID
- Or check your Supabase URL: `https://[THIS-PART].supabase.co`

### Common Issues:

**"Redirect URI mismatch"**
- Make sure the redirect URI in Google Console EXACTLY matches:
  `https://YOUR-PROJECT-ID.supabase.co/auth/v1/callback`
- No trailing slash
- Use your actual project ID

**"This app hasn't been verified"**
- Normal during development
- Click "Advanced" → "Go to DealPress (unsafe)" to continue testing
- For production, you'll need to verify the app

**"Access blocked: This app has not been verified"**
- Add your email as a test user in Google Console:
  - OAuth consent screen → Test users → Add users
  - Add your Gmail address

## Environment Variables (Already Set)

The Google OAuth is handled entirely by Supabase, so no env vars needed in your app! Just enable it in the Supabase dashboard.

## After Setup

Once Google OAuth is enabled:
- ✅ Users can sign up with Google
- ✅ Users can login with Google
- ✅ Auto-creates user profile + organization
- ✅ Extracts name and avatar from Google

---

**Total Time:** 5 minutes
**Status:** Ready to use immediately after Supabase configuration
