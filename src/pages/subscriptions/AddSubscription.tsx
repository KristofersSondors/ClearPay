import { Link } from 'react-router-dom'

export function AddSubscription() {
  return (
    <div className="px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Enter Subscription Manually</h1>
      </div>
      <div>
        <h2 className="text-sm font-bold text-gray-500 uppercase mb-4">Subscription Information</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Provider Name</label>
            <input
              type="text"
              placeholder="Netflix"
              className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#6B5B95]/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
            <select className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#6B5B95]/50">
              <option>Weekly</option>
              <option>Monthly</option>
              <option>Yearly</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="0.00"
                step="0.01"
                className="flex-1 px-4 py-3 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#6B5B95]/50"
              />
              <select className="px-4 py-3 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#6B5B95]/50">
                <option>USD</option>
                <option>EUR</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      <div className="flex gap-3 pt-4">
        <button className="flex-1 py-3 rounded-xl bg-[#6B5B95] text-white font-medium hover:bg-[#5A4A7D] transition-colors">
          Save Changes
        </button>
        <Link
          to="/subscriptions"
          className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-700 font-medium text-center hover:bg-gray-50 transition-colors"
        >
          Cancel
        </Link>
      </div>
    </div>
  )
}
