import { Link } from 'react-router-dom'
import { useAppState } from '../../context/AppContext'
import {
  getMonthlySpend,
  getYearlyProjection,
  getActiveSubscriptionsCount,
  getUpcomingPayments,
  getUpcoming7DaysTotal,
} from '../../utils/subscriptionMetrics'

function formatDate(iso: string): string {
  const d = new Date(iso)
  return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`
}

export function Dashboard() {
  const { subscriptions } = useAppState()
  const monthlySpend = getMonthlySpend(subscriptions)
  const yearlyProjection = getYearlyProjection(subscriptions)
  const activeSubscriptions = getActiveSubscriptionsCount(subscriptions)
  const upcoming7Days = getUpcoming7DaysTotal(subscriptions)
  const upcomingPayments = getUpcomingPayments(subscriptions, 30)

  return (
    <div className="px-4 py-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      <div className="space-y-4">
        <div className="bg-gray-100 rounded-xl p-4 flex justify-between items-start">
          <div>
            <p className="text-sm text-gray-600">Monthly Spend</p>
            <p className="text-2xl font-bold text-gray-900">${monthlySpend.toFixed(2)}</p>
            <p className="text-sm text-red-500 flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              +2.5% vs last month
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
        </div>
        <div className="bg-gray-100 rounded-xl p-4 flex justify-between items-start">
          <div>
            <p className="text-sm text-gray-600">Yearly Projection</p>
            <p className="text-2xl font-bold text-gray-900">${yearlyProjection.toFixed(2)}</p>
            <p className="text-sm text-gray-500">Based on active subs</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#6B5B95]/20 flex items-center justify-center">
            <svg className="w-5 h-5 text-[#6B5B95]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
            </svg>
          </div>
        </div>
        <div className="bg-gray-100 rounded-xl p-4 flex justify-between items-start">
          <div>
            <p className="text-sm text-gray-600">Active Subscriptions</p>
            <p className="text-2xl font-bold text-gray-900">{activeSubscriptions}</p>
            <p className="text-sm text-gray-500">Services active</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#6B5B95]/20 flex items-center justify-center">
            <svg className="w-5 h-5 text-[#6B5B95]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
        <div className="bg-gray-100 rounded-xl p-4 flex justify-between items-start">
          <div>
            <p className="text-sm text-gray-600">Upcoming (7 Days)</p>
            <p className="text-2xl font-bold text-gray-900">${upcoming7Days.toFixed(2)}</p>
            <p className="text-sm text-red-500 flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              +2.5% Due this week
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
        </div>
      </div>
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Upcoming Payments</h2>
          <span className="text-sm text-gray-500">Next 30 Days</span>
        </div>
        <div className="space-y-2">
          {upcomingPayments.length === 0 ? (
            <p className="text-sm text-gray-500 py-4 text-center">No upcoming payments</p>
          ) : (
            upcomingPayments.map((payment) => (
              <Link
                key={payment.id}
                to={`/subscriptions/${payment.id}`}
                className="flex justify-between items-center p-3 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors block"
              >
                <span className="font-medium text-gray-900">{payment.name}</span>
                <div className="text-right">
                  <span className="font-medium text-gray-900">${payment.price.toFixed(2)}</span>
                  <span className="block text-xs text-gray-500">{formatDate(payment.nextPaymentDate)}</span>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
