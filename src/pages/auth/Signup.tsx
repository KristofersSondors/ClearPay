import { Link } from 'react-router-dom'

export function Signup() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center px-6 py-8">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex gap-2">
          <div className="h-1 flex-1 rounded-full bg-[#6B5B95]" />
          <div className="h-1 flex-1 rounded-full bg-[#8B7AB8]/50" />
          <div className="h-1 flex-1 rounded-full bg-[#8B7AB8]/30" />
        </div>
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#6B5B95] flex items-center justify-center">
            <span className="text-white font-bold text-xl">C</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900 text-center">
            Create your ClearPay account
          </h1>
        </div>

        <div className="border-2 border-dashed border-blue-200 rounded-xl p-6 space-y-4 bg-white">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full name
            </label>
            <input
              type="text"
              placeholder="Toms irgiejs"
              className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#6B5B95]/50 focus:border-[#6B5B95]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email address
            </label>
            <input
              type="email"
              placeholder="toms@irge.com"
              className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#6B5B95]/50 focus:border-[#6B5B95]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              placeholder="********"
              className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#6B5B95]/50 focus:border-[#6B5B95]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              placeholder="********"
              className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#6B5B95]/50 focus:border-[#6B5B95]"
            />
          </div>
          <Link
            to="/onboarding/banks"
            className="block w-full py-3 rounded-xl bg-[#6B5B95] text-white font-medium text-center hover:bg-[#5A4A7D] transition-colors"
          >
            Next: Link Your Bank Accounts
          </Link>
        </div>
        <p className="text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-[#6B5B95] font-medium hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  )
}
