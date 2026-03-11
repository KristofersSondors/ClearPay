import { Link, useParams, useNavigate } from 'react-router-dom'
import { useAppState, useAppActions } from '../../context/AppContext'
import { useState } from 'react'
import { Modal } from '../../components/ui/Modal'
import type { NotificationDays } from '../../types/app'

function formatDate(iso: string): string {
  const d = new Date(iso)
  return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`
}

function formatFrequency(f: string): string {
  return f.charAt(0).toUpperCase() + f.slice(1)
}

export function SubscriptionDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { subscriptions } = useAppState()
  const { cancelSubscription, updateSubscription } = useAppActions()
  const subscription = id ? subscriptions.find((s) => s.id === id) : null

  const [showCancelModal, setShowCancelModal] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  const notifyEnabled = subscription?.notifyEnabled ?? true
  const selectedDays = subscription?.notifyDays ?? 3

  function handleNotifyToggle() {
    if (!subscription) return
    updateSubscription(subscription.id, { notifyEnabled: !notifyEnabled })
  }

  function handleDaysChange(days: NotificationDays) {
    if (!subscription) return
    updateSubscription(subscription.id, { notifyDays: days })
  }

  function handleCancelConfirm() {
    if (!subscription) return
    cancelSubscription(subscription.id)
    setShowCancelModal(false)
    setSuccessMessage('Subscription cancelled.')
    setTimeout(() => {
      navigate('/subscriptions')
    }, 600)
  }

  if (!subscription) {
    return (
      <div className="px-4 py-6 space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Subscription Details</h1>
        <p className="text-sm text-gray-500 py-4">Subscription not found.</p>
        <Link
          to="/subscriptions"
          className="inline-flex items-center gap-1 text-sm text-[#6B5B95] font-medium hover:underline"
        >
          Back to Subscriptions
        </Link>
      </div>
    )
  }

  return (
    <div className="px-4 py-6 space-y-6">
      {successMessage && (
        <div className="p-3 rounded-xl bg-green-50 border border-green-200 text-green-800 text-sm font-medium">
          {successMessage}
        </div>
      )}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Subscription Details</h1>
        <Link
          to="/subscriptions"
          className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-[#6B5B95] mt-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </Link>
      </div>
      <div className="flex flex-col items-center">
        <div className={`w-20 h-20 rounded-xl ${subscription.logoBg} ${subscription.logoColor} flex items-center justify-center font-bold text-2xl`}>
          {subscription.logo}
        </div>
        <h2 className="text-xl font-bold text-gray-900 mt-3">{subscription.name}</h2>
      </div>
      <div className="bg-[#8B7AB8]/20 rounded-xl p-4 space-y-3">
        <div className="flex justify-between">
          <span className="text-gray-600">Next payment date:</span>
          <span className="font-medium text-gray-900">{formatDate(subscription.nextPaymentDate)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Amount:</span>
          <span className="font-medium text-gray-900">{subscription.currency} {subscription.price.toFixed(2)} / m.</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Frequency:</span>
          <span className="font-medium text-gray-900">{formatFrequency(subscription.frequency)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Screen time:</span>
          <span className="font-medium text-gray-900">4h / week</span>
        </div>
      </div>
      {subscription.status === 'active' && (
        <button
          onClick={() => setShowCancelModal(true)}
          className="w-full py-3 rounded-xl bg-[#6B5B95] text-white font-medium flex items-center justify-center gap-2 hover:bg-[#5A4A7D] transition-colors"
        >
          <span className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-sm">−</span>
          Cancel subscription
        </button>
      )}
      <Modal isOpen={showCancelModal} onClose={() => setShowCancelModal(false)}>
        <div className="border-2 border-green-200 rounded-xl p-4 bg-green-50">
          <p className="text-lg font-bold text-gray-900 text-center">
            You have successfully canceled your subscription!
          </p>
        </div>
        <button
          onClick={handleCancelConfirm}
          className="w-full mt-4 py-3 rounded-xl bg-[#6B5B95] text-white font-medium hover:bg-[#5A4A7D] transition-colors"
        >
          OK
        </button>
      </Modal>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-gray-700">I want to be notified before my next payment.</span>
          <button
            onClick={handleNotifyToggle}
            className={`relative w-12 h-7 rounded-full transition-colors ${
              notifyEnabled ? 'bg-[#6B5B95]' : 'bg-gray-200'
            }`}
          >
            <div
              className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                notifyEnabled ? 'left-6' : 'left-1'
              }`}
            />
          </button>
        </div>
        <div>
          <p className="text-sm text-gray-600 mb-2">
            How many days before the payment should I be notified
          </p>
          <div className="flex gap-2">
            {([1, 3, 7, 14] as NotificationDays[]).map((days) => (
              <button
                key={days}
                onClick={() => handleDaysChange(days)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  selectedDays === days
                    ? 'bg-[#8B7AB8]/30 text-[#6B5B95]'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {days} day{days > 1 ? 's' : ''}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
