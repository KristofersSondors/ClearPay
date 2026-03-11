import type { Subscription } from '../types/app'

export function getMonthlyEquivalent(sub: Subscription): number {
  switch (sub.frequency) {
    case 'weekly':
      return sub.price * 52 / 12
    case 'monthly':
      return sub.price
    case 'yearly':
      return sub.price / 12
    default:
      return sub.price
  }
}

export function getMonthlySpend(subscriptions: Subscription[]): number {
  const active = subscriptions.filter((s) => s.status === 'active')
  return active.reduce((sum, sub) => sum + getMonthlyEquivalent(sub), 0)
}

export function getYearlyProjection(subscriptions: Subscription[]): number {
  return getMonthlySpend(subscriptions) * 12
}

export function getActiveSubscriptionsCount(subscriptions: Subscription[]): number {
  return subscriptions.filter((s) => s.status === 'active').length
}

export function getUpcomingPayments(
  subscriptions: Subscription[],
  days: number = 7
): Subscription[] {
  const active = subscriptions.filter((s) => s.status === 'active')
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const end = new Date(now)
  end.setDate(end.getDate() + days)

  return active
    .filter((sub) => {
      const date = new Date(sub.nextPaymentDate)
      date.setHours(0, 0, 0, 0)
      return date >= now && date <= end
    })
    .sort((a, b) => new Date(a.nextPaymentDate).getTime() - new Date(b.nextPaymentDate).getTime())
}

export function getUpcoming7DaysTotal(subscriptions: Subscription[]): number {
  return getUpcomingPayments(subscriptions, 7).reduce((sum, s) => sum + s.price, 0)
}

const CATEGORY_COLORS: Record<string, string> = {
  Entertainment: '#8B7AB8',
  Software: '#EC4899',
  Fitness: '#14B8A6',
  Shopping: '#f59e0b',
  Other: '#6B5B95',
}

export function getCategorySpendData(subscriptions: Subscription[]): { name: string; value: number; color: string }[] {
  const active = subscriptions.filter((s) => s.status === 'active')
  const byCategory = new Map<string, number>()
  for (const sub of active) {
    const cat = sub.category || 'Other'
    byCategory.set(cat, (byCategory.get(cat) ?? 0) + getMonthlyEquivalent(sub))
  }
  return Array.from(byCategory.entries())
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({
      name,
      value: Math.round(value * 100) / 100,
      color: CATEGORY_COLORS[name] ?? '#6B5B95',
    }))
}
