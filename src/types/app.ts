export type BillingFrequency = 'weekly' | 'monthly' | 'yearly'
export type SubscriptionStatus = 'active' | 'cancelled'
export type NotificationDays = 1 | 3 | 7 | 14

export interface Subscription {
  id: string
  name: string
  category: string
  price: number
  frequency: BillingFrequency
  currency: string
  logo: string
  logoBg: string
  logoColor: string
  status: SubscriptionStatus
  nextPaymentDate: string
  notifyDays: NotificationDays
  notifyEnabled?: boolean
  createdAt: string
  updatedAt: string
}

export interface Profile {
  name: string
  email: string
  avatarUrl: string
}

export interface BankConnection {
  name: string
  color: string
  connected: boolean
}

export interface Preferences {
  currency: string
  paymentReminders: boolean
  marketingEmails: boolean
  twoFactorEnabled: boolean
}

export interface AppState {
  subscriptions: Subscription[]
  profile: Profile
  banks: BankConnection[]
  preferences: Preferences
}

export interface AddSubscriptionInput {
  name: string
  category: string
  price: number
  frequency: BillingFrequency
  currency: string
  nextPaymentDate: string
}

export interface UpdateProfileInput {
  name: string
  email: string
  avatarUrl?: string
}
