'use client'

import React from 'react'
import Link from 'next/link'
import type { StoreProduct } from '../types'

type Props = {
  product: StoreProduct
  categoryName?: string
  isDarkMode?: boolean
}

function platformTone(platform?: string): string {
  const p = (platform || '').toLowerCase()
  if (p.includes('mern') || p.includes('node')) return 'stackstore-platform--mern'
  if (p.includes('next')) return 'stackstore-platform--next'
  if (p.includes('react')) return 'stackstore-platform--react'
  if (p.includes('flutter')) return 'stackstore-platform--flutter'
  if (p.includes('laravel') || p.includes('django')) return 'stackstore-platform--php'
  return 'stackstore-platform--default'
}

const ProductCard: React.FC<Props> = ({ product, categoryName, isDarkMode = true }) => {
  const hasLinks = Boolean(product.github_url || product.live_url || product.demo_url)

  return (
    <Link
      href={`/stackstore/products/${product.id}`}
      className={`stackstore-card group ${isDarkMode ? 'stackstore-card--dark' : 'stackstore-card--light'}`}
    >
      <div className="stackstore-card__media">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="stackstore-card__img"
            loading="lazy"
          />
        ) : (
          <div className="stackstore-card__placeholder" aria-hidden>
            <span>📦</span>
          </div>
        )}
        <div className="stackstore-card__media-overlay" aria-hidden />
        <div className="stackstore-card__badges">
          {product.team4stack_verified ? (
            <span className="stackstore-badge stackstore-badge--verified">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Verified
            </span>
          ) : null}
          {product.platform ? (
            <span className={`stackstore-platform ${platformTone(product.platform)}`}>{product.platform}</span>
          ) : null}
        </div>
      </div>

      <div className="stackstore-card__body">
        {categoryName ? <p className="stackstore-card__category">{categoryName}</p> : null}
        <h3 className="stackstore-card__title">{product.name}</h3>
        {product.description ? (
          <p className="stackstore-card__desc">{product.description}</p>
        ) : null}

        {hasLinks ? (
          <div className="stackstore-card__meta">
            {product.github_url ? <span className="stackstore-card__meta-item">GitHub</span> : null}
            {product.live_url || product.demo_url ? (
              <span className="stackstore-card__meta-item">Live demo</span>
            ) : null}
          </div>
        ) : null}

        <div className="stackstore-card__footer">
          <div className="stackstore-card__price-wrap">
            <span className="stackstore-card__price-label">From</span>
            <span className="stackstore-card__price">
              {product.price != null ? `Rs. ${product.price.toLocaleString()}` : 'Contact'}
            </span>
          </div>
          <span className="stackstore-card__cta">
            View
            <svg className="stackstore-card__cta-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  )
}

export default ProductCard
