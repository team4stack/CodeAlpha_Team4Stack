import React from 'react'
import { useTheme } from '../../../context/ThemeContext'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  fullScreen?: boolean
  message?: string
  color?: string
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  fullScreen = false,
  message,
  color
}) => {
  const { isDarkMode } = useTheme()

  const sizeClasses = {
    sm: 'h-6 w-6 border-t-2 border-b-2',
    md: 'h-12 w-12 border-t-2 border-b-2',
    lg: 'h-16 w-16 border-t-2 border-b-2'
  }

  const defaultColor = color || (isDarkMode ? 'border-gray-300' : 'border-gray-600')

  const spinner = (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className={`animate-spin rounded-full ${sizeClasses[size]} ${defaultColor}`}></div>
      {message && (
        <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{message}</p>
      )}
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-50 flex items-center justify-center">
        {spinner}
      </div>
    )
  }

  return (
    <div className="h-96 flex items-center justify-center">
      {spinner}
    </div>
  )
}

export default LoadingSpinner

