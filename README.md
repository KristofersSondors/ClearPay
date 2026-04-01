# ClearPay

ClearPay is an Expo-based subscription management app for tracking recurring payments, viewing analytics, and managing account settings.

## Stack

- Expo SDK 54
- React Native 0.81
- React Navigation
- Supabase JS client

## Project Layout

- App.js: app root and navigation setup
- index.js: Expo entry point
- app.json: Expo app config
- screens/: React Native screens
- assets/: icons and splash assets
- lib/: shared utility modules

## Run

1. Install dependencies:

```bash
npm install
```

2. Start development server:

```bash
npm start
```

3. Launch targets:

```bash
npm run ios
npm run android
npm run web
```

## Environment

Create a .env file in the project root:

```bash
EXPO_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

Restart Expo after changing environment variables.

## Enable Banking Sandbox Setup

ClearPay includes a banking bridge backend under `backend/` and a redirect-based
linking flow in the app.

### 1. Configure redirect URLs in Enable Banking app settings

Add these callback URLs to your `redirect_urls` allowlist:

- `http://localhost:4000/api/banking/link/callback`
- `https://YOUR-TUNNEL-DOMAIN/api/banking/link/callback` (for real-device testing)

Important: the app deep link (for example `clearpay://bank/callback`) is **not**
an Enable Banking allowlist URL. Enable Banking redirects to your backend callback,
then backend redirects to app deep link.

### 2. Configure backend environment

Create `backend/.env` (or edit it) with:

```bash
PORT=4000
PUBLIC_BASE_URL=http://localhost:4000
ENABLE_BANKING_MOCK=true
ENABLE_BANKING_BASE_URL=https://api.enablebanking.com
ENABLE_BANKING_REDIRECT_URI=http://localhost:4000/api/banking/link/callback
ENABLE_BANKING_APP_ID=
ENABLE_BANKING_PRIVATE_KEY_PATH=
ENABLE_BANKING_PRIVATE_KEY_PEM=
ENABLE_BANKING_PSU_TYPE=personal
```

For now, `ENABLE_BANKING_MOCK=true` enables local consent simulation and fake
bank subscriptions.

### 2b. Switch to real Enable Banking sandbox mode

When you are ready to use real sandbox bank flows:

1. Set `ENABLE_BANKING_MOCK=false` in `backend/.env`.
2. Fill these required variables:

```bash
ENABLE_BANKING_BASE_URL=https://api.enablebanking.com
ENABLE_BANKING_APP_ID=YOUR_ENABLE_BANKING_APP_ID
ENABLE_BANKING_PRIVATE_KEY_PATH=./YOUR_PRIVATE_KEY_FILE.pem
# or inline form:
# ENABLE_BANKING_PRIVATE_KEY_PEM="-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----"
ENABLE_BANKING_REDIRECT_URI=http://localhost:4000/api/banking/link/callback
ENABLE_BANKING_PSU_TYPE=personal
```

Optional but recommended:

```bash
ENABLE_BANKING_ASPSP_MAP={"swedbank":{"name":"Swedbank","country":"SE"},"seb":{"name":"SEB","country":"SE"},"revolut":{"name":"Revolut","country":"LT"},"luminor":{"name":"Luminor","country":"LT"}}
```

This maps your app bank IDs to Enable Banking ASPSP names/countries.

If testing on a physical device, use a public tunnel and update both:

- `PUBLIC_BASE_URL`
- `ENABLE_BANKING_REDIRECT_URI`

to your tunnel URL callback path.

### 3. Start banking backend

```bash
npm run backend:install
npm run backend:dev
```

Health check URL:

- `http://localhost:4000/health`

### 4. Point app to backend

Add this to your root `.env`:

```bash
EXPO_PUBLIC_BACKEND_URL=http://localhost:4000
```

Restart Expo after env updates.

### 5. Test bank-linking flow

1. Open `Link your bank accounts` screen.
2. Tap `Connect` on any bank.
3. Complete mock consent page in browser.
4. Return to app and confirm bank shows as connected.

## Notes

- Vite-specific files, dependencies, and scripts were removed.
- The repository is now configured for Expo-first development.
