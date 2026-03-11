import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type {
  AddSubscriptionInput,
  AppState,
  BankConnection,
  BillingFrequency,
  Preferences,
  Profile,
  Subscription,
  UpdateProfileInput,
} from '../types/app'
import { mockSubscriptions } from '../data/mockData'
import { loadAppState, saveAppState, clearAppState } from '../utils/storage'

function parseFrequency(f: string): BillingFrequency {
  const lower = f.toLowerCase()
  if (lower === 'weekly') return 'weekly'
  if (lower === 'yearly') return 'yearly'
  return 'monthly'
}

function addDays(d: Date, days: number): string {
  const out = new Date(d)
  out.setDate(out.getDate() + days)
  return out.toISOString().slice(0, 10)
}

function getDefaultSubscriptions(): Subscription[] {
  const now = new Date().toISOString()
  const today = new Date()
  const upcomingDates = [2, 5, 8, 14, 20, 25]
  let idx = 0
  return mockSubscriptions.map((m) => ({
    id: m.id,
    name: m.name,
    category: m.category,
    price: m.price,
    frequency: parseFrequency(m.frequency),
    currency: 'USD',
    logo: m.logo,
    logoBg: m.logoBg,
    logoColor: m.logoColor,
    status: 'active' as const,
    nextPaymentDate: addDays(today, upcomingDates[idx++ % upcomingDates.length]),
    notifyDays: 3 as const,
    notifyEnabled: true,
    createdAt: now,
    updatedAt: now,
  }))
}

const defaultProfile: Profile = {
  name: 'Alex Design',
  email: 'alex@example.com',
  avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
}

const defaultBanks: BankConnection[] = [
  { name: 'Swedbank', color: 'text-orange-500', connected: false },
  { name: 'S|E|B', color: 'text-green-700', connected: false },
  { name: 'Revolut', color: 'text-gray-900', connected: false },
  { name: 'Luminor', color: 'text-[#6B5B95]', connected: false },
]

const defaultPreferences: Preferences = {
  currency: 'USD',
  paymentReminders: true,
  marketingEmails: false,
  twoFactorEnabled: false,
}

function getDefaultState(): AppState {
  return {
    subscriptions: getDefaultSubscriptions(),
    profile: { ...defaultProfile },
    banks: defaultBanks.map((b) => ({ ...b })),
    preferences: { ...defaultPreferences },
  }
}

function normalizeLoadedState(loaded: AppState): AppState {
  const prefs = loaded.preferences && typeof loaded.preferences === 'object'
    ? {
        currency: String(loaded.preferences.currency ?? defaultPreferences.currency),
        paymentReminders: Boolean(loaded.preferences.paymentReminders ?? defaultPreferences.paymentReminders),
        marketingEmails: Boolean(loaded.preferences.marketingEmails ?? defaultPreferences.marketingEmails),
        twoFactorEnabled: Boolean(loaded.preferences.twoFactorEnabled ?? defaultPreferences.twoFactorEnabled),
      }
    : defaultPreferences
  return {
    subscriptions: Array.isArray(loaded.subscriptions) ? loaded.subscriptions : getDefaultSubscriptions(),
    profile: loaded.profile && typeof loaded.profile === 'object'
      ? {
          name: String(loaded.profile.name ?? defaultProfile.name),
          email: String(loaded.profile.email ?? defaultProfile.email),
          avatarUrl: String(loaded.profile.avatarUrl ?? defaultProfile.avatarUrl),
        }
      : defaultProfile,
    banks: Array.isArray(loaded.banks) ? loaded.banks : defaultBanks.map((b) => ({ ...b })),
    preferences: prefs,
  }
}

interface AppActions {
  addSubscription: (input: AddSubscriptionInput) => string
  cancelSubscription: (id: string) => void
  updateSubscription: (id: string, updates: Partial<Subscription>) => void
  updateProfile: (input: UpdateProfileInput) => void
  updatePreferences: (updates: Partial<Preferences>) => void
  connectBank: (name: string) => void
  toggleBank: (name: string) => void
  resetAppState: () => void
}

