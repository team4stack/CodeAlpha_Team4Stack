import React, { useEffect, useState } from 'react'
import { supabase } from '../../../utils/supabaseClient'
import { useTheme } from '../../../context/ThemeContext'

type SiteSetting = {
  key: string
  value: string
  description?: string
  category?: string
}

const SystemSettingsPage: React.FC = () => {
  const { isDarkMode } = useTheme()
  const [settings, setSettings] = useState<SiteSetting[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [editingKey, setEditingKey] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('site_settings')
        .select('*')
        .order('key', { ascending: true })

      if (fetchError) throw fetchError
      setSettings(data || [])
    } catch (err: any) {
      setError('Failed to load settings: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (setting: SiteSetting) => {
    setEditingKey(setting.key)
    setEditValue(setting.value)
  }

  const handleSave = async (key: string) => {
    try {
      setError(null)
      setSuccess(null)

      const { error: updateError } = await supabase
        .from('site_settings')
        .update({ value: editValue })
        .eq('key', key)

      if (updateError) throw updateError

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

  const handleAddSetting = async (e: React.FormEvent) => {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const formData = new FormData(form)
    const key = formData.get('key') as string
    const value = formData.get('value') as string

    if (!key || !value) {
      setError('Key and value are required')
      return
    }

    try {
      setError(null)
      setSuccess(null)

      const { error: insertError } = await supabase
        .from('site_settings')
        .insert({ key: key.trim(), value: value.trim() })

      if (insertError) throw insertError

      setSuccess('Setting added successfully!')
      form.reset()
      loadSettings()
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      setError('Failed to add setting: ' + err.message)
    }
  }

  const handleDeleteSetting = async (key: string) => {
    if (!window.confirm(`Are you sure you want to delete setting "${key}"?`)) {
      return
    }

    try {
      setError(null)
      setSuccess(null)

      const { error: deleteError } = await supabase
        .from('site_settings')
        .delete()
        .eq('key', key)

      if (deleteError) throw deleteError

      setSuccess('Setting deleted successfully!')
      loadSettings()
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      setError('Failed to delete setting: ' + err.message)
    }
  }

  const clearCache = () => {
    if (window.confirm('Clear all browser cache? This will log out all users.')) {
      // Clear localStorage and sessionStorage
      localStorage.clear()
      sessionStorage.clear()
      setSuccess('Cache cleared! Please refresh the page.')
      setTimeout(() => {
        window.location.reload()
      }, 2000)
    }
  }

  const groupedSettings = settings.reduce((acc, setting) => {
    const category = setting.category || 'General'
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(setting)
    return acc
  }, {} as Record<string, SiteSetting[]>)

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 rounded-xl p-6 text-white shadow-lg">
        <h1 className="text-3xl font-bold mb-2">⚙️ System Settings</h1>
        <p className="text-white/90">Manage site settings, environment variables, and system cache</p>
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

      {/* Cache Management */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Cache Management</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div>
              <h3 className="font-semibold text-gray-800 dark:text-white">Browser Cache</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Clear all cached data (localStorage, sessionStorage)</p>
            </div>
            <button
              onClick={clearCache}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-semibold"
            >
              Clear Cache
            </button>
          </div>
        </div>
      </div>

      {/* Environment Variables Info */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Environment Variables</h2>
        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <p>Environment variables are configured in your <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">.env</code> file.</p>
          <p>Key variables:</p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li><code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">VITE_SUPABASE_URL</code> - Supabase project URL</li>
            <li><code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">VITE_SUPABASE_ANON_KEY</code> - Supabase anonymous key</li>
            <li><code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">VITE_ALLOWED_ADMIN_EMAILS</code> - Allowed admin emails (comma-separated)</li>
          </ul>
          <p className="mt-4 text-yellow-600 dark:text-yellow-400 font-semibold">
            ⚠️ To modify environment variables, edit the .env file and restart the development server.
          </p>
        </div>
      </div>

      {/* Site Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Site Settings</h2>
        </div>

        {/* Add New Setting */}
        <form onSubmit={handleAddSetting} className="mb-6 p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700/50">
          <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">Add New Setting</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              name="key"
              placeholder="Setting Key"
              required
              className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
            <input
              type="text"
              name="value"
              placeholder="Setting Value"
              required
              className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-semibold"
            >
              Add Setting
            </button>
          </div>
        </form>

        {/* Settings List */}
        {Object.keys(groupedSettings).length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 py-8">No settings found</p>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedSettings).map(([category, categorySettings]) => (
              <div key={category}>
                <h3 className="text-lg font-semibold mb-3 text-gray-700 dark:text-gray-300">{category}</h3>
                <div className="space-y-2">
                  {categorySettings.map((setting) => (
                    <div
                      key={setting.key}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="font-semibold text-gray-800 dark:text-white">{setting.key}</div>
                        {editingKey === setting.key ? (
                          <div className="mt-2 flex gap-2">
                            <input
                              type="text"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                            />
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
                          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">{setting.value}</div>
                        )}
                      </div>
                      {editingKey !== setting.key && (
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => handleEdit(setting)}
                            className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-semibold"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteSetting(setting.key)}
                            className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-semibold"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default SystemSettingsPage

