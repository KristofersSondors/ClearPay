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

## Notes

- Vite-specific files, dependencies, and scripts were removed.
- The repository is now configured for Expo-first development.
