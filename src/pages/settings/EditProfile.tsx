import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAppState, useAppActions } from '../../context/AppContext'

export function EditProfile() {
  const navigate = useNavigate()
  const { profile } = useAppState()
  const { updateProfile } = useAppActions()
  const [name, setName] = useState(profile.name)
  const [email, setEmail] = useState(profile.email)
  const [avatarUrl] = useState(profile.avatarUrl)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [successMessage, setSuccessMessage] = useState('')

  function validate(): boolean {
    const err: Record<string, string> = {}
    if (!name.trim()) err.name = 'Full name is required'
    if (!email.trim()) err.email = 'Email is required'
    else if (!email.includes('@')) err.email = 'Please enter a valid email address'
    setErrors(err)
    return Object.keys(err).length === 0
  }

  function handleSave() {
    if (!validate()) return
    updateProfile({ name: name.trim(), email: email.trim(), avatarUrl })
    setSuccessMessage('Profile saved!')
    setTimeout(() => {
      navigate('/settings')
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
        <h1 className="text-2xl font-bold text-gray-900">Edit Profile</h1>
        <Link
          to="/settings"
          className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-[#6B5B95] mt-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Settings
        </Link>
      </div>
      <div className="flex flex-col items-center">
        <h2 className="text-sm font-bold text-gray-500 uppercase mb-2">Edit Profile</h2>
        <img
          src={avatarUrl}
          alt="Profile"
          className="w-24 h-24 rounded-full object-cover"
        />
        <button
          type="button"
          className="mt-2 text-[#6B5B95] font-medium text-sm flex items-center gap-1 hover:underline"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          Upload New Photo
        </button>
      </div>
      <div>
        <h2 className="text-sm font-bold text-gray-500 uppercase mb-4">Personal Information</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full px-4 py-3 rounded-lg border bg-white focus:outline-none focus:ring-2 focus:ring-[#6B5B95]/50 ${
                errors.name ? 'border-red-300' : 'border-gray-200'
              }`}
            />
            {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full px-4 py-3 rounded-lg border bg-white focus:outline-none focus:ring-2 focus:ring-[#6B5B95]/50 ${
                errors.email ? 'border-red-300' : 'border-gray-200'
              }`}
            />
            {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
          </div>
        </div>
      </div>
      <div>
        <div className="flex items-center gap-2 mb-4">
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <h2 className="text-sm font-bold text-gray-500 uppercase">Change Password</h2>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
            <input
              type="password"
              placeholder="........"
              className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#6B5B95]/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <input
              type="password"
              placeholder="........"
              className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#6B5B95]/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
            <input
              type="password"
              placeholder="........"
              className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#6B5B95]/50"
            />
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
          to="/settings"
          className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-700 font-medium text-center hover:bg-gray-50 transition-colors"
        >
          Cancel
        </Link>
      </div>
    </div>
  )
}
