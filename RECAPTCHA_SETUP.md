# reCAPTCHA Setup Instructions for FarmChops

## ✅ What's Already Done

The frontend code is ready! Here's what's been implemented:

1. ✅ Installed `react-google-recaptcha-v3` package
2. ✅ Added `GoogleReCaptchaProvider` to App.tsx
3. ✅ Updated Contacts page to use reCAPTCHA
4. ✅ Added environment variable configuration

## 🔑 Step 1: Get Your reCAPTCHA Keys

1. Go to [Google reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin/create)
2. Click "+ Create" or register a new site
3. Fill in:
   - **Label**: `Farmchops Contact Form`
   - **reCAPTCHA type**: Choose **reCAPTCHA v3** (recommended)
   - **Domains**: Add your domains:
     - `farmchops.com`
     - `www.farmchops.com`
     - `localhost` (for testing)
4. Click **Submit**
5. Copy your **Site Key** (for frontend) and **Secret Key** (for backend)

## 🎨 Step 2: Configure Frontend

Update your `.env` file with your reCAPTCHA Site Key:

```env
VITE_API_BASE_URL=https://api.farmchops.com/api
VITE_RECAPTCHA_SITE_KEY=your-actual-site-key-from-google
```

**Important**: Replace `your-actual-site-key-from-google` with the actual Site Key from Step 1.

## 🔧 Step 3: Configure Backend

The backend should already have reCAPTCHA verification implemented. Just make sure your backend `.env` file has:

```env
RECAPTCHA_SECRET_KEY=your-actual-secret-key-from-google
```

**Important**: This is a different key than the Site Key! Use the Secret Key from Step 1.

## 🧪 Step 4: Test

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to the Contact page
3. Fill out and submit the contact form
4. Check:
   - Form submits successfully
   - No errors in console
   - reCAPTCHA badge appears in bottom-right corner
   - Backend logs show reCAPTCHA verification success

## 🚀 Step 5: Deploy

1. Add `VITE_RECAPTCHA_SITE_KEY` to your production environment variables
2. Deploy your frontend
3. Make sure backend has `RECAPTCHA_SECRET_KEY` in production
4. Test the contact form on production

## 🔒 Security Notes

- **Score threshold**: Backend is set to 0.5 (moderate security)
  - 0.0 - 0.3: Likely a bot (blocked)
  - 0.3 - 0.7: Suspicious
  - 0.7 - 1.0: Likely human (allowed)

- **Action name**: Must match between frontend (`contact_form`) and backend

- **Never expose your secret key** - keep it only in backend `.env`

## 📝 How It Works

1. User fills out contact form
2. On submit, frontend calls `executeRecaptcha('contact_form')` to get a token
3. Token is sent to backend along with form data
4. Backend verifies token with Google's API
5. If score is above threshold (0.5), message is accepted
6. Otherwise, request is rejected as potential spam

## 🎯 Expected Result

✅ Spam bot submissions will be blocked automatically
✅ Real users can submit without any extra steps (invisible reCAPTCHA)
✅ You'll see "This site is protected by reCAPTCHA" notice on the form

---

## Need Help?

If you encounter issues:

1. **"reCAPTCHA not available"**: Make sure `VITE_RECAPTCHA_SITE_KEY` is set in `.env`
2. **Invalid site key**: Double-check your Site Key from Google reCAPTCHA console
3. **Verification failed**: Check that backend has correct Secret Key
4. **Domain not allowed**: Add your domain in reCAPTCHA console settings

Check browser console and backend logs for specific error messages.
