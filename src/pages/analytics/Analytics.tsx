import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import { mockMonthlySpendData } from '../../data/mockData'
import { useAppState } from '../../context/AppContext'
import { getCategorySpendData } from '../../utils/subscriptionMetrics'

export function Analytics() {
  const { subscriptions } = useAppState()
  const categorySpendData = getCategorySpendData(subscriptions)
  const chartData = categorySpendData.length > 0 ? categorySpendData : [
    { name: 'No data', value: 1, color: '#e5e7eb' },
  ]

  return (
    <div className="px-4 py-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Monthly Spend Trend</h2>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mockMonthlySpendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#9ca3af" />
              <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" tickFormatter={(v) => `$${v}`} />
              <Tooltip formatter={(v) => [`$${v ?? 0}`, 'Spend']} />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#6B5B95"
                strokeWidth={2}
                dot={{ fill: '#6B5B95' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Spend by Category</h2>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={70}
                paddingAngle={2}
                dataKey="value"
                nameKey="name"
              >
                {chartData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => [`$${Number(v ?? 0).toFixed(2)}`, '']} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
