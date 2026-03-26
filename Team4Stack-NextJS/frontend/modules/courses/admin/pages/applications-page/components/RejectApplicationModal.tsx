import React from 'react'

interface RejectApplicationModalProps {
  isOpen: boolean
  rejectingCourseNumber: 1 | 2 | null
  rejectionMessage: string
  onMessageChange: (value: string) => void
  onConfirm: () => void
  onClose: () => void
}

const RejectApplicationModal: React.FC<RejectApplicationModalProps> = ({
  isOpen,
  rejectingCourseNumber,
  rejectionMessage,
  onMessageChange,
  onConfirm,
  onClose
}) => {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto"
      style={{ paddingTop: '100px', paddingBottom: '100px' }}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full border border-gray-200 dark:border-gray-700 overflow-hidden"
        style={{ maxHeight: 'calc(100vh - 200px)' }}
      >
        <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-4">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="text-2xl">⚠️</span>
            Reject Course {rejectingCourseNumber}
          </h3>
        </div>
        <div className="p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Please provide a reason for rejecting this course. This message will be shown to the applicant.
          </p>
          <textarea
            value={rejectionMessage}
            onChange={(e) => onMessageChange(e.target.value)}
            placeholder="Enter rejection reason..."
            className="w-full h-32 px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
          />
          <div className="flex gap-3 mt-6">
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Reject Application
            </button>
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RejectApplicationModal
