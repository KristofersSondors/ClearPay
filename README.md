# ClearPay

**Subscription management app** — track recurring payments, view spend analytics, and manage subscriptions. Built as a mobile-first prototype with plans for Supabase backend integration.

---

## Project Overview

ClearPay helps users:

- Track subscriptions (Netflix, Spotify, gym, etc.)
- View monthly spend and yearly projections
- See upcoming payments
- Analyze spending by category
- Link bank accounts (planned)

**Current state:** Prototype with mock data. No backend. Two frontends exist:

1. **Web app** — React + Vite + Tailwind (mobile-responsive PWA)
2. **Mobile app** — React Native + Expo (native iOS/Android via Expo Go)

---

## Repository Structure

```
ClearPay/
├── index.html              # Web app entry (Vite)
├── index.js                # Mobile app entry (Expo)
├── App.js                  # Mobile: React Native root + navigation
├── app.json                # Expo config
├── vite.config.ts          # Vite + PWA + Tailwind
├── tsconfig.json           # TypeScript (references)
├── tsconfig.app.json       # App TypeScript config
├── assets/                 # Expo assets (icons, splash) — at root
├── public/                 # Web static assets
├── screens/                # Mobile: React Native screens (.js)
└── src/                    # Web app source
    ├── main.tsx            # Web entry point
    ├── App.tsx             # Web: Router + routes
    ├── index.css            # Tailwind + global styles
    ├── data/
    │   └── mockData.ts     # Mock subscriptions, dashboard, charts
    ├── pages/              # Web screens (route = page)
    │   ├── auth/           # Welcome, Login, Signup
    │   ├── onboarding/     # LinkBanks, LinkBanksComplete
    │   ├── dashboard/
    │   ├── subscriptions/
    │   ├── analytics/
    │   └── settings/
    └── components/
        ├── layout/         # AppLayout, Header, BottomNav, MobileViewport
        ├── features/       # SubscriptionCard
        └── ui/             # Logo, Modal
```

---

## Web App (React + Vite)

### Tech Stack

- **React 19** + **TypeScript**
- **Vite 7** — build tool
- **Tailwind CSS v4** — styling
- **React Router v7** — routing
- **Recharts** — charts (Analytics)
- **Vite PWA** — installable, offline-capable

### Route Structure

| Path                         | Page                | Layout    |
| ---------------------------- | ------------------- | --------- |
| `/`                          | Welcome             | —         |
| `/login`                     | Login               | —         |
| `/signup`                    | Signup              | —         |
| `/onboarding/banks`          | LinkBanks           | —         |
| `/onboarding/banks/complete` | LinkBanksComplete   | —         |
| `/dashboard`                 | Dashboard           | AppLayout |
| `/subscriptions`             | SubscriptionsList   | AppLayout |
| `/subscriptions/add`         | AddSubscription     | AppLayout |
| `/subscriptions/:id`         | SubscriptionDetails | AppLayout |
| `/analytics`                 | Analytics           | AppLayout |
| `/settings`                  | Settings            | AppLayout |
| `/settings/edit-profile`     | EditProfile         | AppLayout |

### Key Patterns

- **Layout:** `AppLayout` wraps authenticated screens with `Header` + `BottomNav`
- **Mobile viewport:** `MobileViewport` constrains width (~430px) for mobile-first design
- **Data:** All data from `src/data/mockData.ts` — replace with API calls later
- **Styling:** Tailwind utility classes. Accent: `#6B5B95` (purple)

### Run Web App

```bash
npm run dev      # Dev server (http://localhost:5173)
npm run build    # Production build → dist/
npm run preview  # Preview production build
```

---

## Mobile App (React Native + Expo)

### Tech Stack

- **Expo SDK 54** — managed workflow
- **React Native 0.81**
- **React Navigation** — Stack + Bottom Tabs
- **react-native-chart-kit** — charts
- **react-native-svg** — SVG for donut chart

### Navigation Structure

```
Stack
├── Welcome
├── Login
├── Register
├── BankLinking
├── Main (Tabs)
│   ├── Home      → DashboardScreen
│   ├── Subs      → SubscriptionsScreen
│   └── Analytics → AnalyticsScreen
├── SubscriptionDetail
├── Settings
├── EditProfile
├── AddSubscription
└── CancellationSuccess
```

### Key Files

- `App.js` — `NavigationContainer` + Stack, defines all screens
- `screens/*.js` — One screen per file, functional components
- Inline: `AppHeader`, `MainTabs`, `StatCard`, `DonutChart` (in App.js / screens)

### Run Mobile App

```bash
npm start        # Expo dev server
npm run android  # Android emulator
npm run ios      # iOS simulator (Mac)
```

Scan QR with Expo Go. Ensure phone and PC on same Wi‑Fi.

---

## Data Layer

**Web:** `src/data/mockData.ts`

- `mockSubscriptions` — subscription list
- `mockDashboardStats` — monthly spend, yearly projection, upcoming
- `mockUpcomingPayments` — next 30 days
- `mockMonthlySpendData`, `mockCategorySpendData` — chart data

**Mobile:** Mock data inline in screens (e.g. `SUBS` in SubscriptionsScreen.js).

**Future:** Replace with Supabase (auth, DB, real-time).

---

## Design System

- **Primary accent:** `#6B5B95` (purple)
- **Background:** `#F5F5F7` / `gray-50`
- **Cards:** White, rounded corners, subtle shadow
- **Mobile-first:** ~430px viewport for web; native for Expo

---

## Conventions for Contributors

### Naming

- **Screens/Pages:** `PascalCase` + `Screen` or descriptive name (e.g. `DashboardScreen`, `Welcome`)
- **Components:** `PascalCase` (e.g. `SubscriptionCard`, `AppLayout`)
- **Hooks:** `use` prefix (e.g. `useSubscriptions`)
- **Utils:** `camelCase` (e.g. `formatCurrency`)

### File Organization

- One component per file
- Co-locate related types/interfaces
- Keep screens thin — logic in hooks/services

### Adding a New Screen (Web)

1. Create `src/pages/<area>/<Name>.tsx`
2. Add route in `src/App.tsx`
3. Use `AppLayout` if authenticated screen
4. Import data from `mockData.ts` or future service

### Adding a New Screen (Mobile)

1. Create `screens/<Name>Screen.js`
2. Add to Stack in `App.js`
3. Use `navigation.navigate('ScreenName')` for links

---

## Environment & Setup

### Prerequisites

- Node.js 20+
- For mobile: Expo Go app (SDK 54) on device

### Install

```bash
npm install
```

### Supabase Auth Setup

Create `.env` in the project root:

```bash
EXPO_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

For the Vite web app, you can also define:

```bash
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

After updating env vars, restart Expo/Vite so the new values are loaded.

### Resolve Merge Conflicts

`package.json` may have merge markers. Ensure scripts include:

- Web: `dev`, `build`, `preview`
- Mobile: `start`, `android`, `ios`

---

## For AI Assistants (Cursor, etc.)

When editing this codebase:

- **Web app** lives in `src/` — use React, Tailwind, React Router patterns
- **Mobile app** lives in `screens/` + `App.js` — use React Native primitives
- **Shared domain:** Subscriptions, dashboard stats, analytics — same concepts, different UI
- **Data:** Web uses `src/data/mockData.ts`; mobile has inline mocks
- **No path aliases** in web app — use relative imports from `src/`
- **Theme:** Purple `#6B5B95`, gray backgrounds, white cards
