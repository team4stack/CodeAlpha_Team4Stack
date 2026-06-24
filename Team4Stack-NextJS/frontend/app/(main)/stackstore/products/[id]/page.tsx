'use client'

import React from 'react'
import { useParams } from 'next/navigation'
import ProductDetailPage from '@/modules/stackstore/pages/ProductDetailPage'

export default function Page() {
  const params = useParams()
  const id = String(params?.id || '')
  return <ProductDetailPage productId={id} />
}
