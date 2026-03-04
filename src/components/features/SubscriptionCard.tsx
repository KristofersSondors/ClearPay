import { Link } from 'react-router-dom'

interface SubscriptionCardProps {
  id: string
  name: string
  category: string
  price: number
  frequency: string
  logo: string
  logoBg: string
  logoColor: string
}

export function SubscriptionCard({
  id,
  name,
  category,
  price,
  frequency,
  logo,
  logoBg,
  logoColor,
}: SubscriptionCardProps) {
  return (
    <Link
      to={`/subscriptions/${id}`}
      className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className={`w-12 h-12 rounded-xl ${logoBg} ${logoColor} flex items-center justify-center font-bold text-sm shrink-0`}>
        {logo}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 truncate">{name}</p>
        <p className="text-sm text-gray-500">{category}</p>
        <p className="text-sm text-gray-700 mt-0.5">
          ${price.toFixed(2)} · {frequency}
        </p>
      </div>
      <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </Link>
  )
}
