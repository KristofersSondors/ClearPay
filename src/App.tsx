import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import { MobileViewport } from './components/layout/MobileViewport'
import { AppLayout } from './components/layout/AppLayout'
import { Welcome } from './pages/auth/Welcome'
import { Login } from './pages/auth/Login'
import { Signup } from './pages/auth/Signup'
import { LinkBanks } from './pages/onboarding/LinkBanks'
import { LinkBanksComplete } from './pages/onboarding/LinkBanksComplete'
import { Dashboard } from './pages/dashboard/Dashboard'
import { SubscriptionsList } from './pages/subscriptions/SubscriptionsList'
import { SubscriptionDetails } from './pages/subscriptions/SubscriptionDetails'
import { AddSubscription } from './pages/subscriptions/AddSubscription'
import { Analytics } from './pages/analytics/Analytics'
import { Settings } from './pages/settings/Settings'
import { EditProfile } from './pages/settings/EditProfile'
import { CurrencyRegion } from './pages/settings/CurrencyRegion'
import { Notifications } from './pages/settings/Notifications'
import { PrivacySecurity } from './pages/settings/PrivacySecurity'

function App() {
  return (
    <BrowserRouter>
      <AppProvider>
      <MobileViewport>
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/onboarding/banks" element={<LinkBanks />} />
          <Route path="/onboarding/banks/complete" element={<LinkBanksComplete />} />
          <Route path="/dashboard" element={<AppLayout><Dashboard /></AppLayout>} />
          <Route path="/subscriptions" element={<AppLayout><SubscriptionsList /></AppLayout>} />
          <Route path="/subscriptions/add" element={<AppLayout><AddSubscription /></AppLayout>} />
          <Route path="/subscriptions/:id" element={<AppLayout><SubscriptionDetails /></AppLayout>} />
          <Route path="/analytics" element={<AppLayout><Analytics /></AppLayout>} />
          <Route path="/settings" element={<AppLayout><Settings /></AppLayout>} />
          <Route path="/settings/edit-profile" element={<AppLayout><EditProfile /></AppLayout>} />
          <Route path="/settings/currency" element={<AppLayout><CurrencyRegion /></AppLayout>} />
          <Route path="/settings/notifications" element={<AppLayout><Notifications /></AppLayout>} />
          <Route path="/settings/privacy" element={<AppLayout><PrivacySecurity /></AppLayout>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </MobileViewport>
      </AppProvider>
    </BrowserRouter>
  )
}

export default App
