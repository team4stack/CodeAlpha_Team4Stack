'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { FiEdit2, FiPlus, FiRefreshCw, FiSearch, FiTrash2 } from 'react-icons/fi'
import { stackstoreApi } from '@/lib/api'

type Seller = {
  id: string
  user_id: string
  store_name: string
  description?: string | null
  active?: boolean
}

type SellerForm = {
  user_id: string
  store_name: string
  description: string
  active: boolean
}

const emptyForm: SellerForm = {
  user_id: '',
  store_name: '',
  description: '',
  active: true,
}

export default function SellersManagementPage() {
  const [sellers, setSellers] = useState<Seller[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [showForm, setShowForm] = useState(false)
  const [editingSeller, setEditingSeller] = useState<Seller | null>(null)
  const [formData, setFormData] = useState<SellerForm>(emptyForm)

  const loadSellers = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await stackstoreApi.getSellers({ includeInactive: true })
      if (result.error) throw new Error(result.error)
      const rows = Array.isArray(result.data) ? result.data : []
      setSellers(
        rows.sort((a: Seller, b: Seller) =>
          (a.store_name || '').localeCompare(b.store_name || '')
        )
      )
    } catch (err: any) {
      const { sanitizeError, logErrorSecurely } = await import('@/lib/utils/errorHandler')
      logErrorSecurely(err, 'loadStackStoreSellers')
      setError(sanitizeError(err).message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadSellers()
  }, [loadSellers])

  const filteredSellers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return sellers.filter((seller) => {
      if (statusFilter === 'active' && seller.active === false) return false
      if (statusFilter === 'inactive' && seller.active !== false) return false
      if (!q) return true
      return (
        seller.store_name.toLowerCase().includes(q) ||
        seller.user_id.toLowerCase().includes(q) ||
        String(seller.description || '').toLowerCase().includes(q)
      )
    })
  }, [sellers, searchQuery, statusFilter])

  const resetForm = () => {
    setFormData(emptyForm)
    setEditingSeller(null)
    setShowForm(false)
  }

  const handleAdd = () => {
    setEditingSeller(null)
    setFormData(emptyForm)
    setShowForm(true)
  }

  const handleEdit = (seller: Seller) => {
    setEditingSeller(seller)
    setFormData({
      user_id: seller.user_id || '',
      store_name: seller.store_name || '',
      description: seller.description || '',
      active: seller.active !== false,
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
        user_id: formData.user_id.trim(),
        store_name: formData.store_name.trim(),
        description: formData.description.trim() || null,
        active: formData.active,
      }

      if (!payload.user_id || !payload.store_name) {
        setError('User ID and store name are required.')
        return
      }

      const result = editingSeller
        ? await stackstoreApi.updateSeller(editingSeller.id, payload)
        : await stackstoreApi.createSeller(payload)

      if (result.error) throw new Error(result.error)
      setSuccess(editingSeller ? 'Seller updated successfully.' : 'Seller created successfully.')
      resetForm()
      await loadSellers()
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      const { sanitizeError, logErrorSecurely } = await import('@/lib/utils/errorHandler')
      logErrorSecurely(err, 'saveStackStoreSeller')
      setError(sanitizeError(err).message)
    } finally {
      setSaving(false)
    }
  }

  const handleToggleActive = async (seller: Seller) => {
    try {
      setError(null)
      setSuccess(null)
      const nextActive = seller.active === false
      const result = await stackstoreApi.updateSeller(seller.id, { active: nextActive })
      if (result.error) throw new Error(result.error)
      setSuccess(`Seller ${nextActive ? 'activated' : 'deactivated'} successfully.`)
      await loadSellers()
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      const { sanitizeError, logErrorSecurely } = await import('@/lib/utils/errorHandler')
      logErrorSecurely(err, 'toggleStackStoreSeller')
      setError(sanitizeError(err).message)
    }
  }

  const handleDelete = async (seller: Seller) => {
    if (!window.confirm(`Delete seller "${seller.store_name}"?`)) return

    try {
      setError(null)
      setSuccess(null)
      const result = await stackstoreApi.deleteSeller(seller.id)
      if (result.error) throw new Error(result.error)
      setSuccess('Seller deleted successfully.')
      await loadSellers()
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      const { sanitizeError, logErrorSecurely } = await import('@/lib/utils/errorHandler')
      logErrorSecurely(err, 'deleteStackStoreSeller')
      setError(sanitizeError(err).message)
    }
  }

  const activeCount = sellers.filter((seller) => seller.active !== false).length
  const inactiveCount = sellers.length - activeCount

  if (loading && sellers.length === 0) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-orange-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-xl border border-white/15 bg-gradient-to-r from-cyan-500/90 to-orange-500/80 p-5 text-white shadow-xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Sellers Management</h1>
            <p className="mt-1 text-sm text-white/85">Manage marketplace seller accounts and store visibility.</p>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-sm">
            <div className="rounded-lg border border-white/20 bg-black/15 px-3 py-2">
              <div className="text-lg font-bold">{sellers.length}</div>
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
              placeholder="Search sellers"
              className="w-full rounded-lg border border-white/10 bg-black/30 py-2 pl-10 pr-3 text-sm text-white outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20"
            />
          </label>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as 'all' | 'active' | 'inactive')}
            className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20"
          >
            <option value="all">All statuses</option>
            <option value="active">Active only</option>
            <option value="inactive">Inactive only</option>
          </select>
          <button onClick={loadSellers} className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15">
            <FiRefreshCw className="h-4 w-4" />
            Refresh
          </button>
          <button onClick={handleAdd} className="inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-600">
            <FiPlus className="h-4 w-4" />
            Add Seller
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-xl border border-white/10 bg-slate-950/80 p-5 shadow-lg">
          <h2 className="text-lg font-semibold text-white">{editingSeller ? 'Edit Seller' : 'Add Seller'}</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="space-y-1">
              <span className="text-sm font-medium text-slate-300">User ID</span>
              <input
                value={formData.user_id}
                onChange={(event) => setFormData({ ...formData, user_id: event.target.value })}
                className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400"
                required
              />
            </label>
            <label className="space-y-1">
              <span className="text-sm font-medium text-slate-300">Store Name</span>
              <input
                value={formData.store_name}
                onChange={(event) => setFormData({ ...formData, store_name: event.target.value })}
                className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400"
                required
              />
            </label>
          </div>
          <label className="mt-4 block space-y-1">
            <span className="text-sm font-medium text-slate-300">Description</span>
            <textarea
              value={formData.description}
              onChange={(event) => setFormData({ ...formData, description: event.target.value })}
              rows={3}
              className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400"
            />
          </label>
          <label className="mt-4 flex items-center gap-2 text-sm text-slate-200">
            <input
              type="checkbox"
              checked={formData.active}
              onChange={(event) => setFormData({ ...formData, active: event.target.checked })}
              className="h-4 w-4 rounded border-white/20 text-cyan-500 focus:ring-cyan-500"
            />
            Seller can receive marketplace listings
          </label>
          <div className="mt-5 flex flex-wrap gap-2">
            <button type="submit" disabled={saving} className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-60">
              {saving ? 'Saving...' : editingSeller ? 'Update Seller' : 'Create Seller'}
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
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-400">Seller</th>
                <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase text-slate-400 md:table-cell">User ID</th>
                <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase text-slate-400 lg:table-cell">Description</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-400">Status</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredSellers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-sm text-slate-400">
                    {loading ? 'Loading sellers...' : 'No sellers found.'}
                  </td>
                </tr>
              ) : (
                filteredSellers.map((seller) => (
                  <tr key={seller.id} className="transition hover:bg-white/[0.03]">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-cyan-500/15 text-sm font-semibold text-cyan-200">
                          {seller.store_name.slice(0, 1).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-white">{seller.store_name}</div>
                          <div className="text-xs text-slate-500">{seller.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="hidden px-4 py-4 text-sm text-slate-300 md:table-cell">{seller.user_id}</td>
                    <td className="hidden max-w-md px-4 py-4 text-sm text-slate-300 lg:table-cell">
                      <p className="line-clamp-2">{seller.description || 'No description'}</p>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${seller.active === false ? 'bg-slate-700 text-slate-200' : 'bg-emerald-500/15 text-emerald-300'}`}>
                        {seller.active === false ? 'Inactive' : 'Active'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleToggleActive(seller)} className="rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/15">
                          {seller.active === false ? 'Activate' : 'Deactivate'}
                        </button>
                        <button onClick={() => handleEdit(seller)} className="rounded-lg bg-cyan-500/90 p-2 text-white transition hover:bg-cyan-600" title="Edit seller">
                          <FiEdit2 className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDelete(seller)} className="rounded-lg bg-red-500/90 p-2 text-white transition hover:bg-red-600" title="Delete seller">
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
