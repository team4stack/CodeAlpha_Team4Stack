import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../utils/supabaseClient'
import { isEmailAllowedForAdmin } from '../utils/adminSecurity'

const TeamAdminLoginPage: React.FC = () => {
  const navigate = useNavigate()
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

      // Step 1: Environment variable check
      if (!isEmailAllowedForAdmin(loginEmail)) {
        setError('Invalid email or password.')
        setLoading(false)
        return
      }

      // Step 2: Check if email exists in admin_users table
      const { data: adminCheck, error: adminError } = await supabase
        .from('admin_users')
        .select('email, role')
        .eq('email', loginEmail)
        .maybeSingle()

      if (adminError || !adminCheck || !adminCheck.email) {
        setError('Invalid email or password.')
        setLoading(false)
        return
      }

      // Step 3: Verify password
      const { data: verifyResult, error: verifyError } = await supabase.rpc('verify_admin_password', {
        p_email: loginEmail,
        p_password: loginPassword
      })

      if (verifyError) {
        setError('Invalid email or password.')
        setLoading(false)
        return
      }

      const isValid = verifyResult && typeof verifyResult === 'object' && verifyResult.valid === true

      if (!isValid) {
        setError('Invalid email or password.')
        setLoading(false)
        return
      }

      // Step 4: Create admin session
      const adminSession = {
        email: loginEmail,
        role: adminCheck.role || 'admin',
        expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
      }

      sessionStorage.setItem('admin_session', JSON.stringify(adminSession))

      // Success - navigate to Team admin dashboard
      navigate('/adminteamt4s', { replace: true })
    } catch (error: any) {
      setError('An error occurred. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 dark:from-gray-950 dark:via-gray-900 dark:to-black p-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-200 dark:border-gray-700">
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">👥</div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Team Admin Login</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage team members</p>
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
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-blue-500 via-cyan-600 to-teal-500 text-white font-semibold rounded-lg hover:from-blue-600 hover:via-cyan-700 hover:to-teal-600 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Logging in...' : 'Login to Team Admin'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/adminlandingt4s/login')}
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

export default TeamAdminLoginPage

