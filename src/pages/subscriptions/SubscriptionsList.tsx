import { useState } from 'react'
import { useAppState } from '../../context/AppContext'
import { filterSubscriptions } from '../../utils/subscriptionFilters'
import { SubscriptionCard } from '../../components/features/SubscriptionCard'

const CATEGORIES = ['all', 'Entertainment', 'Software', 'Fitness', 'Shopping']
const STATUSES = ['all', 'active', 'cancelled']

function formatFrequency(f: string): string {
  return f.charAt(0).toUpperCase() + f.slice(1)
}

export function SubscriptionsList() {
  const { subscriptions } = useAppState()
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  const filtered = filterSubscriptions(subscriptions, searchTerm, categoryFilter, statusFilter)

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
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#6B5B95]/50"
        />
      </div>
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              categoryFilter === cat
                ? 'bg-[#6B5B95] text-white'
                : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {cat === 'all' ? 'All' : cat}
          </button>
        ))}
        {STATUSES.map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              statusFilter === st
                ? 'bg-[#6B5B95] text-white'
                : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {st === 'all' ? 'All Status' : st.charAt(0).toUpperCase() + st.slice(1)}
          </button>
        ))}
      </div>
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <p className="text-sm text-gray-500 py-8 text-center">
            No subscriptions match your search or filters.
          </p>
        ) : (
          filtered.map((sub) => (
            <SubscriptionCard
              key={sub.id}
              id={sub.id}
              name={sub.name}
              category={sub.category}
              price={sub.price}
              frequency={formatFrequency(sub.frequency)}
              logo={sub.logo}
              logoBg={sub.logoBg}
              logoColor={sub.logoColor}
            />
          ))
        )}
      </div>
    </div>
  )
}
