# ClearPay

<<<<<<< HEAD
A subscription management app that helps you track, analyze, and manage your recurring payments. Built as a mobile-first PWA (Progressive Web App) so you can install it on your phone and use it like a native app.

---

## Current Status

**Phase 1 (Complete):** Design prototype — all screens are built with React and match the Figma design. No backend yet; it's a clickable prototype with mock data and client-side navigation.

**Phase 2 (Planned):** Backend integration with Supabase (auth, database, storage).
=======
Subscription management mobile app prototype.
>>>>>>> 906dd08117aa16fb4aa060e3987c82834f844a1d

---

## Tech Stack

<<<<<<< HEAD
| Layer   | Technology                    |
| ------- | ----------------------------- |
| Build   | Vite + React 18 + TypeScript  |
| Styling | Tailwind CSS v4               |
| Routing | React Router v6               |
| Charts  | Recharts                      |
| PWA     | Vite PWA plugin               |

---

## Screens & Routes

| Route                    | Screen                 | Description                                      |
| ------------------------ | ---------------------- | ------------------------------------------------ |
| `/`                      | Welcome                | Landing page with Log In and Sign Up             |
| `/login`                 | Sign In                | Email/password form, Google sign-in option       |
| `/signup`                | Create Account         | Step 1: name, email, password                   |
| `/onboarding/banks`      | Link Bank Accounts     | Step 2: connect banks (Swedbank, SEB, etc.)      |
| `/dashboard`             | Dashboard              | Monthly spend, yearly projection, upcoming       |
| `/subscriptions`         | Subscriptions List     | Search & filter, subscription cards              |
| `/subscriptions/:id`     | Subscription Details   | View/edit, cancel, notification settings         |
| `/subscriptions/add`     | Add Subscription       | Manual entry form                                |
| `/analytics`             | Analytics              | Monthly trend chart, spend by category           |
| `/settings`              | Settings               | Profile, banks, preferences, sign out            |
| `/settings/edit-profile` | Edit Profile           | Edit name, email, avatar, password               |
=======
### Framework
- **Expo SDK 54** — managed workflow, runs via Expo Go on device
- **React Native 0.81.5** — cross-platform mobile UI

### Navigation
- **@react-navigation/native** — core navigation container
- **@react-navigation/stack** — stack navigator for auth/onboarding screens
- **@react-navigation/bottom-tabs** — bottom tab bar for main app (Home, Subs, Analytics)

### Charts
- **react-native-chart-kit** — line chart (Monthly Spend Trend)
- **react-native-svg** — SVG rendering required by chart-kit, also used for the custom donut chart

### Native Modules
| Package | Purpose |
|---|---|
| `react-native-screens` | Native screen containers (performance) |
| `react-native-safe-area-context` | Safe area insets (notch, home indicator) |
| `react-native-gesture-handler` | Native gesture support required by React Navigation |
>>>>>>> 906dd08117aa16fb4aa060e3987c82834f844a1d

---

## Project Structure

```
<<<<<<< HEAD
src/
├── components/
│   ├── layout/       # Header, BottomNav, AppLayout, MobileViewport
│   ├── ui/           # Logo, Modal
│   └── features/     # SubscriptionCard
├── pages/
│   ├── auth/         # Welcome, Login, Signup
│   ├── onboarding/   # LinkBanks, LinkBanksComplete
│   ├── dashboard/
│   ├── subscriptions/
│   ├── analytics/
│   └── settings/
├── data/
│   └── mockData.ts   # Mock subscriptions, dashboard stats, charts
├── App.tsx
└── main.tsx
=======
ClearPay/
├── App.js                        # Root — navigation setup, app header
├── app.json                      # Expo config
├── package.json
├── screens/
│   ├── WelcomeScreen.js          # Landing screen (Log In / Sign Up)
│   ├── LoginScreen.js            # Sign in form + Google button
│   ├── RegisterScreen.js         # Create account form
│   ├── BankLinkingScreen.js      # Connect Swedbank / SEB / Revolut / Luminor
│   ├── DashboardScreen.js        # Spend stats + upcoming payments
│   ├── SubscriptionsScreen.js    # Searchable subscription list
│   ├── SubscriptionDetailScreen.js # Details + cancel + notification settings
│   ├── AnalyticsScreen.js        # Line chart + donut chart
│   ├── SettingsScreen.js         # Profile, banks, preferences, sign out
│   ├── EditProfileScreen.js      # Edit name, email, password
│   ├── AddSubscriptionScreen.js  # Manual subscription entry
│   └── CancellationSuccessScreen.js # Confirmation after cancel
>>>>>>> 906dd08117aa16fb4aa060e3987c82834f844a1d
```

---

<<<<<<< HEAD
## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Install

```bash
npm install
```

### Run

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). The app is wrapped in a mobile viewport (~430px) so it looks like a phone screen on desktop.

### Build

```bash
npm run build
```

### Preview production build

```bash
npm run preview
```

---

## Design Notes

- **Mobile-first:** Layout optimized for phone screens; max-width ~430px on desktop.
- **Colors:** Purple accent (`#6B5B95`), muted purple (`#8B7AB8`), green for "Connected", red for trends and Sign Out.
- **PWA:** Installable on phones; add to home screen for an app-like experience.

---

## Phase 2 (Planned)

- Supabase Auth (email/password, Google OAuth)
- Supabase PostgreSQL for subscriptions, profiles, preferences
- Supabase Storage for avatar uploads
- Form validation and real data flow
- Bank linking (mock or real Open Banking integration)
=======
## Navigation Structure

```
Stack Navigator
├── Welcome
├── Login
├── Register
├── BankLinking
├── Main (Bottom Tabs)
│   ├── Home      → DashboardScreen
│   ├── Subs      → SubscriptionsScreen
│   └── Analytics → AnalyticsScreen
├── SubscriptionDetail
├── Settings
├── EditProfile
├── AddSubscription
└── CancellationSuccess
```

---

## Running Locally

### Prerequisites
- Node.js 18+
- [Expo Go](https://expo.dev/go) installed on your phone (SDK 54)

### Start
```bash
npx expo start
```
Scan the QR code with Expo Go (Android) or the Camera app (iOS).

---

## Design
Prototype built from Figma mockups. No backend — all data is local mock state.
>>>>>>> 906dd08117aa16fb4aa060e3987c82834f844a1d
