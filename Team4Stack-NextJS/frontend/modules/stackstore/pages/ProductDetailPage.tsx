'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { stackstoreApi } from '@/lib/api'
import { getUserFriendlyMessage } from '@/lib/utils/errorHandler'
import type { StoreProduct } from '../types'
import '../stackstore.css'

type Props = { productId: string }

const ProductDetailPage: React.FC<Props> = ({ productId }) => {
  const router = useRouter()
  const { user } = useAuth()
  const [product, setProduct] = useState<StoreProduct | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [buyerNote, setBuyerNote] = useState('')
  const [checkingOut, setCheckingOut] = useState(false)
  const [orderDone, setOrderDone] = useState(false)

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      setError('')
      try {
        const res = await stackstoreApi.getProductById(productId, true)
        if (!res.success || !res.data) throw new Error(res.error || 'Product not found')
        setProduct(res.data as StoreProduct)
      } catch (err: unknown) {
        setError(getUserFriendlyMessage(err, 'Product not found.'))
      } finally {
        setLoading(false)
      }
    })()
  }, [productId])

  const handleBuy = async () => {
    if (!user) {
      router.push(`/login?returnTo=${encodeURIComponent(`/stackstore/products/${productId}`)}`)
      return
    }
    setCheckingOut(true)
    setError('')
    try {
      const res = await stackstoreApi.checkout({ product_id: productId, buyer_note: buyerNote || undefined })
      if (!res.success) throw new Error(res.error || 'Checkout failed')
      setOrderDone(true)
    } catch (err: unknown) {
      setError(getUserFriendlyMessage(err, 'Could not place order. Please try again.'))
    } finally {
      setCheckingOut(false)
    }
  }

  if (loading) {
    return <div className="min-h-screen bg-slate-950 pt-28 text-center text-slate-400">Loading…</div>
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-slate-950 pt-28 pb-16 text-center">
        <p className="text-red-400">{error || 'Product not found'}</p>
        <Link href="/stackstore" className="stackstore-btn mt-6 inline-flex">
          Back to store
        </Link>
      </div>
    )
  }

  if (orderDone) {
    return (
      <div className="min-h-screen bg-slate-950 pt-28 pb-16">
        <div className="container-custom max-w-xl text-center">
          <h1 className="text-2xl font-bold text-white mb-3">Order placed</h1>
          <p className="stackstore-escrow-note mb-6">
            Team4Stack will contact you for secure payment. Your payment stays in escrow until the project is
            delivered and verified. We then connect you with the seller.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/stackstore/orders" className="stackstore-btn">
              My orders
            </Link>
            <Link href="/stackstore" className="stackstore-btn stackstore-btn--ghost">
              Continue shopping
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 pt-28 pb-16">
      <div className="container-custom max-w-5xl">
        <Link href="/stackstore" className="text-sm text-purple-300 hover:text-purple-200">
          ← Back to StackStore
        </Link>

        <div className="grid lg:grid-cols-2 gap-8 mt-6">
          <div className={`h-72 lg:h-96 rounded-2xl overflow-hidden ${product.image_url ? '' : 'bg-slate-800 flex items-center justify-center'}`}>
            {product.image_url ? (
              <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-6xl">📦</span>
            )}
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {product.team4stack_verified ? <span className="stackstore-badge">Team4Stack Verified</span> : null}
              {product.platform ? (
                <span className="text-xs px-2 py-1 rounded-full bg-purple-500/15 text-purple-200">{product.platform}</span>
              ) : null}
            </div>
            <h1 className="text-3xl font-bold text-white">{product.name}</h1>
            {product.price != null ? (
              <p className="text-2xl font-bold text-cyan-300 mt-3">Rs. {product.price.toLocaleString()}</p>
            ) : null}
            {product.description ? <p className="text-slate-300 mt-4 leading-relaxed">{product.description}</p> : null}

            <div className="flex flex-wrap gap-3 mt-5">
              {product.live_url ? (
                <a href={product.live_url} target="_blank" rel="noopener noreferrer" className="stackstore-btn stackstore-btn--ghost">
                  Live preview
                </a>
              ) : null}
              {product.demo_url ? (
                <a href={product.demo_url} target="_blank" rel="noopener noreferrer" className="stackstore-btn stackstore-btn--ghost">
                  Demo
                </a>
              ) : null}
            </div>

            <div className="stackstore-escrow-note mt-6">
              Pay through Team4Stack. We verify the project, hold payment in escrow, and connect you with the seller after
              delivery is confirmed.
            </div>

            <textarea
              className="stackstore-textarea min-h-20 mt-4"
              placeholder="Note for Team4Stack (optional)"
              value={buyerNote}
              onChange={(e) => setBuyerNote(e.target.value)}
            />

            {error ? <p className="text-red-400 text-sm mt-3">{error}</p> : null}

            <button type="button" onClick={handleBuy} disabled={checkingOut} className="stackstore-btn w-full mt-4">
              {checkingOut ? 'Processing…' : user ? 'Buy via Team4Stack' : 'Sign in to buy'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetailPage
