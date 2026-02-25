import { Link } from 'react-router-dom'

export function Welcome() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm space-y-8">
        <div className="bg-[#8B7AB8] rounded-2xl px-8 py-12 text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome to ClearPay!
          </h1>
        </div>
        <div className="space-y-4">
          <Link
            to="/login"
            className="block w-full py-4 rounded-xl bg-[#6B5B95] text-white font-medium text-center hover:bg-[#5A4A7D] transition-colors"
          >
            Log In
          </Link>
          <Link
            to="/signup"
            className="block w-full py-4 rounded-xl bg-[#6B5B95] text-white font-medium text-center hover:bg-[#5A4A7D] transition-colors"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  )
}
