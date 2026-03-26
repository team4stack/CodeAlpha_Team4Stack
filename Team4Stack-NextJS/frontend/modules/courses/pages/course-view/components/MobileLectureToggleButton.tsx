import React from 'react';

interface MobileLectureToggleButtonProps {
  isOpen: boolean;
  onToggle: () => void;
}

const MobileLectureToggleButton: React.FC<MobileLectureToggleButtonProps> = ({ isOpen, onToggle }) => {
  const buttonClass = isOpen
    ? 'bg-red-500 hover:bg-red-600'
    : 'bg-violet-600 hover:bg-violet-700';

  return (
    <button
      type="button"
      onClick={onToggle}
      className={`lg:hidden fixed bottom-8 right-8 z-50 ${buttonClass} text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 animate-bounce-slow w-14 h-14 flex items-center justify-center overflow-hidden focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2`}
      aria-label={isOpen ? 'Close lecture list' : 'Show lecture list'}
      title={isOpen ? 'Close lecture list' : 'Show lecture list'}
    >
      {isOpen ? (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M6 6l12 12M18 6l-12 12" />
        </svg>
      ) : (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7h16M4 12h16M4 17h10" />
        </svg>
      )}
    </button>
  );
};

export default MobileLectureToggleButton;
