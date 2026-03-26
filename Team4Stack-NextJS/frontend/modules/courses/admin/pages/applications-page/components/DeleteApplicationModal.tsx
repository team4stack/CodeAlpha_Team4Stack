import React from 'react'

interface DeleteApplicationModalProps {
  isOpen: boolean
  applicantName: string
  applicantEmail: string
  onConfirm: () => void
  onClose: () => void
}

const DeleteApplicationModal: React.FC<DeleteApplicationModalProps> = ({
  isOpen,
  applicantName,
  applicantEmail,
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
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full border border-gray-200 dark:border-gray-700 overflow-hidden animate-scale-in"
        style={{ maxHeight: 'calc(100vh - 200px)' }}
      >
        <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-4">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="text-2xl">🗑️</span>
            Delete Application
          </h3>
        </div>
        <div className="p-6">
          <div className="mb-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <span className="text-2xl">⚠️</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">Are you absolutely sure?</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">This action cannot be undone</p>
              </div>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mt-4">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <strong>Application from:</strong> {applicantName}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                <strong>Email:</strong> {applicantEmail}
              </p>
              <p className="text-sm text-red-600 dark:text-red-400 mt-3 font-semibold">
                ⚠️ All application data will be permanently deleted
              </p>
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Yes, Delete
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

export default DeleteApplicationModal
