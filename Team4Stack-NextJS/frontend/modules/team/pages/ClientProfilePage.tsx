'use client'

import React from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import '../styles/account-profile.css'

const ClientProfilePage: React.FC = () => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="account-profile">
        <p className="account-profile__muted">Loading…</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="account-profile container-custom">
        <h1 className="account-profile__title">Your Profile</h1>
        <p className="account-profile__muted">Sign in to view your client profile and messages.</p>
        <Link href="/" className="account-profile__link">
          Go to home
        </Link>
      </div>
    )
  }

  return (
    <div className="account-profile container-custom">
      <span className="account-profile__badge">Client Profile</span>
      <h1 className="account-profile__title">Your Profile</h1>

      <div className="account-profile__card">
        {user.avatar_url ? (
          <img src={user.avatar_url} alt="" className="account-profile__avatar" />
        ) : (
          <div className="account-profile__avatar account-profile__avatar--fallback">
            {(user.name || user.email || 'U').charAt(0).toUpperCase()}
          </div>
        )}
        <div>
          <p className="account-profile__name">{user.name || 'User'}</p>
          <p className="account-profile__email">{user.email}</p>
          {user.username ? <p className="account-profile__muted">@{user.username}</p> : null}
        </div>
      </div>

      <p className="account-profile__hint">
        This is your normal client account. To hire a developer, browse the{' '}
        <Link href="/team" className="account-profile__link">
          team page
        </Link>{' '}
        and message from their profile.
      </p>

      <Link href="/developer/inbox" className="account-profile__cta">
        View your messages
      </Link>
    </div>
  )
}

export default ClientProfilePage
