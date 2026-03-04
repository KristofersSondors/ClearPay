import { mockSubscriptions } from '../../data/mockData'
import { SubscriptionCard } from '../../components/features/SubscriptionCard'

export function SubscriptionsList() {
  return (
    <div className="px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Subscriptions</h1>
        <p className="text-gray-500">Your Subscriptions</p>
      </div>
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search..."
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#6B5B95]/50"
        />
      </div>
      <div className="flex gap-2">
        <button className="px-4 py-2 rounded-xl bg-[#6B5B95] text-white text-sm font-medium">
          All
        </button>
        <button className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50">
          All Status
        </button>
      </div>
      <div className="space-y-3">
        {mockSubscriptions.map((sub) => (
          <SubscriptionCard key={sub.id} {...sub} />
        ))}
      </div>
    </div>
  )
}
