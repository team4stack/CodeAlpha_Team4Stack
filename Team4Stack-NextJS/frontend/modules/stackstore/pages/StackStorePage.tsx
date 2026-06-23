'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useTheme } from '@/contexts/ThemeContext'
import { stackstoreApi } from '@/lib/api'
import { landingApi } from '@/lib/api'

type Product = {
  id: string
  name: string
  description?: string
  price?: number
  image_url?: string
  category_id?: string
}

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
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [settings, setSettings] = useState<StoreSettings>({
    heroTitle: 'StackStore',
    heroSubtitle: 'A marketplace where students showcase and sell their projects.',
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

        setSettings({
          heroTitle: map.stackstore_hero_title || 'StackStore',
          heroSubtitle:
            map.stackstore_hero_subtitle ||
            'A marketplace where students showcase and sell their projects.',
          launchStatus: map.stackstore_launch_status || 'live',
          contactEmail: map.stackstore_contact_email || '',
          publicEnabled: map.stackstore_public_enabled !== 'false',
        })

        const [productsRes, categoriesRes] = await Promise.all([
          stackstoreApi.getProducts({ active: true }),
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
              {isBeta ? 'Beta Marketplace' : 'Marketplace'}
            </span>
            <h1 className={`text-3xl sm:text-4xl md:text-5xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
                {settings.heroTitle}
              </span>
            </h1>
            <p className={`mt-4 text-base md:text-lg ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              {settings.heroSubtitle}
            </p>
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

          {/* Category filter */}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className={`h-72 rounded-2xl animate-pulse ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`}
                />
              ))}
            </div>
          ) : filtered.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((product) => (
                <article
                  key={product.id}
                  className={`flex flex-col rounded-2xl border overflow-hidden transition hover:shadow-lg ${
                    isDarkMode ? 'bg-slate-900/60 border-slate-700/60' : 'bg-white border-slate-200'
                  }`}
                >
                  <div className={`h-44 flex items-center justify-center ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-4xl">📦</span>
                    )}
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    {product.category_id && categoryMap[product.category_id] && (
                      <span className={`text-xs uppercase tracking-wide ${isDarkMode ? 'text-purple-300' : 'text-purple-600'}`}>
                        {categoryMap[product.category_id]}
                      </span>
                    )}
                    <h3 className={`text-lg font-semibold mt-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      {product.name}
                    </h3>
                    {product.description && (
                      <p className={`text-sm mt-2 line-clamp-3 flex-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                        {product.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-700/30">
                      <span className={`text-lg font-bold ${isDarkMode ? 'text-cyan-400' : 'text-blue-600'}`}>
                        {product.price != null ? `Rs. ${product.price.toLocaleString()}` : 'Contact'}
                      </span>
                      {settings.contactEmail ? (
                        <a
                          href={`mailto:${settings.contactEmail}?subject=Inquiry: ${encodeURIComponent(product.name)}`}
                          className="text-sm font-medium px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:opacity-90 transition"
                        >
                          Inquire
                        </a>
                      ) : (
                        <Link
                          href="/contact"
                          className="text-sm font-medium px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:opacity-90 transition"
                        >
                          Contact Us
                        </Link>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div
              className={`text-center py-16 rounded-2xl border ${
                isDarkMode ? 'border-slate-700 bg-slate-900/50' : 'border-slate-200 bg-white'
              }`}
            >
              <p className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                {isBeta ? 'Products coming soon!' : 'No products available yet.'}
              </p>
              <p className={`text-sm mt-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Check back soon — student projects will be listed here.
              </p>
              <Link
                href="/courses"
                className="inline-block mt-6 text-sm font-medium px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:opacity-90 transition"
              >
                Explore Courses
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default StackStorePage
