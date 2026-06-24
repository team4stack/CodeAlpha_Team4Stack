'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { stackstoreApi } from '@/lib/api'
import { getUserFriendlyMessage } from '@/lib/utils/errorHandler'
import type { StoreOrder } from '../types'
import '../stackstore.css'

const BuyerOrdersPage: React.FC = () => {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [orders, setOrders] = useState<StoreOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.replace(`/login?returnTo=${encodeURIComponent('/stackstore/orders')}`)
      return
    }

    ;(async () => {
      try {
        const res = await stackstoreApi.getMyOrders()
        if (!res.success) throw new Error(res.error || 'Could not load orders')
        setOrders(Array.isArray(res.data) ? res.data : [])
      } catch (err: unknown) {
        setError(getUserFriendlyMessage(err, 'Could not load orders.'))
      } finally {
        setLoading(false)
      }
    })()
  }, [authLoading, user, router])

  if (authLoading || loading) {
    return <div className="min-h-screen bg-slate-950 pt-28 text-center text-slate-400">Loading…</div>
  }

  return (
    <div className="min-h-screen bg-slate-950 pt-28 pb-16">
      <div className="container-custom max-w-3xl">
        <Link href="/stackstore" className="text-sm text-purple-300 hover:text-purple-200">
          ← Back to StackStore
        </Link>
        <h1 className="text-3xl font-bold text-white mt-4 mb-6">My orders</h1>

        {error ? <p className="text-red-400 mb-4">{error}</p> : null}

        {orders.length === 0 ? (
          <p className="text-slate-400">No orders yet.</p>
        ) : (
          <ul className="space-y-4">
            {orders.map((order) => (
              <li key={order.id} className="rounded-xl border border-slate-700/60 bg-slate-900/50 p-5">
                <div className="flex flex-wrap justify-between gap-2">
                  <p className="text-white font-medium">Order #{order.id.slice(0, 8)}</p>
                  <p className="text-cyan-300">
                    {order.total_amount != null ? `Rs. ${order.total_amount.toLocaleString()}` : ''}
                  </p>
                </div>
                <p className="text-sm text-slate-400 mt-2">
                  Escrow: {order.escrow_status || 'pending_payment'} · Payment: {order.payment_status || 'pending'}
                </p>
                {order.product_id ? (
                  <Link href={`/stackstore/products/${order.product_id}`} className="text-sm text-purple-300 mt-2 inline-block">
                    View product
                  </Link>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default BuyerOrdersPage
