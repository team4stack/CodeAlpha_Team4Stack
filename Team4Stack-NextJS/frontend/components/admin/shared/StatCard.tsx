import React from 'react'
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'

type ChartData = Array<{ name: string; value: number }>

type Props = {
  title: string
  value: string | number
  trend?: string
  icon?: string
  gradient?: string
  onClick?: () => void
  badges?: Array<{ label: string; value: number; color: 'green' | 'red' | 'blue' | 'yellow' | 'purple' | 'orange' }>
  chartType?: 'line' | 'area' | 'bar' | 'pie'
  chartData?: ChartData
}

const StatCard: React.FC<Props> = ({ title, value, trend, icon, onClick, badges, chartType, chartData }) => {
  const getBadgeColor = (color: string) => {
    const colors = {
      green: 'bg-green-500/20 text-green-200 border-green-500/30',
      red: 'bg-red-500/20 text-red-200 border-red-500/30',
      blue: 'bg-blue-500/20 text-blue-200 border-blue-500/30',
      yellow: 'bg-yellow-500/20 text-yellow-200 border-yellow-500/30',
      purple: 'bg-purple-500/20 text-purple-200 border-purple-500/30',
      orange: 'bg-orange-500/20 text-orange-200 border-orange-500/30'
    }
    return colors[color as keyof typeof colors] || colors.blue
  }

  const renderChart = () => {
    if (!chartType || !chartData || chartData.length === 0) return null

    // Enhanced gradient colors for better visual appeal
    const chartColors = {
      line: 'url(#lineGradient)',
      area: 'url(#areaGradient)',
      bar: 'url(#barGradient)',
      pie: ['#f97316', '#ef4444', '#ec4899', '#8b5cf6', '#06b6d4', '#10b981']
    }

    const chartHeight = 75

    // Gradient definitions for charts
    const GradientDefs = () => (
      <defs>
        <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f97316" stopOpacity={1} />
          <stop offset="100%" stopColor="#ef4444" stopOpacity={0.8} />
        </linearGradient>
        <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ef4444" stopOpacity={0.8} />
          <stop offset="100%" stopColor="#ec4899" stopOpacity={0.3} />
        </linearGradient>
        <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#ec4899" stopOpacity={1} />
          <stop offset="50%" stopColor="#f97316" stopOpacity={1} />
          <stop offset="100%" stopColor="#ef4444" stopOpacity={1} />
        </linearGradient>
      </defs>
    )

    // Professional custom tooltip component
    const CustomTooltip = ({ active, payload, label }: any) => {
      if (active && payload && payload.length) {
        return (
          <div className="bg-gradient-to-br from-gray-900 to-black backdrop-blur-md text-white text-xs rounded-lg px-3 py-2 shadow-2xl border border-cyan-500/40">
            <p className="text-cyan-400 font-bold mb-1">{label}</p>
            <p className="text-white font-extrabold text-sm">{payload[0].value}</p>
          </div>
        )
      }
      return null
    }

    switch (chartType) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <LineChart data={chartData} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
              <GradientDefs />
              <CartesianGrid strokeDasharray="2 2" stroke="rgba(148,163,184,0.15)" vertical={false} />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false}
                tick={{ fill: 'rgba(148,163,184,0.6)', fontSize: 9, fontWeight: 500 }}
                hide
              />
              <YAxis 
                axisLine={false} 
                tickLine={false}
                tick={{ fill: 'rgba(148,163,184,0.6)', fontSize: 9, fontWeight: 500 }}
                hide
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#f97316', strokeWidth: 1, strokeDasharray: '3 3' }} />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#f97316" 
                strokeWidth={2.5}
                dot={{ r: 3.5, fill: '#f97316', strokeWidth: 2, stroke: '#fff', fillOpacity: 1 }}
                activeDot={{ r: 6, fill: '#fff', stroke: '#f97316', strokeWidth: 2.5 }}
                animationDuration={1200}
                animationBegin={0}
                animationEasing="ease-out"
              />
            </LineChart>
          </ResponsiveContainer>
        )
      case 'area':
        return (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
              <GradientDefs />
              <CartesianGrid strokeDasharray="2 2" stroke="rgba(148,163,184,0.15)" vertical={false} />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false}
                tick={{ fill: 'rgba(148,163,184,0.6)', fontSize: 9, fontWeight: 500 }}
                hide
              />
              <YAxis 
                axisLine={false} 
                tickLine={false}
                tick={{ fill: 'rgba(148,163,184,0.6)', fontSize: 9, fontWeight: 500 }}
                hide
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#ef4444', strokeWidth: 1, strokeDasharray: '3 3' }} />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#ef4444" 
                fill={chartColors.area}
                fillOpacity={0.6}
                strokeWidth={2.5}
                animationDuration={1200}
                animationBegin={0}
                animationEasing="ease-out"
              />
            </AreaChart>
          </ResponsiveContainer>
        )
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <BarChart data={chartData} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
              <GradientDefs />
              <CartesianGrid strokeDasharray="2 2" stroke="rgba(148,163,184,0.15)" vertical={false} />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false}
                tick={{ fill: 'rgba(148,163,184,0.6)', fontSize: 9, fontWeight: 500 }}
                hide
              />
              <YAxis 
                axisLine={false} 
                tickLine={false}
                tick={{ fill: 'rgba(148,163,184,0.6)', fontSize: 9, fontWeight: 500 }}
                hide
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(236,72,153,0.1)' }} />
              <Bar 
                dataKey="value" 
                fill={chartColors.bar}
                radius={[6, 6, 0, 0]}
                animationDuration={1200}
                animationBegin={0}
                animationEasing="ease-out"
              />
            </BarChart>
          </ResponsiveContainer>
        )
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <PieChart>
              <Tooltip content={<CustomTooltip />} />
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={20}
                outerRadius={30}
                paddingAngle={2}
                dataKey="value"
                animationDuration={1200}
                animationBegin={0}
                animationEasing="ease-out"
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={chartColors.pie[index % chartColors.pie.length]}
                    stroke="#fff"
                    strokeWidth={2.5}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        )
      default:
        return null
    }
  }

  return (
    <div 
      className={`relative rounded-xl p-3 sm:p-4 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 backdrop-blur-xl border border-white/10 shadow-lg hover:shadow-2xl overflow-hidden group transition-all duration-300 ${onClick ? 'cursor-pointer hover:scale-[1.02] hover:border-orange-500/50' : ''}`}
      onClick={onClick}
    >
      {/* Enhanced Decorative Shapes Background */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] group-hover:opacity-[0.06] dark:group-hover:opacity-[0.08] transition-opacity duration-300">
        {/* Geometric shapes with better positioning */}
        <svg className="absolute top-0 right-0 w-24 h-24" viewBox="0 0 100 100" fill="none">
          <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="2" className="text-orange-500" />
          <circle cx="50" cy="50" r="25" stroke="currentColor" strokeWidth="1.5" className="text-red-500" />
          <circle cx="50" cy="50" r="10" fill="currentColor" className="text-pink-500" />
        </svg>
        <svg className="absolute bottom-0 left-0 w-20 h-20" viewBox="0 0 100 100" fill="none">
          <polygon points="50,10 90,90 10,90" stroke="currentColor" strokeWidth="2" className="text-pink-500" />
          <polygon points="50,30 70,70 30,70" fill="currentColor" className="text-orange-500/50" />
        </svg>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-28 h-28 border-2 border-orange-400/20 rounded-full"></div>
        <div className="absolute top-1/4 right-1/4 w-16 h-16 border border-red-400/20 rounded-lg rotate-45"></div>
      </div>

      {/* Enhanced animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/0 via-red-500/0 to-pink-500/0 group-hover:from-orange-500/10 group-hover:via-red-500/10 group-hover:to-pink-500/10 transition-all duration-500"></div>
      
      {/* Subtle glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <div className="text-[10px] sm:text-xs uppercase tracking-widest font-bold text-gray-500 dark:text-gray-400 mb-1.5 truncate">{title}</div>
          <div className="text-xl sm:text-2xl lg:text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 dark:from-orange-400 dark:via-red-400 dark:to-pink-400 drop-shadow-sm">
            {value}
          </div>
        </div>
        {icon && (
          <div className="text-2xl sm:text-3xl lg:text-4xl opacity-70 group-hover:opacity-100 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 flex-shrink-0 ml-2 filter drop-shadow-lg">
            {icon}
          </div>
        )}
      </div>
      {badges && badges.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5 relative z-10">
          {badges.map((badge, index) => (
            <div
              key={index}
              className={`px-2 py-1 rounded-md border font-semibold text-xs ${getBadgeColor(badge.color)} shadow-sm`}
            >
              <span className="font-extrabold">{badge.value}</span> <span className="ml-0.5">{badge.label}</span>
            </div>
          ))}
        </div>
      )}
      {trend && !badges && (
        <div className="mt-2 text-xs font-semibold text-green-500 relative z-10">{trend}</div>
      )}
      
      {/* Chart Section with professional styling */}
      {chartType && chartData && (
        <div className="mt-3 relative z-10 h-[75px] -mx-3 sm:-mx-4 -mb-3 sm:-mb-4 bg-gradient-to-b from-transparent via-gray-50/40 dark:via-gray-800/40 to-gray-100/20 dark:to-gray-900/20 rounded-b-xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-transparent"></div>
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-500/20 to-transparent"></div>
          {renderChart()}
        </div>
      )}
      
      {/* Enhanced shine effect on hover */}
      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none"></div>
      
      {/* Corner accent */}
      <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-orange-500/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    </div>
  )
}

export default StatCard


