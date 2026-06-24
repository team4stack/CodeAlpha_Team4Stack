'use client'

import React, { Suspense, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useAuthForm } from '@/lib/auth/hooks/useAuthForm'
import AuthFormContent from '@/lib/auth/components/AuthFormContent'
import { notifyAuthSessionUpdatedAndReload } from '@/lib/auth/components/auth-modal/sessionPersistence'
import '@/lib/auth/styles/login-page.css'

export const HERO_AUTH_BG = '/hero/team4stack-hero-section.png'

function resolveReturnTo(raw: string | null): string {
  if (!raw || !raw.startsWith('/') || raw.startsWith('//')) return '/'
  return raw
}

type AuthPageMode = 'login' | 'signup'

function UserAuthPageInner({ mode }: { mode: AuthPageMode }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, loading: authLoading } = useAuth()
  const returnTo = resolveReturnTo(searchParams.get('returnTo'))
  const initialError = searchParams.get('error')
  const isSignup = mode === 'signup'

  const onSuccess = () => {
    if (returnTo && returnTo !== '/login' && returnTo !== '/signup') {
      globalThis.window.location.assign(returnTo)
      return
    }
    notifyAuthSessionUpdatedAndReload()
  }

  const form = useAuthForm({
    active: true,
    returnTo,
    initialError,
    initialSignUp: isSignup,
    authPath: isSignup ? '/signup' : '/login',
    onSuccess,
  })

  useEffect(() => {
    if (mode === 'login' && searchParams.get('mode') === 'signup') {
      const params = new URLSearchParams(searchParams.toString())
      params.delete('mode')
      const q = params.toString()
      router.replace(q ? `/signup?${q}` : '/signup')
    }
  }, [mode, searchParams, router])

  useEffect(() => {
    if (authLoading) return
    if (user && returnTo) {
      router.replace(returnTo)
    }
  }, [authLoading, user, returnTo, router])

  const partnerHref = isSignup
    ? `/login${returnTo !== '/' ? `?returnTo=${encodeURIComponent(returnTo)}` : ''}`
    : `/signup${returnTo !== '/' ? `?returnTo=${encodeURIComponent(returnTo)}` : ''}`

  return (
    <div className="t4s-login-page">
      <div className="t4s-login-page__bg" aria-hidden>
        <img
          src={HERO_AUTH_BG}
          alt=""
          className="t4s-login-page__bg-img"
          width={1536}
          height={1024}
          fetchPriority="high"
        />
      </div>
      <div className="t4s-login-page__overlay" aria-hidden />
      <div className="t4s-login-page__fade" aria-hidden />

      <div className="t4s-login-page__content">
        <Link href="/" className="t4s-login-page__back-home">
          <span className="t4s-login-page__back-home-icon" aria-hidden>
            ←
          </span>
          Back to website
        </Link>

        <div className="t4s-login-page__glow" aria-hidden />

        <div className="t4s-login-page__panel">
          <Link href="/" className="t4s-login-page__logo-link">
            <img
              src="/Team4Stack_Transparant.svg"
              alt="Team4Stack"
              className="t4s-login-page__logo"
              width={52}
              height={52}
            />
          </Link>

          <AuthFormContent
            {...form}
            recaptchaRef={form.recaptchaRef}
            layout="page"
            partnerHref={partnerHref}
            partnerMode={isSignup ? 'login' : 'signup'}
          />
        </div>
      </div>
    </div>
  )
}

function UserAuthPage({ mode }: { mode: AuthPageMode }) {
  return (
    <Suspense
      fallback={
        <div className="t4s-login-page t4s-login-page--loading">
          <p>Loading…</p>
        </div>
      }
    >
      <UserAuthPageInner mode={mode} />
    </Suspense>
  )
}

export default UserAuthPage