const AppStateContext = createContext<AppState | null>(null)
const AppActionsContext = createContext<AppActions | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(() => {
    const loaded = loadAppState()
    return loaded ? normalizeLoadedState(loaded) : getDefaultState()
  })

  useEffect(() => {
    saveAppState(state)
  }, [state])

  const addSubscription = useCallback((input: AddSubscriptionInput): string => {
    const now = new Date().toISOString()
    const id = `sub-${Date.now()}`
    const logo = input.name.charAt(0).toUpperCase()
    const sub: Subscription = {
      id,
      name: input.name,
      category: input.category,
      price: input.price,
      frequency: input.frequency,
      currency: input.currency,
      logo,
      logoBg: 'bg-[#6B5B95]',
      logoColor: 'text-white',
      status: 'active',
      nextPaymentDate: input.nextPaymentDate,
      notifyDays: 3,
      createdAt: now,
      updatedAt: now,
    }
    setState((prev) => ({
      ...prev,
      subscriptions: [...prev.subscriptions, sub],
    }))
    return id
  }, [])

  const cancelSubscription = useCallback((id: string) => {
    const now = new Date().toISOString()
    setState((prev) => ({
      ...prev,
      subscriptions: prev.subscriptions.map((s) =>
        s.id === id ? { ...s, status: 'cancelled' as const, updatedAt: now } : s
      ),
    }))
  }, [])

  const updateSubscription = useCallback((id: string, updates: Partial<Subscription>) => {
    const now = new Date().toISOString()
    setState((prev) => ({
      ...prev,
      subscriptions: prev.subscriptions.map((s) =>
        s.id === id ? { ...s, ...updates, updatedAt: now } : s
      ),
    }))
  }, [])

  const updateProfile = useCallback((input: UpdateProfileInput) => {
    setState((prev) => ({
      ...prev,
      profile: {
        name: input.name,
        email: input.email,
        avatarUrl: input.avatarUrl ?? prev.profile.avatarUrl,
      },
    }))
  }, [])

  const connectBank = useCallback((name: string) => {
    setState((prev) => ({
      ...prev,
      banks: prev.banks.map((b) =>
        b.name === name ? { ...b, connected: true } : b
      ),
    }))
  }, [])

  const toggleBank = useCallback((name: string) => {
    setState((prev) => ({
      ...prev,
      banks: prev.banks.map((b) =>
        b.name === name ? { ...b, connected: !b.connected } : b
      ),
    }))
  }, [])

  const updatePreferences = useCallback((updates: Partial<Preferences>) => {
    setState((prev) => ({
      ...prev,
      preferences: { ...prev.preferences, ...updates },
    }))
  }, [])

  const resetAppState = useCallback(() => {
    clearAppState()
    setState(getDefaultState())
  }, [])

  const actions = useMemo<AppActions>(
    () => ({
      addSubscription,
      cancelSubscription,
      updateSubscription,
      updateProfile,
      updatePreferences,
      connectBank,
      toggleBank,
      resetAppState,
    }),
    [
      addSubscription,
      cancelSubscription,
      updateSubscription,
      updateProfile,
      updatePreferences,
      connectBank,
      toggleBank,
      resetAppState,
    ]
  )

  return (
    <AppStateContext.Provider value={state}>
      <AppActionsContext.Provider value={actions}>
        {children}
      </AppActionsContext.Provider>
    </AppStateContext.Provider>
  )
}

export function useAppState(): AppState {
  const ctx = useContext(AppStateContext)
  if (!ctx) throw new Error('useAppState must be used within AppProvider')
  return ctx
}

export function useAppActions(): AppActions {
  const ctx = useContext(AppActionsContext)
  if (!ctx) throw new Error('useAppActions must be used within AppProvider')
  return ctx
}
