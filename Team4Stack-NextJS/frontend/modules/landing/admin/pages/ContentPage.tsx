'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { useParams } from 'next/navigation'
import toast from 'react-hot-toast'
import AdminCollapsibleSection from '@/modules/landing/admin/components/AdminCollapsibleSection'
import { landingApi, coursesApi, teamApi } from '@/lib/api'
import { retryWithBackoff } from '@/lib/utils/retry'

type Row = { id?: number; title?: string; description?: string; role_text?: string; image_url?: string; is_head?: boolean; profile_image_url?: string; banner_image_url?: string; portfolio_url?: string; github_url?: string; primary_tag?: string; order_index?: number; active?: boolean; level?: string; duration?: string; price?: string; note?: string; features?: string; gradient?: string; emoji?: string; gradient_color?: string; contact?: string }

interface ContentPageProps {
  contentType?: string
}

const ContentPage: React.FC<ContentPageProps> = ({ contentType: propContentType }) => {
  const params = useParams()
  const contentType = propContentType || (params?.contentType as string) || ''
  const table = useMemo(() => (contentType || '').toLowerCase(), [contentType])
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState<Row>({ title: '', description: '', role_text: '', image_url: '', is_head: false, profile_image_url: '', banner_image_url: '', portfolio_url: '', github_url: '', primary_tag: '', order_index: undefined, active: true, emoji: '', gradient_color: '', contact: '' })
  const [editingId, setEditingId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selectedService, setSelectedService] = useState<Row | null>(null)
  const [availableOrders, setAvailableOrders] = useState<number[]>([])

  // Component lifecycle tracking (dev only)

  // Handle ESC key for modal
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedService) {
        setSelectedService(null)
      }
    }
    if (selectedService) {
      document.addEventListener('keydown', handleEsc)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.removeEventListener('keydown', handleEsc)
      document.body.style.overflow = 'unset'
    }
  }, [selectedService])
  const isReviews = table === 'reviews'
  const isTeamLike = table === 'team_members' || table === 'mentor_profile'
  const isCourses = table === 'courses'
  const isServices = table === 'services'
  const isContact = table === 'contact'
  const isFooter = table === 'footer'
  const isSupport = table === 'support'
  const isProjects = table === 'projects'
  const isHero = table === 'hero'
  /** Hero tab: opaque fields, no glass-style inputs */
  const heroFieldClass =
    'w-full rounded border border-slate-700 bg-slate-950 py-1 px-1.5 text-xs text-white placeholder:text-slate-600 shadow-none focus:border-slate-500 focus:outline-none focus:ring-0'
  const heroSelectClass =
    'w-full min-w-0 rounded border border-slate-700 bg-slate-950 py-0.5 px-1 text-[11px] text-white shadow-none focus:border-slate-500 focus:outline-none focus:ring-0'
  /** Remove row: flat slate icon, top-right aligned */
  const heroRemoveBtnClass =
    'landing-admin-glass landing-admin-glass-icon z-[2] flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-slate-600 bg-slate-900/85 text-[13px] font-medium leading-none text-slate-400 hover:border-rose-500/55 hover:bg-rose-950/90 hover:text-rose-200'
  const moveArrayItem = <T,>(list: T[], from: number, to: number): T[] => {
    if (from === to || from < 0 || to < 0 || from >= list.length || to >= list.length) return [...list]
    const next = [...list]
    const [item] = next.splice(from, 1)
    next.splice(to, 0, item)
    return next
  }
  const isRecordEditorPage = isProjects || isServices || isCourses || isTeamLike
  const recordTypeLabel =
    isProjects ? 'Project' : isServices ? 'Service' : isCourses ? 'Course' : table === 'team_members' ? 'Team member' : 'Mentor'

  const [editorOpen, setEditorOpen] = useState(false)
  /** Hero: form opens in modal only (saved data is the default view). */
  const [heroSettingsOpen, setHeroSettingsOpen] = useState(false)

  const closeEditor = useCallback(() => {
    setEditorOpen(false)
    setEditingId(null)
    setForm({
      title: '',
      description: '',
      role_text: '',
      image_url: '',
      is_head: false,
      profile_image_url: '',
      banner_image_url: '',
      portfolio_url: '',
      github_url: '',
      primary_tag: '',
      order_index: undefined,
      active: true,
      level: '',
      duration: '',
      price: '',
      note: '',
      features: '',
      emoji: '',
      gradient_color: '',
      contact: ''
    })
  }, [])

  const openNewRecord = useCallback(() => {
    setEditingId(null)
    setForm({
      title: '',
      description: '',
      role_text: '',
      image_url: '',
      is_head: false,
      profile_image_url: '',
      banner_image_url: '',
      portfolio_url: '',
      github_url: '',
      primary_tag: '',
      order_index: undefined,
      active: true,
      level: '',
      duration: '',
      price: '',
      note: '',
      features: '',
      emoji: '',
      gradient_color: '',
      contact: ''
    })
    setEditorOpen(true)
  }, [])

  const closeHeroSettings = useCallback(() => {
    setHeroSettingsOpen(false)
  }, [])

  /** Open hero editor with form fields synced from saved site settings (`rows`). */
  const openHeroSettings = useCallback(() => {
    const map: Record<string, string> = {}
    rows.forEach((it: any) => {
      map[it.key] = it.value ?? ''
    })
    if (map.hero_animated_texts) {
      try {
        const parsed = JSON.parse(map.hero_animated_texts)
        if (Array.isArray(parsed)) setHeroAnimatedTexts(parsed)
      } catch {
        /* ignore */
      }
    }
    if (map.hero_bullet_points) {
      try {
        const parsed = JSON.parse(map.hero_bullet_points)
        if (Array.isArray(parsed)) setHeroBulletPoints(parsed)
      } catch {
        /* ignore */
      }
    }
    if (map.navbar_links) {
      try {
        const parsed = JSON.parse(map.navbar_links)
        if (Array.isArray(parsed)) setNavbarLinks(parsed)
      } catch {
        /* ignore */
      }
    }
    setForm((s) => ({ ...s, ...(map as any) }))
    setHeroSettingsOpen(true)
  }, [rows])

  useEffect(() => {
    setEditorOpen(false)
    setEditingId(null)
    setHeroSettingsOpen(false)
  }, [table])

  const landingFormModalOpen = (isRecordEditorPage && editorOpen) || (isHero && heroSettingsOpen)

  useEffect(() => {
    if (!landingFormModalOpen) return
    const onEsc = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (isRecordEditorPage && editorOpen) closeEditor()
      if (isHero && heroSettingsOpen) closeHeroSettings()
    }
    document.addEventListener('keydown', onEsc)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onEsc)
      document.body.style.overflow = 'unset'
    }
  }, [landingFormModalOpen, isRecordEditorPage, editorOpen, isHero, heroSettingsOpen, closeEditor, closeHeroSettings])

  // Contact socials UI: up to 15 preset slots
  const defaultSocialSlots = useMemo(() => Array.from({ length: 15 }, () => ({ name: '', href: '' })), [])
  const [contactSocials, setContactSocials] = useState<{ name: string; href: string }[]>(defaultSocialSlots)
  const setSocialAt = (idx: number, key: 'name' | 'href', value: string) => {
    setContactSocials((prev) => prev.map((row, i) => (i === idx ? { ...row, [key]: value } : row)))
  }

  // Footer socials UI: up to 15 preset slots
  const [footerSocials, setFooterSocials] = useState<{ name: string; href: string }[]>(defaultSocialSlots)
  const setFooterSocialAt = (idx: number, key: 'name' | 'href', value: string) => {
    setFooterSocials((prev) => prev.map((row, i) => (i === idx ? { ...row, [key]: value } : row)))
  }

  // Footer links UI: up to 10 preset slots
  const defaultFooterLinkSlots = useMemo(() => Array.from({ length: 10 }, () => ({ name: '', url: '', external: false })), [])
  const [footerLinks, setFooterLinks] = useState<{ name: string; url: string; external: boolean }[]>(defaultFooterLinkSlots)
  const setFooterLinkAt = (idx: number, key: 'name' | 'url' | 'external', value: string | boolean) => {
    setFooterLinks((prev) => prev.map((row, i) => (i === idx ? { ...row, [key]: value } : row)))
  }

  // Hero section UI: animated texts, bullet points, navbar links
  const [heroAnimatedTexts, setHeroAnimatedTexts] = useState<string[]>(['Ai-Innovation', 'MERN Solutions', 'Code Phantom', 'Digital Innovation', 'Full-Stack Power'])
  const [heroBulletPoints, setHeroBulletPoints] = useState<string[]>(['09+ Awesome Demos', 'Modern & Clean Design', 'Fully Responsive Design'])
  const [navbarLinks, setNavbarLinks] = useState<{ name: string; href: string }[]>([
    { name: 'Home', href: '#home' },
    { name: 'Team', href: '#about' },
    { name: 'Services', href: '#services' },
    { name: 'Projects', href: '#projects' },
    { name: 'Courses', href: '#courses' },
    { name: 'Contact', href: '#contact' }
  ])

  // Social platform options and icons
  const socialOptions = [
    'Facebook','Instagram','Twitter/X','LinkedIn','YouTube','GitHub','WhatsApp','Telegram','TikTok','Snapchat','Pinterest','Reddit','Medium','Discord','Website',
    // Work platforms
    'Fiverr','Upwork','Freelancer','PeoplePerHour','Guru','Toptal','FlexJobs','99designs','Upstack','SimplyHired'
  ]
  const renderBadgeIcon = (abbr: string, color?: string) => (
    <svg viewBox="0 0 24 24" className="w-5 h-5" stroke="currentColor" fill="none" strokeWidth="1.5">
      <circle cx="12" cy="12" r="10" fill={color || 'currentColor'} fillOpacity="0.15" />
      <text x="12" y="15" textAnchor="middle" fontSize="9" fontWeight="700" fill={color || 'currentColor'}>{abbr}</text>
    </svg>
  )
  const simpleIcons: Record<string, { slug: string; color: string }> = {
    'Facebook': { slug: 'facebook', color: '1877F2' },
    'Instagram': { slug: 'instagram', color: 'E4405F' },
    'Twitter/X': { slug: 'x', color: '000000' },
    'LinkedIn': { slug: 'linkedin', color: '0A66C2' },
    'YouTube': { slug: 'youtube', color: 'FF0000' },
    'GitHub': { slug: 'github', color: '181717' },
    'WhatsApp': { slug: 'whatsapp', color: '25D366' },
    'Telegram': { slug: 'telegram', color: '26A5E4' },
    'TikTok': { slug: 'tiktok', color: '000000' },
    'Snapchat': { slug: 'snapchat', color: 'FFFC00' },
    'Pinterest': { slug: 'pinterest', color: 'E60023' },
    'Reddit': { slug: 'reddit', color: 'FF4500' },
    'Medium': { slug: 'medium', color: '12100E' },
    'Discord': { slug: 'discord', color: '5865F2' },
    Fiverr: { slug: 'fiverr', color: '00B22D' },
    Upwork: { slug: 'upwork', color: '6FDA44' },
    Freelancer: { slug: 'freelancer', color: '29B2FE' },
    PeoplePerHour: { slug: 'peopleperhour', color: 'FF5C00' },
    Guru: { slug: 'guru', color: '4C6CF7' },
    Toptal: { slug: 'toptal', color: '0D61A9' },
    FlexJobs: { slug: 'flexjobs', color: 'F05D23' },
    '99designs': { slug: '99designs', color: 'FF6A00' },
    Upstack: { slug: 'upstack', color: '00C1D4' },
    SimplyHired: { slug: 'simplyhired', color: 'FF6A00' },
  }
  const renderBrandImg = (name?: string) => {
    if (!name) return null
    const meta = simpleIcons[name]
    if (!meta) return null
    return (
      <img
        src={`https://cdn.simpleicons.org/${meta.slug}/${meta.color}`}
        alt={name}
        className="w-5 h-5"
        loading="lazy"
      />
    )
  }
  const renderSocialIcon = (name?: string) => {
    const common = 'w-5 h-5 text-white'
    switch (name) {
      case 'Facebook':
        return (<svg viewBox="0 0 24 24" className={common} fill="currentColor"><path d="M22 12a10 10 0 10-11.5 9.95v-7.04H7.9V12h2.6V9.8c0-2.57 1.53-3.99 3.87-3.99 1.12 0 2.29.2 2.29.2v2.52h-1.29c-1.27 0-1.66.79-1.66 1.6V12h2.83l-.45 2.91h-2.38v7.04A10 10 0 0022 12z"/></svg>)
      case 'Instagram':
        return (<svg viewBox="0 0 24 24" className={common} fill="currentColor"><path d="M7 2h10a5 5 0 015 5v10a5 5 0 01-5 5H7a5 5 0 01-5-5V7a5 5 0 015-5zm5 5a5 5 0 100 10 5 5 0 000-10zm6.5-.75a1.25 1.25 0 11-2.5 0 1.25 1.25 0 012.5 0z"/></svg>)
      case 'Twitter/X':
        return (<svg viewBox="0 0 24 24" className={common} fill="currentColor"><path d="M18.244 2H21l-6.53 7.46L22.5 22h-7.03l-4.6-6.01L5.4 22H2.64l7.07-8.06L1.5 2h7.15l4.19 5.61L18.24 2zm-2.47 18h1.93L8.33 4h-1.9l9.34 16z"/></svg>)
      case 'LinkedIn':
        return (<svg viewBox="0 0 24 24" className={common} fill="currentColor"><path d="M4.98 3.5C4.98 4.88 3.86 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM.5 8h4V23h-4V8zm7 0h3.83v2.05h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.78 2.65 4.78 6.1V23h-4v-7.6c0-1.82-.03-4.17-2.54-4.17-2.54 0-2.93 1.98-2.93 4.03V23h-4V8z"/></svg>)
      case 'YouTube':
        return (<svg viewBox="0 0 24 24" className={common} fill="currentColor"><path d="M23.5 6.2a3 3 0 00-2.1-2.1C19.3 3.5 12 3.5 12 3.5S4.7 3.5 2.6 4.1A3 3 0 00.5 6.2 31.7 31.7 0 000 12c0 1.96.18 3.89.5 5.8a3 3 0 002.1 2.1c2.1.6 9.4.6 9.4.6s7.3 0 9.4-.6a3 3 0 002.1-2.1c.32-1.91.5-3.84.5-5.8 0-1.96-.18-3.89-.5-5.8zM9.75 8.5l6 3.5-6 3.5v-7z"/></svg>)
      case 'GitHub':
        return (<svg viewBox="0 0 24 24" className={common} fill="currentColor"><path d="M12 .5A11.5 11.5 0 000 12.14c0 5.17 3.36 9.56 8.03 11.11.59.11.8-.26.8-.57v-2.2c-3.27.72-3.96-1.4-3.96-1.4-.54-1.38-1.32-1.75-1.32-1.75-1.08-.74.08-.72.08-.72 1.2.08 1.83 1.24 1.83 1.24 1.07 1.85 2.82 1.31 3.51 1 .11-.78.42-1.31.76-1.61-2.66-.3-5.47-1.34-5.47-5.97 0-1.32.47-2.4 1.23-3.24-.12-.3-.53-1.51.12-3.15 0 0 1.01-.32 3.31 1.23a11.5 11.5 0 016.02 0c2.3-1.55 3.31-1.23 3.31-1.23.65 1.64.24 2.85.12 3.15.77.84 1.23 1.92 1.23 3.24 0 4.64-2.8 5.67-5.48 5.97.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.83.58A11.5 11.5 0 0024 12.14C24 5.75 18.63.5 12 .5z"/></svg>)
      case 'WhatsApp':
        return (<svg viewBox="0 0 24 24" className={common} fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606l.446-.52c.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52l-.916-2.207c-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.712.308 1.27.49 1.702.627.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413a.93.93 0 00-.57-.347z"/><path d="M12.004 22.785h-.005A9.87 9.87 0 016.968 21.41l-.361-.214-3.741.982.998-3.648-.235-.374A9.86 9.86 0 011.12 12C1.121 6.55 5.555 2.116 11.007 2.116a9.88 9.88 0 019.885 9.888c-.003 5.45-4.437 9.884-9.888 9.884z"/></svg>)
      case 'Telegram':
        return (<svg viewBox="0 0 24 24" className={common} fill="currentColor"><path d="M9.04 15.29l-.38 5.36c.54 0 .77-.24 1.05-.52l2.52-2.41 5.22 3.83c.96.53 1.65.25 1.9-.89l3.45-16.16h0c.31-1.46-.53-2.03-1.45-1.67L1.8 9.35c-1.39.54-1.37 1.31-.25 1.66l5.22 1.63L19.6 6.03c.61-.37 1.16-.17.71.2"/></svg>)
      case 'TikTok':
        return (<svg viewBox="0 0 24 24" className={common} fill="currentColor"><path d="M12.5 0c-.1 0-.2 0-.2.1v2.2c-2.5-.1-4.6 1.8-4.6 4.3 0 .3 0 .6.1.9H5.7c-.1 0-.2 0-.2.1v3.5c0 .1.1.2.2.2h2.1c.3 2.8 2.7 5 5.6 5 3.3 0 6-2.7 6-6V7.8c0-.1-.1-.2-.2-.2h-3.5v1.3c0 .5-.4.9-.9.9s-.9-.4-.9-.9V6.5c0-.5.4-.9.9-.9s.9.4.9.9v.7c1.8 0 3.2 1.4 3.2 3.2v3.5c0 2.2-1.8 4-4 4-2.2 0-4-1.8-4-4v-1.3c0-1 .4-1.9 1-2.6.3-.3.4-.7.3-1.1-.1-.4-.5-.7-.9-.7H8c-.1 0-.2.1-.2.2v.9c0 1.9 1.6 3.5 3.5 3.5z"/></svg>)
      case 'Snapchat':
        return (<svg viewBox="0 0 24 24" className={common} fill="currentColor"><path d="M12 2c-3.5 0-6 2.7-6 6.2 0 2.1-.7 2.7-1.7 3.5-.3.2-.2.6.1.7 1.2.5 2.2 1.1 2.8 2.1-.7.4-1.7.7-2.8.8-.3 0-.5.3-.4.5.3.9 1.7 1.2 2.7 1.3.3.6.8 1.2 1.4 1.6.9.6 2 .9 3.3.9s2.4-.3 3.3-.9c.6-.4 1.1-1 1.4-1.6 1-.1 2.4-.4 2.7-1.3.1-.2 0-.5-.3-.5-1.1-.1-2.1-.4-2.8-.8.6-1 1.6-1.6 2.8-2.1.3-.1.4-.5.1-.7-1-.8-1.7-1.4-1.7-3.5C18 4.7 15.5 2 12 2z"/></svg>)
      case 'Pinterest':
        return (<svg viewBox="0 0 24 24" className={common} fill="currentColor"><path d="M12.04 2C6.56 2 3 6 3 9.97c0 1.98.75 3.75 2.38 4.41.27.11.52 0 .6-.3l.24-.93c.08-.3.05-.4-.17-.66-.47-.54-.77-1.23-.77-2.2 0-2.84 2.12-5.38 5.5-5.38 3 0 4.64 1.83 4.64 4.28 0 3.22-1.43 5.94-3.55 5.94-1.17 0-2.05-.97-1.77-2.16.34-1.46 1-3.03 1-4.08 0-.94-.5-1.73-1.56-1.73-1.24 0-2.23 1.28-2.23 3 0 1.09.37 1.83.37 1.83l-1.5 6.38c-.45 1.9-.07 4.23-.04 4.47.02.1.14.13.2.05.08-.1 1.16-1.45 1.53-2.8.1-.37.6-2.32.6-2.32.29.56 1.13 1.05 2.04 1.05 2.69 0 4.52-2.42 4.52-5.67C17.12 6.96 15 2 12.04 2z"/></svg>)
      case 'Reddit':
        return (<svg viewBox="0 0 24 24" className={common} fill="currentColor"><path d="M22 12.08c0-1.1-.9-2-2-2-.55 0-1.04.22-1.4.57-1.38-.9-3.28-1.48-5.4-1.56l1.1-3.5 3.06.72a2 2 0 103.95-.62 2 2 0 00-3.72 1.1l-3.6-.85a.75.75 0 00-.9.5l-1.43 4.4c-2.2.05-4.2.64-5.62 1.55A2 2 0 104 10.1c-.55 0-1.04.22-1.4.57A2 2 0 100 12.08c0 1.61 1.63 3.03 4.02 3.72A6.9 6.9 0 0012 18.9c3.06 0 5.66-1.1 7.03-2.75 2.17-.66 2.97-1.92 2.97-4.07zM8.5 13.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm10 0a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM12 17.2c-1.65 0-3-.58-3-.58a.5.5 0 01.6-.8s1.2.48 2.4.48 2.4-.48 2.4-.48a.5.5 0 01.6.8s-1.35.58-3 .58z"/></svg>)
      case 'Medium':
        return (<svg viewBox="0 0 24 24" className={common} fill="currentColor"><path d="M2 7.5a.5.5 0 01.18-.38L6.1 3.78v16.46L2.18 7.89A.5.5 0 012 7.5zM7.6 4.9l4.9 8.5-4.9 6.84V4.9zm5.6 8.2L21 3.75v16.5L13.2 13.1z"/></svg>)
      case 'Discord':
        return (<svg viewBox="0 0 24 24" className={common} fill="currentColor"><path d="M20.3 4.3A18 18 0 0015.9 3l-.2.4c1.9.5 2.7 1.2 3.5 2.1-1.5-.8-3-1.3-4.7-1.5a16.7 16.7 0 00-4.7 0C8 4 6.5 4.5 5 5.3c.8-.9 1.6-1.7 3.5-2.1L8.3 3A18 18 0 003.9 4.3C1.6 7.7.8 10.9 1 14c2.1 1.6 4.1 2.6 6 3l.7-1.5c-1.1-.4-2.1-.9-3-1.6.3.2.7.4 1 .6a11 11 0 0011 0c.4-.2.7-.4 1-.6-1 .7-2 1.2-3 1.6l.7 1.5c1.9-.4 3.9-1.4 6-3 .3-3.1-.5-6.3-2.8-9.7zM8.9 13.2c-.8 0-1.5-.8-1.5-1.7 0-1 .7-1.7 1.5-1.7.9 0 1.6.8 1.5 1.7 0 .9-.7 1.7-1.5 1.7zm6.2 0c-.8 0-1.5-.8-1.5-1.7 0-1 .7-1.7 1.5-1.7.9 0 1.6.8 1.5 1.7 0 .9-.7 1.7-1.5 1.7z"/></svg>)
      case 'Website':
        return (<svg viewBox="0 0 24 24" className={common} fill="currentColor"><path d="M12 2a10 10 0 100 20 10 10 0 000-20zm6.9 6H15a15.8 15.8 0 00-.9-3.2A8.04 8.04 0 0118.9 8zM12 4c.6 0 1.8 1.8 2.4 4H9.6C10.2 5.8 11.4 4 12 4zM6 12c0-.7.1-1.4.2-2h4.1c-.1.6-.1 1.3-.1 2s0 1.4.1 2H6.2A8.1 8.1 0 016 12zm1.1 4H9a15.8 15.8 0 00.9 3.2A8.04 8.04 0 017.1 16zM12 20c-.6 0-1.8-1.8-2.4-4h4.8C13.8 18.2 12.6 20 12 20zm2.9-4h3.1a8.04 8.04 0 01-4.7 3.2c.5-1.4.9-3.2 1.6-3.2zM17.8 12c0 .7-.1 1.4-.2 2h-4.1c.1-.6.1-1.3.1-2s0-1.4-.1-2h4.1c.1.6.2 1.3.2 2zM7.1 8A8.04 8.04 0 0111.8 4c-.5 1.4-.9 3.2-1.6 3.2H7.1z"/></svg>)
      // Work platforms - real colored brand where possible, else badge
      case 'Fiverr':
      case 'Upwork':
      case 'Freelancer':
      case 'PeoplePerHour':
      case 'Guru':
      case 'Toptal':
      case 'FlexJobs':
      case '99designs':
      case 'Upstack':
      case 'SimplyHired':
        return renderBrandImg(name) || renderBadgeIcon((name || 'W').slice(0,2), '#7c3aed')
      default:
        return (<svg viewBox="0 0 24 24" className={common} fill="currentColor"><circle cx="12" cy="12" r="10"/></svg>)
    }
  }

  // Helper: delete site_settings keys; fallback to clearing values if delete blocked by RLS
  const deleteSiteSettingKeys = async (keys: string[]) => {
    if (!keys.length) return
    const delRes = await landingApi.deleteSiteSettings(keys)
    if (delRes.error) {
      // Fallback: upsert empty values so UI clears
      const entries = keys.map((k) => ({ key: k, value: '' }))
      const upRes = await landingApi.upsertSiteSettings(entries)
      if (upRes.error) {
        toast.error(upRes.error)
        setError(upRes.error)
      }
    }
  }

  // Helper: Get API function based on table name
  const getApiForTable = (tableName: string) => {
    if (tableName === 'reviews' || tableName === 'projects' || tableName === 'services') {
      return landingApi
    } else if (tableName === 'team_members' || tableName === 'mentor_profile') {
      return teamApi
    } else if (tableName === 'courses') {
      return coursesApi
    }
    return null
  }

  // Helper: Update record in table
  const updateTableRecord = async (tableName: string, id: number, payload: any) => {
    const api = getApiForTable(tableName)
    if (!api) {
      setError(`Unknown table: ${tableName}`)
      return { error: `Unknown table: ${tableName}` }
    }

    if (tableName === 'reviews') {
      return await api.updateReview(id, payload)
    } else if (tableName === 'projects') {
      return await api.updateProject(id, payload)
    } else if (tableName === 'services') {
      return await api.updateService(id, payload)
    } else if (tableName === 'team_members') {
      return await api.updateTeamMember(id, payload)
    } else if (tableName === 'mentor_profile') {
      return await api.updateMentorProfile(id, payload)
    } else if (tableName === 'courses') {
      return await api.updateCourse(id, payload)
    }
    return { error: `Update not implemented for table: ${tableName}` }
  }

  // Helper: Create record in table
  const createTableRecord = async (tableName: string, payload: any) => {
    const api = getApiForTable(tableName)
    if (!api) {
      setError(`Unknown table: ${tableName}`)
      return { error: `Unknown table: ${tableName}` }
    }

    if (tableName === 'reviews') {
      return await api.createReview(payload)
    } else if (tableName === 'projects') {
      return await api.createProject(payload)
    } else if (tableName === 'services') {
      return await api.createService(payload)
    } else if (tableName === 'team_members') {
      return await api.createTeamMember(payload)
    } else if (tableName === 'mentor_profile') {
      return await api.createMentorProfile(payload)
    } else if (tableName === 'courses') {
      return await api.createCourse(payload)
    }
    return { error: `Create not implemented for table: ${tableName}` }
  }

  // Helper: Delete record from table
  const deleteTableRecord = async (tableName: string, id: number) => {
    const api = getApiForTable(tableName)
    if (!api) {
      setError(`Unknown table: ${tableName}`)
      return { error: `Unknown table: ${tableName}` }
    }

    if (tableName === 'reviews') {
      return await api.deleteReview(id)
    } else if (tableName === 'projects') {
      return await api.deleteProject(id)
    } else if (tableName === 'services') {
      return await api.deleteService(id)
    } else if (tableName === 'team_members') {
      return await api.deleteTeamMember(id)
    } else if (tableName === 'mentor_profile') {
      return await api.deleteMentorProfile(id)
    } else if (tableName === 'courses') {
      return await api.deleteCourse(id)
    }
    return { error: `Delete not implemented for table: ${tableName}` }
  }

  // Convert features input into JSON array safely (accepts JSON or comma/newline separated)
  const toFeaturesJson = (raw?: string | null) => {
    if (!raw) return null
    const value = String(raw).trim()
    if (!value) return null
    try {
      const parsed = JSON.parse(value)
      if (Array.isArray(parsed)) return parsed
      return [String(parsed)]
    } catch {
      const parts = value
        .split(/[\n,;•|]+/)
        .map((s) => s.trim())
        .filter(Boolean)
      return parts.length ? parts : null
    }
  }

  const load = useCallback(async () => {
      setLoading(true)
      setError(null)
      
      let data: any = null
      let error: any = null
      
      try {
        if (isReviews) {
          const result = await retryWithBackoff(async () => await landingApi.getReviews())
          data = result.data || []
          // Sort by order_index and created_at
          data.sort((a: any, b: any) => {
            if (a.order_index !== b.order_index) {
              return (a.order_index || 999) - (b.order_index || 999)
            }
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          })
        } else if (isTeamLike) {
          const result = table === 'team_members' 
            ? await retryWithBackoff(async () => await teamApi.getTeamMembers())
            : await retryWithBackoff(async () => await teamApi.getMentorProfiles())
          data = result.data || []
          // Sort by is_head, order_index, id
          data.sort((a: any, b: any) => {
            if (a.is_head !== b.is_head) return b.is_head ? 1 : -1
            if (a.order_index !== b.order_index) return (a.order_index || 999) - (b.order_index || 999)
            return (b.id || 0) - (a.id || 0)
          })
        } else if (isCourses) {
          const result = await retryWithBackoff(async () => await coursesApi.getAllCourses())
          data = result.data || []
          data.sort((a: any, b: any) => {
            if (a.order_index !== b.order_index) return (a.order_index || 999) - (b.order_index || 999)
            return (b.id || 0) - (a.id || 0)
          })
        } else if (isServices) {
          const result = await retryWithBackoff(async () => await landingApi.getServices())
          data = result.data || []
          data.sort((a: any, b: any) => {
            if (a.order_index !== b.order_index) return (a.order_index || 999) - (b.order_index || 999)
            return (b.id || 0) - (a.id || 0)
          })
        } else if (isContact || isFooter || isHero) {
          const keys = [
            ...(isContact ? ['contact_address','contact_website','contact_phone','contact_map_src','contact_primary_name','contact_primary_tagline','contact_whatsapp','contact_socials_json'] : []),
            ...(isFooter ? ['footer_about_text','footer_socials_json','footer_version','footer_links_json'] : []),
            ...(isHero ? ['hero_projects_count','hero_services_count','hero_courses_count','hero_animated_texts','hero_bullet_points','navbar_links'] : [])
          ]
          const result = await retryWithBackoff(async () => await landingApi.getSiteSettings(keys))
          data = result.data || []
        } else if (isSupport) {
          const result = await retryWithBackoff(async () => await landingApi.getSupportRequests())
          data = result.data || []
          data.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        } else if (isProjects) {
          const result = await retryWithBackoff(async () => await landingApi.getProjects())
          data = result.data || []
          data.sort((a: any, b: any) => {
            if (a.order_index !== b.order_index) return (a.order_index || 999) - (b.order_index || 999)
            return (b.id || 0) - (a.id || 0)
          })
        } else {
          // Fallback for other tables - try to use appropriate API
          error = new Error('Unknown content type')
        }
      } catch (err: any) {
        error = err
      }
      if (error) {
        if (process.env.NODE_ENV === 'development') {
        console.error('Error loading data:', error)
        }
        const msg = error.message || 'Failed to load content'
        toast.error(msg)
        setError(msg)
        setLoading(false)
        return
      }
      setRows((data as Row[]) || [])
      
      // Calculate available orders for services, reviews, and projects
      if (isServices && data) {
        // For services: show only available orders (not in use)
        const usedOrders = new Set(
          (data as any[])
            .map((r: any) => r.order_index)
            .filter((o: any) => o !== null && o !== undefined)
        )
        const maxOrder = Math.max(...Array.from(usedOrders), 0)
        const available: number[] = []
        for (let i = 1; i <= maxOrder + 10; i++) {
          if (!usedOrders.has(i)) {
            available.push(i)
          }
        }
        if (editingId !== null) {
          const currentItem = (data as any[]).find((r: any) => r.id === editingId)
          if (currentItem && currentItem.order_index !== null && currentItem.order_index !== undefined) {
            if (!available.includes(currentItem.order_index)) {
              available.push(currentItem.order_index)
              available.sort((a, b) => a - b)
            }
          }
        }
        setAvailableOrders(available)
      } else if ((isReviews || isProjects) && data) {
        // For reviews and projects: show only available orders (not in use by others)
        const usedOrders = new Set(
          (data as any[])
            .map((r: any) => r.order_index)
            .filter((o: any) => o !== null && o !== undefined)
        )
        const available: number[] = []
        // Generate available orders (1 to 30, excluding used ones)
        for (let i = 1; i <= 30; i++) {
          if (!usedOrders.has(i)) {
            available.push(i)
          }
        }
        setAvailableOrders(available)
      } else if (isReviews || isProjects) {
        // If no data yet, show all orders 1-30
        const allOrders: number[] = []
        for (let i = 1; i <= 30; i++) {
          allOrders.push(i)
        }
        setAvailableOrders(allOrders)
      } else {
        setAvailableOrders([])
      }
      
      // Load contact socials from JSON
      if (isContact && data) {
        const socialsJson = data.find((r: any) => r.key === 'contact_socials_json')?.value
        if (socialsJson) {
          try {
            const parsed = JSON.parse(socialsJson)
            if (Array.isArray(parsed)) {
              const filled = [...parsed, ...defaultSocialSlots].slice(0, 15)
              setContactSocials(filled)
            }
          } catch {}
        }
      }
      
      // Load footer socials from JSON
      if (isFooter && data) {
        const socialsJson = data.find((r: any) => r.key === 'footer_socials_json')?.value
        if (socialsJson) {
          try {
            const parsed = JSON.parse(socialsJson)
            if (Array.isArray(parsed)) {
              const filled = [...parsed, ...defaultSocialSlots].slice(0, 15)
              setFooterSocials(filled)
            }
          } catch {}
        }
      }
      
      // Load hero section data from JSON
      if (isHero && data) {
        const animatedTextsJson = data.find((r: any) => r.key === 'hero_animated_texts')?.value
        if (animatedTextsJson) {
          try {
            const parsed = JSON.parse(animatedTextsJson)
            if (Array.isArray(parsed) && parsed.length > 0) {
              setHeroAnimatedTexts(parsed)
            }
          } catch {}
        }
        const bulletPointsJson = data.find((r: any) => r.key === 'hero_bullet_points')?.value
        if (bulletPointsJson) {
          try {
            const parsed = JSON.parse(bulletPointsJson)
            if (Array.isArray(parsed) && parsed.length > 0) {
              setHeroBulletPoints(parsed)
            }
          } catch {}
        }
        const navbarLinksJson = data.find((r: any) => r.key === 'navbar_links')?.value
        if (navbarLinksJson) {
          try {
            const parsed = JSON.parse(navbarLinksJson)
            if (Array.isArray(parsed) && parsed.length > 0) {
              setNavbarLinks(parsed)
            }
          } catch {}
        }
      }
      
      setLoading(false)
    }, [table, isReviews, isTeamLike, isCourses, isServices, isContact, isFooter, isHero, defaultSocialSlots, editingId])
  
  useEffect(() => {
    // Realtime subscriptions removed - data now comes from backend API
    // If needed, implement polling or WebSocket from backend in the future
    if (table && table !== 'users' && table !== 'settings') {
      load()
    }
  }, [table, load])

  // Reset socials UI when switching away/back to contact
  useEffect(() => {
    if (!isContact) {
      setContactSocials(defaultSocialSlots)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isContact])

  // Reset footer socials and links UI when switching away/back to footer
  useEffect(() => {
    if (!isFooter) {
      setFooterSocials(defaultSocialSlots)
      setFooterLinks(defaultFooterLinkSlots)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFooter])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (isReviews) return // reviews are user-generated; no create from admin here
    if (isContact) {
      const kv = form as any
      const entries: Array<{ key: string; value: string }> = []
      // Compute socials JSON from UI if provided
      const uiSocials = contactSocials.filter(s => s.name && s.href).map(s => ({ name: s.name, href: s.href }))
      const socialsJson = uiSocials.length ? JSON.stringify(uiSocials) : String(kv['contact_socials_json'] ?? '')
      ;['contact_address','contact_website','contact_phone','contact_map_src','contact_primary_name','contact_primary_tagline','contact_whatsapp']
        .forEach(k => { if (kv[k] !== undefined) entries.push({ key: k, value: String(kv[k] ?? '') }) })
      entries.push({ key: 'contact_socials_json', value: socialsJson })
      if (entries.length) {
        const result = await landingApi.upsertSiteSettings(entries)
        if (result.error) {
          toast.error(result.error)
          return setError(result.error)
        }
        // refresh immediately
        const refreshedResult = await landingApi.getSiteSettings(['contact_address','contact_website','contact_phone','contact_map_src','contact_primary_name','contact_primary_tagline','contact_whatsapp','contact_socials_json'])
        setRows((refreshedResult.data as any) || [])
        toast.success('Saved contact settings')
      }
      return
    }
    if (isFooter) {
      const kv = form as any
      const entries: Array<{ key: string; value: string }> = []
      // Compute socials JSON from UI if provided
      const uiSocials = footerSocials.filter(s => s.name && s.href).map(s => ({ name: s.name, href: s.href }))
      const socialsJson = uiSocials.length ? JSON.stringify(uiSocials) : String(kv['footer_socials_json'] ?? '')
      // Compute links JSON from UI if provided
      const uiLinks = footerLinks.filter(l => l.name && l.url).map(l => ({ name: l.name, url: l.url, external: l.external || false }))
      const linksJson = uiLinks.length ? JSON.stringify(uiLinks) : String(kv['footer_links_json'] ?? '')
      ;['footer_about_text','footer_version']
        .forEach(k => { if (kv[k] !== undefined) entries.push({ key: k, value: String(kv[k] ?? '') }) })
      entries.push({ key: 'footer_socials_json', value: socialsJson })
      entries.push({ key: 'footer_links_json', value: linksJson })
      if (entries.length) {
        const result = await landingApi.upsertSiteSettings(entries)
        if (result.error) {
          toast.error(result.error)
          return setError(result.error)
        }
        const refreshedResult = await landingApi.getSiteSettings(['footer_about_text','footer_socials_json','footer_version','footer_links_json'])
        setRows((refreshedResult.data as any) || [])
        toast.success('Saved footer settings')
      }
      return
    }
    if (isHero) {
      const kv = form as any
      const entries: Array<{ key: string; value: string }> = []
      // Save counters
      ;['hero_projects_count','hero_services_count','hero_courses_count']
        .forEach(k => { 
          if (kv[k] !== undefined) {
            entries.push({ key: k, value: String(kv[k] ?? '') }) 
          }
        })
      // Save animated texts
      if (heroAnimatedTexts.length > 0) {
        entries.push({ key: 'hero_animated_texts', value: JSON.stringify(heroAnimatedTexts) })
      }
      // Save bullet points
      if (heroBulletPoints.length > 0) {
        entries.push({ key: 'hero_bullet_points', value: JSON.stringify(heroBulletPoints) })
      }
      // Save navbar links
      const validNavbarLinks = navbarLinks.filter(link => link.name && link.href)
      if (validNavbarLinks.length > 0) {
        entries.push({ key: 'navbar_links', value: JSON.stringify(validNavbarLinks) })
      }
      if (entries.length) {
        const result = await landingApi.upsertSiteSettings(entries)
        if (result.error) {
          toast.error(result.error)
          return setError(result.error)
        }
        const refreshedResult = await landingApi.getSiteSettings(['hero_projects_count','hero_services_count','hero_courses_count','hero_animated_texts','hero_bullet_points','navbar_links'])
        setRows((refreshedResult.data as any) || [])
        toast.success('Saved hero settings')
        setHeroSettingsOpen(false)
      }
      return
    }
    if (editingId) {
      // For team_members, map title->name and description->role on write
    const payload = isTeamLike
        ? {
            name: form.title,
            role: form.role_text,
            description: form.description,
            image_url: form.image_url,
            profile_image_url: form.profile_image_url || null,
            banner_image_url: form.banner_image_url || null,
            portfolio_url: form.portfolio_url || null,
            github_url: form.github_url || null,
            primary_tag: form.primary_tag || null,
            order_index: form.order_index ?? null,
            active: form.active !== false,
            is_head: !!form.is_head
          }
        : isProjects
          ? {
              title: form.title,
              description: form.description || null,
              video_id: (form as any).video_id || null,
              github_url: (form as any).github_url || null,
              image_url: form.image_url || null,
              order_index: form.order_index ?? null
            }
        : isCourses
          ? {
              title: form.title,
              description: form.description,
              level: form.level || null,
              duration: form.duration || null,
              price: form.price || null,
              note: form.note || null,
              features: toFeaturesJson(form.features),
              order_index: form.order_index ?? null,
              active: form.active !== false
            }
        : isServices
          ? {
              title: form.title,
              description: form.description || null,
              image_url: form.image_url || null,
              emoji: form.emoji || null,
              gradient_color: form.gradient_color || null,
              contact: form.contact || null,
              order_index: form.order_index ?? null,
              active: form.active !== false
            }
          : form
    
    // No conflict check needed - dropdown only shows available orders (including current service's order when editing)
    
    const result = await updateTableRecord(table, editingId, payload)
    if (result.error) {
      toast.error(result.error)
      return setError(result.error)
    }
      await load()
      toast.success('Updated successfully')
      if (isRecordEditorPage) {
        closeEditor()
      } else {
        setEditingId(null)
        setForm({ title: '', description: '', image_url: '', is_head: false, profile_image_url: '', banner_image_url: '', portfolio_url: '', github_url: '', primary_tag: '', order_index: undefined, active: true, emoji: '', gradient_color: '', contact: '' })
      }
      return
    }
    const payload = isTeamLike
      ? {
          name: form.title,
          role: form.role_text,
          description: form.description,
          image_url: form.image_url,
          profile_image_url: form.profile_image_url || null,
          banner_image_url: form.banner_image_url || null,
          portfolio_url: form.portfolio_url || null,
          github_url: form.github_url || null,
          primary_tag: form.primary_tag || null,
          order_index: form.order_index ?? null,
          active: form.active !== false,
          is_head: !!form.is_head
        }
      : isProjects
        ? {
            title: form.title,
            description: form.description || null,
            video_id: (form as any).video_id || null,
            github_url: (form as any).github_url || null,
            image_url: form.image_url || null,
            order_index: form.order_index ?? null
          }
      : isCourses
        ? {
            title: form.title,
            description: form.description,
            level: form.level || null,
            duration: form.duration || null,
            price: form.price || null,
            note: form.note || null,
            features: toFeaturesJson(form.features),
            order_index: form.order_index ?? null,
            active: form.active !== false
          }
      : isServices
        ? {
            title: form.title,
            description: form.description || null,
            image_url: form.image_url || null,
            emoji: form.emoji || null,
            gradient_color: form.gradient_color || null,
            contact: form.contact || null,
            order_index: form.order_index ?? null,
            active: form.active !== false
          }
        : form
    
    // No conflict check needed - dropdown only shows available orders
    
    const result = await createTableRecord(table, payload)
    if (result.error) {
      toast.error(result.error)
      return setError(result.error)
    }
    await load()
    toast.success('Created successfully')
    if (isRecordEditorPage) {
      closeEditor()
    } else {
      setForm({ title: '', description: '', role_text: '', image_url: '', is_head: false, profile_image_url: '', banner_image_url: '', portfolio_url: '', github_url: '', primary_tag: '', order_index: undefined, active: true, level: '', duration: '', price: '', note: '', features: '', emoji: '', gradient_color: '', contact: '' })
    }
  }

  const startEdit = (r: Row | any) => {
    setEditingId((r as any).id || null)
    if (isTeamLike) {
      setForm({
        title: (r as any).name || '',
        description: (r as any).description || '',
        role_text: (r as any).role || '',
        image_url: (r as any).image_url || '',
        is_head: !!(r as any).is_head,
        profile_image_url: (r as any).profile_image_url || '',
        banner_image_url: (r as any).banner_image_url || '',
        portfolio_url: (r as any).portfolio_url || '',
        github_url: (r as any).github_url || '',
        primary_tag: (r as any).primary_tag || '',
        order_index: (r as any).order_index ?? undefined,
        active: (r as any).active !== false
      })
    } else if (isCourses) {
      setForm({
        title: (r as any).title || '',
        description: (r as any).description || '',
        level: (r as any).level || '',
        duration: (r as any).duration || '',
        price: (r as any).price || '',
        note: (r as any).note || '',
        features: Array.isArray((r as any).features) ? JSON.stringify((r as any).features) : ((r as any).features ? String((r as any).features) : ''),
        order_index: (r as any).order_index ?? undefined,
        active: (r as any).active !== false,
      })
    } else if (isServices) {
      setForm({
        title: (r as any).title || '',
        description: (r as any).description || '',
        image_url: (r as any).image_url || '',
        emoji: (r as any).emoji || '',
        gradient_color: (r as any).gradient_color || '',
        contact: (r as any).contact || '',
        order_index: (r as any).order_index ?? undefined,
        active: (r as any).active !== false,
      })
    } else if (isProjects) {
      setForm({
        title: r.title || '',
        description: r.description || '',
        image_url: r.image_url || '',
        order_index: (r as any).order_index ?? undefined,
        ...({ video_id: (r as any).video_id ?? '', github_url: (r as any).github_url ?? '' } as Record<string, unknown>)
      } as Row)
    } else {
      setForm({ title: r.title || '', description: r.description || '', image_url: r.image_url || '', is_head: false })
    }
    if (isRecordEditorPage) setEditorOpen(true)
  }

  const del = async (id?: number) => {
    if (!id) return
    const ok = window.confirm('Are you sure you want to delete this record?')
    if (!ok) return
    
    try {
      const result = await deleteTableRecord(table, id)
      if (result.error) {
        const msg = result.error || 'Failed to delete record. Please check permissions.'
        toast.error(msg)
        setError(msg)
        return
      }
      
      // Success - reload data to update UI
      toast.success('Record deleted successfully')
      await load()
    } catch (err: any) {
      const msg = err.message || 'An error occurred while deleting the record.'
      toast.error(msg)
      setError(msg)
    }
  }

  const sanitizeImageUrl = (u?: string): string => {
    if (!u) return ''
    if (u.includes('github.com') && u.includes('/blob/') && !u.includes('?raw=')) {
      return `${u}?raw=1`
    }
    return u
  }

  // Early return if invalid table
  if (!table || table === 'users' || table === 'settings') {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-red-500">Invalid Page</h1>
        <p className="text-gray-600 dark:text-gray-400">This page is not available. Please use the navigation menu.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div
        className={
          isHero
            ? 'relative overflow-hidden rounded-xl border border-slate-700 bg-slate-900 p-4 text-white shadow-md sm:p-5'
            : 'relative overflow-hidden rounded-xl border border-white/20 bg-gradient-to-r from-orange-500/90 to-red-500/90 p-5 text-white shadow-xl backdrop-blur-xl'
        }
      >
        {!isHero ? <div className="absolute inset-0 bg-black/5" /> : null}
        <div className="relative z-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-xl font-bold sm:text-2xl">Manage {contentType || table}</h1>
            <p className={`mt-1 text-sm ${isHero ? 'text-slate-400' : 'text-white/90'}`}>
              {isHero ? 'Review saved values below. Open the editor to change them.' : `Add, edit, and manage ${contentType || table} content`}
            </p>
          </div>
          {isHero ? (
            <button
              type="button"
              onClick={openHeroSettings}
              className="shrink-0 rounded-lg border border-cyan-500/25 bg-slate-800/90 px-4 py-2 text-sm font-medium text-cyan-200/95 shadow-sm backdrop-blur-sm transition hover:border-cyan-400/40 hover:bg-slate-800"
            >
              Edit hero settings
            </button>
          ) : null}
        </div>
      </div>
      {error && (
        <div className="rounded-lg p-3 bg-red-500/10 border border-red-500/30 text-red-500 text-sm">
          {error}
        </div>
      )}
      {!isReviews && !isSupport && (!isRecordEditorPage || editorOpen) && (!isHero || heroSettingsOpen) && (
        <LandingAdminFormMount
          usePortal={landingFormModalOpen}
          onBackdropClose={isRecordEditorPage ? closeEditor : closeHeroSettings}
        >
          <div
            className={
              isRecordEditorPage && editorOpen
                ? 'relative z-[1] my-auto w-full max-w-4xl rounded-2xl border border-cyan-500/20 bg-slate-950/95 p-4 shadow-2xl backdrop-blur-md sm:p-5'
                : isHero && heroSettingsOpen
                  ? 'landing-admin-plain-ui relative z-[1] my-auto flex w-full max-h-[min(90dvh,calc(100dvh-1.25rem))] min-h-0 max-w-2xl flex-col rounded-lg border border-slate-700 bg-slate-950/95 p-3 shadow-none backdrop-blur-md sm:p-4'
                  : 'rounded-xl border border-cyan-500/20 bg-slate-900/50 p-4 shadow-lg'
            }
          >
            {isRecordEditorPage && editorOpen ? (
              <div className="mb-4 flex items-center justify-between gap-3 border-b border-white/10 pb-3">
                <h2 className="text-lg font-semibold text-white">
                  {editingId ? `Edit ${recordTypeLabel}` : `Add ${recordTypeLabel}`}
                </h2>
                <button
                  type="button"
                  className="rounded-lg px-3 py-1.5 text-sm font-medium text-white/80 transition hover:bg-white/10"
                  onClick={closeEditor}
                >
                  Close
                </button>
              </div>
            ) : null}
            {isHero && heroSettingsOpen ? (
              <div className="mb-3 flex shrink-0 items-start justify-between gap-2 border-b border-slate-800 bg-slate-950 pb-2">
                <h2 className="text-base font-semibold text-white">Hero settings</h2>
                <button
                  type="button"
                  className={heroRemoveBtnClass}
                  aria-label="Close hero settings"
                  onClick={closeHeroSettings}
                >
                  <span className="relative z-[2]">×</span>
                </button>
              </div>
            ) : null}
          <form
            className={`grid grid-cols-1 md:grid-cols-3 ${isHero ? 'gap-1' : 'gap-3'} ${
              isHero && heroSettingsOpen
                ? 'admin-custom-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1 pb-3'
                : ''
            }`}
            onSubmit={handleSubmit}
          >
            {!isContact && !isFooter && !isHero && !isSupport && (
              <>
                <input className="px-4 py-3 rounded-lg bg-white/90 dark:bg-gray-700/90 border-2 border-gray-200 dark:border-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 hover:border-orange-300 dark:hover:border-orange-600" placeholder={isTeamLike ? 'Name' : 'Title'} value={form.title || ''} onChange={(e) => setForm(s => ({ ...s, title: e.target.value }))} />
                {isTeamLike ? (
                  <input className="px-4 py-3 rounded-lg bg-white/90 dark:bg-gray-700/90 border-2 border-gray-200 dark:border-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 hover:border-orange-300 dark:hover:border-orange-600" placeholder="Role" value={form.role_text || ''} onChange={(e) => setForm(s => ({ ...s, role_text: e.target.value }))} />
                ) : (
                  <input className="px-4 py-3 rounded-lg bg-white/90 dark:bg-gray-700/90 border-2 border-gray-200 dark:border-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 hover:border-orange-300 dark:hover:border-orange-600" placeholder="Description" value={form.description || ''} onChange={(e) => setForm(s => ({ ...s, description: e.target.value }))} />
                )}
              </>
            )}
            {!isTeamLike && !isCourses && !isProjects && !isServices && !isContact && !isFooter && !isHero && !isSupport && (
              <input className="px-4 py-3 rounded-lg bg-white/90 dark:bg-gray-700/90 border-2 border-gray-200 dark:border-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 hover:border-purple-300 dark:hover:border-purple-600" placeholder="Image URL (GitHub/Internet)" value={form.image_url || ''} onChange={(e) => setForm(s => ({ ...s, image_url: e.target.value }))} />
            )}
            {isProjects && (
              <>
                <input className="px-4 py-3 rounded-lg bg-white/90 dark:bg-gray-700/90 border-2 border-gray-200 dark:border-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 hover:border-orange-300 dark:hover:border-orange-600" placeholder="YouTube Video ID or URL" value={(form as any)['video_id'] || ''} onChange={(e) => setForm(s => ({ ...s, video_id: e.target.value }))} />
                <select 
                  className="px-4 py-3 rounded-lg bg-white/90 dark:bg-gray-700/90 border-2 border-gray-200 dark:border-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 hover:border-purple-300 dark:hover:border-purple-600" 
                  value={form.order_index ?? ''} 
                  onChange={(e) => setForm(s => ({ ...s, order_index: e.target.value === '' ? undefined : Number(e.target.value) }))}
                  required
                >
                  <option value="">Select Order (Required)</option>
                  {(() => {
                    // Include current project's order in available list (when editing)
                    const ordersForThisProject = [...availableOrders]
                    if (editingId !== null && form.order_index !== null && form.order_index !== undefined && !ordersForThisProject.includes(form.order_index)) {
                      ordersForThisProject.push(form.order_index)
                      ordersForThisProject.sort((a, b) => a - b)
                    }
                    return ordersForThisProject.map(order => (
                      <option key={order} value={order}>Order {order}</option>
                    ))
                  })()}
                  {availableOrders.length === 0 && (
                    <option value="">No available orders (all taken)</option>
                  )}
                </select>
                <input className="px-4 py-3 rounded-lg bg-white/90 dark:bg-gray-700/90 border-2 border-gray-200 dark:border-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 hover:border-purple-300 dark:hover:border-purple-600 md:col-span-2" placeholder="GitHub URL (View Code)" value={(form as any)['github_url'] || ''} onChange={(e) => setForm(s => ({ ...s, github_url: e.target.value }))} />
                <input className="px-4 py-3 rounded-lg bg-white/90 dark:bg-gray-700/90 border-2 border-gray-200 dark:border-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 hover:border-purple-300 dark:hover:border-purple-600 md:col-span-2" placeholder="Image URL (optional)" value={form.image_url || ''} onChange={(e) => setForm(s => ({ ...s, image_url: e.target.value }))} />
              </>
            )}
            {isCourses && (
              <>
                <input className="px-4 py-3 rounded-lg bg-white/90 dark:bg-gray-700/90 border-2 border-gray-200 dark:border-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 hover:border-orange-300 dark:hover:border-orange-600" placeholder="Level (Physical/Online)" value={form.level || ''} onChange={(e) => setForm(s => ({ ...s, level: e.target.value }))} />
                <input className="px-4 py-3 rounded-lg bg-white/90 dark:bg-gray-700/90 border-2 border-gray-200 dark:border-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 hover:border-orange-300 dark:hover:border-orange-600" placeholder="Duration (e.g., 3 months)" value={form.duration || ''} onChange={(e) => setForm(s => ({ ...s, duration: e.target.value }))} />
                <input className="px-4 py-3 rounded-lg bg-white/90 dark:bg-gray-700/90 border-2 border-gray-200 dark:border-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 hover:border-orange-300 dark:hover:border-orange-600" placeholder="Price (e.g., Rs 10,000)" value={form.price || ''} onChange={(e) => setForm(s => ({ ...s, price: e.target.value }))} />
                <input className="px-4 py-3 rounded-lg bg-white/90 dark:bg-gray-700/90 border-2 border-gray-200 dark:border-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 hover:border-orange-300 dark:hover:border-orange-600" placeholder="Note (e.g., Next months...)" value={form.note || ''} onChange={(e) => setForm(s => ({ ...s, note: e.target.value }))} />
                <input className="px-4 py-3 rounded-lg bg-white/90 dark:bg-gray-700/90 border-2 border-gray-200 dark:border-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 hover:border-purple-300 dark:hover:border-purple-600 md:col-span-2" placeholder='Features JSON (e.g., ["Live classes","Projects"])' value={form.features || ''} onChange={(e) => setForm(s => ({ ...s, features: e.target.value }))} />
              </>
            )}
            {isServices && (
              <>
                <input className="px-4 py-3 rounded-lg bg-white/90 dark:bg-gray-700/90 border-2 border-gray-200 dark:border-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 hover:border-orange-300 dark:hover:border-orange-600" placeholder="Emoji (e.g., 🌐, 🚀, 💻, 🎨)" value={form.emoji || ''} onChange={(e) => setForm(s => ({ ...s, emoji: e.target.value }))} />
                <select className="px-4 py-3 rounded-lg bg-white/90 dark:bg-gray-700/90 border-2 border-gray-200 dark:border-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 hover:border-purple-300 dark:hover:border-purple-600" value={form.gradient_color || ''} onChange={(e) => setForm(s => ({ ...s, gradient_color: e.target.value }))}>
                  <option value="">Select Gradient</option>
                  <option value="from-blue-500 to-cyan-500">Blue to Cyan</option>
                  <option value="from-purple-500 to-pink-500">Purple to Pink</option>
                  <option value="from-green-500 to-emerald-500">Green to Emerald</option>
                  <option value="from-orange-500 to-red-500">Orange to Red</option>
                  <option value="from-fuchsia-500 to-violet-500">Fuchsia to Violet</option>
                  <option value="from-rose-500 to-purple-500">Rose to Purple</option>
                  <option value="from-teal-500 to-emerald-500">Teal to Emerald</option>
                  <option value="from-sky-500 to-indigo-500">Sky to Indigo</option>
                  <option value="from-purple-500 to-blue-500">Purple to Blue</option>
                  <option value="from-yellow-500 to-orange-500">Yellow to Orange</option>
                  <option value="from-pink-500 to-rose-500">Pink to Rose</option>
                  <option value="from-indigo-500 to-purple-500">Indigo to Purple</option>
                </select>
                <input className="px-4 py-3 rounded-lg bg-white/90 dark:bg-gray-700/90 border-2 border-gray-200 dark:border-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 hover:border-orange-300 dark:hover:border-orange-600" placeholder="Contact (WhatsApp Number, e.g., 923001234567)" value={form.contact || ''} onChange={(e) => setForm(s => ({ ...s, contact: e.target.value }))} />
                <select 
                  className="px-4 py-3 rounded-lg bg-white/90 dark:bg-gray-700/90 border-2 border-gray-200 dark:border-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 hover:border-purple-300 dark:hover:border-purple-600" 
                  value={form.order_index ?? ''} 
                  onChange={(e) => setForm(s => ({ ...s, order_index: e.target.value === '' ? undefined : Number(e.target.value) }))}
                >
                  <option value="">Select Order (Optional)</option>
                  {availableOrders.map(order => (
                    <option key={order} value={order}>Order {order}</option>
                  ))}
                  {availableOrders.length === 0 && (
                    <option value="">No available orders (all taken)</option>
                  )}
                </select>
              </>
            )}
            {isContact && (
              <>
                <div className="md:col-span-3">
                  <AdminCollapsibleSection title="Physical location" description="Address, website, phone, map embed" defaultOpen>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                      <input className="px-3 py-2 rounded-md bg-gray-100 dark:bg-gray-700 text-sm md:col-span-2" placeholder="Address" value={(form as any)['contact_address'] || ''} onChange={(e) => setForm(s => ({ ...s, contact_address: e.target.value }))} />
                      <input className="px-3 py-2 rounded-md bg-gray-100 dark:bg-gray-700 text-sm" placeholder="Website (https://...)" value={(form as any)['contact_website'] || ''} onChange={(e) => setForm(s => ({ ...s, contact_website: e.target.value }))} />
                      <input className="px-3 py-2 rounded-md bg-gray-100 dark:bg-gray-700 text-sm" placeholder="Phone" value={(form as any)['contact_phone'] || ''} onChange={(e) => setForm(s => ({ ...s, contact_phone: e.target.value }))} />
                      <input className="px-3 py-2 rounded-md bg-gray-100 dark:bg-gray-700 text-sm md:col-span-2" placeholder="Google Maps Embed src" value={(form as any)['contact_map_src'] || ''} onChange={(e) => setForm(s => ({ ...s, contact_map_src: e.target.value }))} />
                    </div>
                  </AdminCollapsibleSection>
                </div>
                <div className="md:col-span-3">
                  <AdminCollapsibleSection title="Primary contact & socials" description="Lead line, WhatsApp, presets, optional JSON">
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                      <input className="px-3 py-2 rounded-md bg-gray-100 dark:bg-gray-700 text-sm" placeholder="Primary Name" value={(form as any)['contact_primary_name'] || ''} onChange={(e) => setForm(s => ({ ...s, contact_primary_name: e.target.value }))} />
                      <input className="px-3 py-2 rounded-md bg-gray-100 dark:bg-gray-700 text-sm" placeholder="Primary Tagline" value={(form as any)['contact_primary_tagline'] || ''} onChange={(e) => setForm(s => ({ ...s, contact_primary_tagline: e.target.value }))} />
                      <input className="px-3 py-2 rounded-md bg-gray-100 dark:bg-gray-700 text-sm" placeholder="WhatsApp Number" value={(form as any)['contact_whatsapp'] || ''} onChange={(e) => setForm(s => ({ ...s, contact_whatsapp: e.target.value }))} />
                      <div className="md:col-span-3 rounded-md border border-white/20 dark:border-white/10 bg-white/60 dark:bg-gray-800/50 p-3">
                        <div className="text-sm font-medium mb-2 text-gray-800 dark:text-gray-200">Social Links (choose up to 15)</div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {contactSocials.map((s, idx) => (
                            <div key={idx} className="flex gap-2 items-center">
                              <div className="w-9 h-9" />
                              <select className="w-36 px-4 py-3 rounded-lg bg-white/90 dark:bg-gray-700/90 border-2 border-gray-200 dark:border-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 hover:border-purple-300 dark:hover:border-purple-600" value={s.name} onChange={(e) => setSocialAt(idx, 'name', e.target.value)}>
                                <option value="">Select</option>
                                {socialOptions.map(opt => (<option key={opt}>{opt}</option>))}
                              </select>
                              <input className="flex-1 px-4 py-3 rounded-lg bg-white/90 dark:bg-gray-700/90 border-2 border-gray-200 dark:border-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 hover:border-purple-300 dark:hover:border-purple-600" placeholder="https://..." value={s.href} onChange={(e) => setSocialAt(idx, 'href', e.target.value)} />
                            </div>
                          ))}
                        </div>
                        <div className="text-xs opacity-70 mt-2">Advanced: you can still paste custom JSON below; preset entries will override it.</div>
                      </div>
                      <textarea className="px-4 py-3 rounded-lg bg-white/90 dark:bg-gray-700/90 border-2 border-gray-200 dark:border-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 hover:border-purple-300 dark:hover:border-purple-600 md:col-span-3" rows={3} placeholder='Socials JSON (optional override)' value={(form as any)['contact_socials_json'] || ''} onChange={(e) => setForm(s => ({ ...s, contact_socials_json: e.target.value }))} />
                    </div>
                  </AdminCollapsibleSection>
                </div>
              </>
            )}
            {/* No hero settings fields (floating WhatsApp/Fiverr removed) */}
            {isFooter && (
              <>
                <div className="md:col-span-3">
                  <AdminCollapsibleSection title="About & version" description="Footer copy and release label" defaultOpen>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                      <textarea className="px-4 py-3 rounded-lg bg-white/90 dark:bg-gray-700/90 border-2 border-gray-200 dark:border-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 hover:border-purple-300 dark:hover:border-purple-600 md:col-span-3" rows={3} placeholder="Footer About Text" value={(form as any)['footer_about_text'] || ''} onChange={(e) => setForm(s => ({ ...s, footer_about_text: e.target.value }))} />
                      <input className="px-3 py-2 rounded-md bg-gray-100 dark:bg-gray-700 text-sm" placeholder="Website Version (e.g., 1.0.3)" value={(form as any)['footer_version'] || ''} onChange={(e) => setForm(s => ({ ...s, footer_version: e.target.value }))} />
                    </div>
                  </AdminCollapsibleSection>
                </div>
                <div className="md:col-span-3">
                  <AdminCollapsibleSection title="Social links" description="Up to 15 presets or JSON override">
                    <div className="space-y-3">
                      <div className="rounded-md border border-white/20 dark:border-white/10 bg-white/60 dark:bg-gray-800/50 p-3">
                        <div className="text-sm font-medium mb-2 text-gray-800 dark:text-gray-200">Social Links (choose up to 15)</div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {footerSocials.map((s, idx) => (
                            <div key={idx} className="flex gap-2 items-center">
                              {renderBrandImg(s.name)}
                              <select className="w-36 px-3 py-2 rounded-md bg-gray-100 dark:bg-gray-700 text-sm" value={s.name} onChange={(e) => setFooterSocialAt(idx, 'name', e.target.value)}>
                                <option value="">Select</option>
                                {socialOptions.map(opt => (<option key={opt}>{opt}</option>))}
                              </select>
                              <input className="flex-1 px-3 py-2 rounded-md bg-gray-100 dark:bg-gray-700 text-sm" placeholder="https://..." value={s.href} onChange={(e) => setFooterSocialAt(idx, 'href', e.target.value)} />
                            </div>
                          ))}
                        </div>
                        <div className="text-xs opacity-70 mt-2">Advanced: you can still paste custom JSON below; preset entries will override it.</div>
                      </div>
                      <textarea className="w-full px-4 py-3 rounded-lg bg-white/90 dark:bg-gray-700/90 border-2 border-gray-200 dark:border-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 hover:border-purple-300 dark:hover:border-purple-600" rows={3} placeholder='Footer Socials JSON (optional override)' value={(form as any)['footer_socials_json'] || ''} onChange={(e) => setForm(s => ({ ...s, footer_socials_json: e.target.value }))} />
                    </div>
                  </AdminCollapsibleSection>
                </div>
                <div className="md:col-span-3">
                  <AdminCollapsibleSection title="Footer page links" description="Legal / utility links, optional JSON">
                    <div className="space-y-3">
                      <div className="rounded-md border border-white/20 dark:border-white/10 bg-white/60 dark:bg-gray-800/50 p-3">
                        <div className="text-sm font-medium mb-2 text-gray-800 dark:text-gray-200">Footer Links (up to 10)</div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {footerLinks.map((link, idx) => (
                            <div key={idx} className="flex gap-2 items-center">
                              <input 
                                className="flex-1 px-3 py-2 rounded-md bg-gray-100 dark:bg-gray-700 text-sm" 
                                placeholder="Link Name (e.g., Privacy Policy)" 
                                value={link.name} 
                                onChange={(e) => setFooterLinkAt(idx, 'name', e.target.value)} 
                              />
                              <input 
                                className="flex-1 px-3 py-2 rounded-md bg-gray-100 dark:bg-gray-700 text-sm" 
                                placeholder="URL (e.g., /privacy or https://...)" 
                                value={link.url} 
                                onChange={(e) => setFooterLinkAt(idx, 'url', e.target.value)} 
                              />
                              <label className="flex items-center gap-1 text-xs text-gray-700 dark:text-gray-300 whitespace-nowrap">
                                <input 
                                  type="checkbox" 
                                  checked={link.external || false} 
                                  onChange={(e) => setFooterLinkAt(idx, 'external', e.target.checked)} 
                                  className="rounded"
                                />
                                External
                              </label>
                            </div>
                          ))}
                        </div>
                        <div className="text-xs opacity-70 mt-2">Set "External" for links that open in a new tab (e.g., https://www.team4stack.com)</div>
                      </div>
                      <textarea className="w-full px-4 py-3 rounded-lg bg-white/90 dark:bg-gray-700/90 border-2 border-gray-200 dark:border-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 hover:border-purple-300 dark:hover:border-purple-600" rows={3} placeholder='Footer Links JSON (optional override)' value={(form as any)['footer_links_json'] || ''} onChange={(e) => setForm(s => ({ ...s, footer_links_json: e.target.value }))} />
                    </div>
                  </AdminCollapsibleSection>
                </div>
              </>
            )}
            {isHero && (
              <div className="md:col-span-3 space-y-2 bg-slate-950">
                <AdminCollapsibleSection title="Counters" description="Leave blank to use live counts" defaultOpen variant="flat">
                  <div className="grid grid-cols-3 gap-2 bg-slate-950">
                    <label className="flex flex-col gap-0.5">
                      <span className="text-[10px] font-medium uppercase tracking-wide text-slate-500">Proj</span>
                      <input className={heroFieldClass} placeholder="—" value={(form as any)['hero_projects_count'] || ''} onChange={(e) => setForm(s => ({ ...s, hero_projects_count: e.target.value }))} />
                    </label>
                    <label className="flex flex-col gap-0.5">
                      <span className="text-[10px] font-medium uppercase tracking-wide text-slate-500">Svc</span>
                      <input className={heroFieldClass} placeholder="—" value={(form as any)['hero_services_count'] || ''} onChange={(e) => setForm(s => ({ ...s, hero_services_count: e.target.value }))} />
                    </label>
                    <label className="flex flex-col gap-0.5">
                      <span className="text-[10px] font-medium uppercase tracking-wide text-slate-500">Crs</span>
                      <input className={heroFieldClass} placeholder="—" value={(form as any)['hero_courses_count'] || ''} onChange={(e) => setForm(s => ({ ...s, hero_courses_count: e.target.value }))} />
                    </label>
                  </div>
                </AdminCollapsibleSection>
                <AdminCollapsibleSection title="Headlines" description="Pick # to reorder" variant="flat">
                  <div className="space-y-1 bg-slate-950">
                    {heroAnimatedTexts.map((text, idx) => (
                      <div
                        key={idx}
                        className="relative grid grid-cols-[1.25rem_1fr_2.75rem] items-center gap-1 rounded border border-slate-800 bg-slate-950 py-1 pl-1 pr-7"
                      >
                        <span className="text-center text-[10px] tabular-nums text-slate-500">{idx + 1}</span>
                        <input
                          className={`${heroFieldClass} min-w-0`}
                          placeholder="Text"
                          value={text}
                          onChange={(e) => {
                            const updated = [...heroAnimatedTexts]
                            updated[idx] = e.target.value
                            setHeroAnimatedTexts(updated)
                          }}
                        />
                        <select
                          className={heroSelectClass}
                          aria-label={`Order for line ${idx + 1}`}
                          value={idx + 1}
                          onChange={(e) => {
                            const to = Number(e.target.value) - 1
                            setHeroAnimatedTexts(moveArrayItem(heroAnimatedTexts, idx, to))
                          }}
                        >
                          {heroAnimatedTexts.map((_, i) => (
                            <option key={i} value={i + 1}>
                              {i + 1}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          className={`${heroRemoveBtnClass} absolute right-1 top-1/2 z-[2] -translate-y-1/2`}
                          aria-label="Remove line"
                          onClick={() => setHeroAnimatedTexts(heroAnimatedTexts.filter((_, i) => i !== idx))}
                        >
                          <span className="relative z-[2]">×</span>
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => setHeroAnimatedTexts([...heroAnimatedTexts, ''])}
                      className="landing-admin-glass w-full rounded-md border border-cyan-900/40 bg-slate-900/80 py-1 text-[11px] font-medium text-cyan-100 hover:border-cyan-600/50 hover:bg-slate-800/90"
                    >
                      + Line
                    </button>
                  </div>
                </AdminCollapsibleSection>
                <AdminCollapsibleSection title="Bullets" description="Three fixed slots" defaultOpen variant="flat">
                  <div className="grid grid-cols-1 gap-2 bg-slate-950 sm:grid-cols-3">
                    {[0, 1, 2].map((idx) => (
                      <label key={idx} className="flex flex-col gap-0.5">
                        <span className="text-[10px] text-slate-500">#{idx + 1}</span>
                        <input
                          className={heroFieldClass}
                          placeholder="Text"
                          value={heroBulletPoints[idx] || ''}
                          onChange={(e) => {
                            const updated = [...heroBulletPoints]
                            updated[idx] = e.target.value
                            while (updated.length < 3) updated.push('')
                            setHeroBulletPoints(updated.slice(0, 3))
                          }}
                        />
                      </label>
                    ))}
                  </div>
                </AdminCollapsibleSection>
                <AdminCollapsibleSection title="Navbar" description="Order, label, href" variant="flat">
                  <div className="space-y-1 bg-slate-950">
                    {navbarLinks.map((link, idx) => (
                      <div
                        key={idx}
                        className="relative rounded border border-slate-800 bg-slate-950 p-1.5 pr-8 sm:pr-8"
                      >
                        <button
                          type="button"
                          className={`${heroRemoveBtnClass} absolute right-1.5 top-1.5 z-[2]`}
                          aria-label="Remove link"
                          onClick={() => setNavbarLinks(navbarLinks.filter((_, i) => i !== idx))}
                        >
                          <span className="relative z-[2]">×</span>
                        </button>
                        <div className="mb-1 flex items-center gap-1 sm:hidden">
                          <span className="w-4 text-center text-[10px] tabular-nums text-slate-500">{idx + 1}</span>
                          <select
                            className={`${heroSelectClass} min-w-0 flex-1`}
                            aria-label={`Nav order ${idx + 1}`}
                            value={idx + 1}
                            onChange={(e) => {
                              const to = Number(e.target.value) - 1
                              setNavbarLinks(moveArrayItem(navbarLinks, idx, to))
                            }}
                          >
                            {navbarLinks.map((_, i) => (
                              <option key={i} value={i + 1}>
                                {i + 1}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="hidden grid-cols-[1.25rem_2.75rem_1fr_1fr] gap-1 sm:grid sm:items-center">
                          <span className="text-center text-[10px] text-slate-500">{idx + 1}</span>
                          <select
                            className={heroSelectClass}
                            aria-label={`Nav order ${idx + 1}`}
                            value={idx + 1}
                            onChange={(e) => {
                              const to = Number(e.target.value) - 1
                              setNavbarLinks(moveArrayItem(navbarLinks, idx, to))
                            }}
                          >
                            {navbarLinks.map((_, i) => (
                              <option key={i} value={i + 1}>
                                {i + 1}
                              </option>
                            ))}
                          </select>
                          <input
                            className={heroFieldClass}
                            placeholder="Label"
                            value={link.name}
                            onChange={(e) => {
                              const updated = [...navbarLinks]
                              updated[idx] = { ...updated[idx], name: e.target.value }
                              setNavbarLinks(updated)
                            }}
                          />
                          <input
                            className={heroFieldClass}
                            placeholder="#anchor"
                            value={link.href}
                            onChange={(e) => {
                              const updated = [...navbarLinks]
                              updated[idx] = { ...updated[idx], href: e.target.value }
                              setNavbarLinks(updated)
                            }}
                          />
                        </div>
                        <div className="grid grid-cols-1 gap-1 sm:hidden">
                          <input
                            className={heroFieldClass}
                            placeholder="Label"
                            value={link.name}
                            onChange={(e) => {
                              const updated = [...navbarLinks]
                              updated[idx] = { ...updated[idx], name: e.target.value }
                              setNavbarLinks(updated)
                            }}
                          />
                          <input
                            className={heroFieldClass}
                            placeholder="#anchor"
                            value={link.href}
                            onChange={(e) => {
                              const updated = [...navbarLinks]
                              updated[idx] = { ...updated[idx], href: e.target.value }
                              setNavbarLinks(updated)
                            }}
                          />
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => setNavbarLinks([...navbarLinks, { name: '', href: '' }])}
                      className="landing-admin-glass w-full rounded-md border border-cyan-900/40 bg-slate-900/80 py-1 text-[11px] font-medium text-cyan-100 hover:border-cyan-600/50 hover:bg-slate-800/90"
                    >
                      + Link
                    </button>
                  </div>
                </AdminCollapsibleSection>
              </div>
            )}
            {isTeamLike && (
              <>
                <input className="px-3 py-2 rounded-md bg-gray-100 dark:bg-gray-700 text-sm" placeholder="Profile Image URL (DP)" value={form.profile_image_url || ''} onChange={(e) => setForm(s => ({ ...s, profile_image_url: e.target.value }))} />
                <input className="px-3 py-2 rounded-md bg-gray-100 dark:bg-gray-700 text-sm" placeholder="Banner Image URL (Background)" value={form.banner_image_url || ''} onChange={(e) => setForm(s => ({ ...s, banner_image_url: e.target.value }))} />
                <input className="px-3 py-2 rounded-md bg-gray-100 dark:bg-gray-700 text-sm" placeholder="Portfolio URL" value={form.portfolio_url || ''} onChange={(e) => setForm(s => ({ ...s, portfolio_url: e.target.value }))} />
                <input className="px-3 py-2 rounded-md bg-gray-100 dark:bg-gray-700 text-sm" placeholder="GitHub URL" value={form.github_url || ''} onChange={(e) => setForm(s => ({ ...s, github_url: e.target.value }))} />
                <input className="px-3 py-2 rounded-md bg-gray-100 dark:bg-gray-700 text-sm" placeholder="Primary Tag (e.g., Team Lead)" value={form.primary_tag || ''} onChange={(e) => setForm(s => ({ ...s, primary_tag: e.target.value }))} />
                <input type="number" className="px-3 py-2 rounded-md bg-gray-100 dark:bg-gray-700 text-sm" placeholder="Order (required)" value={form.order_index ?? ''} min={1} required onChange={(e) => setForm(s => ({ ...s, order_index: e.target.value === '' ? undefined : Number(e.target.value) }))} />
                {/* Bio/Description for preview */}
                <textarea className="md:col-span-3 px-4 py-3 rounded-lg bg-white/90 dark:bg-gray-700/90 border-2 border-gray-200 dark:border-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 hover:border-purple-300 dark:hover:border-purple-600" rows={3} placeholder="Bio / Description (shown in preview)" value={form.description || ''} onChange={(e) => setForm(s => ({ ...s, description: e.target.value }))} />
              </>
            )}
            <div className="md:col-span-3 flex flex-wrap gap-2 items-center">
              <button
                type="submit"
                className={
                  isHero
                    ? 'landing-admin-glass rounded-md border border-cyan-500/40 bg-cyan-950/90 px-3 py-1.5 text-xs font-semibold text-cyan-50 shadow-none transition hover:border-cyan-400/55 hover:bg-cyan-900'
                    : 'rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-6 py-3 font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl active:scale-95'
                }
              >
                {isHero ? 'Save hero' : editingId ? 'Update' : 'Create'}
              </button>
              {isHero ? (
                <button
                  type="button"
                  className="landing-admin-glass rounded-md border border-slate-500/40 bg-slate-800/90 px-3 py-1.5 text-xs font-medium text-slate-100 shadow-none hover:border-slate-400/50 hover:bg-slate-700/90"
                  onClick={closeHeroSettings}
                >
                  Cancel
                </button>
              ) : null}
              {editingId && !isHero && (
                <button
                  type="button"
                  className="px-6 py-3 rounded-xl bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 hover:scale-105 active:scale-95 transition-all duration-300"
                  onClick={() => {
                    if (isRecordEditorPage) closeEditor()
                    else {
                      setEditingId(null)
                      setForm({ title: '', description: '', role_text: '', image_url: '', is_head: false, profile_image_url: '', banner_image_url: '', portfolio_url: '', github_url: '', primary_tag: '', order_index: undefined, active: true })
                    }
                  }}
                >
                  Cancel
                </button>
              )}
              {table === 'team_members' && (
                <label className="ml-4 inline-flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={!!form.is_head} onChange={(e) => setForm(s => ({ ...s, is_head: e.target.checked }))} />
                  Mark as Team Head
                </label>
              )}
              {(isTeamLike || isCourses || isServices) && (
                <label className="ml-4 inline-flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.active !== false} onChange={(e) => setForm(s => ({ ...s, active: e.target.checked }))} />
                  Active
                </label>
              )}
            </div>
          </form>
          {error && <div className="mt-3 text-sm text-red-400">{error}</div>}
          </div>
        </LandingAdminFormMount>
      )}

      {isSupport ? (
        <div className="space-y-4">
          {loading ? (
            <div className="text-sm text-gray-500 dark:text-gray-400">Loading support requests…</div>
          ) : rows.length === 0 ? (
            <div className="text-gray-500 dark:text-gray-400 text-center py-8">
              <p className="text-lg mb-2">No support requests yet.</p>
              <p className="text-sm">Support requests will appear here when users submit them via the footer support button.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {rows.map((r: any) => (
                <div key={r.id} className={`border rounded-lg p-6 ${r.viewed ? 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800' : 'border-blue-300 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/20'}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-3 flex-wrap">
                        <span className={`font-bold text-lg ${r.viewed ? 'text-gray-900 dark:text-white' : 'text-blue-900 dark:text-blue-100'}`}>
                          {r.email || 'No email'}
                        </span>
                        {!r.viewed && (
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500 text-white animate-pulse">
                            New
                          </span>
                        )}
                        {r.viewed && (
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                            Viewed
                          </span>
                        )}
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          r.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                          r.status === 'in_progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                          r.status === 'resolved' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                          'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                        }`}>
                          {r.status}
                        </span>
                      </div>
                      
                      <div className="space-y-2 mb-3">
                        <div className="text-sm">
                          <span className="font-semibold text-gray-700 dark:text-gray-300">Reason:</span>
                          <span className="ml-2 text-gray-900 dark:text-white">{r.reason || 'Not specified'}</span>
                        </div>
                        {r.subject && (
                          <div className="text-sm">
                            <span className="font-semibold text-gray-700 dark:text-gray-300">Subject:</span>
                            <span className="ml-2 text-gray-900 dark:text-white">{r.subject}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 mb-3">
                        <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Message:</div>
                        <div className="text-gray-900 dark:text-white whitespace-pre-wrap break-words">
                          {r.message || 'No message provided'}
                        </div>
                      </div>
                      
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Submitted: {r.created_at ? new Date(r.created_at).toLocaleString() : 'Unknown date'}
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      {!r.viewed && (
                        <button
                          onClick={async () => {
                            const result = await landingApi.updateSupportRequest(r.id, { viewed: true });
                            if (!result.error) {
                              const updated = rows.map((row: any) => 
                                row.id === r.id ? { ...row, viewed: true } : row
                              );
                              setRows(updated);
                            } else {
                              if (process.env.NODE_ENV === 'development') {
                                console.error('Error updating viewed status:', error);
                              }
                            }
                          }}
                          className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium transition-colors shadow-md hover:shadow-lg"
                        >
                          View
                        </button>
                      )}
                      {r.viewed && (
                        <div className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium text-center">
                          Viewed
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className={`grid grid-cols-1 ${isProjects ? 'md:grid-cols-2 xl:grid-cols-3' : 'lg:grid-cols-2'} gap-4`}>
          {isRecordEditorPage && !isReviews && (
            <div className="col-span-full flex flex-col gap-2 rounded-xl border border-cyan-500/20 bg-slate-900/40 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-white/65">List view — add new items or edit from each card.</p>
              <button
                type="button"
                onClick={openNewRecord}
                className="inline-flex shrink-0 items-center justify-center rounded-lg bg-gradient-to-r from-cyan-600 to-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:from-cyan-500 hover:to-teal-500"
              >
                + Add {recordTypeLabel}
              </button>
            </div>
          )}
          {loading ? (
            <div className="text-sm text-gray-500 dark:text-gray-400">Loading…</div>
          ) : rows.length === 0 ? (
            <div className="text-sm text-gray-500 dark:text-gray-400">No records yet.</div>
          ) : (
            (isContact || isFooter || isHero)
            ? (
            <div
              className={`col-span-full rounded-lg bg-slate-950 p-4 text-sm text-slate-100 ${
                isHero ? 'border border-cyan-500/20' : 'border border-slate-700'
              }`}
            >
              {isContact ? (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                    <h3 className="text-base font-semibold text-white">Saved contact</h3>
                    <div className="flex flex-wrap gap-2">
                      <button type="button" className="rounded-md border border-slate-600 bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800" onClick={() => {
                        const map: any = {}
                        rows.forEach((it: any) => { map[it.key] = it.value })
                        setForm((s) => ({ ...s, ...map }))
                      }}>Load into form</button>
                      <button type="button" className="rounded-md border border-red-900/60 bg-red-950/80 px-3 py-1.5 text-xs font-medium text-red-200 hover:bg-red-900/50" onClick={async () => {
                        const keys = ['contact_address','contact_website','contact_phone','contact_map_src','contact_primary_name','contact_primary_tagline','contact_whatsapp','contact_socials_json']
                        const ok = window.confirm('Delete all contact settings?')
                        if (!ok) return
                        await deleteSiteSettingKeys(keys)
                      }}>Delete all</button>
                    </div>
                  </div>
                  <dl className="mt-3 grid max-h-[min(70vh,28rem)] grid-cols-1 gap-3 overflow-y-auto sm:grid-cols-2">
                    {rows.map((r: any) => (
                      <div key={r.key} className="min-w-0 rounded border border-slate-800/90 bg-slate-900/50 p-2">
                        <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{String(r.key).replace(/_/g, ' ')}</dt>
                        <dd className="mt-1 max-h-32 overflow-y-auto break-words text-xs leading-relaxed text-slate-200">{r.value || '—'}</dd>
                      </div>
                    ))}
                  </dl>
                </>
              ) : isFooter ? (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                    <h3 className="text-base font-semibold text-white">Saved footer</h3>
                    <div className="flex flex-wrap gap-2">
                      <button type="button" className="rounded-md border border-slate-600 bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800" onClick={() => {
                        const map: any = {}
                        rows.forEach((it: any) => { map[it.key] = it.value })
                        setForm((s) => ({ ...s, ...map }))
                      }}>Load into form</button>
                      <button type="button" className="rounded-md border border-red-900/60 bg-red-950/80 px-3 py-1.5 text-xs font-medium text-red-200 hover:bg-red-900/50" onClick={async () => {
                        const keys = ['footer_about_text','footer_socials_json','footer_version','footer_links_json']
                        const ok = window.confirm('Delete all footer settings?')
                        if (!ok) return
                        await deleteSiteSettingKeys(keys)
                      }}>Delete all</button>
                    </div>
                  </div>
                  <dl className="mt-3 grid max-h-[min(70vh,28rem)] grid-cols-1 gap-3 overflow-y-auto sm:grid-cols-2">
                    {rows.map((r: any) => (
                      <div key={r.key} className="min-w-0 rounded border border-slate-800/90 bg-slate-900/50 p-2">
                        <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{String(r.key).replace(/_/g, ' ')}</dt>
                        <dd className="mt-1 max-h-32 overflow-y-auto break-words text-xs leading-relaxed text-slate-200">{r.value || '—'}</dd>
                      </div>
                    ))}
                  </dl>
                </>
              ) : (
                <>
                  {(() => {
                    const kv: Record<string, string> = {}
                    rows.forEach((it: any) => { kv[it.key] = it.value ?? '' })
                    let headlines: string[] = []
                    let bullets: string[] = []
                    let nav: { name?: string; href?: string }[] = []
                    try {
                      const h = JSON.parse(kv.hero_animated_texts || '[]')
                      if (Array.isArray(h)) headlines = h.map((x) => String(x))
                    } catch { /* ignore */ }
                    try {
                      const b = JSON.parse(kv.hero_bullet_points || '[]')
                      if (Array.isArray(b)) bullets = b.map((x) => String(x))
                    } catch { /* ignore */ }
                    try {
                      const n = JSON.parse(kv.navbar_links || '[]')
                      if (Array.isArray(n)) nav = n
                    } catch { /* ignore */ }
                    return (
                      <>
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                          <h3 className="text-base font-semibold text-white">Saved hero</h3>
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              className="rounded-md border border-slate-600 bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800"
                              onClick={openHeroSettings}
                            >
                              Load into form
                            </button>
                            <button type="button" className="rounded-md border border-red-900/60 bg-red-950/80 px-3 py-1.5 text-xs font-medium text-red-200 hover:bg-red-900/50" onClick={async () => {
                              const keys = ['hero_projects_count','hero_services_count','hero_courses_count','hero_animated_texts','hero_bullet_points','navbar_links']
                              const ok = window.confirm('Delete all hero section settings?')
                              if (!ok) return
                              await deleteSiteSettingKeys(keys)
                            }}>Delete all</button>
                          </div>
                        </div>
                        <div className="mt-3 grid w-full min-w-0 grid-cols-1 gap-3">
                          <section className="w-full min-w-0 rounded-md border border-slate-800 bg-slate-900/60 p-3">
                            <h4 className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Counters</h4>
                            <div className="mt-2 grid w-full grid-cols-3 gap-2 text-center">
                              <div className="rounded border border-slate-800 py-2">
                                <div className="text-[10px] text-slate-500">Projects</div>
                                <div className="text-sm font-semibold tabular-nums text-white">{kv.hero_projects_count || '—'}</div>
                              </div>
                              <div className="rounded border border-slate-800 py-2">
                                <div className="text-[10px] text-slate-500">Services</div>
                                <div className="text-sm font-semibold tabular-nums text-white">{kv.hero_services_count || '—'}</div>
                              </div>
                              <div className="rounded border border-slate-800 py-2">
                                <div className="text-[10px] text-slate-500">Courses</div>
                                <div className="text-sm font-semibold tabular-nums text-white">{kv.hero_courses_count || '—'}</div>
                              </div>
                            </div>
                          </section>
                          <section className="w-full min-w-0 rounded-md border border-slate-800 bg-slate-900/60 p-3">
                            <h4 className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Headlines (order)</h4>
                            {headlines.length ? (
                              <div className="mt-2 grid grid-cols-1 gap-1 text-xs sm:grid-cols-2">
                                {headlines.map((t, i) => (
                                  <div key={i} className="flex gap-2 rounded border border-slate-800/60 px-2 py-1">
                                    <span className="w-4 shrink-0 tabular-nums text-slate-500">{i + 1}.</span>
                                    <span className="min-w-0 break-words text-slate-200">{t || <span className="text-slate-600">(empty)</span>}</span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="mt-2 text-xs text-slate-500">None saved</p>
                            )}
                          </section>
                          <section className="w-full min-w-0 rounded-md border border-slate-800 bg-slate-900/60 p-3">
                            <h4 className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Bullets</h4>
                            <ul className="mt-2 grid grid-cols-1 gap-1 sm:grid-cols-3">
                              {[0, 1, 2].map((i) => (
                                <li key={i} className="rounded border border-slate-800/80 px-2 py-1.5 text-xs text-slate-200">
                                  <span className="text-slate-500">#{i + 1}</span> {bullets[i] || '—'}
                                </li>
                              ))}
                            </ul>
                          </section>
                          <section className="w-full min-w-0 rounded-md border border-slate-800 bg-slate-900/60 p-3">
                            <h4 className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Navbar</h4>
                            {nav.length ? (
                              <div className="mt-2 grid grid-cols-1 gap-1 sm:grid-cols-2 lg:grid-cols-3">
                                {nav.map((item, i) => (
                                  <div key={i} className="flex min-w-0 items-baseline justify-between gap-2 rounded border border-slate-800/80 px-2 py-1 text-xs">
                                    <span className="truncate font-medium text-white">{item.name || '—'}</span>
                                    <span className="shrink-0 font-mono text-[10px] text-cyan-500/90">{item.href || ''}</span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="mt-2 text-xs text-slate-500">None saved</p>
                            )}
                          </section>
                        </div>
                      </>
                    )
                  })()}
                </>
              )}
            </div>
            )
            : rows.map((r: any) => (
            <div key={r.id} className={`rounded-xl ${isProjects ? 'p-5 min-h-[280px]' : 'p-4'} bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border-2 border-white/30 dark:border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]`}>
              {isReviews ? (
                <>
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-gray-900 dark:text-white">{r.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{new Date(r.created_at).toLocaleString()}</div>
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-300">{r.address} • ⭐ {r.rating} • {r.status || 'pending'}</div>
                  <div className="mt-2 flex items-center gap-2 text-xs">
                    <label className="flex items-center gap-1">
                      <span className="opacity-70 font-semibold">Order:</span>
                      <span className="px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-bold text-xs">
                        {r.order_index ?? 'Not Set'}
                      </span>
                    </label>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <label className="flex items-center gap-1 text-xs">
                      <span className="opacity-70 font-semibold">Order: <span className="text-red-500">*</span></span>
                      <select 
                        className="px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-xs font-medium" 
                        value={r.order_index ?? ''} 
                        required
                        onChange={async (e) => {
                          const selectedValue = e.target.value
                          if (!selectedValue || selectedValue === '') {
                            toast.error('Please select an order (1-30)')
                            setError('Please select an order (1-30)')
                            return
                          }
                          const value = Number(selectedValue)
                          if (isNaN(value) || value < 1 || value > 30) {
                            toast.error('Order must be between 1 and 30')
                            setError('Order must be between 1 and 30')
                            return
                          }
                          
                          setError(null)
                          try {
                            const updateResult = await updateTableRecord(table, r.id, { order_index: value })
                            if (updateResult.error) {
                              const msg = updateResult.error || 'Failed to update order'
                              toast.error(msg)
                              setError(msg)
                            } else if (updateResult.data) {
                              toast.success('Order updated successfully')
                              await load()
                            } else {
                              toast.error('Update failed: No rows were updated')
                              setError('Update failed: No rows were updated')
                            }
                          } catch (err: any) {
                            const msg = err.message || 'Failed to update order'
                            toast.error(msg)
                            setError(msg)
                          }
                        }}
                      >
                        <option value="">Select Order (Required)</option>
                        {(() => {
                          // Include current review's order in available list (so they can keep it)
                          const ordersForThisReview = [...availableOrders]
                          if (r.order_index !== null && r.order_index !== undefined && !ordersForThisReview.includes(r.order_index)) {
                            ordersForThisReview.push(r.order_index)
                            ordersForThisReview.sort((a, b) => a - b)
                          }
                          return ordersForThisReview.map(order => (
                            <option key={order} value={order}>Order {order}</option>
                          ))
                        })()}
                        {availableOrders.length === 0 && !r.order_index && (
                          <option value="">All orders are taken (1-30)</option>
                        )}
                      </select>
                    </label>
                  </div>
                  <div className="mt-2 text-sm text-gray-700 dark:text-gray-200">{r.comment}</div>
                  <div className="mt-3 flex gap-2">
                    {r.status !== 'approved' ? (
                      <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-semibold shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-300" onClick={async () => {
                        setError(null)
                        try {
                          const updateResult = await updateTableRecord(table, r.id, { status: 'approved' })
                          if (updateResult.error) {
                            const msg = updateResult.error || 'Failed to approve review'
                            toast.error(msg)
                            setError(msg)
                          } else if (updateResult.data) {
                            toast.success('Review approved successfully')
                            await load()
                          } else {
                            toast.error('Update failed: No rows were updated')
                            setError('Update failed: No rows were updated')
                          }
                        } catch (err: any) {
                          const msg = err.message || 'Failed to approve review'
                          toast.error(msg)
                          setError(msg)
                        }
                      }}>Approve</button>
                    ) : (
                      <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-300" onClick={async () => {
                        setError(null)
                        try {
                          const updateResult = await updateTableRecord(table, r.id, { status: 'pending' })
                          if (updateResult.error) {
                            const msg = updateResult.error || 'Failed to unapprove review'
                            toast.error(msg)
                            setError(msg)
                          } else if (updateResult.data) {
                            toast.success('Review unapproved successfully')
                            await load()
                          } else {
                            toast.error('Update failed: No rows were updated')
                            setError('Update failed: No rows were updated')
                          }
                        } catch (err: any) {
                          const msg = err.message || 'Failed to unapprove review'
                          toast.error(msg)
                          setError(msg)
                        }
                      }}>Unapprove</button>
                    )}
                    <button className="px-3 py-1.5 rounded-md bg-red-500 text-white" onClick={() => del(r.id)}>Delete</button>
                  </div>
                </>
              ) : table === 'team_members' ? (
                <>
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-gray-900 dark:text-white">{(r as any).name}</div>
                    {(r as any).is_head && (
                      <span className="px-2 py-0.5 rounded-full text-xs bg-gradient-to-r from-amber-500 to-orange-600 text-white">Team Head</span>
                    )}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-300">{(r as any).role}</div>
                  <div className="mt-2 text-sm text-gray-700 dark:text-gray-200">{(r as any).description}</div>
                  {(r as any).profile_image_url && <img alt="profile" src={sanitizeImageUrl((r as any).profile_image_url)} className="mt-2 h-20 w-20 object-cover rounded-full" />}
                  {(r as any).banner_image_url && <img alt="banner" src={sanitizeImageUrl((r as any).banner_image_url)} className="mt-2 h-20 w-full object-cover rounded-md" />}
                  {(r as any).image_url && <img alt="member" src={sanitizeImageUrl((r as any).image_url)} className="mt-2 h-24 w-full object-cover rounded-md" />}
                  <div className="mt-3 flex gap-2">
                    <button className="px-3 py-1.5 rounded-md bg-gray-200 dark:bg-gray-700" onClick={() => startEdit(r)}>Edit</button>
                    <button className="px-3 py-1.5 rounded-md bg-red-500 text-white" onClick={() => del((r as any).id)}>Delete</button>
                  </div>
                </>
              ) : isProjects ? (
                <>
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-bold text-lg text-gray-900 dark:text-white">{r.title}</div>
                  </div>
                  {r.description && (
                    <div className="text-sm text-gray-600 dark:text-gray-300 mt-2 line-clamp-3 leading-relaxed">{r.description}</div>
                  )}
                  {r.image_url && <img alt="project" src={sanitizeImageUrl(r.image_url)} className="mt-3 h-40 w-full object-cover rounded-lg shadow-md" />}
                  <div className="mt-2 flex items-center gap-2 text-xs">
                    <label className="flex items-center gap-1">
                      <span className="opacity-70 font-semibold">Order:</span>
                      <span className="px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-bold text-xs">
                        {r.order_index ?? 'Not Set'}
                      </span>
                    </label>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <label className="flex items-center gap-1 text-xs">
                      <span className="opacity-70 font-semibold">Order: <span className="text-red-500">*</span></span>
                      <select 
                        className="px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-xs font-medium" 
                        value={r.order_index ?? ''} 
                        required
                        onChange={async (e) => {
                          const selectedValue = e.target.value
                          if (!selectedValue || selectedValue === '') {
                            toast.error('Please select an order (1-30)')
                            setError('Please select an order (1-30)')
                            return
                          }
                          const value = Number(selectedValue)
                          if (isNaN(value) || value < 1 || value > 30) {
                            toast.error('Order must be between 1 and 30')
                            setError('Order must be between 1 and 30')
                            return
                          }
                          
                          setError(null)
                          try {
                            const updateResult = await updateTableRecord(table, r.id, { order_index: value })
                            if (updateResult.error) {
                              const msg = updateResult.error || 'Failed to update order'
                              toast.error(msg)
                              setError(msg)
                            } else if (updateResult.data) {
                              toast.success('Order updated successfully')
                              await load()
                            } else {
                              toast.error('Update failed: No rows were updated')
                              setError('Update failed: No rows were updated')
                            }
                          } catch (err: any) {
                            const msg = err.message || 'Failed to update order'
                            toast.error(msg)
                            setError(msg)
                          }
                        }}
                      >
                        <option value="">Select Order (Required)</option>
                        {(() => {
                          // Include current project's order in available list (so they can keep it)
                          const ordersForThisProject = [...availableOrders]
                          if (r.order_index !== null && r.order_index !== undefined && !ordersForThisProject.includes(r.order_index)) {
                            ordersForThisProject.push(r.order_index)
                            ordersForThisProject.sort((a, b) => a - b)
                          }
                          return ordersForThisProject.map(order => (
                            <option key={order} value={order}>Order {order}</option>
                          ))
                        })()}
                        {availableOrders.length === 0 && !r.order_index && (
                          <option value="">All orders are taken (1-30)</option>
                        )}
                      </select>
                    </label>
                  </div>
                  {(r as any).video_id && (
                    <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                      Video ID: {(r as any).video_id}
                    </div>
                  )}
                  {(r as any).github_url && (
                    <div className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                      GitHub: <a href={(r as any).github_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{(r as any).github_url}</a>
                    </div>
                  )}
                  <div className="mt-3 flex gap-2">
                    <button className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 hover:scale-105 active:scale-95 transition-all duration-300 shadow-md hover:shadow-lg" onClick={() => startEdit(r)}>Edit</button>
                    <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-semibold shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-300" onClick={() => del(r.id)}>Delete</button>
                  </div>
                </>
              ) : (
                <>
                  <div 
                    className={`font-semibold text-gray-900 dark:text-white ${isServices ? 'cursor-pointer hover:text-purple-500 dark:hover:text-purple-400 transition-colors' : ''}`}
                    onClick={isServices ? () => setSelectedService(r) : undefined}
                  >
                    {r.title}
                  </div>
                  {r.description && (
                    <div className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">{r.description}</div>
                  )}
                  {isCourses && (
                    <div className="mt-2 text-xs text-gray-600 dark:text-gray-300">
                      {(r as any).level ? <span className="mr-2">Level: {(r as any).level}</span> : null}
                      {(r as any).duration ? <span className="mr-2">Duration: {(r as any).duration}</span> : null}
                      {(r as any).price ? <span className="mr-2">Price: {(r as any).price}</span> : null}
                      {(r as any).note ? <span className="mr-2">Note: {(r as any).note}</span> : null}
                    </div>
                  )}
                  {isServices && (
                    <div className="mt-2 flex items-center gap-3">
                      {(r as any).emoji && (
                        <div className={`w-12 h-12 bg-gradient-to-r ${(r as any).gradient_color || 'from-purple-500 to-blue-500'} rounded-full flex items-center justify-center text-xl`}>
                          {(r as any).emoji}
                        </div>
                      )}
                      <div className="text-xs text-gray-600 dark:text-gray-300 flex-1">
                        <div className="flex items-center gap-4 flex-wrap">
                          <div className="flex items-center gap-1">
                            <span className="font-semibold text-purple-600 dark:text-purple-400">Order:</span>
                            <span className="px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-bold">
                              {(r as any).order_index ?? 'Not Set'}
                            </span>
                          </div>
                          {(r as any).emoji ? <div>Emoji: {(r as any).emoji}</div> : null}
                          {(r as any).gradient_color ? <div>Gradient: {(r as any).gradient_color}</div> : null}
                          {(r as any).contact ? <div>Contact: {(r as any).contact}</div> : null}
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="mt-3 flex gap-2">
                    <button className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 hover:scale-105 active:scale-95 transition-all duration-300 shadow-md hover:shadow-lg" onClick={(e) => { e.stopPropagation(); startEdit(r); }}>Edit</button>
                    <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-semibold shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-300" onClick={(e) => { e.stopPropagation(); del(r.id); }}>Delete</button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
        </div>
      )}

      {/* Service Detail Modal */}
      {selectedService && isServices && (
        <>
          <div 
            className="fixed inset-0 z-[9998] bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setSelectedService(null)}
          />
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div 
              className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xl max-w-md w-full p-6 relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedService(null)}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                aria-label="Close"
              >
                <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              
              <div className="flex items-center gap-4 mb-4">
                {(selectedService as any).emoji && (
                  <div className={`w-16 h-16 bg-gradient-to-r ${(selectedService as any).gradient_color || 'from-purple-500 to-blue-500'} rounded-full flex items-center justify-center text-3xl`}>
                    {(selectedService as any).emoji}
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedService.title}</h3>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Order:</span>
                    <span className="px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-bold text-sm">
                      {(selectedService as any).order_index ?? 'Not Set'}
                    </span>
                  </div>
                </div>
              </div>
              
              {selectedService.description && (
                <div className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {selectedService.description}
                </div>
              )}
              
              <div className="mt-4 flex gap-2">
                <button 
                  className="px-4 py-2 rounded-md bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 transition-colors"
                  onClick={() => {
                    setSelectedService(null);
                    startEdit(selectedService);
                  }}
                >
                  Edit Service
                </button>
                <button 
                  className="px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  onClick={() => setSelectedService(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

/** Renders children in document.body when modal open so fixed overlay is not clipped by admin main scroll. */
function LandingAdminFormMount({
  usePortal,
  onBackdropClose,
  children
}: {
  usePortal: boolean
  onBackdropClose: () => void
  children: React.ReactNode
}) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  if (!usePortal) {
    return <>{children}</>
  }
  if (!mounted) return null
  return createPortal(
    <div className="fixed inset-0 z-[200] overflow-y-auto overflow-x-hidden admin-custom-scrollbar">
      {/* fixed + inset-0: full viewport; do not put padding on this layer or absolute inset-0 backdrops miss edges */}
      <button
        type="button"
        aria-label="Close"
        className="btn-no-liquid fixed inset-0 z-0 rounded-none border-0 bg-black/60 backdrop-blur-md"
        onClick={onBackdropClose}
      />
      <div
        className="relative z-[1] flex min-h-full justify-center px-4 pb-10 pointer-events-none"
        style={{ paddingTop: 'max(1rem, calc(var(--admin-header-height, 80px) + 0.5rem))' }}
      >
        <div className="pointer-events-auto w-full max-w-full flex justify-center">{children}</div>
      </div>
    </div>,
    document.body
  )
}

export default ContentPage


