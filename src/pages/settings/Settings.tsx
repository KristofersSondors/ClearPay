import { Link, useNavigate } from 'react-router-dom'
import { useAppState, useAppActions } from '../../context/AppContext'

export function Settings() {
  const navigate = useNavigate()
  const { profile, banks, preferences } = useAppState()
  const { connectBank, toggleBank, resetAppState } = useAppActions()

  function handleSignOut() {
    resetAppState()
    navigate('/')
  }

  function handleBankClick(bank: { name: string; connected: boolean }) {
    if (bank.connected) {
      toggleBank(bank.name)
    } else {
      connectBank(bank.name)
    }
  }

  return (
    <div className="px-4 py-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
      <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
        <div className="flex items-center gap-4">
          <img
            src={profile.avatarUrl}
            alt="Profile"
            className="w-16 h-16 rounded-full object-cover"
          />
          <div className="flex-1">
            <h2 className="font-bold text-gray-900">{profile.name}</h2>
            <p className="text-sm text-gray-500">{profile.email}</p>
            <span className="inline-block mt-2 px-2 py-0.5 rounded-lg bg-gray-100 text-gray-600 text-xs font-medium">
              Free Plan
            </span>
          </div>
          <Link
            to="/settings/edit-profile"
            className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 font-medium text-sm hover:bg-gray-50"
          >
            Edit Profile
          </Link>
        </div>
      </div>
      <div>
        <div className="flex items-center gap-2 mb-2">
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <h2 className="font-semibold text-gray-900">Connected Banks</h2>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          Link your bank accounts to automatically detect subscriptions and recurring payments. We use bank-level 256-bit encryption.
        </p>
        <div className="space-y-2">
          {banks.map((bank) => (
            <div
              key={bank.name}
              className={`flex items-center justify-between p-4 rounded-xl ${
                bank.connected ? 'bg-green-50 border border-green-200' : 'border border-gray-200 bg-white'
              }`}
            >
              <span className={`font-medium ${bank.color}`}>{bank.name}</span>
              {bank.connected ? (
                <button
                  type="button"
                  onClick={() => handleBankClick(bank)}
                  className="flex items-center gap-1 text-sm text-green-600 font-medium hover:underline"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Connected
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleBankClick(bank)}
                  className="text-sm text-gray-500 hover:text-[#6B5B95]"
                >
                  Connect
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
      <div>
        <h2 className="font-semibold text-gray-900 mb-4">Preferences</h2>
        <div className="space-y-2">
          <Link
            to="/settings/currency"
            className="flex items-center justify-between p-4 rounded-xl border border-gray-200 bg-white hover:bg-gray-50"
          >
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              <span className="text-gray-900">Currency & Region</span>
            </div>
            <span className="text-gray-500 text-sm">{
              preferences.currency === 'EUR' ? 'EUR (€)' : preferences.currency === 'GBP' ? 'GBP (£)' : 'USD ($)'
            }</span>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
          <Link
            to="/settings/notifications"
            className="flex items-center justify-between p-4 rounded-xl border border-gray-200 bg-white hover:bg-gray-50"
          >
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="text-gray-900">Notifications</span>
            </div>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
          <Link
            to="/settings/privacy"
            className="flex items-center justify-between p-4 rounded-xl border border-gray-200 bg-white hover:bg-gray-50"
          >
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span className="text-gray-900">Privacy & Security</span>
            </div>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
      <button
        onClick={handleSignOut}
        className="w-full py-3 rounded-xl bg-red-500 text-white font-medium flex items-center justify-center gap-2 hover:bg-red-600 transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        Sign Out
      </button>
      <p className="text-center text-xs text-gray-400">Version 1.2.0 Build 4829</p>
    </div>
  )
}
