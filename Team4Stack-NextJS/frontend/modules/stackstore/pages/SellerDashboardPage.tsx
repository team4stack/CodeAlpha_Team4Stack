'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { stackstoreApi } from '@/lib/api'
import { getUserFriendlyMessage } from '@/lib/utils/errorHandler'
import { STACK_PLATFORMS, type StoreProduct } from '../types'
import '../stackstore.css'

const SellerDashboardPage: React.FC = () => {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [seller, setSeller] = useState<{ id: string; store_name: string } | null>(null)
  const [products, setProducts] = useState<StoreProduct[]>([])
  const [applicationStatus, setApplicationStatus] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    platform: 'MERN Stack',
    github_url: '',
    demo_url: '',
    live_url: '',
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.replace(`/login?returnTo=${encodeURIComponent('/stackstore/seller')}`)
      return
    }

    ;(async () => {
      setLoading(true)
      setError('')
      try {
        const [sellerRes, appRes] = await Promise.all([
          stackstoreApi.getMySellerProfile(),
          stackstoreApi.getMySellerApplication(),
        ])

        if (sellerRes.success && sellerRes.data) {
          setSeller(sellerRes.data as { id: string; store_name: string })
          const productsRes = await stackstoreApi.getMySellerProducts()
          setProducts(Array.isArray(productsRes.data) ? productsRes.data : [])
        } else {
          const app = appRes.data as { status?: string } | null
          setApplicationStatus(app?.status || null)
        }
      } catch (err: unknown) {
        setError(getUserFriendlyMessage(err, 'Could not load seller dashboard.'))
      } finally {
        setLoading(false)
      }
    })()
  }, [authLoading, user, router])

  const submitProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      const res = await stackstoreApi.createMySellerProduct({
        ...form,
        price: Number(form.price),
      })
      if (!res.success) throw new Error(res.error || 'Could not submit project')
      setSuccess('Project submitted for Team4Stack verification.')
      setForm({
        name: '',
        description: '',
        price: '',
        platform: 'MERN Stack',
        github_url: '',
        demo_url: '',
        live_url: '',
      })
      const productsRes = await stackstoreApi.getMySellerProducts()
      setProducts(Array.isArray(productsRes.data) ? productsRes.data : [])
    } catch (err: unknown) {
      setError(getUserFriendlyMessage(err, 'Could not submit project.'))
    } finally {
      setSaving(false)
    }
  }

  if (authLoading || loading) {
    return <div className="min-h-screen bg-slate-950 pt-28 text-center text-slate-400">Loading…</div>
  }

  if (!seller) {
    return (
      <div className="min-h-screen bg-slate-950 pt-28 pb-16">
        <div className="container-custom max-w-xl text-center">
          <h1 className="text-2xl font-bold text-white mb-3">Seller access required</h1>
          <p className="text-slate-400 mb-4">
            {applicationStatus === 'pending'
              ? 'Your seller application is under review.'
              : applicationStatus === 'rejected'
                ? 'Your seller application was not approved. Contact support if you have questions.'
                : 'Apply to sell pre-made stack projects on StackStore.'}
          </p>
          {applicationStatus !== 'pending' ? (
            <Link href="/stackstore/seller/apply" className="stackstore-btn">
              Apply as seller
            </Link>
          ) : (
            <Link href="/stackstore" className="stackstore-btn stackstore-btn--ghost">
              Back to store
            </Link>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 pt-28 pb-16">
      <div className="container-custom max-w-5xl">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <p className="text-purple-300 text-sm">Seller dashboard</p>
            <h1 className="text-3xl font-bold text-white">{seller.store_name}</h1>
          </div>
          <Link href="/stackstore" className="stackstore-btn stackstore-btn--ghost">
            View store
          </Link>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <form onSubmit={submitProduct} className="stackstore-form rounded-2xl border border-slate-700/60 bg-slate-900/50 p-6">
            <h2 className="text-lg font-semibold text-white">List a pre-made project</h2>
            <p className="text-sm text-slate-400">
              Include live demo + GitHub repo. Team4Stack verifies originality before listing.
            </p>

            <input
              className="stackstore-input"
              placeholder="Project name *"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
            <textarea
              className="stackstore-textarea min-h-24"
              placeholder="Description (features, stack, what buyer gets) *"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              required
            />
            <div className="grid sm:grid-cols-2 gap-3">
              <input
                className="stackstore-input"
                placeholder="Price (PKR) *"
                type="number"
                min="1"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                required
              />
              <select
                className="stackstore-select"
                value={form.platform}
                onChange={(e) => setForm({ ...form, platform: e.target.value })}
              >
                {STACK_PLATFORMS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
            <input
              className="stackstore-input"
              placeholder="GitHub repository URL *"
              value={form.github_url}
              onChange={(e) => setForm({ ...form, github_url: e.target.value })}
              required
            />
            <input
              className="stackstore-input"
              placeholder="Live demo URL"
              value={form.demo_url}
              onChange={(e) => setForm({ ...form, demo_url: e.target.value })}
            />
            <input
              className="stackstore-input"
              placeholder="Deployed app URL"
              value={form.live_url}
              onChange={(e) => setForm({ ...form, live_url: e.target.value })}
            />

            {error ? <p className="text-red-400 text-sm">{error}</p> : null}
            {success ? <p className="text-emerald-400 text-sm">{success}</p> : null}

            <button type="submit" disabled={saving} className="stackstore-btn w-full">
              {saving ? 'Submitting…' : 'Submit for verification'}
            </button>
          </form>

          <div className="rounded-2xl border border-slate-700/60 bg-slate-900/50 p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Your listings</h2>
            {products.length === 0 ? (
              <p className="text-slate-400 text-sm">No projects yet. Submit your first listing.</p>
            ) : (
              <ul className="space-y-3">
                {products.map((p) => (
                  <li key={p.id} className="rounded-xl border border-slate-700/50 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-white">{p.name}</p>
                        <p className="text-xs text-slate-400 mt-1">{p.platform}</p>
                      </div>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          p.verification_status === 'approved'
                            ? 'bg-emerald-500/15 text-emerald-300'
                            : p.verification_status === 'rejected'
                              ? 'bg-red-500/15 text-red-300'
                              : 'bg-amber-500/15 text-amber-300'
                        }`}
                      >
                        {p.verification_status || 'pending'}
                      </span>
                    </div>
                    {p.price != null ? (
                      <p className="text-sm text-cyan-300 mt-2">Rs. {p.price.toLocaleString()}</p>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SellerDashboardPage
