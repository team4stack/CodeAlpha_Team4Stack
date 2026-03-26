import React from 'react';

interface AdmissionFormSignInRequiredPopupProps {
  show: boolean;
}

const AdmissionFormSignInRequiredPopup: React.FC<AdmissionFormSignInRequiredPopupProps> = ({ show }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center pointer-events-none p-4">
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-4 rounded-lg shadow-2xl transform transition-all duration-300 animate-scale-in pointer-events-auto border border-white/20 backdrop-blur-sm max-w-md w-full">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-lg">Please Sign In First</p>
            <p className="text-sm text-white/90">You must be signed in to submit the contact form.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdmissionFormSignInRequiredPopup;
