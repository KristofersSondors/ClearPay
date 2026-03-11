import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAppState, useAppActions } from '../../context/AppContext'

const CURRENCIES = [
  { code: 'USD', symbol: '$', label: 'US Dollar' },
  { code: 'EUR', symbol: '€', label: 'Euro' },
  { code: 'GBP', symbol: '£', label: 'British Pound' },
]

export function CurrencyRegion() {
  const navigate = useNavigate()
  const { preferences } = useAppState()
  const { updatePreferences } = useAppActions()
  const [currency, setCurrency] = useState(preferences.currency)
  const [successMessage, setSuccessMessage] = useState('')

  function handleSave() {
    updatePreferences({ currency })
    setSuccessMessage('Settings saved!')
    setTimeout(() => navigate('/settings'), 800)
  }

  return (
    <div className="px-4 py-6 space-y-6">
      {successMessage && (
        <div className="p-3 rounded-xl bg-green-50 border border-green-200 text-green-800 text-sm font-medium">
          {successMessage}
        </div>
      )}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Currency & Region</h1>
        <Link
          to="/settings"
          className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-[#6B5B95] mt-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Settings
        </Link>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Display currency</label>
        <div className="space-y-2">
          {CURRENCIES.map((c) => (
            <button
              key={c.code}
              type="button"
              onClick={() => setCurrency(c.code)}
              className={`w-full flex items-center justify-between p-4 rounded-xl border text-left transition-colors ${
                currency === c.code
                  ? 'border-[#6B5B95] bg-[#6B5B95]/5'
                  : 'border-gray-200 bg-white hover:bg-gray-50'
              }`}
            >
              <span className="font-medium text-gray-900">{c.label}</span>
              <span className="text-gray-600">{c.code} ({c.symbol})</span>
            </button>
          ))}
        </div>
      </div>
      <button
        onClick={handleSave}
        className="w-full py-3 rounded-xl bg-[#6B5B95] text-white font-medium hover:bg-[#5A4A7D] transition-colors"
      >
        Save
      </button>
    </div>
  )
}
