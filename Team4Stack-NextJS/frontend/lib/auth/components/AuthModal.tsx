'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

type Props = { isOpen: boolean; onClose: () => void; initialError?: string | null }

/** Legacy modal entry — redirects to the dedicated /login page. */
const AuthModal: React.FC<Props> = ({ isOpen, onClose, initialError }) => {
  const router = useRouter()

  useEffect(() => {
    if (!isOpen || typeof globalThis.window === 'undefined') return

    const returnTo = `${globalThis.window.location.pathname}${globalThis.window.location.search}`
    const params = new URLSearchParams()
    if (returnTo && returnTo !== '/login') params.set('returnTo', returnTo)
    if (initialError) params.set('error', initialError)

    onClose()
    const query = params.toString()
    router.push(query ? `/login?${query}` : '/login')
  }, [isOpen, initialError, onClose, router])

  return null
}

export default AuthModal
