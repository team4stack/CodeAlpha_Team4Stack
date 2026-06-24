'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { FiEdit2, FiPlus, FiRefreshCw, FiSearch, FiTrash2 } from 'react-icons/fi'
import { stackstoreApi } from '@/lib/api'

type Category = {
  id: string
  name: string
  description?: string | null
  image_url?: string | null
  active?: boolean
}

type CategoryForm = {
  name: string
  description: string
  image_url: string
  active: boolean
}

const emptyForm: CategoryForm = {
  name: '',
  description: '',
  image_url: '',
  active: true,
}

export default function CategoriesManagementPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [showForm, setShowForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState<CategoryForm>(emptyForm)

  const loadCategories = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await stackstoreApi.getCategories({ includeInactive: true })
      if (result.error) throw new Error(result.error)
      const rows = Array.isArray(result.data) ? result.data : []
      setCategories(
        rows.sort((a: Category, b: Category) =>
          (a.name || '').localeCompare(b.name || '')
        )
      )
    } catch (err: any) {
      const { sanitizeError, logErrorSecurely } = await import('@/lib/utils/errorHandler')
      logErrorSecurely(err, 'loadStackStoreCategories')
      setError(sanitizeError(err).message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadCategories()
  }, [loadCategories])

  const filteredCategories = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return categories.filter((category) => {
      if (statusFilter === 'active' && category.active === false) return false
      if (statusFilter === 'inactive' && category.active !== false) return false
      if (!q) return true
      return (
        category.name.toLowerCase().includes(q) ||
        String(category.description || '').toLowerCase().includes(q)
      )
    })
  }, [categories, searchQuery, statusFilter])

  const resetForm = () => {
    setFormData(emptyForm)
    setEditingCategory(null)
    setShowForm(false)
  }

  const handleAdd = () => {
    setEditingCategory(null)
    setFormData(emptyForm)
    setShowForm(true)
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name || '',
      description: category.description || '',
      image_url: category.image_url || '',
      active: category.active !== false,
    })
    setShowForm(true)
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    try {
      setSaving(true)
      setError(null)
      setSuccess(null)

      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        image_url: formData.image_url.trim() || null,
        active: formData.active,
      }

      if (!payload.name) {
        setError('Category name is required.')
        return
      }

      const result = editingCategory
        ? await stackstoreApi.updateCategory(editingCategory.id, payload)
        : await stackstoreApi.createCategory(payload)

      if (result.error) throw new Error(result.error)
      setSuccess(editingCategory ? 'Category updated successfully.' : 'Category created successfully.')
      resetForm()
      await loadCategories()
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      const { sanitizeError, logErrorSecurely } = await import('@/lib/utils/errorHandler')
      logErrorSecurely(err, 'saveStackStoreCategory')
      setError(sanitizeError(err).message)
    } finally {
      setSaving(false)
    }
  }

  const handleToggleActive = async (category: Category) => {
    try {
      setError(null)
      setSuccess(null)
      const nextActive = category.active === false
      const result = await stackstoreApi.updateCategory(category.id, { active: nextActive })
      if (result.error) throw new Error(result.error)
      setSuccess(`Category ${nextActive ? 'activated' : 'deactivated'} successfully.`)
      await loadCategories()
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      const { sanitizeError, logErrorSecurely } = await import('@/lib/utils/errorHandler')
      logErrorSecurely(err, 'toggleStackStoreCategory')
      setError(sanitizeError(err).message)
    }
  }

  const handleDelete = async (category: Category) => {
    if (!window.confirm(`Delete category "${category.name}"? Products linked to it may become uncategorized.`)) {
      return
    }

    try {
      setError(null)
      setSuccess(null)
      const result = await stackstoreApi.deleteCategory(category.id)
      if (result.error) throw new Error(result.error)
      setSuccess('Category deleted successfully.')
      await loadCategories()
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      const { sanitizeError, logErrorSecurely } = await import('@/lib/utils/errorHandler')
      logErrorSecurely(err, 'deleteStackStoreCategory')
      setError(sanitizeError(err).message)
    }
  }

  const activeCount = categories.filter((category) => category.active !== false).length
  const inactiveCount = categories.length - activeCount

  if (loading && categories.length === 0) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-orange-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-xl border border-white/15 bg-gradient-to-r from-orange-500/90 to-cyan-500/80 p-5 text-white shadow-xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Categories Management</h1>
            <p className="mt-1 text-sm text-white/85">Organize products and control marketplace category visibility.</p>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-sm">
            <div className="rounded-lg border border-white/20 bg-black/15 px-3 py-2">
              <div className="text-lg font-bold">{categories.length}</div>
              <div className="text-white/75">Total</div>
            </div>
            <div className="rounded-lg border border-white/20 bg-black/15 px-3 py-2">
              <div className="text-lg font-bold">{activeCount}</div>
              <div className="text-white/75">Active</div>
            </div>
            <div className="rounded-lg border border-white/20 bg-black/15 px-3 py-2">
              <div className="text-lg font-bold">{inactiveCount}</div>
              <div className="text-white/75">Hidden</div>
            </div>
          </div>
        </div>
      </div>

      {error && <div className="rounded-xl border border-red-500/30 bg-red-500/15 p-4 text-sm text-red-200">{error}</div>}
      {success && <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/15 p-4 text-sm text-emerald-200">{success}</div>}

      <div className="rounded-xl border border-white/10 bg-slate-950/70 p-4 shadow-lg">
        <div className="flex flex-col gap-3 lg:flex-row">
          <label className="relative flex-1">
            <FiSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search categories"
              className="w-full rounded-lg border border-white/10 bg-black/30 py-2 pl-10 pr-3 text-sm text-white outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-500/20"
            />
          </label>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as 'all' | 'active' | 'inactive')}
            className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-500/20"
          >
            <option value="all">All statuses</option>
            <option value="active">Active only</option>
            <option value="inactive">Inactive only</option>
          </select>
          <button
            onClick={loadCategories}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15"
          >
            <FiRefreshCw className="h-4 w-4" />
            Refresh
          </button>
          <button
            onClick={handleAdd}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600"
          >
            <FiPlus className="h-4 w-4" />
            Add Category
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-xl border border-white/10 bg-slate-950/80 p-5 shadow-lg">
          <h2 className="text-lg font-semibold text-white">{editingCategory ? 'Edit Category' : 'Add Category'}</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="space-y-1">
              <span className="text-sm font-medium text-slate-300">Name</span>
              <input
                value={formData.name}
                onChange={(event) => setFormData({ ...formData, name: event.target.value })}
                className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-orange-400"
                required
              />
            </label>
            <label className="space-y-1">
              <span className="text-sm font-medium text-slate-300">Image URL</span>
              <input
                type="url"
                value={formData.image_url}
                onChange={(event) => setFormData({ ...formData, image_url: event.target.value })}
                className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-orange-400"
              />
            </label>
          </div>
          <label className="mt-4 block space-y-1">
            <span className="text-sm font-medium text-slate-300">Description</span>
            <textarea
              value={formData.description}
              onChange={(event) => setFormData({ ...formData, description: event.target.value })}
              rows={3}
              className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-orange-400"
            />
          </label>
          <label className="mt-4 flex items-center gap-2 text-sm text-slate-200">
            <input
              type="checkbox"
              checked={formData.active}
              onChange={(event) => setFormData({ ...formData, active: event.target.checked })}
              className="h-4 w-4 rounded border-white/20 text-orange-500 focus:ring-orange-500"
            />
            Visible in StackStore
          </label>
          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? 'Saving...' : editingCategory ? 'Update Category' : 'Create Category'}
            </button>
            <button type="button" onClick={resetForm} className="rounded-lg border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15">
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="overflow-hidden rounded-xl border border-white/10 bg-slate-950/70 shadow-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/10">
            <thead className="bg-white/5">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-400">Category</th>
                <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase text-slate-400 md:table-cell">Description</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-400">Status</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center text-sm text-slate-400">
                    {loading ? 'Loading categories...' : 'No categories found.'}
                  </td>
                </tr>
              ) : (
                filteredCategories.map((category) => (
                  <tr key={category.id} className="transition hover:bg-white/[0.03]">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        {category.image_url ? (
                          <img src={category.image_url} alt={category.name} className="h-11 w-11 rounded-lg object-cover" />
                        ) : (
                          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white/10 text-sm font-semibold text-slate-300">
                            {category.name.slice(0, 1).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div className="font-medium text-white">{category.name}</div>
                          <div className="text-xs text-slate-500">{category.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="hidden max-w-md px-4 py-4 text-sm text-slate-300 md:table-cell">
                      <p className="line-clamp-2">{category.description || 'No description'}</p>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${category.active === false ? 'bg-slate-700 text-slate-200' : 'bg-emerald-500/15 text-emerald-300'}`}>
                        {category.active === false ? 'Inactive' : 'Active'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleToggleActive(category)} className="rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/15">
                          {category.active === false ? 'Activate' : 'Deactivate'}
                        </button>
                        <button onClick={() => handleEdit(category)} className="rounded-lg bg-cyan-500/90 p-2 text-white transition hover:bg-cyan-600" title="Edit category">
                          <FiEdit2 className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDelete(category)} className="rounded-lg bg-red-500/90 p-2 text-white transition hover:bg-red-600" title="Delete category">
                          <FiTrash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
