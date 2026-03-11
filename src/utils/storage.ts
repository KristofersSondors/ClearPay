import type { AppState } from '../types/app'

const STORAGE_KEY = 'clearpay-app-state'

export function loadAppState(): AppState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as unknown
    if (!parsed || typeof parsed !== 'object') return null
    const state = parsed as Record<string, unknown>
    if (!Array.isArray(state.subscriptions) || !state.profile || !Array.isArray(state.banks)) {
      return null
    }
    return parsed as AppState
  } catch {
    return null
  }
}

export function saveAppState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // ignore
  }
}

export function clearAppState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}
