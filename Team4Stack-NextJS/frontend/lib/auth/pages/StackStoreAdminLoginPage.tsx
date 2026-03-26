"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
const StackStoreAdminLoginPage: React.FC = () => {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const loginEmail = email.toLowerCase().trim()
      const loginPassword = password

      if (!loginEmail || !loginPassword) {
        setError('Please enter both email and password.')
        setLoading(false)
        return
      }

      const { superadminApi } = await import('@/lib/api')
      const adminCheckResult = await superadminApi.checkAdminByEmail(loginEmail)

      if (adminCheckResult.error || !adminCheckResult.data || !(adminCheckResult.data as any).email) {
        setError('Invalid email or password.')
        setLoading(false)
        return
      }

      const verifyResult = await superadminApi.verifyAdminPassword(loginEmail, loginPassword)

      if (verifyResult.error) {
        setError('Invalid email or password.')
        setLoading(false)
        return
      }

      const verifyPayload = verifyResult.data as {
        valid?: boolean
        apiToken?: string
        expiresAt?: number
        role?: string
      }
      if (!verifyPayload?.valid || !verifyPayload.apiToken) {
        setError('Invalid email or password.')
        setLoading(false)
        return
      }

      const adminSession = {
        email: loginEmail,
        role: verifyPayload.role || (adminCheckResult.data as any).role || 'admin',
        expiresAt:
          typeof verifyPayload.expiresAt === 'number'
            ? verifyPayload.expiresAt
            : Date.now() + 24 * 60 * 60 * 1000,
        apiToken: verifyPayload.apiToken
      }

      sessionStorage.setItem('admin_session', JSON.stringify(adminSession))

      // Success - navigate to StackStore admin dashboard
      router.replace('/adminstackt4s')
    } catch (error: any) {
      setError('An error occurred. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-emerald-50 to-cyan-50 dark:from-gray-950 dark:via-gray-900 dark:to-black p-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-200 dark:border-gray-700">
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">🧩</div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">StackStore Admin Login</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage marketplace</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg text-red-700 dark:text-red-300 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="admin@example.com"
                required
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-purple-500 via-emerald-600 to-cyan-500 text-white font-semibold rounded-lg hover:from-purple-600 hover:via-emerald-700 hover:to-cyan-600 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Logging in...' : 'Login to StackStore Admin'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => router.push('/adminlandingt4s/login')}
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            >
              Landing Page Admin Login →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StackStoreAdminLoginPage

