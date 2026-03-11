import type { Subscription } from '../types/app'

export function filterSubscriptions(
  subscriptions: Subscription[],
  search: string,
  category: string,
  status: string
): Subscription[] {
  let result = [...subscriptions]

  if (search.trim()) {
    const term = search.toLowerCase().trim()
    result = result.filter(
      (s) =>
        s.name.toLowerCase().includes(term) ||
        s.category.toLowerCase().includes(term)
    )
  }

  if (category && category !== 'all') {
    const cat = category.toLowerCase()
    result = result.filter((s) => s.category.toLowerCase() === cat)
  }

  if (status && status !== 'all') {
    const st = status.toLowerCase()
    result = result.filter((s) => s.status === st)
  }

  return result
}
