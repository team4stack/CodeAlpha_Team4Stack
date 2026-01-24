'use client'

import React from 'react'

interface NotificationBadgeProps {
  count: number
  className?: string
}

const NotificationBadge: React.FC<NotificationBadgeProps> = ({ count, className = '' }) => {
  if (count <= 0) return null

  return (
    <span
      className={`absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center px-1.5 rounded-full bg-gradient-to-r from-red-500 to-pink-500 text-white text-[10px] font-bold shadow-lg shadow-red-500/50 border-2 border-white dark:border-gray-900 animate-pulse ${className}`}
    >
      {count > 99 ? '99+' : count}
    </span>
  )
}

export default NotificationBadge
