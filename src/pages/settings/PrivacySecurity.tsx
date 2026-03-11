import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAppState, useAppActions } from '../../context/AppContext'

export function PrivacySecurity() {
  const navigate = useNavigate()
  const { preferences } = useAppState()
  const { updatePreferences } = useAppActions()
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(preferences.twoFactorEnabled)
  const [successMessage, setSuccessMessage] = useState('')

  function handleSave() {
    updatePreferences({ twoFactorEnabled })
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
        <h1 className="text-2xl font-bold text-gray-900">Privacy & Security</h1>
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
      <div className="space-y-4">
        <div className="p-4 rounded-xl border border-gray-200 bg-white">
          <h2 className="font-medium text-gray-900 mb-2">Data protection</h2>
          <p className="text-sm text-gray-600">
            Your subscription data is stored locally on your device. We use bank-level encryption for any connected accounts.
          </p>
        </div>
        <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 bg-white">
          <div>
            <h2 className="font-medium text-gray-900 mb-1">Two-factor authentication</h2>
            <p className="text-sm text-gray-500">Add an extra layer of security to your account.</p>
          </div>
          <button
            type="button"
            onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
            className={`relative w-12 h-7 rounded-full transition-colors shrink-0 ${
              twoFactorEnabled ? 'bg-[#6B5B95]' : 'bg-gray-200'
            }`}
          >
            <div
              className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                twoFactorEnabled ? 'left-6' : 'left-1'
              }`}
            />
          </button>
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
