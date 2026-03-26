import React from 'react';

interface CourseRejectionModalProps {
  isDarkMode: boolean;
  open: boolean;
  message: string;
  onClose: () => void;
}

const CourseRejectionModal: React.FC<CourseRejectionModalProps> = ({
  isDarkMode,
  open,
  message,
  onClose
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[10001] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className={`w-full max-w-lg rounded-xl sm:rounded-2xl text-white bg-gradient-to-br from-red-600/20 to-orange-600/20 border border-red-400/30 max-h-[90vh] overflow-y-auto p-4 sm:p-6 ${
        isDarkMode ? 'shadow-2xl' : 'shadow-xl'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            <span className="text-2xl">⚠️</span>
            Application Rejected
          </h3>
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="bg-red-500/20 border border-red-400/30 rounded-lg p-4 mb-4">
          <p className="text-sm font-semibold text-white/90 mb-2">Rejection Reason:</p>
          <p className="text-white/80 text-sm sm:text-base leading-relaxed">
            {message || 'No reason provided.'}
          </p>
        </div>
        <div className="bg-yellow-500/20 border border-yellow-400/30 rounded-lg p-4 mb-4">
          <p className="text-sm text-white/90">
            <strong>Note:</strong> You cannot apply again for this course. If you have questions, please contact the administration.
          </p>
        </div>
        <button
          onClick={onClose}
          className="w-full px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default CourseRejectionModal;
