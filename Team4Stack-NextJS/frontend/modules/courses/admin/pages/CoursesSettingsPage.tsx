'use client'

import React, { useEffect, useState } from 'react'
import { useTheme } from '@/contexts/ThemeContext'

type CourseSetting = {
  key: string
  value: string
  description?: string
}

const CoursesSettingsPage: React.FC = () => {
  const { isDarkMode } = useTheme()
  const [settings, setSettings] = useState<CourseSetting[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [editingKey, setEditingKey] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')

  // Default course settings
  const defaultSettings: CourseSetting[] = [
    { key: 'default_course_duration', value: '30', description: 'Default course duration in days' },
    { key: 'max_videos_per_course', value: '50', description: 'Maximum number of videos allowed per course' },
    { key: 'enable_certificates', value: 'true', description: 'Enable certificate generation for completed courses' },
    { key: 'certificate_min_score', value: '70', description: 'Minimum score required for certificate (percentage)' },
    { key: 'enable_progress_tracking', value: 'true', description: 'Enable student progress tracking' },
    { key: 'auto_enroll_enabled', value: 'false', description: 'Allow automatic enrollment in courses' },
    { key: 'video_player_theme', value: 'light', description: 'Default video player theme (light/dark)' },
    { key: 'enable_discussions', value: 'true', description: 'Enable course discussions and comments' },
  ]

  useEffect(() => {
    loadSettings()
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

      // Save to site_settings table with course_ prefix
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

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500/90 to-red-500/90 backdrop-blur-xl rounded-xl p-5 text-white shadow-xl relative overflow-hidden border border-white/20">
        <div className="absolute inset-0 bg-black/5"></div>
        <div className="relative z-10">
          <h1 className="text-2xl font-bold mb-1">⚙️ Courses Settings</h1>
          <p className="text-white/90 text-sm">Configure course management settings and preferences</p>
        </div>
      </div>

      {/* Messages */}
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

      {/* Settings List */}
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
                  {setting.key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
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

      {/* Info Section */}
      <div className="bg-gradient-to-r from-orange-50/50 to-red-50/50 dark:from-orange-900/20 dark:to-red-900/20 backdrop-blur-sm rounded-xl p-5 border border-orange-200/50 dark:border-orange-800/50">
        <h3 className="text-base font-bold mb-2 text-gray-800 dark:text-white">ℹ️ About Course Settings</h3>
        <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
          These settings control various aspects of course management, including enrollment, certificates, and progress tracking.
          Changes take effect immediately and apply to all courses.
        </p>
        <ul className="list-disc list-inside space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <li><strong>Default Course Duration:</strong> Number of days students have to complete a course</li>
          <li><strong>Max Videos Per Course:</strong> Maximum number of videos allowed in a single course</li>
          <li><strong>Enable Certificates:</strong> Allow certificate generation for completed courses</li>
          <li><strong>Certificate Min Score:</strong> Minimum percentage score required to receive a certificate</li>
          <li><strong>Enable Progress Tracking:</strong> Track and store student progress data</li>
          <li><strong>Auto Enroll Enabled:</strong> Automatically enroll students in courses</li>
          <li><strong>Video Player Theme:</strong> Default theme for the video player interface</li>
          <li><strong>Enable Discussions:</strong> Allow students to post comments and discussions</li>
        </ul>
      </div>
    </div>
  )
}

export default CoursesSettingsPage

