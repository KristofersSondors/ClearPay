# ClearPay

Subscription management mobile app prototype.

---

## Tech Stack

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

---

## Project Structure

```
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
```

---

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
