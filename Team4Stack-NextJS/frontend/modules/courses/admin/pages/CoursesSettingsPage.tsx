'use client'

import React, { useEffect, useState } from 'react'

type CourseSetting = {
  key: string
  value: string
  description?: string
}

const CoursesSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<CourseSetting[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [editingKey, setEditingKey] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [adminEmail, setAdminEmail] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordLoading, setPasswordLoading] = useState(false)

  const defaultSettings: CourseSetting[] = [
    {
      key: 'enable_progress_tracking',
      value: 'true',
      description: 'Track student progress and watch time'
    },
    {
      key: 'enable_certificates',
      value: 'true',
      description: 'Allow certificate applications after completion'
    },
    {
      key: 'certificate_min_score',
      value: '70',
      description: 'Minimum quiz score percentage for certificate'
    },
    {
      key: 'max_videos_per_course',
      value: '50',
      description: 'Maximum videos allowed in one course'
    }
  ]

  useEffect(() => {
    loadSettings()
    try {
      const raw = sessionStorage.getItem('admin_session')
      if (raw) {
        const parsed = JSON.parse(raw) as { email?: string }
        if (parsed?.email) setAdminEmail(parsed.email)
      }
    } catch {
      /* ignore */
    }
  }, [])

  const loadSettings = async () => {
    try {
      setLoading(true)
      setError(null)

      const keys = defaultSettings.map((s) => `course_${s.key}`)
      const { landingApi } = await import('@/lib/api')
      const result = await landingApi.getSiteSettings(keys)

      const settingsMap = new Map<string, CourseSetting>()
      defaultSettings.forEach((setting) => {
        settingsMap.set(setting.key, { ...setting })
      })

      if (result.success && !result.error && Array.isArray(result.data)) {
        ;(result.data as any[]).forEach((item: any) => {
          if (item.key?.startsWith('course_')) {
            const shortKey = item.key.replace('course_', '')
            if (settingsMap.has(shortKey)) {
              settingsMap.set(shortKey, { ...settingsMap.get(shortKey)!, value: item.value })
            }
          }
        })
      }

      setSettings(Array.from(settingsMap.values()))
    } catch (err: any) {
      setError('Failed to load settings: ' + err.message)
      setSettings(defaultSettings)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (setting: CourseSetting) => {
    setEditingKey(setting.key)
    setEditValue(setting.value)
  }

  const handleSave = async (key: string) => {
    try {
      setError(null)
      setSuccess(null)

      const settingKey = `course_${key}`

      const { landingApi } = await import('@/lib/api')
      const res = await landingApi.upsertSiteSetting(settingKey, editValue)
      if (!res.success || res.error) {
        throw new Error(res.error || 'Save failed')
      }

      setSuccess('Setting updated successfully!')
      setEditingKey(null)
      setEditValue('')
      loadSettings()
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      setError('Failed to update setting: ' + err.message)
    }
  }

  const handleCancel = () => {
    setEditingKey(null)
    setEditValue('')
  }

  const handleReset = async () => {
    if (!window.confirm('Reset all settings to default values? This cannot be undone.')) {
      return
    }

    try {
      setError(null)
      setSuccess(null)

      const keys = defaultSettings.map((s) => `course_${s.key}`)
      const { landingApi } = await import('@/lib/api')
      const res = await landingApi.deleteSiteSettings(keys)
      if (!res.success && res.error) {
        throw new Error(res.error)
      }

      setSuccess('Settings reset to defaults!')
      loadSettings()
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      setError('Failed to reset settings: ' + err.message)
    }
  }

  const handlePasswordUpdate = async () => {
    try {
      setError(null)
      setSuccess(null)
      if (!currentPassword || !newPassword) {
        setError('Current and new password are required')
        return
      }
      if (newPassword !== confirmPassword) {
        setError('New password and confirm password do not match')
        return
      }
      setPasswordLoading(true)
      const { coursesApi } = await import('@/lib/api')
      const res = await coursesApi.updateAdminPassword({
        current_password: currentPassword,
        new_password: newPassword
      })
      if (!res.success || res.error) {
        throw new Error(res.error || 'Failed to update password')
      }
      setSuccess('Password updated successfully')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      setError('Failed to update password: ' + err.message)
    } finally {
      setPasswordLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-orange-500/90 to-red-500/90 backdrop-blur-xl rounded-xl p-5 text-white shadow-xl relative overflow-hidden border border-white/20">
        <div className="absolute inset-0 bg-black/5"></div>
        <div className="relative z-10">
          <h1 className="text-2xl font-bold mb-1">Courses Settings</h1>
          <p className="text-white/90 text-sm">Update core course options and admin password</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl p-4">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-500/20 text-green-400 border border-green-500/30 rounded-xl p-4">
          {success}
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Course Settings</h2>
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-semibold"
          >
            Reset to Defaults
          </button>
        </div>

        <div className="space-y-4">
          {settings.map((setting) => (
            <div
              key={setting.key}
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <div className="flex-1">
                <div className="font-semibold text-gray-800 dark:text-white mb-1">
                  {setting.key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                </div>
                {setting.description && (
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">{setting.description}</div>
                )}
                {editingKey === setting.key ? (
                  <div className="mt-2 flex gap-2">
                    {setting.key.includes('enable') || setting.key.includes('auto') ? (
                      <select
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                      >
                        <option value="true">True</option>
                        <option value="false">False</option>
                      </select>
                    ) : (
                      <input
                        type={setting.key.includes('score') || setting.key.includes('duration') || setting.key.includes('max') ? 'number' : 'text'}
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    )}
                    <button
                      onClick={() => handleSave(setting.key)}
                      className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleCancel}
                      className="px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="text-sm font-mono text-gray-700 dark:text-gray-300 mt-1 bg-white dark:bg-gray-800 px-3 py-2 rounded border border-gray-200 dark:border-gray-600 inline-block">
                    {setting.value}
                  </div>
                )}
              </div>
              {editingKey !== setting.key && (
                <button
                  onClick={() => handleEdit(setting)}
                  className="ml-4 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all shadow-md hover:shadow-lg font-semibold"
                >
                  Edit
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Admin Account</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Only super admin can change email. You can update your password here.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Email</label>
            <input
              type="email"
              value={adminEmail || ''}
              readOnly
              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
            />
          </div>
          <div></div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              placeholder="Enter current password"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              placeholder="Enter new password"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              placeholder="Confirm new password"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handlePasswordUpdate}
              disabled={passwordLoading}
              className="px-5 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition disabled:opacity-60"
            >
              {passwordLoading ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CoursesSettingsPage
