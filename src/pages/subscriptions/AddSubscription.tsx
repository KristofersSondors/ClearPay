import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAppActions } from '../../context/AppContext'
import type { BillingFrequency } from '../../types/app'

const CATEGORIES = ['Entertainment', 'Software', 'Fitness', 'Shopping', 'Other']
const FREQUENCIES: { value: BillingFrequency; label: string }[] = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
]
const CURRENCIES = ['USD', 'EUR']

function getDefaultNextPayment(): string {
  const d = new Date()
  d.setDate(d.getDate() + 30)
  return d.toISOString().slice(0, 10)
}

export function AddSubscription() {
  const navigate = useNavigate()
  const { addSubscription } = useAppActions()
  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [price, setPrice] = useState('')
  const [frequency, setFrequency] = useState<BillingFrequency>('monthly')
  const [currency, setCurrency] = useState('USD')
  const [nextPaymentDate, setNextPaymentDate] = useState(getDefaultNextPayment())
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [successMessage, setSuccessMessage] = useState('')

  function validate(): boolean {
    const err: Record<string, string> = {}
    if (!name.trim()) err.name = 'Provider name is required'
    if (!category) err.category = 'Category is required'
    const p = parseFloat(price)
    if (!price || isNaN(p) || p <= 0) err.price = 'Amount must be greater than 0'
    if (!frequency) err.frequency = 'Frequency is required'
    if (!currency) err.currency = 'Currency is required'
    if (!nextPaymentDate) err.nextPaymentDate = 'Next payment date is required'
    setErrors(err)
    return Object.keys(err).length === 0
  }

  function handleSave() {
    if (!validate()) return
    addSubscription({
      name: name.trim(),
      category: category === 'Other' ? 'Other' : category,
      price: parseFloat(price),
      frequency,
      currency,
      nextPaymentDate,
    })
    setSuccessMessage('Subscription added!')
    setTimeout(() => {
      navigate('/subscriptions')
    }, 800)
  }

  return (
    <div className="px-4 py-6 space-y-6">
      {successMessage && (
        <div className="p-3 rounded-xl bg-green-50 border border-green-200 text-green-800 text-sm font-medium">
          {successMessage}
        </div>
      )}
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
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full px-4 py-3 rounded-lg border bg-white focus:outline-none focus:ring-2 focus:ring-[#6B5B95]/50 ${
                errors.name ? 'border-red-300' : 'border-gray-200'
              }`}
            />
            {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={`w-full px-4 py-3 rounded-lg border bg-white focus:outline-none focus:ring-2 focus:ring-[#6B5B95]/50 ${
                errors.category ? 'border-red-300' : 'border-gray-200'
              }`}
            >
              <option value="">Select category</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            {errors.category && <p className="text-sm text-red-500 mt-1">{errors.category}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value as BillingFrequency)}
              className={`w-full px-4 py-3 rounded-lg border bg-white focus:outline-none focus:ring-2 focus:ring-[#6B5B95]/50 ${
                errors.frequency ? 'border-red-300' : 'border-gray-200'
              }`}
            >
              {FREQUENCIES.map((f) => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
            {errors.frequency && <p className="text-sm text-red-500 mt-1">{errors.frequency}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="0.00"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className={`flex-1 px-4 py-3 rounded-lg border bg-white focus:outline-none focus:ring-2 focus:ring-[#6B5B95]/50 ${
                  errors.price ? 'border-red-300' : 'border-gray-200'
                }`}
              />
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className={`px-4 py-3 rounded-lg border bg-white focus:outline-none focus:ring-2 focus:ring-[#6B5B95]/50 ${
                  errors.currency ? 'border-red-300' : 'border-gray-200'
                }`}
              >
                {CURRENCIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            {errors.price && <p className="text-sm text-red-500 mt-1">{errors.price}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Next Payment Date</label>
            <input
              type="date"
              value={nextPaymentDate}
              onChange={(e) => setNextPaymentDate(e.target.value)}
              className={`w-full px-4 py-3 rounded-lg border bg-white focus:outline-none focus:ring-2 focus:ring-[#6B5B95]/50 ${
                errors.nextPaymentDate ? 'border-red-300' : 'border-gray-200'
              }`}
            />
            {errors.nextPaymentDate && <p className="text-sm text-red-500 mt-1">{errors.nextPaymentDate}</p>}
          </div>
        </div>
      </div>
      <div className="flex gap-3 pt-4">
        <button
          onClick={handleSave}
          className="flex-1 py-3 rounded-xl bg-[#6B5B95] text-white font-medium hover:bg-[#5A4A7D] transition-colors"
        >
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
