import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
const LoginPage: React.FC = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkSession = async () => {
      // Check custom admin session (NOT Supabase Auth session)
      const adminSessionStr = sessionStorage.getItem('admin_session')
      if (adminSessionStr) {
        try {
          const adminSession = JSON.parse(adminSessionStr)
          // Check if session is still valid
          if (adminSession.expiresAt && Date.now() < adminSession.expiresAt) {
            navigate('/adminlandingt4s', { replace: true })
          } else {
            // Session expired, remove it
            sessionStorage.removeItem('admin_session')
          }
        } catch (error) {
          // Invalid session, remove it
          sessionStorage.removeItem('admin_session')
        }
      }
    }
    checkSession()
  }, [navigate])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // Validate inputs
      if (!email || !password) {
        setError('Please enter both email and password')
        setLoading(false)
        return
      }

      // Trim and lowercase email for consistency
      const loginEmail = email.trim().toLowerCase()
      const loginPassword = password.trim()

      // Ensure password is not empty
      if (!loginPassword || loginPassword.length === 0) {
        setError('Password is required')
        setLoading(false)
        return
      }

      const { superadminApi } = await import('@/lib/api')
      const adminCheckResult = await superadminApi.checkAdminByEmail(loginEmail)

      // If there's an error checking admin_users, deny access
      if (adminCheckResult.error) {
        // No sensitive info in logs
        setError('Invalid email or password.')
        setLoading(false)
        return
      }

      // CRITICAL: If email is NOT in admin_users table, deny immediately
      // Normal users ka email admin_users mein nahi hoga
      // Only manually added admins will be in admin_users table
      if (!adminCheckResult.data || !(adminCheckResult.data as any).email) {
        // Email not in admin_users table - this is a normal user
        // Deny access immediately - do not proceed with password verification
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

      // Success - navigate to admin dashboard
      navigate('/adminlandingt4s', { replace: true })
    } catch (error: any) {
      // Generic error message - no sensitive info
      setError('An error occurred. Please try again.')
      setLoading(false)
    }
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-black flex items-center justify-center p-6">
      <div className="relative w-full max-w-md">
        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl blur opacity-40"></div>
        <div className="relative bg-gray-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">Team4Stack Admin</h1>
            <p className="text-sm text-gray-300 mt-1">Sign in to manage your site</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl bg-gray-800/70 border-2 border-gray-700 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 hover:border-gray-600"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-200 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-gray-800/70 border-2 border-gray-700 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 hover:border-gray-600"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute inset-y-0 right-2 px-2 text-gray-300 hover:text-white"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>


            {error && (
              <div className="text-sm text-red-400 bg-red-400/10 border border-red-500/30 rounded-lg px-3 py-2">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white font-bold shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <p className="mt-4 text-center text-xs text-gray-400">
            Only authorized users can access the admin panel.
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage


