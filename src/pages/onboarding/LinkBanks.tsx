import { Link } from 'react-router-dom'

const banks = [
  { name: 'Swedbank', color: 'text-orange-500', connected: false },
  { name: 'S|E|B', color: 'text-green-700', connected: false },
  { name: 'Revolut', color: 'text-gray-900', connected: false },
  { name: 'Luminor', color: 'text-[#6B5B95]', connected: false },
]

export function LinkBanks() {
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
              className="flex items-center justify-between p-4 rounded-xl border border-gray-200 bg-white"
            >
              <span className={`font-medium ${bank.color}`}>{bank.name}</span>
              <Link
                to={bank.name === 'Swedbank' ? '/onboarding/banks/complete' : '#'}
                className="text-sm text-gray-500 hover:text-[#6B5B95]"
              >
                Connect
              </Link>
            </div>
          ))}
        </div>
        <Link
          to="/dashboard"
          className="block w-full py-3 rounded-xl bg-[#8B7AB8]/70 text-white font-medium text-center"
        >
          Link at least 1 bank
        </Link>
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
