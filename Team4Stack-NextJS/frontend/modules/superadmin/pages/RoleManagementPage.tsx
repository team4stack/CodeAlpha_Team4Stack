'use client'

import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

interface AdminUser {
  id: string
  email: string
  role: string
  created_at: string
  updated_at?: string
}

const RoleManagementPage: React.FC = () => {
  const [admins, setAdmins] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  // Add new admin form
  const [showAddForm, setShowAddForm] = useState(false)
  const [newAdminEmail, setNewAdminEmail] = useState('')
  const [newAdminPassword, setNewAdminPassword] = useState('')
  const [newAdminRole, setNewAdminRole] = useState('landing_admin')
  const [addingAdmin, setAddingAdmin] = useState(false)

  const roles = [
    { value: 'super_admin', label: 'Super Admin', color: 'from-yellow-500 to-orange-500' },
    { value: 'landing_admin', label: 'Landing Admin', color: 'from-blue-500 to-cyan-500' },
    { value: 'stackstore_admin', label: 'StackStore Admin', color: 'from-purple-500 to-pink-500' },
    { value: 'team_admin', label: 'Team Admin', color: 'from-green-500 to-emerald-500' },
    { value: 'courses_admin', label: 'Courses Admin', color: 'from-indigo-500 to-purple-500' },
    { value: 'admin', label: 'Admin (Legacy)', color: 'from-gray-500 to-slate-500' },
  ]

  useEffect(() => {
    loadAdmins()
  }, [])

  const loadAdmins = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setAdmins(data || [])
    } catch (err: any) {
      setError('Failed to load admins: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const updateRole = async (adminId: string, newRole: string) => {
    try {
      setError(null)
      setSuccess(null)

      const { error } = await supabase
        .from('admin_users')
        .update({ 
          role: newRole,
          updated_at: new Date().toISOString()
        })
        .eq('id', adminId)

      if (error) throw error

      setSuccess('Role updated successfully!')
      loadAdmins()
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      setError('Failed to update role: ' + err.message)
    }
  }

  const addNewAdmin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newAdminEmail || !newAdminPassword) {
      setError('Email and password are required')
      return
    }

    try {
      setAddingAdmin(true)
      setError(null)
      setSuccess(null)

      // Try using the add_admin_user function first (recommended)
      const { data: result, error: rpcError } = await supabase.rpc('add_admin_user', {
        p_email: newAdminEmail.toLowerCase().trim(),
        p_password: newAdminPassword,
        p_role: newAdminRole
      })

      if (rpcError) {
        // If RPC function doesn't exist, try hash function
        const { data: hashData, error: hashError } = await supabase.rpc('hash_admin_password', {
          p_password: newAdminPassword
        })

        if (hashError) {
          throw new Error('Password hashing functions not found. Please run create_password_hash_function.sql in Supabase, or add admin via SQL using add_all_admins.sql')
        }

        // Insert with hashed password
        const { error: insertError } = await supabase
          .from('admin_users')
          .insert({
            email: newAdminEmail.toLowerCase().trim(),
            password_hash: hashData,
            role: newAdminRole
          })

        if (insertError) throw insertError
      } else if (result && !result.success) {
        throw new Error(result.error || 'Failed to add admin')
      }

      setSuccess('Admin added successfully!')
      setNewAdminEmail('')
      setNewAdminPassword('')
      setNewAdminRole('landing_admin')
      setShowAddForm(false)
      loadAdmins()
      
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      setError('Failed to add admin. Note: You may need to set password_hash via SQL. Error: ' + err.message)
    } finally {
      setAddingAdmin(false)
    }
  }

  const deleteAdmin = async (adminId: string, email: string) => {
    if (!confirm(`Are you sure you want to delete admin: ${email}?`)) {
      return
    }

    try {
      setError(null)
      setSuccess(null)

      const { error } = await supabase
        .from('admin_users')
        .delete()
        .eq('id', adminId)

      if (error) throw error

      setSuccess('Admin deleted successfully!')
      loadAdmins()
      
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      setError('Failed to delete admin: ' + err.message)
    }
  }

  const getRoleColor = (role: string) => {
    const roleObj = roles.find(r => r.value === role)
    return roleObj?.color || 'from-gray-500 to-slate-500'
  }

  const getRoleLabel = (role: string) => {
    const roleObj = roles.find(r => r.value === role)
    return roleObj?.label || role
  }

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
      <div className="bg-gradient-to-r from-yellow-500 via-orange-600 to-red-600 rounded-xl p-8 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-5xl">🔐</div>
              <div>
                <h1 className="text-4xl font-bold mb-2">Role Management</h1>
                <p className="text-white/90 text-lg">Assign and manage admin roles</p>
              </div>
            </div>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-6 py-3 bg-white/20 hover:bg-white/30 rounded-xl font-bold transition-all backdrop-blur-sm"
            >
              {showAddForm ? 'Cancel' : '+ Add Admin'}
            </button>
          </div>
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-100 dark:bg-green-900/30 border border-green-500 text-green-700 dark:text-green-300 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}
      {error && (
        <div className="bg-red-100 dark:bg-red-900/30 border border-red-500 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Add Admin Form */}
      {showAddForm && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Add New Admin</h2>
          <form onSubmit={addNewAdmin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                value={newAdminEmail}
                onChange={(e) => setNewAdminEmail(e.target.value)}
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="admin@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <input
                type="password"
                value={newAdminPassword}
                onChange={(e) => setNewAdminPassword(e.target.value)}
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Enter password"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Note: Password will be hashed using bcrypt. If this fails, you may need to add the admin via SQL.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Role
              </label>
              <select
                value={newAdminRole}
                onChange={(e) => setNewAdminRole(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {roles.map(role => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              disabled={addingAdmin}
              className="w-full py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-all disabled:opacity-50"
            >
              {addingAdmin ? 'Adding...' : 'Add Admin'}
            </button>
          </form>
        </div>
      )}

      {/* Admins List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            All Admins ({admins.length})
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Current Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Change Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {admins.map((admin) => (
                <tr key={admin.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {admin.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${getRoleColor(admin.role)}`}>
                      {getRoleLabel(admin.role)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={admin.role}
                      onChange={(e) => updateRole(admin.id, e.target.value)}
                      className="px-3 py-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    >
                      {roles.map(role => (
                        <option key={role.value} value={role.value}>
                          {role.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(admin.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {admin.email !== 'superadmin@gmail.com' && (
                      <button
                        onClick={() => deleteAdmin(admin.id, admin.email)}
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 font-medium"
                      >
                        Delete
                      </button>
                    )}
                    {admin.email === 'superadmin@gmail.com' && (
                      <span className="text-gray-400 dark:text-gray-500 text-xs">Protected</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info Section */}
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl p-6 border-2 border-yellow-300 dark:border-yellow-700">
        <h3 className="text-lg font-bold mb-2 text-gray-800 dark:text-white">ℹ️ Role Assignment</h3>
        <p className="text-gray-700 dark:text-gray-300 mb-3">
          Assign roles to admins to control their access. Each role grants access to specific admin panels:
        </p>
        <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300 text-sm">
          <li><strong>Super Admin:</strong> Full system access</li>
          <li><strong>Landing Admin:</strong> Landing page management</li>
          <li><strong>StackStore Admin:</strong> StackStore marketplace management</li>
          <li><strong>Team Admin:</strong> Team members and mentor management</li>
          <li><strong>Courses Admin:</strong> Courses and videos management</li>
        </ul>
      </div>
    </div>
  )
}

export default RoleManagementPage

