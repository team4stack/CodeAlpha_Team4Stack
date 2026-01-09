import React from 'react'

type Props = {
  title: string
  value: string | number
  trend?: string
  icon?: string
  onClick?: () => void
  badges?: Array<{ label: string; value: number; color: 'green' | 'red' | 'blue' | 'yellow' | 'purple' | 'orange' }>
}

const StatCard: React.FC<Props> = ({ title, value, trend, icon, onClick, badges }) => {
  const getBadgeColor = (color: string) => {
    const colors = {
      green: 'bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30',
      red: 'bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/30',
      blue: 'bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-500/30',
      yellow: 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-500/30',
      purple: 'bg-purple-500/20 text-purple-700 dark:text-purple-400 border-purple-500/30',
      orange: 'bg-orange-500/20 text-orange-700 dark:text-orange-400 border-orange-500/30'
    }
    return colors[color as keyof typeof colors] || colors.blue
  }

  return (
    <div 
      className={`relative rounded-xl p-5 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border-2 border-white/30 dark:border-white/20 shadow-lg overflow-hidden group ${onClick ? 'cursor-pointer hover:scale-105 hover:shadow-2xl transition-all duration-300 hover:border-purple-400/50' : ''}`}
      onClick={onClick}
    >
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex-1">
          <div className="text-xs uppercase tracking-widest font-bold text-gray-500 dark:text-gray-400 mb-1">{title}</div>
          <div className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400">{value}</div>
        </div>
        {icon && (
          <div className="text-4xl opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300">
            {icon}
          </div>
        )}
      </div>
      {badges && badges.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2 relative z-10">
          {badges.map((badge, index) => (
            <div
              key={index}
              className={`px-3 py-1.5 rounded-lg border-2 font-bold text-sm ${getBadgeColor(badge.color)} shadow-sm`}
            >
              <span className="font-extrabold">{badge.value}</span> <span className="ml-1">{badge.label}</span>
            </div>
          ))}
        </div>
      )}
      {trend && !badges && (
        <div className="mt-3 text-xs font-semibold text-green-500 relative z-10">{trend}</div>
      )}
      
      {/* Shine effect on hover */}
      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
    </div>
  )
}

export default StatCard


