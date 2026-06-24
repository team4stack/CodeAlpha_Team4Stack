'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useTheme } from '@/contexts/ThemeContext'
import { useAuth } from '@/contexts/AuthContext'
import { stackstoreApi } from '@/lib/api'
import { landingApi } from '@/lib/api'
import type { StoreProduct } from '../types'
import ProductCard from '../components/ProductCard'
import ProductCardSkeleton from '../components/ProductCardSkeleton'
import '../stackstore.css'

type Category = {
  id: string
  name: string
}

type StoreSettings = {
  heroTitle: string
  heroSubtitle: string
  launchStatus: string
  contactEmail: string
  publicEnabled: boolean
}

const StackStorePage: React.FC = () => {
  const { isDarkMode } = useTheme()
  const { user } = useAuth()
  const [products, setProducts] = useState<StoreProduct[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [settings, setSettings] = useState<StoreSettings>({
    heroTitle: 'StackStore',
    heroSubtitle: 'Buy verified pre-made stack projects. Team4Stack handles payment & connects you with sellers.',
    launchStatus: 'live',
    contactEmail: '',
    publicEnabled: true,
  })
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      setError(null)

      try {
        const settingsRes = await landingApi.getSiteSettings([
          'stackstore_public_enabled',
          'stackstore_hero_title',
          'stackstore_hero_subtitle',
          'stackstore_launch_status',
          'stackstore_contact_email',
        ])

        const map: Record<string, string> = {}
        if (Array.isArray(settingsRes.data)) {
          settingsRes.data.forEach((s: { key: string; value: string }) => {
            map[s.key] = s.value
          })
        }

        const nextSettings = {
          heroTitle: map.stackstore_hero_title || 'StackStore',
          heroSubtitle:
            map.stackstore_hero_subtitle ||
            'Buy verified pre-made stack projects. Team4Stack handles payment & connects you with sellers.',
          launchStatus: map.stackstore_launch_status || 'live',
          contactEmail: map.stackstore_contact_email || '',
          publicEnabled: map.stackstore_public_enabled !== 'false',
        }
        setSettings(nextSettings)

        if (!nextSettings.publicEnabled) {
          setProducts([])
          setCategories([])
          return
        }

        const [productsRes, categoriesRes] = await Promise.all([
          stackstoreApi.getProducts({ storefront: true }),
          stackstoreApi.getCategories({ active: true }),
        ])

        setProducts(Array.isArray(productsRes.data) ? productsRes.data : [])
        setCategories(Array.isArray(categoriesRes.data) ? categoriesRes.data : [])
      } catch {
        setError('Unable to load marketplace data. Please try again later.')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const categoryMap = Object.fromEntries(categories.map((c) => [c.id, c.name]))
  const filtered =
    selectedCategory === 'all'
      ? products
      : products.filter((p) => p.category_id === selectedCategory)

  const isBeta = settings.launchStatus === 'beta' || settings.launchStatus === 'coming_soon'

  if (!settings.publicEnabled && !loading) {
    return (
      <div className={`min-h-screen pt-28 pb-20 ${isDarkMode ? 'bg-slate-950 text-slate-300' : 'bg-slate-50 text-slate-600'}`}>
        <div className="container-custom max-w-xl text-center">
          <h1 className="text-2xl font-bold text-white mb-3">StackStore is not public yet</h1>
          <p className="mb-6">The marketplace is currently disabled by admin.</p>
          <Link href="/" className="stackstore-btn inline-flex">
            Back to home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
      <section className="pt-24 md:pt-28 pb-12">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <span
              className={`inline-block text-xs uppercase tracking-widest px-3 py-1 rounded-full mb-4 ${
                isDarkMode ? 'bg-purple-500/15 text-purple-300' : 'bg-purple-100 text-purple-700'
              }`}
            >
              {isBeta ? 'Beta Marketplace' : 'Verified Projects'}
            </span>
            <h1 className={`text-3xl sm:text-4xl md:text-5xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
                {settings.heroTitle}
              </span>
            </h1>
            <p className={`mt-4 text-base md:text-lg ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              {settings.heroSubtitle}
            </p>

            <div className="flex flex-wrap justify-center gap-3 mt-8">
              <Link href="/stackstore/seller/apply" className="stackstore-btn">
                Sell your stack project
              </Link>
              {user ? (
                <>
                  <Link href="/stackstore/seller" className="stackstore-btn stackstore-btn--ghost">
                    Seller dashboard
                  </Link>
                  <Link href="/stackstore/orders" className="stackstore-btn stackstore-btn--ghost">
                    My orders
                  </Link>
                </>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <section className="pb-20">
        <div className="container-custom max-w-6xl">
          {error && (
            <div className="mb-8 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-center text-sm">
              {error}
            </div>
          )}

          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-center mb-8">
              <button
                type="button"
                onClick={() => setSelectedCategory('all')}
                className={`text-sm px-4 py-2 rounded-lg transition ${
                  selectedCategory === 'all'
                    ? 'bg-purple-600 text-white'
                    : isDarkMode
                      ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`text-sm px-4 py-2 rounded-lg transition ${
                    selectedCategory === cat.id
                      ? 'bg-purple-600 text-white'
                      : isDarkMode
                        ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-7">
              {Array.from({ length: 6 }).map((_, i) => (
                <ProductCardSkeleton key={i} isDarkMode={isDarkMode} />
              ))}
            </div>
          ) : filtered.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-7">
              {filtered.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  categoryName={product.category_id ? categoryMap[product.category_id] : undefined}
                  isDarkMode={isDarkMode}
                />
              ))}
            </div>
          ) : (
            <div
              className={`text-center py-16 rounded-2xl border ${
                isDarkMode ? 'border-slate-700 bg-slate-900/50' : 'border-slate-200 bg-white'
              }`}
            >
              <p className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                {isBeta ? 'Verified projects coming soon!' : 'No verified projects yet.'}
              </p>
              <p className={`text-sm mt-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Sellers can apply and list pre-made stack projects after Team4Stack verification.
              </p>
              <Link
                href="/stackstore/seller/apply"
                className="inline-block mt-6 text-sm font-medium px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:opacity-90 transition"
              >
                Become a seller
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default StackStorePage
