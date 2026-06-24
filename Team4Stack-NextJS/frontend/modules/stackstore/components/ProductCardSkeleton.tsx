'use client'

import React from 'react'

type Props = { isDarkMode?: boolean }

const ProductCardSkeleton: React.FC<Props> = ({ isDarkMode = true }) => (
  <div className={`stackstore-card stackstore-card--skeleton ${isDarkMode ? 'stackstore-card--dark' : 'stackstore-card--light'}`}>
    <div className="stackstore-card__media stackstore-card__media--skeleton" />
    <div className="stackstore-card__body">
      <div className="stackstore-skel stackstore-skel--sm" />
      <div className="stackstore-skel stackstore-skel--lg" />
      <div className="stackstore-skel stackstore-skel--md" />
      <div className="stackstore-skel stackstore-skel--md" />
      <div className="stackstore-card__footer">
        <div className="stackstore-skel stackstore-skel--price" />
        <div className="stackstore-skel stackstore-skel--btn" />
      </div>
    </div>
  </div>
)

export default ProductCardSkeleton
