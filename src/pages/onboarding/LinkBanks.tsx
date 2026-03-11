import { Link, useNavigate } from 'react-router-dom'
import { useAppState, useAppActions } from '../../context/AppContext'

export function LinkBanks() {
  const navigate = useNavigate()
  const { banks } = useAppState()
  const { connectBank } = useAppActions()
  const hasConnected = banks.some((b) => b.connected)

  return (
    <div className="min-h-screen bg-white flex flex-col px-6 py-8">
      <div className="w-full max-w-sm mx-auto space-y-6">
        <div className="flex gap-2">
          <div className="h-1 flex-1 rounded-full bg-[#8B7AB8]/50" />
          <div className="h-1 flex-1 rounded-full bg-[#6B5B95]" />
          <div className="h-1 flex-1 rounded-full bg-[#8B7AB8]/30" />
        </div>
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#6B5B95] flex items-center justify-center">
            <span className="text-white font-bold text-xl">C</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900 text-center">
            Link your bank accounts
          </h1>
          <p className="text-sm text-gray-500 text-center">
            Select your bank to securely connect and automatically import subscriptions.
          </p>
        </div>
        <div className="space-y-3">
          {banks.map((bank) => (
            <div
              key={bank.name}
              className={`flex items-center justify-between p-4 rounded-xl ${
                bank.connected
                  ? 'bg-green-50 border border-green-200'
                  : 'border border-gray-200 bg-white'
              }`}
            >
              <span className={`font-medium ${bank.color}`}>{bank.name}</span>
              {bank.connected ? (
                <span className="flex items-center gap-1 text-sm text-green-600 font-medium">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Connected
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => connectBank(bank.name)}
                  className="text-sm text-gray-500 hover:text-[#6B5B95]"
                >
                  Connect
                </button>
              )}
            </div>
          ))}
        </div>
        {hasConnected ? (
          <button
            onClick={() => navigate('/onboarding/banks/complete')}
            className="block w-full py-3 rounded-xl bg-[#6B5B95] text-white font-medium text-center hover:bg-[#5A4A7D] transition-colors"
          >
            Link at least 1 bank
          </button>
        ) : (
          <div
            className="block w-full py-3 rounded-xl bg-[#8B7AB8]/70 text-white font-medium text-center cursor-not-allowed opacity-75"
          >
            Link at least 1 bank
          </div>
        )}
        <Link
          to="/signup"
          className="block text-center text-sm text-gray-500 hover:text-gray-700"
        >
          Back to details
        </Link>
      </div>
    </div>
  )
}
