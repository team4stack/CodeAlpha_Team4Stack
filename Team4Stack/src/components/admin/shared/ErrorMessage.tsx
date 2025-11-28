import React from 'react'

interface ErrorMessageProps {
  message: string
  onDismiss?: () => void
  type?: 'error' | 'warning' | 'info'
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  onDismiss,
  type = 'error'
}) => {
  const colorClasses = {
    error: 'bg-red-500/20 text-red-400 border-red-500/30',
    warning: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    info: 'bg-blue-500/20 text-blue-400 border-blue-500/30'
  }

  return (
    <div className={`${colorClasses[type]} border rounded-xl p-4 flex items-center justify-between gap-4`}>
      <div className="flex-1">
        <p className="font-semibold">{message}</p>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-current opacity-70 hover:opacity-100 transition-opacity"
          aria-label="Dismiss"
        >
          ✕
        </button>
      )}
    </div>
  )
}

export default ErrorMessage

