import axios from 'axios'
import { useState, useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authContext } from '../../contexts/authContext'
import { RiLockPasswordLine, RiLockPasswordFill } from 'react-icons/ri'
import { FiEye, FiEyeOff } from 'react-icons/fi'

let BASE_URL = import.meta.env.VITE_AUTH_URL

export function ChangePassword() {
  let { user } = useContext(authContext)
  const navigate = useNavigate()

  let [form, setForm] = useState({ currentPassword: '', newPassword: '' })
  let [showCurrent, setShowCurrent] = useState(false)
  let [showNew, setShowNew] = useState(false)
  let [loading, setLoading] = useState(false)
  let [message, setMessage] = useState({ text: '', type: '' })

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!form.currentPassword || !form.newPassword) {
      setMessage({ text: 'Please fill in all fields', type: 'error' })
      return
    }
    if (form.newPassword.length < 6) {
      setMessage({ text: 'New password must be at least 6 characters', type: 'error' })
      return
    }

    setLoading(true)
    setMessage({ text: '', type: '' })

    axios
      .put(`${BASE_URL}/auth/changePassword?userId=${user._id}`, form)
      .then(res => {
        setMessage({ text: res.data.message, type: 'success' })
        setForm({ currentPassword: '', newPassword: '' })
      })
      .catch(err => {
        setMessage({ text: err.response?.data?.message || 'Something went wrong', type: 'error' })
      })
      .finally(() => setLoading(false))
  }

  return (
    <div className="backgroundDiv min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-black border border-gray-700 rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-black px-6 py-8 text-center border-b border-gray-700">
            <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4">
              <RiLockPasswordFill className="text-3xl text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Change Password</h1>
            <p className="text-white/70 text-sm mt-1">Update your account password</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
            {/* Current Password */}
            <div className="flex flex-col gap-2">
              <label htmlFor="currentPassword" className="text-sm font-medium text-gray-300">
                Current Password
              </label>
              <div className="relative">
                <RiLockPasswordLine className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type={showCurrent ? 'text' : 'password'}
                  name="currentPassword"
                  id="currentPassword"
                  value={form.currentPassword}
                  placeholder="Enter current password"
                  className="w-full bg-black border border-gray-700 rounded-xl py-3 pl-10 pr-10 text-white placeholder-gray-600 focus:outline-none focus:border-[#4242FA] transition"
                  onChange={(e) => setForm(pre => ({ ...pre, [e.target.name]: e.target.value }))}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition"
                >
                  {showCurrent ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="flex flex-col gap-2">
              <label htmlFor="newPassword" className="text-sm font-medium text-gray-300">
                New Password
              </label>
              <div className="relative">
                <RiLockPasswordLine className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type={showNew ? 'text' : 'password'}
                  name="newPassword"
                  id="newPassword"
                  value={form.newPassword}
                  placeholder="Enter new password"
                  className="w-full bg-black border border-gray-700 rounded-xl py-3 pl-10 pr-10 text-white placeholder-gray-600 focus:outline-none focus:border-[#4242FA] transition"
                  onChange={(e) => setForm(pre => ({ ...pre, [e.target.name]: e.target.value }))}
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition"
                >
                  {showNew ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            {/* Message */}
            {message.text && (
              <div className={`text-center text-sm font-medium py-2 px-4 rounded-lg ${
                message.type === 'success' 
                  ? 'bg-green-500/10 text-green-400 border border-green-500/30' 
                  : 'bg-red-500/10 text-red-400 border border-red-500/30'
              }`}>
                {message.text}
              </div>
            )}

            {/* Forgot Password Link */}
            <Link
              to="/forgotPassword"
              className="text-[#4242FA] hover:text-[#6366f1] text-sm font-medium text-right transition"
            >
              Forgot Password?
            </Link>

            {/* Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex-1 py-3 rounded-xl border border-gray-700 text-gray-400 hover:text-white hover:border-white font-medium transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 rounded-xl bg-[#4242FA] text-white font-bold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}